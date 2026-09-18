import JsBarcode from 'jsbarcode'
import { checkQRCode, jsBarcodeSupportedFormats } from '@/config/barcode-types'
import {
  BarcodeTextFontFamily,
  BarcodeTextSettings,
  DEFAULT_BARCODE_TEXT_SETTINGS,
  normalizeBarcodeTextSettings,
} from '@/types/barcode-text'
import { ImageFormat } from '@/types/image'
import { fontNotoSansSC, fontNotoSerifSC } from '@/lib/fonts'

const bwipjs = require('bwip-js') as {
  toSVG: (options: Record<string, unknown>) => string
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const DEFAULT_NATIVE_FONT_SIZE = 15
const DEFAULT_TEXT_MARGIN = 2
const INDEPENDENT_TEXT_GAP = 4
const INDEPENDENT_TEXT_BOTTOM_PADDING = 4

const FONT_FAMILIES: Record<BarcodeTextFontFamily, string> = {
  'noto-sans-sc': fontNotoSansSC.style.fontFamily,
  'noto-serif-sc': fontNotoSerifSC.style.fontFamily,
}

export interface BarcodeRenderOptions extends BarcodeTextSettings {
  value: string
  displayText?: string
  barcodeLength: number
  barcodeHeight: number
  barcodeMargin: number
  showText: boolean
  codeFormat: string
}

interface SvgDimensions {
  width: number
  height: number
}

const toPositiveNumber = (
  value: string | null | undefined,
  fallback: number,
) => {
  const parsed = Number.parseFloat(value || '')
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const getSvgViewBox = (svg: SVGElement): SvgDimensions => {
  const values = svg.getAttribute('viewBox')?.trim().split(/\s+/).map(Number)

  if (values && values.length === 4 && values[2] > 0 && values[3] > 0) {
    return { width: values[2], height: values[3] }
  }

  return {
    width: toPositiveNumber(svg.getAttribute('width'), 1),
    height: toPositiveNumber(svg.getAttribute('height'), 1),
  }
}

const getSvgAttributeDimension = (
  svg: SVGElement,
  attribute: 'width' | 'height',
  viewBoxValue: number,
) => toPositiveNumber(svg.getAttribute(attribute), viewBoxValue)

const getTextFont = (
  fontSize: number,
  fontFamily: string,
  bold = false,
  italic = false,
) => {
  const style = italic ? 'italic ' : ''
  const weight = bold ? 'bold ' : ''
  return style + weight + fontSize + 'px ' + fontFamily
}

const measureText = (
  value: string,
  fontSize: number,
  fontFamily: string,
  bold = false,
  italic = false,
) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return Math.max(1, value.length * fontSize)
  }

  context.font = getTextFont(fontSize, fontFamily, bold, italic)
  return Math.max(1, context.measureText(value).width)
}

const setBaseSvgDimensions = (
  svg: SVGElement,
  barcodeLength: number,
  preferredHeight?: number,
) => {
  const sourceDimensions = getSvgViewBox(svg)
  const width = Math.max(1, barcodeLength)
  const height = preferredHeight
    ? Math.max(1, preferredHeight)
    : (sourceDimensions.height / sourceDimensions.width) * width

  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')

  return { width, height }
}

const createTextElement = (
  documentNode: Document,
  value: string,
  x: number,
  y: number,
  fontSize: number,
  fontFamily: string,
  bold: boolean,
  italic: boolean,
) => {
  const text = documentNode.createElementNS(SVG_NS, 'text')
  text.setAttribute('x', String(x))
  text.setAttribute('y', String(y))
  text.setAttribute('text-anchor', 'middle')
  text.setAttribute('font-family', fontFamily)
  text.setAttribute('font-size', String(fontSize))
  text.setAttribute('font-weight', bold ? '700' : '400')
  text.setAttribute('font-style', italic ? 'italic' : 'normal')
  text.setAttribute('fill', '#000000')
  text.textContent = value
  return text
}

const appendTextLayout = (
  source: SVGElement,
  value: string,
  settings: BarcodeTextSettings,
  barcodeMargin: number,
  barcodeLength: number,
  baseDimensions: SvgDimensions,
) => {
  const fontFamily = FONT_FAMILIES[settings.fontFamily]
  const textWidth = measureText(
    value,
    settings.fontSize,
    fontFamily,
    settings.bold,
    settings.italic,
  )
  const sidePadding = Math.max(8, barcodeMargin)
  const width = Math.max(barcodeLength, textWidth + sidePadding * 2)
  const textBlockHeight =
    settings.fontSize +
    INDEPENDENT_TEXT_GAP +
    (settings.textPosition === 'bottom' ? INDEPENDENT_TEXT_BOTTOM_PADDING : 0)
  const height = baseDimensions.height + textBlockHeight
  const documentNode = source.ownerDocument || document
  const root = documentNode.createElementNS(SVG_NS, 'svg')
  const offsetX = (width - baseDimensions.width) / 2
  const offsetY = settings.textPosition === 'top' ? textBlockHeight : 0
  const background = documentNode.createElementNS(SVG_NS, 'rect')
  const base = source.cloneNode(true) as SVGElement

  root.setAttribute('xmlns', SVG_NS)
  root.setAttribute('width', String(width))
  root.setAttribute('height', String(height))
  root.setAttribute('viewBox', '0 0 ' + width + ' ' + height)
  root.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  background.setAttribute('width', '100%')
  background.setAttribute('height', '100%')
  background.setAttribute('fill', '#ffffff')
  root.appendChild(background)

  base.setAttribute('x', String(offsetX))
  base.setAttribute('y', String(offsetY))
  base.setAttribute('width', String(baseDimensions.width))
  base.setAttribute('height', String(baseDimensions.height))
  base.setAttribute('preserveAspectRatio', 'none')
  root.appendChild(base)

  const textY =
    settings.textPosition === 'top'
      ? settings.fontSize
      : baseDimensions.height + INDEPENDENT_TEXT_GAP + settings.fontSize
  root.appendChild(
    createTextElement(
      documentNode,
      value,
      width / 2,
      textY,
      settings.fontSize,
      fontFamily,
      settings.bold,
      settings.italic,
    ),
  )

  return root
}

const serializeSvg = (svg: SVGElement) => {
  svg.setAttribute('xmlns', SVG_NS)
  return new XMLSerializer().serializeToString(svg)
}

const renderJsBarcode = (
  options: BarcodeRenderOptions,
  customText?: string,
) => {
  const svg = document.createElementNS(SVG_NS, 'svg')
  const config: Record<string, unknown> = {
    format: options.codeFormat.toUpperCase(),
    width: 2,
    height: options.barcodeHeight,
    displayValue: options.showText,
    font: FONT_FAMILIES[DEFAULT_BARCODE_TEXT_SETTINGS.fontFamily],
    fontSize: DEFAULT_NATIVE_FONT_SIZE,
    margin: options.barcodeMargin,
    background: '#ffffff',
    lineColor: '#000000',
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: DEFAULT_TEXT_MARGIN,
  }

  if (options.showText && customText) {
    config.text = customText
  }

  try {
    JsBarcode(svg, options.value, config)
  } catch (error) {
    console.error('JsBarcode generation error:', error)
    throw new Error(
      'Invalid barcode value for ' + options.codeFormat + ': ' + options.value,
    )
  }

  setBaseSvgDimensions(svg, options.barcodeLength)
  return svg
}

const renderBwipBarcode = (
  options: BarcodeRenderOptions,
  customText?: string,
) => {
  const scale = 2
  const mmToPx = 2.835 * scale
  const heightInMm = options.barcodeHeight / mmToPx
  const widthInMm = options.barcodeLength / mmToPx
  const marginInMm = options.barcodeMargin / scale
  const isQRCode = checkQRCode(options.codeFormat)
  const isReplacementText =
    options.textMode === 'replacement' && Boolean(customText)
  const includeNativeText = options.showText && !isQRCode && !isReplacementText

  const config: Record<string, unknown> = {
    bcid: options.codeFormat.toLowerCase(),
    text: options.value,
    scale,
    height: heightInMm,
    width: widthInMm,
    includetext: includeNativeText,
    padding: marginInMm,
    paddingbottom: marginInMm,
    backgroundcolor: 'ffffff',
    barcolor: '000000',
  }

  let svg: SVGElement
  try {
    const svgString = bwipjs.toSVG(config)
    const documentNode = new DOMParser().parseFromString(
      svgString,
      'image/svg+xml',
    )
    svg = documentNode.documentElement as unknown as SVGElement
  } catch (error) {
    console.error('BWIP-JS generation error:', error)
    throw new Error(
      'Invalid barcode value for ' + options.codeFormat + ': ' + options.value,
    )
  }

  setBaseSvgDimensions(svg, options.barcodeLength)
  return svg
}

export const renderBarcodeSvg = (options: BarcodeRenderOptions) => {
  const settings = normalizeBarcodeTextSettings(options)
  const customText = options.showText ? options.displayText?.trim() : undefined
  const renderOptions = { ...options, ...settings }

  let svg = jsBarcodeSupportedFormats.includes(options.codeFormat.toUpperCase())
    ? renderJsBarcode(
        renderOptions,
        renderOptions.textMode === 'replacement' ? customText : undefined,
      )
    : renderBwipBarcode(renderOptions, customText)

  const isJsBarcode = jsBarcodeSupportedFormats.includes(
    options.codeFormat.toUpperCase(),
  )
  const appendText = (value: string, textSettings: BarcodeTextSettings) => {
    const sourceDimensions = getSvgViewBox(svg)
    const baseDimensions = {
      width: getSvgAttributeDimension(svg, 'width', sourceDimensions.width),
      height: getSvgAttributeDimension(svg, 'height', sourceDimensions.height),
    }

    svg = appendTextLayout(
      svg,
      value,
      textSettings,
      options.barcodeMargin,
      options.barcodeLength,
      baseDimensions,
    )
  }

  if (
    renderOptions.showText &&
    !isJsBarcode &&
    checkQRCode(options.codeFormat)
  ) {
    appendText(
      renderOptions.textMode === 'replacement'
        ? customText || options.value
        : options.value,
      { ...DEFAULT_BARCODE_TEXT_SETTINGS, textPosition: 'bottom' },
    )
  }

  const shouldAppendCustomText =
    renderOptions.showText &&
    customText &&
    (renderOptions.textMode === 'independent' ||
      (!isJsBarcode && !checkQRCode(options.codeFormat)))

  if (shouldAppendCustomText) {
    const textSettings =
      renderOptions.textMode === 'independent'
        ? renderOptions
        : { ...DEFAULT_BARCODE_TEXT_SETTINGS, textPosition: 'bottom' as const }

    appendText(customText, textSettings)
  }

  return serializeSvg(svg)
}

const getMarkupSvg = (markup: string) => {
  const parsed = new DOMParser().parseFromString(markup, 'text/html')
  const svg = parsed.querySelector('svg')
  if (!svg) {
    throw new Error('No barcode SVG found')
  }
  svg.setAttribute('xmlns', SVG_NS)
  return svg
}

const getImageDimension = (
  svg: SVGElement,
  attribute: 'width' | 'height',
  viewBoxIndex: number,
) => {
  const value = Number.parseFloat(svg.getAttribute(attribute) || '')
  if (Number.isFinite(value) && value > 0) {
    return value
  }

  const viewBox = svg.getAttribute('viewBox')?.trim().split(/\s+/).map(Number)
  return viewBox && Number.isFinite(viewBox[viewBoxIndex])
    ? viewBox[viewBoxIndex]
    : 1
}

export const svgToImageBlob = async (
  markup: string,
  format: ImageFormat,
  scale = 1,
) => {
  const svg = getMarkupSvg(markup)
  const width = getImageDimension(svg, 'width', 2)
  const height = getImageDimension(svg, 'height', 3)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(width * scale))
  canvas.height = Math.max(1, Math.ceil(height * scale))

  const imageUrl = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], {
      type: 'image/svg+xml;charset=utf-8',
    }),
  )

  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Failed to render barcode SVG'))
      image.src = imageUrl
    })

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Canvas 2D context is not supported')
    }

    context.imageSmoothingEnabled = false
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const mimeType =
      format === 'jpg'
        ? 'image/jpeg'
        : format === 'gif'
          ? 'image/gif'
          : 'image/png'

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create barcode image'))
          }
        },
        mimeType,
        format === 'jpg' ? 0.9 : 1,
      )
    })
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

export const svgToPngBlob = (markup: string) => svgToImageBlob(markup, 'png', 2)

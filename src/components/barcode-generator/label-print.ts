export type PrintType = 'sheet' | 'thermal'
export type Orientation = 'portrait' | 'landscape'
export type PaperSizeKey = 'a4' | 'letter' | 'a5'

export interface SheetSettings {
  paper: PaperSizeKey
  orientation: Orientation
  labelWidth: number
  labelHeight: number
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  gapX: number
  gapY: number
  startPosition: number
  cutGuides: boolean
}

export interface ThermalSettings {
  width: number
  height: number
  rotate: boolean
}

export interface SheetPreset {
  id: string
  nameEn: string
  nameZh: string
  settings: Omit<SheetSettings, 'startPosition'>
}

export interface PaperSize {
  id: PaperSizeKey
  nameEn: string
  nameZh: string
  width: number
  height: number
}

export interface PageCell {
  x: number
  y: number
  width: number
  height: number
  barcode?: string
  rotate?: boolean
}

export interface PagePlan {
  width: number
  height: number
  cells: PageCell[]
  cutGuides: boolean
}

interface PdfImagePage {
  widthMm: number
  heightMm: number
  widthPx: number
  heightPx: number
  jpeg: Uint8Array
}

export const PAPER_SIZES: PaperSize[] = [
  {
    id: 'a4',
    nameEn: 'A4',
    nameZh: 'A4',
    width: 210,
    height: 297,
  },
  {
    id: 'letter',
    nameEn: 'US Letter',
    nameZh: 'US Letter',
    width: 215.9,
    height: 279.4,
  },
  {
    id: 'a5',
    nameEn: 'A5',
    nameZh: 'A5',
    width: 148,
    height: 210,
  },
]

export const SHEET_PRESETS: SheetPreset[] = [
  {
    id: 'avery-5160',
    nameEn: 'Avery 5160 · 3×10',
    nameZh: 'Avery 5160 · 3×10',
    settings: {
      paper: 'letter',
      orientation: 'portrait',
      labelWidth: 66.7,
      labelHeight: 25.4,
      marginTop: 12.7,
      marginRight: 3.2,
      marginBottom: 12.7,
      marginLeft: 3.2,
      gapX: 3.2,
      gapY: 0,
      cutGuides: false,
    },
  },
  {
    id: 'avery-5163',
    nameEn: 'Avery 5163 · 2×5',
    nameZh: 'Avery 5163 · 2×5',
    settings: {
      paper: 'letter',
      orientation: 'portrait',
      labelWidth: 101.6,
      labelHeight: 50.8,
      marginTop: 12.7,
      marginRight: 4.8,
      marginBottom: 12.7,
      marginLeft: 4.8,
      gapX: 3.1,
      gapY: 0,
      cutGuides: false,
    },
  },
  {
    id: 'a4-l7160',
    nameEn:
      'A4 · 63.5 × 38.1 mm · 21 labels · 3×7 · LP21/63 / Avery L7160 / EU30015',
    nameZh:
      'A4 · 63.5 × 38.1 mm · 21张 · 3×7 · LP21/63 / Avery L7160 / EU30015',
    settings: {
      paper: 'a4',
      orientation: 'portrait',
      labelWidth: 63.5,
      labelHeight: 38.1,
      marginTop: 15.15,
      marginRight: 7.25,
      marginBottom: 15.15,
      marginLeft: 7.25,
      gapX: 2.5,
      gapY: 0,
      cutGuides: false,
    },
  },
  {
    id: 'a4-l7674',
    nameEn:
      'A4 · 145 × 17 mm · 16 labels · 1×16 · LP16/145 / Avery L7674 / EU30012',
    nameZh: 'A4 · 145 × 17 mm · 16张 · 1×16 · LP16/145 / Avery L7674 / EU30012',
    settings: {
      paper: 'a4',
      orientation: 'portrait',
      labelWidth: 145,
      labelHeight: 17,
      marginTop: 12.5,
      marginRight: 32.5,
      marginBottom: 12.5,
      marginLeft: 32.5,
      gapX: 0,
      gapY: 0,
      cutGuides: false,
    },
  },
  {
    id: 'a4-online-labels-167',
    nameEn: 'A4 · 50 × 35 mm · 21 labels · 3×7 · OnlineLabels 167',
    nameZh: 'A4 · 50 × 35 mm · 21张 · 3×7 · OnlineLabels 167',
    settings: {
      paper: 'a4',
      orientation: 'portrait',
      labelWidth: 50,
      labelHeight: 35,
      marginTop: 26,
      marginRight: 21,
      marginBottom: 26,
      marginLeft: 21,
      gapX: 9,
      gapY: 0,
      cutGuides: false,
    },
  },
  {
    id: 'plain-a4',
    nameEn: 'Plain A4 paper · cut manually · 3×7',
    nameZh: '普通 A4 纸 · 自行裁切 · 3×7',
    settings: {
      paper: 'a4',
      orientation: 'portrait',
      labelWidth: 60,
      labelHeight: 37,
      marginTop: 10,
      marginRight: 10,
      marginBottom: 10,
      marginLeft: 10,
      gapX: 5,
      gapY: 3,
      cutGuides: true,
    },
  },
]

export const DEFAULT_SHEET_SETTINGS: SheetSettings = {
  ...SHEET_PRESETS[2].settings,
  startPosition: 0,
}

export const DEFAULT_THERMAL_SETTINGS: ThermalSettings = {
  width: 50,
  height: 30,
  rotate: false,
}

export const THERMAL_SIZES = [
  [40, 30],
  [50, 30],
  [60, 40],
  [80, 50],
  [100, 50],
  [100, 100],
  [100, 150],
  [101.6, 152.4],
] as const

const clampCount = (value: number) =>
  Math.max(1, Math.min(50, Number.isFinite(value) ? value : 1))

export const getPaperDimensions = (
  paper: PaperSizeKey,
  orientation: Orientation,
) => {
  const selectedPaper =
    PAPER_SIZES.find((item) => item.id === paper) || PAPER_SIZES[0]

  if (orientation === 'landscape') {
    return {
      width: selectedPaper.height,
      height: selectedPaper.width,
    }
  }

  return {
    width: selectedPaper.width,
    height: selectedPaper.height,
  }
}

export const getSheetGrid = (settings: SheetSettings) => {
  const paper = getPaperDimensions(settings.paper, settings.orientation)
  const usableWidth = Math.max(
    settings.labelWidth,
    paper.width - settings.marginLeft - settings.marginRight,
  )
  const usableHeight = Math.max(
    settings.labelHeight,
    paper.height - settings.marginTop - settings.marginBottom,
  )
  const columns = clampCount(
    Math.floor(
      (usableWidth + settings.gapX) /
        Math.max(0.1, settings.labelWidth + settings.gapX),
    ),
  )
  const rows = clampCount(
    Math.floor(
      (usableHeight + settings.gapY) /
        Math.max(0.1, settings.labelHeight + settings.gapY),
    ),
  )

  return {
    columns,
    rows,
    capacity: columns * rows,
    paper,
  }
}

export const getPageCount = (
  barcodeCount: number,
  printType: PrintType,
  sheet: SheetSettings,
) => {
  if (printType === 'thermal') {
    return Math.max(1, barcodeCount)
  }

  const { capacity } = getSheetGrid(sheet)
  return Math.max(1, Math.ceil((barcodeCount + sheet.startPosition) / capacity))
}

export const buildPagePlans = (
  barcodes: string[],
  printType: PrintType,
  sheet: SheetSettings,
  thermal: ThermalSettings,
): PagePlan[] => {
  if (printType === 'thermal') {
    const thermalBarcodes = barcodes.length ? barcodes : [undefined]
    return thermalBarcodes.map((barcode) => ({
      width: thermal.width,
      height: thermal.height,
      cutGuides: false,
      cells: [
        {
          x: 0,
          y: 0,
          width: thermal.width,
          height: thermal.height,
          barcode,
          rotate: thermal.rotate,
        },
      ],
    }))
  }

  const { columns, rows, capacity, paper } = getSheetGrid(sheet)
  const pageCount = getPageCount(barcodes.length, printType, sheet)

  return Array.from({ length: pageCount }, (_, pageIndex) => ({
    width: paper.width,
    height: paper.height,
    cutGuides: sheet.cutGuides,
    cells: Array.from({ length: capacity }, (_, slotIndex) => {
      const row = Math.floor(slotIndex / columns)
      const column = slotIndex % columns
      const barcodeIndex =
        pageIndex * capacity + slotIndex - sheet.startPosition

      return {
        x: sheet.marginLeft + column * (sheet.labelWidth + sheet.gapX),
        y: sheet.marginTop + row * (sheet.labelHeight + sheet.gapY),
        width: sheet.labelWidth,
        height: sheet.labelHeight,
        barcode:
          barcodeIndex >= 0 && barcodeIndex < barcodes.length
            ? barcodes[barcodeIndex]
            : undefined,
      }
    }),
  }))
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

export const buildPrintDocument = (plans: PagePlan[], title: string) => {
  const firstPage = plans[0]
  const pageWidth = firstPage?.width || 210
  const pageHeight = firstPage?.height || 297
  const pages = plans
    .map(
      (page) => `
        <section class="print-page" style="width:${page.width}mm;height:${page.height}mm">
          ${page.cells
            .map(
              (cell) => `
                <div
                  class="print-cell${page.cutGuides ? ' print-cell--guide' : ''}"
                  style="left:${cell.x}mm;top:${cell.y}mm;width:${cell.width}mm;height:${cell.height}mm"
                >
                  ${
                    cell.barcode
                      ? `<div
                          class="print-barcode${cell.rotate ? ' print-barcode--rotate' : ''}"
                          ${
                            cell.rotate
                              ? `style="width:${Math.max(1, cell.height - 2.4)}mm;height:${Math.max(1, cell.width - 2.4)}mm"`
                              : ''
                          }
                        >${cell.barcode}</div>`
                      : ''
                  }
                </div>
              `,
            )
            .join('')}
        </section>
      `,
    )
    .join('')

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #fff; }
          body { font-family: Arial, sans-serif; }
          .print-page {
            position: relative;
            overflow: hidden;
            page-break-after: always;
            break-after: page;
            background: #fff;
          }
          .print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .print-cell {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 1.2mm;
          }
          .print-cell--guide {
            border: 0.2mm dashed #94a3b8;
          }
          .print-barcode,
          .print-barcode > .barcode-item,
          .print-barcode > .barcode-item > .barcode-item {
            display: flex;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;
          }
          .print-barcode svg {
            display: block;
            width: auto !important;
            height: auto !important;
            max-width: 100%;
            max-height: 100%;
          }
          .print-barcode--rotate {
            flex: none;
            transform: rotate(90deg);
          }
          @page {
            size: ${pageWidth}mm ${pageHeight}mm;
            margin: 0;
          }
          @media print {
            html, body {
              width: ${pageWidth}mm;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        </style>
      </head>
      <body>${pages}</body>
    </html>`
}

export const printPlans = (plans: PagePlan[], title: string) => {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.width = '1px'
  iframe.style.height = '1px'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'

  const removeIframe = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe)
    }
  }

  iframe.onload = () => {
    const printWindow = iframe.contentWindow
    if (!printWindow) {
      removeIframe()
      return
    }

    printWindow.addEventListener('afterprint', removeIframe, { once: true })
    printWindow.focus()
    printWindow.print()
    window.setTimeout(removeIframe, 60000)
  }

  iframe.srcdoc = buildPrintDocument(plans, title)
  document.body.appendChild(iframe)
}

const getSvgMarkup = (barcode: string) => {
  const documentNode = new DOMParser().parseFromString(barcode, 'text/html')
  const svg = documentNode.querySelector('svg')

  if (!svg) {
    return null
  }

  const clone = svg.cloneNode(true) as SVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  return new XMLSerializer().serializeToString(clone)
}

const loadSvgImage = async (barcode: string) => {
  const svgMarkup = getSvgMarkup(barcode)
  if (!svgMarkup) {
    return null
  }

  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Unable to render barcode SVG'))
      image.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

const drawBarcode = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  cell: PageCell,
  pixelsPerMm: number,
) => {
  const padding = Math.min(1.5, cell.width / 12, cell.height / 12)
  const x = (cell.x + padding) * pixelsPerMm
  const y = (cell.y + padding) * pixelsPerMm
  const width = Math.max(1, (cell.width - padding * 2) * pixelsPerMm)
  const height = Math.max(1, (cell.height - padding * 2) * pixelsPerMm)
  const imageWidth = Math.max(1, image.naturalWidth || image.width)
  const imageHeight = Math.max(1, image.naturalHeight || image.height)

  context.save()

  if (cell.rotate) {
    const scale = Math.min(width / imageHeight, height / imageWidth)
    context.translate(x + width / 2, y + height / 2)
    context.rotate(Math.PI / 2)
    context.drawImage(
      image,
      (-imageWidth * scale) / 2,
      (-imageHeight * scale) / 2,
      imageWidth * scale,
      imageHeight * scale,
    )
  } else {
    const scale = Math.min(width / imageWidth, height / imageHeight)
    const drawWidth = imageWidth * scale
    const drawHeight = imageHeight * scale
    context.drawImage(
      image,
      x + (width - drawWidth) / 2,
      y + (height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    )
  }

  context.restore()
}

const dataUrlToBytes = (dataUrl: string) => {
  const encoded = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const binary = atob(encoded)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

const renderPageToImage = async (page: PagePlan): Promise<PdfImagePage> => {
  const pixelsPerMm = 203 / 25.4
  const widthPx = Math.max(1, Math.round(page.width * pixelsPerMm))
  const heightPx = Math.max(1, Math.round(page.height * pixelsPerMm))
  const canvas = document.createElement('canvas')
  canvas.width = widthPx
  canvas.height = heightPx

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas 2D is not available')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, widthPx, heightPx)

  for (const cell of page.cells) {
    if (page.cutGuides) {
      context.save()
      context.strokeStyle = '#94a3b8'
      context.lineWidth = Math.max(1, 0.15 * pixelsPerMm)
      context.setLineDash([0.8 * pixelsPerMm, 0.8 * pixelsPerMm])
      context.strokeRect(
        cell.x * pixelsPerMm,
        cell.y * pixelsPerMm,
        cell.width * pixelsPerMm,
        cell.height * pixelsPerMm,
      )
      context.restore()
    }

    if (cell.barcode) {
      const image = await loadSvgImage(cell.barcode)
      if (image) {
        drawBarcode(context, image, cell, pixelsPerMm)
      }
    }
  }

  return {
    widthMm: page.width,
    heightMm: page.height,
    widthPx,
    heightPx,
    jpeg: dataUrlToBytes(canvas.toDataURL('image/jpeg', 1)),
  }
}

const encode = (value: string) => new TextEncoder().encode(value)

const concatBytes = (chunks: Uint8Array[]) => {
  const length = chunks.reduce((total, chunk) => total + chunk.byteLength, 0)
  const output = new Uint8Array(length)
  let offset = 0

  chunks.forEach((chunk) => {
    output.set(chunk, offset)
    offset += chunk.byteLength
  })

  return output
}

const formatPdfNumber = (value: number) => Number(value.toFixed(3)).toString()

const createPdfBlob = (pages: PdfImagePage[]) => {
  const objectCount = 2 + pages.length * 3
  const chunks: Uint8Array[] = []
  const offsets = Array<number>(objectCount + 1).fill(0)
  let byteLength = 0

  const append = (value: string | Uint8Array) => {
    const bytes = typeof value === 'string' ? encode(value) : value
    chunks.push(bytes)
    byteLength += bytes.byteLength
  }

  const startObject = (id: number) => {
    offsets[id] = byteLength
    append(`${id} 0 obj\n`)
  }

  const endObject = () => append('\nendobj\n')

  append('%PDF-1.4\n%BarcodeMaker\n')

  startObject(1)
  append('<< /Type /Catalog /Pages 2 0 R >>')
  endObject()

  const pageIds = pages.map((_, index) => 3 + index * 3)
  startObject(2)
  append(
    `<< /Type /Pages /Count ${pages.length} /Kids [${pageIds
      .map((id) => `${id} 0 R`)
      .join(' ')}] >>`,
  )
  endObject()

  pages.forEach((page, index) => {
    const pageId = 3 + index * 3
    const imageId = pageId + 1
    const contentId = pageId + 2
    const widthPt = formatPdfNumber((page.widthMm * 72) / 25.4)
    const heightPt = formatPdfNumber((page.heightMm * 72) / 25.4)
    const content = encode(`q\n${widthPt} 0 0 ${heightPt} 0 0 cm\n/Im0 Do\nQ\n`)

    startObject(pageId)
    append(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt} ${heightPt}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    )
    endObject()

    startObject(imageId)
    append(
      `<< /Type /XObject /Subtype /Image /Width ${page.widthPx} /Height ${page.heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.byteLength} >>\nstream\n`,
    )
    append(page.jpeg)
    append('\nendstream')
    endObject()

    startObject(contentId)
    append(`<< /Length ${content.byteLength} >>\nstream\n`)
    append(content)
    append('endstream')
    endObject()
  })

  const xrefOffset = byteLength
  append(`xref\n0 ${objectCount + 1}\n`)
  append('0000000000 65535 f \n')

  for (let id = 1; id <= objectCount; id += 1) {
    append(`${offsets[id].toString().padStart(10, '0')} 00000 n \n`)
  }

  append(
    `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  )

  const pdfBytes = concatBytes(chunks)
  return new Blob([pdfBytes.buffer as ArrayBuffer], {
    type: 'application/pdf',
  })
}

export const downloadPlansAsPdf = async (
  plans: PagePlan[],
  fileName: string,
) => {
  const images: PdfImagePage[] = []

  for (const page of plans) {
    images.push(await renderPageToImage(page))
  }

  const pdf = createPdfBlob(images)
  const url = URL.createObjectURL(pdf)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

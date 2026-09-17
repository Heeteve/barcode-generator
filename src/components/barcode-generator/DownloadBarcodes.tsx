import React, { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBarcodeContext } from './BarcodeContext'
import JSZip from 'jszip'
import FileSaver from 'file-saver'
import { Download } from 'lucide-react'
import { ImageFormat } from '@/types/image'
import { parseLine } from '@/lib/parseLine'
import { renderBarcodeSvg, svgToImageBlob } from '@/lib/barcode-renderer'
import { useTranslations } from 'next-intl'

interface DownloadBarcodesProps {
  format?: ImageFormat
  onFormatChange?: (format: ImageFormat) => void
  onDownloadSuccess?: () => void
  buttonLabel?: string
}

export const DownloadBarcodes: React.FC<DownloadBarcodesProps> = ({
  format,
  onFormatChange,
  onDownloadSuccess,
  buttonLabel,
}) => {
  const {
    input,
    barcodeLength,
    barcodeHeight,
    showText,
    codeFormat,
    imageFormat,
    setImageFormat,
    barcodeMargin,
    textMode,
    textPosition,
    textFontSize,
    textFontFamily,
    textBold,
    textItalic,
  } = useBarcodeContext()
  const t = useTranslations('Barcode.download')
  const activeImageFormat = format || imageFormat
  const setActiveImageFormat = onFormatChange || setImageFormat

  const generateBarcode = useCallback(
    async (parsed: {
      barcodeValue: string
      displayText: string | undefined
    }): Promise<Blob | string> => {
      const svg = renderBarcodeSvg({
        value: parsed.barcodeValue,
        displayText: parsed.displayText,
        barcodeLength,
        barcodeHeight,
        barcodeMargin,
        showText,
        codeFormat,
        textMode,
        textPosition,
        fontSize: textFontSize,
        fontFamily: textFontFamily,
        bold: textBold,
        italic: textItalic,
      })

      if (activeImageFormat === 'svg') {
        return svg
      }

      return svgToImageBlob(
        svg,
        activeImageFormat,
        activeImageFormat === 'png' ? 2 : 1,
      )
    },
    [
      barcodeLength,
      barcodeHeight,
      barcodeMargin,
      showText,
      codeFormat,
      activeImageFormat,
      textMode,
      textPosition,
      textFontSize,
      textFontFamily,
      textBold,
      textItalic,
    ],
  )

  const downloadBarcodes = useCallback(async () => {
    const lines = input.split('\n').filter((line) => line.trim() !== '')
    const parsed = lines.map(parseLine)

    if (parsed.length === 1) {
      const barcodeData = await generateBarcode(parsed[0])
      if (activeImageFormat === 'svg') {
        const blob = new Blob([barcodeData as string], {
          type: 'image/svg+xml;charset=utf-8',
        })
        FileSaver.saveAs(
          blob,
          'barcode-' + codeFormat + '.' + activeImageFormat,
        )
      } else {
        FileSaver.saveAs(
          barcodeData as Blob,
          'barcode-' + codeFormat + '.' + activeImageFormat,
        )
      }
      onDownloadSuccess?.()
      return
    }

    const zip = new JSZip()
    for (let i = 0; i < parsed.length; i += 1) {
      const barcodeData = await generateBarcode(parsed[i])
      const fileName =
        'barcode-' + codeFormat + '_' + (i + 1) + '.' + activeImageFormat

      if (activeImageFormat === 'svg') {
        zip.file(fileName, barcodeData as string)
      } else {
        zip.file(fileName, barcodeData as Blob)
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    FileSaver.saveAs(content, 'barcodes(barcode-maker).zip')
    onDownloadSuccess?.()
  }, [input, generateBarcode, activeImageFormat, codeFormat, onDownloadSuccess])

  return (
    <div className="flex flex-wrap items-center justify-center space-x-2 space-y-2">
      <Button
        size="lg"
        variant="outline"
        onClick={downloadBarcodes}
        title={buttonLabel || t('button')}
        className="h-10 border-none bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 px-6 text-white hover:from-blue-700 hover:via-purple-700 hover:to-red-700"
      >
        <Download className="mr-2 h-4 w-4" />
        <span className="text-sm">{buttonLabel || t('button')}</span>
      </Button>
      <span className="text-sm">{t('as')}</span>
      <Select
        value={activeImageFormat}
        onValueChange={(value: ImageFormat) => setActiveImageFormat(value)}
      >
        <SelectTrigger
          className="h-8 w-[70px] bg-white"
          aria-label={t('format')}
        >
          <SelectValue placeholder={t('format')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="png">PNG</SelectItem>
          <SelectItem value="jpg">JPG</SelectItem>
          <SelectItem value="gif">GIF</SelectItem>
          <SelectItem value="svg">SVG</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

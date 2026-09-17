import { useCallback, useEffect } from 'react'
import { parseLine } from '@/lib/parseLine'
import { renderBarcodeSvg } from '@/lib/barcode-renderer'
import { useBarcodeContext } from './BarcodeContext'

export const useBarcodeGenerator = () => {
  const {
    input,
    setOutput,
    barcodeLength,
    barcodeHeight,
    showText,
    codeFormat,
    barcodeMargin,
    textMode,
    textPosition,
    textFontSize,
    textFontFamily,
    textBold,
    textItalic,
  } = useBarcodeContext()

  const generateBarcodes = useCallback(() => {
    const lines = input.split('\n').filter((line) => line.trim() !== '')

    try {
      const barcodes = lines.map((line) => {
        const { barcodeValue, displayText } = parseLine(line)
        const svg = renderBarcodeSvg({
          value: barcodeValue,
          displayText,
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

        return '<div class="barcode-item">' + svg + '</div>'
      })

      setOutput(barcodes)
    } catch (error) {
      console.error('Error generating barcodes:', error)
      setOutput([
        '<p class="error-message">Error generating barcodes: ' + error + '</p>',
      ])
    }
  }, [
    input,
    setOutput,
    codeFormat,
    barcodeHeight,
    showText,
    barcodeMargin,
    barcodeLength,
    textMode,
    textPosition,
    textFontSize,
    textFontFamily,
    textBold,
    textItalic,
  ])

  useEffect(() => {
    generateBarcodes()
  }, [generateBarcodes])

  return { generateBarcodes }
}

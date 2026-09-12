import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { useBarcodeContext } from './BarcodeContext'

interface ShareButtonProps {
  variant?:
    'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined
}

const COPY_SCALE = 2

const getSvgDimension = (
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

const svgToPng = async (svg: SVGElement): Promise<Blob> => {
  const width = getSvgDimension(svg, 'width', 2)
  const height = getSvgDimension(svg, 'height', 3)
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width * COPY_SCALE)
  canvas.height = Math.ceil(height * COPY_SCALE)

  const svgBlob = new Blob([new XMLSerializer().serializeToString(svg)], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const imageUrl = URL.createObjectURL(svgBlob)

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

    // 直接以目标分辨率绘制 SVG，避免先生成低分辨率图片再放大
    context.imageSmoothingEnabled = false
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create PNG image'))
        }
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  variant,
  className,
  size,
}) => {
  const { output } = useBarcodeContext()
  const [isCopying, setIsCopying] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    if (isCopying) {
      return
    }

    try {
      setIsCopying(true)

      const parser = new DOMParser()
      const parsedDocument = parser.parseFromString(
        output[0] || '',
        'text/html',
      )
      const svg = parsedDocument.querySelector('svg')
      if (!svg) {
        throw new Error('No barcode image available')
      }

      const pngBlob = await svgToPng(svg)
      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
        throw new Error('Image clipboard is not supported by this browser')
      }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob }),
      ])
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 1500)
    } catch (error) {
      console.error('Failed to copy barcode PNG:', error)
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <Button
      variant={variant}
      className={className}
      size={size}
      onClick={handleCopy}
      disabled={isCopying}
      title="Copy Barcode PNG"
      aria-label="Copy Barcode PNG"
    >
      {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
    </Button>
  )
}

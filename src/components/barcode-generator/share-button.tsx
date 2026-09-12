import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Image as ImageIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBarcodeContext } from './BarcodeContext'
import { useTranslations } from 'next-intl'

interface ShareButtonProps {
  variant?:
    'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined
  onCopySuccess?: () => void
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

const getBarcodeSvg = (markup: string): SVGElement | null => {
  const parser = new DOMParser()
  const parsedDocument = parser.parseFromString(markup, 'text/html')
  return parsedDocument.querySelector('svg')
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
  onCopySuccess,
}) => {
  const { output } = useBarcodeContext()
  const t = useTranslations('Barcode.copy')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCopying, setIsCopying] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const copyBarcodeImage = async (index: number) => {
    if (isCopying || !output[index]) {
      return
    }

    try {
      setIsCopying(true)

      const svg = getBarcodeSvg(output[index])
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
      onCopySuccess?.()
      window.setTimeout(() => setIsCopied(false), 1500)
    } catch (error) {
      console.error('Failed to copy barcode PNG:', error)
    } finally {
      setIsCopying(false)
    }
  }

  const handleCopyButtonClick = () => {
    if (output.length > 1) {
      setCurrentIndex(0)
      setIsCopied(false)
      setIsDialogOpen(true)
      return
    }

    void copyBarcodeImage(0)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setIsCopied(false)
    }
  }

  const moveSelection = (direction: number) => {
    setCurrentIndex(
      (index) => (index + direction + output.length) % output.length,
    )
    setIsCopied(false)
  }

  useEffect(() => {
    if (output.length === 0) {
      setIsDialogOpen(false)
      setCurrentIndex(0)
      return
    }

    setCurrentIndex((index) => Math.min(index, output.length - 1))
  }, [output.length])

  return (
    <>
      <Button
        variant={variant}
        className={className}
        size={size}
        onClick={handleCopyButtonClick}
        disabled={output.length === 0 || isCopying}
        title={t('button')}
        aria-label={t('button')}
      >
        {isCopied && output.length === 1 ? (
          <Check className="h-5 w-5" />
        ) : (
          <Copy className="h-5 w-5" />
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="bg-white text-slate-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {t('image', {
                  current: currentIndex + 1,
                  total: output.length,
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  className="h-8 w-8 bg-slate-900 text-white hover:bg-slate-700"
                  onClick={() => moveSelection(-1)}
                  aria-label={t('previous')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="h-8 w-8 bg-slate-900 text-white hover:bg-slate-700"
                  onClick={() => moveSelection(1)}
                  aria-label={t('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className="flex min-h-[180px] items-center justify-center overflow-auto border bg-white p-4 [&_svg]:h-auto [&_svg]:max-h-[280px] [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: output[currentIndex] || '' }}
            />

            <Button
              type="button"
              className="w-full bg-slate-900 text-white hover:bg-slate-700"
              onClick={() => void copyBarcodeImage(currentIndex)}
              disabled={isCopying}
            >
              {isCopied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <ImageIcon className="mr-2 h-4 w-4" />
              )}
              {isCopying
                ? t('copying')
                : isCopied
                  ? t('copied')
                  : t('copy-as-image')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

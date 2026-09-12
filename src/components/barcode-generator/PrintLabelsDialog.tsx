'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useLocale } from 'next-intl'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Files,
  Printer,
  RotateCcw,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  buildPagePlans,
  DEFAULT_SHEET_SETTINGS,
  DEFAULT_THERMAL_SETTINGS,
  downloadPlansAsPdf,
  getSheetGrid,
  PAPER_SIZES,
  PaperSizeKey,
  printPlans,
  PrintType,
  SHEET_PRESETS,
  SheetSettings,
  THERMAL_SIZES,
  ThermalSettings,
} from './label-print'

interface PrintLabelsDialogProps {
  output: string[]
  codeFormat: string
}

interface Copy {
  button: string
  title: string
  description: string
  labels: (count: number) => string
  printType: string
  sheet: string
  sheetHint: string
  thermal: string
  thermalHint: string
  sheetPreset: string
  custom: string
  paperSize: string
  orientation: string
  portrait: string
  landscape: string
  labelSize: string
  width: string
  height: string
  margins: string
  top: string
  right: string
  bottom: string
  left: string
  gaps: string
  horizontal: string
  vertical: string
  cutGuides: string
  cutGuidesHint: string
  startPosition: string
  startAt: (position: number) => string
  showMore: string
  showLess: string
  template: string
  retailTemplate: string
  warehouseTemplate: string
  shippingTemplate: string
  shippingInchTemplate: string
  direction: string
  normal: string
  rotate: string
  preview: string
  previous: string
  next: string
  page: (current: number, total: number) => string
  startsHere: (position: number) => string
  empty: string
  reset: string
  downloadPdf: string
  downloading: string
  print: string
  pdfError: string
}

const COPY: Record<'zh' | 'en', Copy> = {
  zh: {
    button: '打印标签',
    title: '标签打印排版',
    description: '准确排版标签纸与热敏标签',
    labels: (count) => `${count} 个标签`,
    printType: '打印类型',
    sheet: '标签纸',
    sheetHint: 'A4 / Letter 标签纸',
    thermal: '热敏 / 卷筒标签',
    thermalHint: 'Zebra、TSC 等',
    sheetPreset: '标签纸型号',
    custom: '自定义',
    paperSize: '纸张尺寸',
    orientation: '方向',
    portrait: '纵向',
    landscape: '横向',
    labelSize: '标签尺寸',
    width: '宽度 (mm)',
    height: '高度 (mm)',
    margins: '边距 (mm)',
    top: '上',
    right: '右',
    bottom: '下',
    left: '左',
    gaps: '标签间距 (mm)',
    horizontal: '水平',
    vertical: '垂直',
    cutGuides: '打印裁切辅助线',
    cutGuidesHint: '适用于打印后需要自行裁切的普通纸。',
    startPosition: '起始位置',
    startAt: (position) => `从第 ${position} 个标签开始`,
    showMore: '显示更多行',
    showLess: '收起',
    template: '模板',
    retailTemplate: '商品标签 · 50 × 30 mm',
    warehouseTemplate: '仓储标签 · 60 × 40 mm',
    shippingTemplate: '物流标签 · 100 × 150 mm',
    shippingInchTemplate: '物流标签 · 4 × 6 in',
    direction: '方向',
    normal: '正常',
    rotate: '旋转 90°',
    preview: '预览',
    previous: '上一页',
    next: '下一页',
    page: (current, total) => `第 ${current} / ${total} 页`,
    startsHere: (position) => `从这里开始（第 ${position} 格）`,
    empty: '没有可打印的条码',
    reset: '全部重置',
    downloadPdf: '下载 PDF',
    downloading: '正在生成 PDF…',
    print: '打印',
    pdfError: 'PDF 生成失败，请重试。',
  },
  en: {
    button: 'Print labels',
    title: 'Label print layout',
    description: 'Precisely arrange label sheets and thermal labels',
    labels: (count) => `${count} ${count === 1 ? 'label' : 'labels'}`,
    printType: 'Print type',
    sheet: 'Label sheet',
    sheetHint: 'A4 / Letter label sheets',
    thermal: 'Thermal / roll labels',
    thermalHint: 'Zebra, TSC, and more',
    sheetPreset: 'Label sheet preset',
    custom: 'Custom',
    paperSize: 'Paper size',
    orientation: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Landscape',
    labelSize: 'Label size',
    width: 'Width (mm)',
    height: 'Height (mm)',
    margins: 'Margins (mm)',
    top: 'Top',
    right: 'Right',
    bottom: 'Bottom',
    left: 'Left',
    gaps: 'Label gaps (mm)',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
    cutGuides: 'Print cutting guides',
    cutGuidesHint: 'Useful when labels need to be cut from plain paper.',
    startPosition: 'Starting position',
    startAt: (position) => `Start at label ${position}`,
    showMore: 'Show more rows',
    showLess: 'Show fewer rows',
    template: 'Template',
    retailTemplate: 'Product label · 50 × 30 mm',
    warehouseTemplate: 'Warehouse label · 60 × 40 mm',
    shippingTemplate: 'Shipping label · 100 × 150 mm',
    shippingInchTemplate: 'Shipping label · 4 × 6 in',
    direction: 'Direction',
    normal: 'Normal',
    rotate: 'Rotate 90°',
    preview: 'Preview',
    previous: 'Previous page',
    next: 'Next page',
    page: (current, total) => `Page ${current} / ${total}`,
    startsHere: (position) => `Starts here (cell ${position})`,
    empty: 'There are no printable barcodes',
    reset: 'Reset all',
    downloadPdf: 'Download PDF',
    downloading: 'Generating PDF…',
    print: 'Print',
    pdfError: 'Unable to generate the PDF. Please try again.',
  },
}

const SectionTitle: React.FC<{
  number: number
  children: React.ReactNode
}> = ({ number, children }) => (
  <div className="mb-3 flex items-center gap-2">
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
      {number}
    </span>
    <h3 className="text-sm font-semibold text-slate-900">{children}</h3>
  </div>
)

const NumberField: React.FC<{
  id: string
  label: string
  value: number
  min?: number
  onChange: (value: number) => void
}> = ({ id, label, value, min = 0, onChange }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs font-medium text-slate-600">
      {label}
    </Label>
    <Input
      id={id}
      type="number"
      min={min}
      step="0.1"
      value={Number.isFinite(value) ? value : 0}
      onChange={(event) => {
        const nextValue = Number(event.target.value)
        if (Number.isFinite(nextValue)) {
          onChange(Math.max(min, nextValue))
        }
      }}
      className="h-9 bg-white"
    />
  </div>
)

const ChoiceCard: React.FC<{
  selected: boolean
  icon: React.ReactNode
  title: string
  hint: string
  onClick: () => void
}> = ({ selected, icon, title, hint, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn(
      'flex min-h-16 w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
      selected
        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
    )}
  >
    <span
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
        selected ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-500',
      )}
    >
      {icon}
    </span>
    <span>
      <span className="block text-sm font-semibold">{title}</span>
      <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
    </span>
  </button>
)

export const PrintLabelsDialog: React.FC<PrintLabelsDialogProps> = ({
  output,
  codeFormat,
}) => {
  const locale = useLocale()
  const copy = COPY[locale.toLowerCase().startsWith('zh') ? 'zh' : 'en']
  const isZh = locale.toLowerCase().startsWith('zh')
  const barcodes = useMemo(
    () => output.filter((item) => item.includes('<svg')),
    [output],
  )
  const [open, setOpen] = useState(false)
  const [printType, setPrintType] = useState<PrintType>('sheet')
  const [sheetPreset, setSheetPreset] = useState('a4-l7160')
  const [sheet, setSheet] = useState<SheetSettings>({
    ...DEFAULT_SHEET_SETTINGS,
  })
  const [thermal, setThermal] = useState<ThermalSettings>({
    ...DEFAULT_THERMAL_SETTINGS,
  })
  const [thermalTemplate, setThermalTemplate] = useState('custom')
  const [thermalSize, setThermalSize] = useState('50x30')
  const [showAllPositions, setShowAllPositions] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState('')

  const grid = useMemo(() => getSheetGrid(sheet), [sheet])
  const plans = useMemo(
    () => buildPagePlans(barcodes, printType, sheet, thermal),
    [barcodes, printType, sheet, thermal],
  )
  const totalPages = plans.length
  const currentPlan = plans[Math.min(currentPage, totalPages - 1)]
  const positionCount = showAllPositions
    ? Math.min(grid.capacity, 200)
    : Math.min(grid.capacity, grid.columns * 2)

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(0, totalPages - 1)))
  }, [totalPages])

  useEffect(() => {
    setSheet((current) => ({
      ...current,
      startPosition: Math.min(
        current.startPosition,
        Math.max(0, grid.capacity - 1),
      ),
    }))
  }, [grid.capacity])

  const updateSheet = <Key extends keyof SheetSettings>(
    key: Key,
    value: SheetSettings[Key],
  ) => {
    setSheetPreset('custom')
    setSheet((current) => ({ ...current, [key]: value }))
    setCurrentPage(0)
  }

  const applySheetPreset = (presetId: string) => {
    setSheetPreset(presetId)
    const preset = SHEET_PRESETS.find((item) => item.id === presetId)
    if (preset) {
      setSheet({ ...preset.settings, startPosition: 0 })
      setShowAllPositions(false)
      setCurrentPage(0)
    }
  }

  const applyThermalSize = (width: number, height: number) => {
    setThermalSize(`${width}x${height}`)
    setThermal((current) => ({ ...current, width, height }))
    setCurrentPage(0)
  }

  const applyThermalTemplate = (template: string) => {
    setThermalTemplate(template)

    if (template === 'retail') {
      applyThermalSize(50, 30)
    } else if (template === 'warehouse') {
      applyThermalSize(60, 40)
    } else if (template === 'shipping') {
      applyThermalSize(100, 150)
    } else if (template === 'shipping-inch') {
      applyThermalSize(101.6, 152.4)
    }
  }

  const resetAll = () => {
    setPrintType('sheet')
    setSheetPreset('a4-l7160')
    setSheet({ ...DEFAULT_SHEET_SETTINGS })
    setThermal({ ...DEFAULT_THERMAL_SETTINGS })
    setThermalTemplate('custom')
    setThermalSize('50x30')
    setShowAllPositions(false)
    setCurrentPage(0)
    setError('')
  }

  const handlePrint = () => {
    if (!barcodes.length) {
      return
    }

    printPlans(plans, `${copy.title} - ${codeFormat}`)
  }

  const handleDownloadPdf = async () => {
    if (!barcodes.length || isDownloading) {
      return
    }

    setIsDownloading(true)
    setError('')

    try {
      await downloadPlansAsPdf(
        plans,
        `barcodes-${codeFormat.toLowerCase()}.pdf`,
      )
    } catch (downloadError) {
      console.error('PDF generation error:', downloadError)
      setError(copy.pdfError)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) {
          setError('')
          setCurrentPage(0)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!barcodes.length}
          className="gap-2 px-2"
          aria-label={copy.button}
          title={copy.button}
        >
          <Printer className="h-5 w-5" />
          <span className="hidden text-xs font-medium xl:inline">
            {copy.button}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[min(92vh,880px)] w-[calc(100vw-1rem)] max-w-[960px] flex-col gap-0 overflow-hidden bg-white p-0 text-slate-900 sm:rounded-xl">
        <DialogHeader className="shrink-0 border-b border-slate-200 px-5 py-4 pr-12 text-left">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
              <Printer className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-base">{copy.title}</DialogTitle>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {codeFormat}
                  <span className="px-1 text-slate-300">•</span>
                  {copy.labels(barcodes.length)}
                </span>
              </div>
              <DialogDescription className="mt-1 text-xs text-slate-500">
                {copy.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="min-h-0 flex-[1.05] space-y-5 overflow-y-auto border-b border-slate-200 p-4 lg:border-b-0 lg:border-r lg:p-5">
            <section>
              <SectionTitle number={1}>{copy.printType}</SectionTitle>
              <div className="grid gap-2 sm:grid-cols-2">
                <ChoiceCard
                  selected={printType === 'sheet'}
                  icon={<Files className="h-4 w-4" />}
                  title={copy.sheet}
                  hint={copy.sheetHint}
                  onClick={() => {
                    setPrintType('sheet')
                    setCurrentPage(0)
                  }}
                />
                <ChoiceCard
                  selected={printType === 'thermal'}
                  icon={<Tag className="h-4 w-4" />}
                  title={copy.thermal}
                  hint={copy.thermalHint}
                  onClick={() => {
                    setPrintType('thermal')
                    setCurrentPage(0)
                  }}
                />
              </div>
            </section>

            {printType === 'sheet' ? (
              <>
                <section>
                  <SectionTitle number={2}>{copy.sheetPreset}</SectionTitle>
                  <Select value={sheetPreset} onValueChange={applySheetPreset}>
                    <SelectTrigger className="h-auto min-h-10 bg-white py-2 text-left">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-w-[min(90vw,620px)] bg-white text-slate-900">
                      {SHEET_PRESETS.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {isZh ? preset.nameZh : preset.nameEn}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">{copy.custom}</SelectItem>
                    </SelectContent>
                  </Select>
                </section>

                <section>
                  <SectionTitle number={3}>{copy.paperSize}</SectionTitle>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <Select
                      value={sheet.paper}
                      onValueChange={(value) =>
                        updateSheet('paper', value as PaperSizeKey)
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-slate-900">
                        {PAPER_SIZES.map((paper) => (
                          <SelectItem key={paper.id} value={paper.id}>
                            {isZh ? paper.nameZh : paper.nameEn} ({paper.width}{' '}
                            × {paper.height} mm)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
                      {(['portrait', 'landscape'] as const).map(
                        (orientation) => (
                          <button
                            key={orientation}
                            type="button"
                            aria-pressed={sheet.orientation === orientation}
                            onClick={() =>
                              updateSheet('orientation', orientation)
                            }
                            className={cn(
                              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                              sheet.orientation === orientation
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700',
                            )}
                          >
                            {orientation === 'portrait'
                              ? copy.portrait
                              : copy.landscape}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <SectionTitle number={4}>{copy.labelSize}</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      id="sheet-label-width"
                      label={copy.width}
                      value={sheet.labelWidth}
                      min={1}
                      onChange={(value) => updateSheet('labelWidth', value)}
                    />
                    <NumberField
                      id="sheet-label-height"
                      label={copy.height}
                      value={sheet.labelHeight}
                      min={1}
                      onChange={(value) => updateSheet('labelHeight', value)}
                    />
                  </div>
                </section>

                <section>
                  <SectionTitle number={5}>{copy.margins}</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      id="margin-top"
                      label={copy.top}
                      value={sheet.marginTop}
                      onChange={(value) => updateSheet('marginTop', value)}
                    />
                    <NumberField
                      id="margin-right"
                      label={copy.right}
                      value={sheet.marginRight}
                      onChange={(value) => updateSheet('marginRight', value)}
                    />
                    <NumberField
                      id="margin-bottom"
                      label={copy.bottom}
                      value={sheet.marginBottom}
                      onChange={(value) => updateSheet('marginBottom', value)}
                    />
                    <NumberField
                      id="margin-left"
                      label={copy.left}
                      value={sheet.marginLeft}
                      onChange={(value) => updateSheet('marginLeft', value)}
                    />
                  </div>
                </section>

                <section>
                  <SectionTitle number={6}>{copy.gaps}</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      id="gap-x"
                      label={copy.horizontal}
                      value={sheet.gapX}
                      onChange={(value) => updateSheet('gapX', value)}
                    />
                    <NumberField
                      id="gap-y"
                      label={copy.vertical}
                      value={sheet.gapY}
                      onChange={(value) => updateSheet('gapY', value)}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="pr-4">
                      <Label
                        htmlFor="print-cut-guides"
                        className="text-xs font-semibold text-slate-800"
                      >
                        {copy.cutGuides}
                      </Label>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {copy.cutGuidesHint}
                      </p>
                    </div>
                    <Switch
                      id="print-cut-guides"
                      checked={sheet.cutGuides}
                      onCheckedChange={(checked) =>
                        updateSheet('cutGuides', checked)
                      }
                    />
                  </div>
                </section>

                <section>
                  <SectionTitle number={7}>{copy.startPosition}</SectionTitle>
                  <div
                    className="grid gap-1.5"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(grid.columns, 10)}, minmax(30px, 1fr))`,
                    }}
                  >
                    {Array.from({ length: positionCount }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        aria-label={copy.startAt(index + 1)}
                        aria-pressed={sheet.startPosition === index}
                        onClick={() => {
                          setSheet((current) => ({
                            ...current,
                            startPosition: index,
                          }))
                          setCurrentPage(0)
                        }}
                        className={cn(
                          'flex aspect-[1.45] min-h-8 items-center justify-center rounded border text-xs font-medium transition-colors',
                          sheet.startPosition === index
                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600',
                        )}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  {grid.capacity > grid.columns * 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllPositions((value) => !value)}
                      className="mt-2 h-7 px-2 text-xs text-slate-500"
                    >
                      {showAllPositions ? copy.showLess : copy.showMore}
                    </Button>
                  )}
                </section>
              </>
            ) : (
              <>
                <section>
                  <SectionTitle number={2}>{copy.template}</SectionTitle>
                  <Select
                    value={thermalTemplate}
                    onValueChange={applyThermalTemplate}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-slate-900">
                      <SelectItem value="custom">{copy.custom}</SelectItem>
                      <SelectItem value="retail">
                        {copy.retailTemplate}
                      </SelectItem>
                      <SelectItem value="warehouse">
                        {copy.warehouseTemplate}
                      </SelectItem>
                      <SelectItem value="shipping">
                        {copy.shippingTemplate}
                      </SelectItem>
                      <SelectItem value="shipping-inch">
                        {copy.shippingInchTemplate}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </section>

                <section>
                  <SectionTitle number={3}>{copy.labelSize}</SectionTitle>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {THERMAL_SIZES.map(([width, height]) => {
                      const id = `${width}x${height}`
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={thermalSize === id}
                          onClick={() => applyThermalSize(width, height)}
                          className={cn(
                            'rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                            thermalSize === id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                          )}
                        >
                          {width} × {height} mm
                          {width === 101.6 && height === 152.4 && (
                            <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                              4 × 6 in
                            </span>
                          )}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      aria-pressed={thermalSize === 'custom'}
                      onClick={() => {
                        setThermalSize('custom')
                        setThermalTemplate('custom')
                      }}
                      className={cn(
                        'rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                        thermalSize === 'custom'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                      )}
                    >
                      {copy.custom}
                    </button>
                  </div>

                  {thermalSize === 'custom' && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <NumberField
                        id="thermal-label-width"
                        label={copy.width}
                        value={thermal.width}
                        min={1}
                        onChange={(value) => {
                          setThermal((current) => ({
                            ...current,
                            width: value,
                          }))
                          setCurrentPage(0)
                        }}
                      />
                      <NumberField
                        id="thermal-label-height"
                        label={copy.height}
                        value={thermal.height}
                        min={1}
                        onChange={(value) => {
                          setThermal((current) => ({
                            ...current,
                            height: value,
                          }))
                          setCurrentPage(0)
                        }}
                      />
                    </div>
                  )}
                </section>

                <section>
                  <SectionTitle number={4}>{copy.direction}</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      aria-pressed={!thermal.rotate}
                      onClick={() =>
                        setThermal((current) => ({
                          ...current,
                          rotate: false,
                        }))
                      }
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                        !thermal.rotate
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600',
                      )}
                    >
                      {copy.normal}
                    </button>
                    <button
                      type="button"
                      aria-pressed={thermal.rotate}
                      onClick={() =>
                        setThermal((current) => ({
                          ...current,
                          rotate: true,
                        }))
                      }
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                        thermal.rotate
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600',
                      )}
                    >
                      {copy.rotate}
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>

          <div className="flex min-h-[220px] flex-[0.95] flex-col bg-slate-100/80 lg:min-h-0">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
              <h2 className="text-sm font-semibold text-slate-900">
                {copy.preview}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 0}
                  aria-label={copy.previous}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(0, page - 1))
                  }
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-20 text-center text-xs font-medium text-slate-700">
                  {copy.page(currentPage + 1, totalPages)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={currentPage >= totalPages - 1}
                  aria-label={copy.next}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages - 1, page + 1))
                  }
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-5">
              {currentPlan ? (
                <div
                  className="relative shrink-0 overflow-hidden border border-slate-300 bg-white shadow-sm"
                  style={{
                    aspectRatio: `${currentPlan.width} / ${currentPlan.height}`,
                    width:
                      currentPlan.width >= currentPlan.height
                        ? 'min(100%, 430px)'
                        : 'min(78%, 300px)',
                  }}
                >
                  {currentPlan.cells.map((cell, index) => (
                    <div
                      key={index}
                      className={cn(
                        'absolute flex items-center justify-center overflow-hidden p-[1.2%]',
                        printType === 'sheet' &&
                          'border border-dashed border-slate-300',
                      )}
                      style={{
                        left: `${(cell.x / currentPlan.width) * 100}%`,
                        top: `${(cell.y / currentPlan.height) * 100}%`,
                        width: `${(cell.width / currentPlan.width) * 100}%`,
                        height: `${(cell.height / currentPlan.height) * 100}%`,
                      }}
                    >
                      {printType === 'sheet' &&
                        currentPage === 0 &&
                        index === sheet.startPosition && (
                          <span className="absolute left-0 top-0 z-10 max-w-full truncate bg-blue-50/95 px-1 py-0.5 text-[7px] font-medium leading-none text-blue-700">
                            {copy.startsHere(index + 1)}
                          </span>
                        )}
                      {cell.barcode && (
                        <div
                          className={cn(
                            'flex items-center justify-center [&_.barcode-item]:flex [&_.barcode-item]:h-full [&_.barcode-item]:w-full [&_.barcode-item]:items-center [&_.barcode-item]:justify-center [&_svg]:!h-auto [&_svg]:!max-h-full [&_svg]:!w-auto [&_svg]:!max-w-full',
                            cell.rotate
                              ? 'shrink-0 rotate-90'
                              : 'h-full w-full',
                          )}
                          style={
                            cell.rotate
                              ? {
                                  width: `${(cell.height / cell.width) * 100}%`,
                                  height: `${(cell.width / cell.height) * 100}%`,
                                }
                              : undefined
                          }
                          dangerouslySetInnerHTML={{ __html: cell.barcode }}
                        />
                      )}
                    </div>
                  ))}
                  {!barcodes.length && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-xs text-slate-400">
                      {copy.empty}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">{copy.empty}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetAll}
              className="gap-2 px-2 text-xs text-slate-600"
            >
              <RotateCcw className="h-4 w-4" />
              {copy.reset}
            </Button>
            {error && (
              <span className="text-xs text-red-600 sm:hidden">{error}</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            {error && (
              <span className="hidden text-xs text-red-600 sm:inline">
                {error}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!barcodes.length || isDownloading}
              onClick={handleDownloadPdf}
              className="gap-2 bg-white"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? copy.downloading : copy.downloadPdf}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!barcodes.length}
              onClick={handlePrint}
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              {copy.print}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

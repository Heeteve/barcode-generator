'use client'

import React, { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Barcode, CheckCircle2, Download, Printer, QrCode } from 'lucide-react'
import { barcodeTypes } from '@/config/barcode-types'
import { ImageFormat } from '@/types/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BarcodeProvider, useBarcodeContext } from './BarcodeContext'
import { InputComponent, OptionsComponent } from './BarcodeComponents'
import { DownloadBarcodes } from './DownloadBarcodes'
import { PrintLabelsDialog } from './PrintLabelsDialog'
import { ShareButton } from './share-button'
import { useBarcodeGenerator } from './useBarcodeGenerator'
import { cn } from '@/lib/utils'

type Step = 1 | 2 | 3 | 4
type ActionMode = 'export' | 'print'

const defaultFormat = 'Code128'
const allBarcodeTypes = barcodeTypes.flatMap((category) => category.types)
const quickFormats = [
  { value: 'Code128', label: 'any', hint: 'any-hint' },
  { value: 'Ean13', label: 'ean13', hint: 'ean13-hint' },
  { value: 'Qrcode', label: 'qrcode', hint: 'qrcode-hint' },
]

const getInitialData = (format: string) =>
  allBarcodeTypes.find((type) => type.value === format)?.initData || ''

const GuidedBarcodeGeneratorContent: React.FC = () => {
  useBarcodeGenerator()

  const guide = useTranslations('Guide')
  const { input, setInput, output, codeFormat, setCodeFormat } =
    useBarcodeContext()
  const [step, setStep] = useState<Step>(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionMode, setActionMode] = useState<ActionMode>('export')
  const [exportFormat, setExportFormat] = useState<ImageFormat>('png')
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [inputTouched, setInputTouched] = useState(false)

  const inputCount = input
    .split('\n')
    .filter((line) => line.trim() !== '').length
  const validOutput =
    inputCount > 0 &&
    output.length === inputCount &&
    output.every((item) => item.includes('<svg'))
  const codeFormatName =
    allBarcodeTypes.find(
      (type) => type.value.toLowerCase() === codeFormat.toLowerCase(),
    )?.name || codeFormat

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) {
      return barcodeTypes
    }

    return barcodeTypes
      .map((category) => ({
        ...category,
        types: category.types.filter(
          (type) =>
            type.name.toLowerCase().includes(normalizedSearch) ||
            type.value.toLowerCase().includes(normalizedSearch),
        ),
      }))
      .filter((category) => category.types.length > 0)
  }, [searchTerm])

  const numberedOutput = output
    .map((svg, index) => {
      const number =
        output.length > 1
          ? `<span class="mr-2 text-sm font-medium">${index + 1}.</span>`
          : ''

      return `<div class="barcode-item mb-3 flex items-center justify-center">${number}${svg}</div>`
    })
    .join('')

  const selectFormat = (format: string) => {
    if (codeFormat.toLowerCase() !== format.toLowerCase()) {
      setCodeFormat(format)
      setInput(getInitialData(format))
    }
    setInputTouched(false)
  }

  const continueFromInput = () => {
    setInputTouched(true)
    if (validOutput) {
      setStep(3)
    }
  }

  const restart = () => {
    setCodeFormat(defaultFormat)
    setInput(getInitialData(defaultFormat))
    setSearchTerm('')
    setActionMode('export')
    setExportFormat('png')
    setInputTouched(false)
    setStep(1)
  }

  const stepLabels = [
    guide('steps.format'),
    guide('steps.input'),
    guide('steps.action'),
    guide('steps.complete'),
  ]

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {guide('title')}
        </h2>
        <p className="mt-2 text-sm text-blue-100">{guide('subtitle')}</p>
      </div>

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1
          const active = step === stepNumber
          const finished = step > stepNumber

          return (
            <li key={label}>
              <button
                type="button"
                disabled={!finished}
                onClick={() => setStep(stepNumber as Step)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium',
                  active || finished
                    ? 'border-white bg-white text-slate-900'
                    : 'border-white/30 bg-white/10 text-blue-100',
                  finished && 'cursor-pointer hover:bg-blue-50',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs',
                    active || finished
                      ? 'bg-slate-900 text-white'
                      : 'bg-white/20 text-white',
                  )}
                >
                  {finished ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
                </span>
                <span>{label}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <Card className="border-white/30 bg-white p-5 text-slate-900 shadow-xl sm:p-7">
        {step === 1 && (
          <section aria-labelledby="guide-format-title">
            <div className="mb-5">
              <h3 id="guide-format-title" className="text-xl font-bold">
                {guide('format.title')}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {guide('format.description')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {quickFormats.map((option) => {
                const selected =
                  codeFormat.toLowerCase() === option.value.toLowerCase()

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectFormat(option.value)}
                    className={cn(
                      'flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center transition-colors',
                      selected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50',
                    )}
                  >
                    {option.value === 'Qrcode' ? (
                      <QrCode className="h-8 w-8" />
                    ) : (
                      <Barcode className="h-8 w-8" />
                    )}
                    <span className="text-base font-semibold">
                      {guide(`format.quick.${option.label}`)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {guide(`format.quick.${option.hint}`)}
                    </span>
                  </button>
                )
              })}
            </div>

            <details className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                {guide('format.advanced')}
              </summary>
              <div className="mt-4">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={guide('format.search-placeholder')}
                  className="mb-4 bg-white"
                />

                <ScrollArea className="h-[min(42vh,380px)] pr-3">
                  <div className="space-y-5">
                    {filteredCategories.map((category) => (
                      <section key={category.name}>
                        <h4 className="mb-2 text-sm font-semibold text-slate-500">
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                          {category.types.map((type) => {
                            const selected =
                              codeFormat.toLowerCase() ===
                              type.value.toLowerCase()

                            return (
                              <button
                                key={type.value}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => selectFormat(type.value)}
                                className={cn(
                                  'flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center transition-colors',
                                  selected
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-300'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50',
                                )}
                              >
                                {type.value.toLowerCase() === 'qrcode' ? (
                                  <QrCode className="h-7 w-7" />
                                ) : (
                                  <Barcode className="h-7 w-7" />
                                )}
                                <span className="text-sm font-semibold">
                                  {type.name}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </details>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {guide('format.continue')}
              </Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="guide-input-title">
            <div className="mb-5">
              <h3 id="guide-input-title" className="text-xl font-bold">
                {guide('input.title')}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {guide('input.description')}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="space-y-4">
                <InputComponent />
                <details className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer text-sm font-semibold">
                    {guide('input.advanced')}
                  </summary>
                  <div className="mt-4">
                    <OptionsComponent />
                  </div>
                </details>
                {inputTouched && !validOutput && (
                  <p className="text-sm text-red-600">
                    {guide('input.invalid')}
                  </p>
                )}
              </div>

              <div>
                <h4 className="mb-3 text-base font-semibold">
                  {guide('input.preview')}
                </h4>
                <div
                  className="min-h-[300px] overflow-auto rounded-lg border bg-blue-50 p-4 [&_.barcode-item]:max-w-full [&_svg]:h-auto [&_svg]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: numberedOutput }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                {guide('input.back')}
              </Button>
              <Button
                type="button"
                onClick={continueFromInput}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {guide('input.continue')}
              </Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="guide-action-title">
            <div className="mb-5">
              <h3 id="guide-action-title" className="text-xl font-bold">
                {guide('action.title')}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {guide('action.description')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={actionMode === 'export'}
                onClick={() => setActionMode('export')}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  actionMode === 'export'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white hover:border-blue-300',
                )}
              >
                <Download className="mb-3 h-6 w-6" />
                <span className="block font-semibold">
                  {guide('action.export')}
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {guide('action.export-hint')}
                </span>
              </button>
              <button
                type="button"
                aria-pressed={actionMode === 'print'}
                onClick={() => setActionMode('print')}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  actionMode === 'print'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white hover:border-blue-300',
                )}
              >
                <Printer className="mb-3 h-6 w-6" />
                <span className="block font-semibold">
                  {guide('action.print')}
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  {guide('action.print-hint')}
                </span>
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              {actionMode === 'export' ? (
                <div className="space-y-4">
                  <DownloadBarcodes
                    format={exportFormat}
                    onFormatChange={setExportFormat}
                    buttonLabel={guide('action.download')}
                  />
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <ShareButton variant="outline" size="default" />
                    <span className="text-sm font-medium">
                      {guide('action.copy')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <Printer className="h-10 w-10 text-blue-600" />
                  <Button
                    type="button"
                    onClick={() => setPrintDialogOpen(true)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {guide('action.open-print')}
                  </Button>
                  <PrintLabelsDialog
                    output={output}
                    codeFormat={codeFormat}
                    open={printDialogOpen}
                    onOpenChange={setPrintDialogOpen}
                    trigger={null}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                {guide('action.back')}
              </Button>
              <Button
                type="button"
                onClick={() => setStep(4)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {guide('action.complete')}
              </Button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            <h3 className="mt-5 text-2xl font-bold">
              {guide('complete.title')}
            </h3>
            <p className="mt-3 max-w-md text-sm text-slate-500">
              {guide('complete.description', {
                format: codeFormatName,
                count: inputCount,
              })}
            </p>
            <Button
              type="button"
              onClick={restart}
              className="mt-7 bg-blue-600 text-white hover:bg-blue-700"
            >
              {guide('complete.restart')}
            </Button>
          </section>
        )}
      </Card>
    </div>
  )
}

const GuidedBarcodeGenerator: React.FC = () => (
  <BarcodeProvider
    value={{
      initCodeFormat: defaultFormat,
      initialData: getInitialData(defaultFormat),
    }}
  >
    <GuidedBarcodeGeneratorContent />
  </BarcodeProvider>
)

export default GuidedBarcodeGenerator

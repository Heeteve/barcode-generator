import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Copy, Lock, Text } from 'lucide-react'
import { useBarcodeContext } from './BarcodeContext'

import { useTranslations } from 'next-intl'
import { ShareButton } from './share-button'
import { Switch } from '@/components/ui/switch'
import ScrollControls from './ScrollControls'
import ImportData from './ImportData'
import { lockHeight } from '@/config/barcode-types'
import { PrintLabelsDialog } from './PrintLabelsDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { clampBarcodeTextFontSize } from '@/types/barcode-text'
import { cn } from '@/lib/utils'

export const InputComponent: React.FC = () => {
  const t = useTranslations('Barcode')
  const { input, setInput, showText } = useBarcodeContext()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const insertTextSeparator = (start: number, end: number) => {
    const textarea = inputRef.current
    if (!textarea) return

    const newValue = input.slice(0, start) + '\t' + input.slice(end)
    setInput(newValue)

    requestAnimationFrame(() => {
      textarea.focus({ preventScroll: true })
      textarea.setSelectionRange(start + 1, start + 1)
    })
  }

  const handleInsertTextSeparator = () => {
    const textarea = inputRef.current
    if (!textarea) return

    const isFocused = document.activeElement === textarea
    const start = isFocused ? textarea.selectionStart : input.length
    const end = isFocused ? textarea.selectionEnd : input.length
    insertTextSeparator(start, end)
  }

  return (
    <div className="form-control">
      <label htmlFor="input" className="label">
        <div className="flex justify-between">
          <span className="label-text text-base font-semibold">
            {t('input.title')}
          </span>
          <span className="label-text-alt flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              type="button"
              aria-label={t('input.insert-separator')}
              title={t('input.insert-separator')}
              onPointerDown={(event) => event.preventDefault()}
              onClick={handleInsertTextSeparator}
            >
              <Text className="h-5 w-5" />
            </Button>
            <ImportData setInput={setInput} />
            <Button
              size="icon"
              variant="ghost"
              type="button"
              aria-label={t('input.copy-input')}
              title={t('input.copy-input')}
              onClick={() => navigator.clipboard.writeText(input)}
            >
              <Copy className="h-5 w-5" />
            </Button>
          </span>
        </div>
      </label>
      <Textarea
        ref={inputRef}
        id="input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="h-28 bg-white font-mono text-sm"
        placeholder={t('input.placeholder')}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault()
            const el = e.currentTarget
            const start = el.selectionStart ?? 0
            const end = el.selectionEnd ?? 0
            insertTextSeparator(start, end)
          }
        }}
      />
      {showText && (
        <p className="mt-1 text-xs text-gray-500">{t('input.caption-hint')}</p>
      )}
    </div>
  )
}

export const OutputComponent: React.FC = () => {
  const { output, codeFormat } = useBarcodeContext()
  const outputRef = React.useRef<HTMLDivElement>(null)
  const t = useTranslations('Barcode')

  // Create a numbered output
  const numberedOutput = output
    .map((svg, index) => {
      const numberSpan =
        output.length > 1
          ? `<span class="barcode-number mr-2">${index + 1}.</span>`
          : ''

      return `<div class="barcode-item flex items-center mb-2">
      ${numberSpan}
      <div class="barcode-svg">${svg}</div>
    </div>`
    })
    .join('')

  return (
    <div className="form-control flex flex-col">
      <label htmlFor="output" className="label">
        <div className="flex justify-between">
          <span className="label-text text-base font-semibold">
            {t('output.title')}
          </span>
          <span className="label-text-alt flex items-center justify-between gap-4">
            <ShareButton size="icon" variant="ghost" />
            <PrintLabelsDialog output={output} codeFormat={codeFormat} />
            <ScrollControls outputRef={outputRef} />
          </span>
        </div>
      </label>
      <div
        ref={outputRef}
        id="output"
        className="flex aspect-square max-h-[480px] flex-col items-center overflow-auto rounded-md border bg-blue-100 bg-opacity-30 p-3 text-sm shadow-sm"
        dangerouslySetInnerHTML={{ __html: numberedOutput }}
      />
    </div>
  )
}

export const OptionsComponent: React.FC = () => {
  const {
    barcodeLength,
    setBarcodeLength,
    barcodeHeight,
    setBarcodeHeight,
    showText,
    setShowText,
    textMode,
    setTextMode,
    textPosition,
    setTextPosition,
    textFontSize,
    setTextFontSize,
    textFontFamily,
    setTextFontFamily,
    textBold,
    setTextBold,
    textItalic,
    setTextItalic,
    barcodeMargin,
    setBarcodeMargin,
    codeFormat,
  } = useBarcodeContext()
  const t = useTranslations('Barcode')
  const [textFontSizeInput, setTextFontSizeInput] = React.useState(
    String(textFontSize),
  )

  // 检查是否是二维码类型
  const isLockHeight = lockHeight(codeFormat)

  // 当条形码宽度改变且是二维码时，自动设置高度等于宽度
  React.useEffect(() => {
    if (isLockHeight) {
      setBarcodeHeight(barcodeLength)
    }
  }, [barcodeLength, isLockHeight, setBarcodeHeight])

  React.useEffect(() => {
    setTextFontSizeInput(String(textFontSize))
  }, [textFontSize])

  // 处理宽度变化
  const handleLengthChange = (value: number) => {
    setBarcodeLength(value)
    if (isLockHeight) {
      setBarcodeHeight(value)
    }
  }

  return (
    <div>
      <div className="flex justify-between">
        <span className="label-text text-lg font-semibold">
          {t('options.name')}
        </span>
      </div>

      <div className="xs:text-sm rounded-md bg-transparent p-3 text-xs shadow-sm">
        <div className="grid grid-cols-1 gap-2">
          <div className="md:col-span-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="showText" className="text-sm font-medium">
                {t('options.show-text')}
              </Label>
              <Switch
                id="showText"
                checked={showText}
                onCheckedChange={setShowText}
              />
            </div>
          </div>
          {showText && (
            <div className="space-y-3 md:col-span-1">
              <Label className="text-sm font-medium">
                {t('options.text-mode')}
              </Label>
              <RadioGroup
                value={textMode}
                onValueChange={setTextMode}
                className="grid grid-cols-2 gap-2"
              >
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                    textMode === 'replacement'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50',
                  )}
                >
                  <RadioGroupItem
                    value="replacement"
                    id="textMode-replacement"
                    className={cn(
                      textMode === 'replacement'
                        ? 'border-blue-600 text-blue-600 [&_svg]:fill-blue-600'
                        : 'border-slate-400 text-slate-500',
                    )}
                  />
                  <span>{t('options.text-mode-replacement')}</span>
                </label>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                    textMode === 'independent'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50',
                  )}
                >
                  <RadioGroupItem
                    value="independent"
                    id="textMode-independent"
                    className={cn(
                      textMode === 'independent'
                        ? 'border-blue-600 text-blue-600 [&_svg]:fill-blue-600'
                        : 'border-slate-400 text-slate-500',
                    )}
                  />
                  <span>{t('options.text-mode-independent')}</span>
                </label>
              </RadioGroup>
            </div>
          )}
          {showText && textMode === 'independent' && (
            <div className="space-y-3 rounded-md border border-slate-200 p-3 md:col-span-1">
              <div>
                <Label className="text-sm font-medium">
                  {t('options.text-position')}
                </Label>
                <RadioGroup
                  value={textPosition}
                  onValueChange={setTextPosition}
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                      textPosition === 'top'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50',
                    )}
                  >
                    <RadioGroupItem
                      value="top"
                      id="textPosition-top"
                      className={cn(
                        textPosition === 'top'
                          ? 'border-blue-600 text-blue-600 [&_svg]:fill-blue-600'
                          : 'border-slate-400 text-slate-500',
                      )}
                    />
                    <span>{t('options.text-position-top')}</span>
                  </label>
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                      textPosition === 'bottom'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50',
                    )}
                  >
                    <RadioGroupItem
                      value="bottom"
                      id="textPosition-bottom"
                      className={cn(
                        textPosition === 'bottom'
                          ? 'border-blue-600 text-blue-600 [&_svg]:fill-blue-600'
                          : 'border-slate-400 text-slate-500',
                      )}
                    />
                    <span>{t('options.text-position-bottom')}</span>
                  </label>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="textFontSize">
                  {t('options.text-font-size')}
                </Label>
                <Input
                  id="textFontSize"
                  type="number"
                  min={8}
                  max={64}
                  step={1}
                  value={textFontSizeInput}
                  className="bg-white"
                  onChange={(event) => setTextFontSizeInput(event.target.value)}
                  onBlur={() => {
                    const value = textFontSizeInput.trim()
                    const nextFontSize =
                      value === ''
                        ? textFontSize
                        : clampBarcodeTextFontSize(Number(value))
                    setTextFontSize(nextFontSize)
                    setTextFontSizeInput(String(nextFontSize))
                  }}
                />
              </div>
              <div>
                <Label htmlFor="textFontFamily">
                  {t('options.text-font-family')}
                </Label>
                <Select
                  value={textFontFamily}
                  onValueChange={setTextFontFamily}
                >
                  <SelectTrigger id="textFontFamily" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noto-sans-sc">
                      {t('options.text-font-noto-sans')}
                    </SelectItem>
                    <SelectItem value="noto-serif-sc">
                      {t('options.text-font-noto-serif')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
                  <Label htmlFor="textBold">{t('options.text-bold')}</Label>
                  <Switch
                    id="textBold"
                    checked={textBold}
                    onCheckedChange={setTextBold}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
                  <Label htmlFor="textItalic">{t('options.text-italic')}</Label>
                  <Switch
                    id="textItalic"
                    checked={textItalic}
                    onCheckedChange={setTextItalic}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="md:col-span-1">
            <Label htmlFor="barcodeLength">{t('options.barcode-length')}</Label>
            <Input
              id="barcodeLength"
              type="number"
              value={barcodeLength}
              onChange={(e) => handleLengthChange(Number(e.target.value))}
              className="bg-white"
            />
          </div>
          <div className="relative md:col-span-1">
            <Label htmlFor="barcodeHeight">{t('options.barcode-height')}</Label>
            <div className="relative">
              <Input
                id="barcodeHeight"
                type="number"
                value={barcodeHeight}
                className={`bg-white ${isLockHeight ? 'pr-10' : ''}`}
                onChange={(e) => setBarcodeHeight(Number(e.target.value))}
                disabled={isLockHeight}
              />
              {isLockHeight && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
              )}
            </div>
            {isLockHeight && (
              <p className="mt-1 text-xs text-gray-500">
                {t('options.locked-aspect-ratio')}
              </p>
            )}
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="barcodeMargin">{t('options.barcode-margin')}</Label>
            <Input
              id="barcodeMargin"
              type="number"
              value={barcodeMargin}
              className="bg-white"
              onChange={(e) => setBarcodeMargin(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

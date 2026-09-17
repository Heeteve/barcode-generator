export type BarcodeTextMode = 'replacement' | 'independent'

export type BarcodeTextPosition = 'top' | 'bottom'

export type BarcodeTextFontFamily = 'noto-sans-sc' | 'noto-serif-sc'

export interface BarcodeTextSettings {
  textMode: BarcodeTextMode
  textPosition: BarcodeTextPosition
  fontSize: number
  fontFamily: BarcodeTextFontFamily
  bold: boolean
  italic: boolean
}

export const DEFAULT_BARCODE_TEXT_SETTINGS: BarcodeTextSettings = {
  textMode: 'replacement',
  textPosition: 'bottom',
  fontSize: 15,
  fontFamily: 'noto-sans-sc',
  bold: false,
  italic: false,
}

export const clampBarcodeTextFontSize = (value: number) =>
  Math.max(8, Math.min(64, Number.isFinite(value) ? Math.round(value) : 15))

export const normalizeBarcodeTextSettings = (
  settings?: Partial<BarcodeTextSettings>,
): BarcodeTextSettings => ({
  textMode:
    settings?.textMode === 'independent' ? 'independent' : 'replacement',
  textPosition: settings?.textPosition === 'top' ? 'top' : 'bottom',
  fontSize: clampBarcodeTextFontSize(
    settings?.fontSize ?? DEFAULT_BARCODE_TEXT_SETTINGS.fontSize,
  ),
  fontFamily:
    settings?.fontFamily === 'noto-serif-sc' ? 'noto-serif-sc' : 'noto-sans-sc',
  bold: settings?.bold === true,
  italic: settings?.italic === true,
})

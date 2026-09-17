/**
 * 将单行输入解析为条码值和 Tab 后的文字。
 *
 * 格式："value\tcaption"
 * 文字的替代或独立显示方式，以及具体显示位置，由条码文字设置决定。
 * 没有 Tab 或 Tab 后为空时，文字回退到条码库的原生文字。
 */
export const parseLine = (
  line: string,
): { barcodeValue: string; displayText: string | undefined } => {
  const tabIndex = line.indexOf('\t')
  if (tabIndex !== -1) {
    const barcodeValue = line.slice(0, tabIndex).trim()
    const caption = line.slice(tabIndex + 1).trim()
    return {
      barcodeValue,
      // Treat an empty caption the same as no caption (fallback to default).
      displayText: caption !== '' ? caption : undefined,
    }
  }
  return { barcodeValue: line.trim(), displayText: undefined }
}

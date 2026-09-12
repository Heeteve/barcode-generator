import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// 可从共享配置中导入
export const locales = ['en', 'zh']

export const languageNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
}

export type Locale = (typeof locales)[number]
export const defaultLocale = 'en'
// 使用默认值 always；设置为 as-needed 可隐藏默认语言路由
export const localePrefix = 'always'

export default getRequestConfig(async ({ locale }) => {
  // 校验传入的语言参数是否有效
  if (!locales.includes(locale as any)) notFound()

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})

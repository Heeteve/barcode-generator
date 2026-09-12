import { Locale } from '@/i18n'

type SiteConfig = {
  name: string
  description: string
  // 主导航：{ title: string; href: string }[]
  // 链接：{
  //   twitter: string
  //   github: string
  //   docs: string
  // }
}

const siteConfigBase: Record<Locale, SiteConfig> = {
  en: {
    name: 'Free Online Barcode Generator',
    description:
      'Free Barcode Generator is an online tool that allows users to easily create various formats of barcodes and QR codes. It supports multiple encoding types and enables users to generate barcodes in real-time and in bulk, completely free of charge.',
  },
  zh: {
    name: '免费在线条形码生成器',
    description:
      '免费条码生成器是一个在线工具，可以让用户轻松创建各种格式的条码和二维码。它支持多种编码类型，并允许用户实时批量生成条码，完全免费使用。',
  },
}

export function getSiteConfig(locale: Locale): SiteConfig {
  return siteConfigBase[locale] || siteConfigBase.en
}

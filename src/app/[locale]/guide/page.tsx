import { unstable_setRequestLocale } from 'next-intl/server'
import { Locale } from '@/i18n'
import { SiteHeader } from '@/components/Header'
import Footer from '@/components/footer'
import GuidedBarcodeGenerator from '@/components/barcode-generator/GuidedBarcodeGenerator'

export default function GuidePage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  unstable_setRequestLocale(locale)

  return (
    <>
      <SiteHeader locale={locale} codeFormat="Code128" mode="guide" />
      <main className="flex flex-1 justify-center px-4 py-8 sm:py-12">
        <GuidedBarcodeGenerator />
      </main>
      <Footer />
    </>
  )
}

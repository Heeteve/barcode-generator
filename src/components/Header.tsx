import Link from 'next/link'
import Image from 'next/image'

import { getSiteConfig } from '@/config/site-i18n'
import { ThemeToggle } from '@/components/theme-toggle'
import { Locale } from '@/i18n'
import { LanguageToggle } from './language-toggle'
import { useTranslations } from 'next-intl'

interface SiteHeaderProps {
  locale: Locale
  codeFormat?: string
  mode?: 'generator' | 'guide'
}

export function SiteHeader({
  locale,
  codeFormat,
  mode = 'generator',
}: SiteHeaderProps) {
  const t = useTranslations('Barcode')
  const guide = useTranslations('Guide')
  const isGuide = mode === 'guide'

  return (
    <header className="w-full bg-background">
      <div className="container flex h-16 min-w-0 items-center justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <Link href={`/${locale}`} className="flex min-w-0 items-center gap-2">
            <Image
              src="/logo.png"
              alt="Barcode Generator"
              width={32}
              height={32}
              className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
            />
            <h1 className="min-w-0 max-w-[66vw] truncate text-lg font-bold normal-case sm:max-w-full sm:text-3xl">
              {t('title', { type: codeFormat || 'Code128' })}
            </h1>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href={isGuide ? `/${locale}/Code128` : `/${locale}/guide`}
            className="shrink-0 whitespace-nowrap text-xs font-medium text-foreground hover:text-primary sm:text-sm"
          >
            {isGuide ? guide('full-editor') : guide('entry')}
          </Link>
          {/* <ThemeToggle /> */}
          <LanguageToggle locale={locale} />
        </div>
      </div>
    </header>
  )
}

import Link from 'next/link'

import { getSiteConfig } from '@/config/site-i18n'
import { ThemeToggle } from '@/components/theme-toggle'
import { Locale } from '@/i18n'
import { LanguageToggle } from './language-toggle'
import { Icons } from '@/components/icons'
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
      <div className="container flex h-16 items-center justify-between space-x-4">
        <div className="flex items-center">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <h1 className="max-w-[66vw] truncate text-2xl font-bold normal-case sm:max-w-full sm:text-3xl">
              {t('title', { type: codeFormat || 'Code128' })}
            </h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href={isGuide ? `/${locale}/Code128` : `/${locale}/guide`}
            className="text-xs font-medium text-foreground hover:text-primary sm:text-sm"
          >
            {isGuide ? guide('full-editor') : guide('entry')}
          </Link>
          <Link
            href="https://github.com/Heeteve/barcode-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary"
          >
            <Icons.gitHub className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          {/* <ThemeToggle /> */}
          <LanguageToggle locale={locale} />
        </div>
      </div>
    </header>
  )
}

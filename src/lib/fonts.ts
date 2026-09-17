import {
  Inter as FontSans,
  JetBrains_Mono as FontMono,
  Noto_Sans_SC as FontNotoSansSC,
  Noto_Serif_SC as FontNotoSerifSC,
} from 'next/font/google'

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const fontNotoSansSC = FontNotoSansSC({
  weight: ['400', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
  preload: false,
})

export const fontNotoSerifSC = FontNotoSerifSC({
  weight: ['400', '700'],
  variable: '--font-noto-serif-sc',
  display: 'swap',
  preload: false,
})

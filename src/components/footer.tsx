import { GoogleAnalytics } from '@next/third-parties/google'
import Link from 'next/link'
import { Icons } from '@/components/icons'

export default function Footer() {
  return (
    <footer className="flex items-center justify-center gap-4 px-4 py-8 text-sm sm:px-8">
      <Link
        href="https://github.com/Heeteve/barcode-generator"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-primary"
      >
        <Icons.gitHub className="h-5 w-5" />
        <span className="sr-only">GitHub</span>
      </Link>
      <span>&copy; {new Date().getFullYear()}</span>
      <Link href="/terms" className="hover:underline">
        Terms & Privacy
      </Link>
      <>
        {process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ? (
          <>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_TAG_ID} />
          </>
        ) : null}
      </>
    </footer>
  )
}

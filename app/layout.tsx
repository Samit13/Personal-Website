import './globals.css'
import type { Metadata } from 'next'
import GlobalBackground from '@/components/GlobalBackground'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Samit Madatanapalli — Portfolio',
  description: 'Modern, minimal, scroll-driven portfolio with glossy liquid glass hero.',
  metadataBase: new URL('http://localhost:3000')
}

type RootLayoutProps = { children: React.ReactNode }

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="bg-bg text-fg">
      <body className="min-h-screen antialiased selection:bg-fg/10 selection:text-fg overflow-x-hidden">
        {/* Preload the first photo to speed ring population (adjust path if needed) */}
        <link rel="preload" as="image" href="/photos/1.jpg" />
        <GlobalBackground />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 rounded bg-fg px-3 py-2 text-bg">Skip to content</a>
        {children}
      </body>
    </html>
  )
}

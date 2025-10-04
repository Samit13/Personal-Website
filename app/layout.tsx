import './globals.css'
import type { Metadata } from 'next'
import GlobalBackground from '@/components/GlobalBackground'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Samit Madatanapalli — Embedded Engineer Portfolio',
  description: 'Portfolio of Samit Madatanapalli – Embedded Engineer (Honeywell) showcasing projects in embedded systems, drones, computer architecture, data systems, and full‑stack applications.',
  metadataBase: new URL('https://samitm.com'),
  alternates: { canonical: 'https://samitm.com/' },
  themeColor: '#0b0c0f',
  keywords: [
    'Samit Madatanapalli',
    'Samit M',
    'Embedded Engineer',
    'Firmware Engineer Portfolio',
    'Drone Control Systems',
    'Computer Architecture Projects',
    'Embedded Systems Portfolio'
  ],
  authors: [{ name: 'Samit Madatanapalli', url: 'https://samitm.com' }],
  openGraph: {
    type: 'website',
    url: 'https://samitm.com/',
    title: 'Samit Madatanapalli — Embedded Engineer Portfolio',
    description: 'Projects & experience in embedded systems, multi‑axis drones, computer architecture, audio hardware, and full‑stack engineering.',
    siteName: 'Samit Madatanapalli Portfolio',
    images: [
      {
        url: '/websiteicon.png',
        width: 512,
        height: 512,
        alt: 'Samit Madatanapalli Portfolio Logo'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Samit Madatanapalli — Embedded Engineer Portfolio',
    description: 'Embedded + systems + full‑stack projects by Samit Madatanapalli.',
    images: ['/websiteicon.png']
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/websiteicon.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/favicon.svg', color: '#0b0c0f' }]
  },
  category: 'technology'
}

type RootLayoutProps = { children: React.ReactNode }

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="bg-bg text-fg">
      <body className="min-h-screen antialiased selection:bg-fg/10 selection:text-fg overflow-x-hidden">
        {/* Preload the first photo to speed ring population (adjust path if needed) */}
        <link rel="preload" as="image" href="/photos/1.jpg" />
        {/* Structured Data: Person schema for better name/entity recognition */}
        <Script id="ld-person" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Samit Madatanapalli',
              url: 'https://samitm.com',
              jobTitle: 'Embedded Engineer',
              worksFor: {
                '@type': 'Organization',
                name: 'Honeywell'
              },
              alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: 'Pennsylvania State University'
              },
              description: 'Embedded systems, drone control, computer architecture, audio hardware, and full-stack engineering projects.',
              sameAs: [
                // Add public profile URLs when available:
                // 'https://www.linkedin.com/in/your-handle',
                // 'https://github.com/your-handle'
              ]
            })
          }}
        />
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Samit Madatanapalli Portfolio',
              url: 'https://samitm.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://samitm.com/?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <GlobalBackground />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 rounded bg-fg px-3 py-2 text-bg">Skip to content</a>
        {children}
      </body>
    </html>
  )
}

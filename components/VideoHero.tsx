"use client"
import { useEffect, useMemo, useRef, useState } from 'react'

type Source = { src: string; type?: string }

export type VideoHeroProps = {
  className?: string
  poster?: string
  /** Either a single src or a list of sources */
  src?: string
  sources?: Source[]
  children?: React.ReactNode
  /** When true, tries to avoid vertical cropping on narrow (iPhone) screens by switching to object-contain and a letterboxed layout */
  preserveContentOnMobile?: boolean
  /** Optional overlay gradient classes override */
  overlayClassName?: string
}

export default function VideoHero({
  className,
  poster,
  src,
  sources,
  children,
  preserveContentOnMobile = true,
  overlayClassName
}: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [supportedSources, setSupportedSources] = useState<Source[]>([])
  const [isIOS, setIsIOS] = useState(false)
  const [vhUnit, setVhUnit] = useState<'svh' | 'dvh' | 'vh'>('svh')

  const candidateSources = useMemo<Source[]>(() => {
    if (sources?.length) return sources
    return src ? [{ src }] : []
  }, [src, sources])

  useEffect(() => {
    // Filter by canPlayType if possible
    const v = document.createElement('video')
    const result: Source[] = []
    for (const s of candidateSources) {
      const ok = s.type ? v.canPlayType(s.type) : 'maybe'
      // Keep sources the browser says it can play, plus keep QuickTime as a Safari fallback
      if (ok !== '' || s.type === 'video/quicktime') {
        result.push(s)
      }
    }
    setSupportedSources(result.length ? result : candidateSources)
  }, [candidateSources])

  // Detect iOS & best viewport unit (dvh supported on iOS 16+ / modern browsers)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const ua = window.navigator.userAgent
    setIsIOS(/iPhone|iPad|iPod/i.test(ua))
    // Test for dvh support
    const testEl = document.createElement('div')
    testEl.style.height = '100dvh'
    if (testEl.style.height.includes('dvh')) setVhUnit('dvh')
    else if (CSS && (CSS as any).supports?.('(height: 100dvh)')) setVhUnit('dvh')
  }, [])

  const containerHeightClass = useMemo(() => {
    // Use dynamic viewport height if supported, else fall back.
    // Tailwind does not ship dvh utility by default; apply inline style fallback below.
    return 'min-h-[100svh]'
  }, [])

  const objectFit = preserveContentOnMobile && isIOS ? 'object-contain md:object-cover' : 'object-cover'
  // Apply a subtle upscale on medium+ screens for a larger visual presence (disabled on iOS when using contain)
  const scaleClasses = (preserveContentOnMobile && isIOS) ? '' : 'md:scale-[1.06] xl:scale-[1.1]'
  const mobileBg = preserveContentOnMobile && isIOS ? 'bg-black' : ''

  // Inline style to leverage dvh when available for iOS Safari chrome collapse correctness
  const containerDataAttr = vhUnit === 'dvh' ? { 'data-dvh': 'true' } : {}

  return (
    <div
      className={`relative overflow-hidden rounded-none sm:rounded-2xl ${containerHeightClass} ${mobileBg} ${className ?? ''} ${vhUnit === 'dvh' ? 'supports-dvh' : ''}`}
      {...containerDataAttr}
    >
      <video
        ref={videoRef}
  className={`w-full h-full ${objectFit} ${scaleClasses} transition-[object-fit,transform] duration-700 ease-out will-change-transform`}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        {supportedSources.map((s, i) => (
          <source key={`src-${i}`} src={s.src} type={s.type} />
        ))}
      </video>
      <div className={`pointer-events-none absolute inset-0 ${
        overlayClassName || 'bg-gradient-to-t from-black/70 via-black/25 to-black/5 md:from-black/60 md:via-black/15 md:to-transparent'
      }`} />
      {/* Safe-area inset padding wrapper for children */}
      {children && (
        <div className="absolute inset-0 flex flex-col justify-end p-6 pb-[calc(env(safe-area-inset-bottom,0)+1.25rem)]">
          {children}
        </div>
      )}
    </div>
  )
}

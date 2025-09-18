"use client"
import { useEffect, useMemo, useRef, useState } from 'react'

type Source = { src: string; type?: string }

export type VideoHeroProps = {
  className?: string
  poster?: string
  // Either a single src or a list of sources
  src?: string
  sources?: Source[]
  children?: React.ReactNode
}

export default function VideoHero({ className, poster, src, sources, children }: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [supportedSources, setSupportedSources] = useState<Source[]>([])

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
      if (ok !== '') result.push(s)
    }
    setSupportedSources(result.length ? result : candidateSources)
  }, [candidateSources])

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className ?? ''}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      >
        {supportedSources.map((s, i) => (
          <source key={`src-${i}`} src={s.src} type={s.type} />
        ))}
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {children}
    </div>
  )
}

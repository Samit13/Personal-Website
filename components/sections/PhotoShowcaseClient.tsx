"use client"
import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ShowcaseData } from './PhotoShowcase'

interface Props { data: ShowcaseData }

export default function PhotoShowcaseClient({ data }: Props) {
  const prefersReduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  // Build mosaic list: combine curated + a few recent extras to reach at least 10-12 items
  const extrasNeeded = Math.max(0, 12 - data.mosaic.length)
  const filler = data.recent.slice(-extrasNeeded)
  const mosaic = [...data.mosaic, ...filler]
  const all = mosaic

  // Reveal animation via IntersectionObserver
  useEffect(() => {
    if (prefersReduced) return
    const root = rootRef.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-photo]'))
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.setAttribute('data-inview', 'true')
          io.unobserve(e.target)
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    items.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [prefersReduced])

  const open = useCallback((src: string) => {
    const idx = all.indexOf(src)
    if (idx >= 0) setLightboxIndex(idx)
  }, [all])

  const close = () => setLightboxIndex(null)
  const goto = (dir: 1 | -1) => {
    setLightboxIndex(i => (i == null ? i : (i + dir + all.length) % all.length))
  }

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') goto(1)
      else if (e.key === 'ArrowLeft') goto(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex])

  // --- Vertical Waterfall Auto-Scroll ---
  const scrollWrapRef = useRef<HTMLDivElement | null>(null)
  const batchRef = useRef<HTMLDivElement | null>(null)
  const cloneRef = useRef<HTMLDivElement | null>(null)
  // Column count state (must be declared before effects that depend on it)
  const [columnCount, setColumnCount] = useState(3)
  useEffect(() => {
    const decide = () => {
      const w = window.innerWidth
      setColumnCount(w >= 1024 ? 4 : w >= 640 ? 3 : 2)
    }
    decide()
    window.addEventListener('resize', decide)
    return () => window.removeEventListener('resize', decide)
  }, [])

  useEffect(() => {
    if (prefersReduced) return
    const wrap = scrollWrapRef.current
    const batch = batchRef.current
    const clone = cloneRef.current
    if (!wrap || !batch || !clone) return

  let raf = 0
  let last = performance.now()
  let offset = 0
  let resumeAt = 0 // timestamp after which auto-scroll resumes
  let lastTouchY: number | null = null
  const SPEED = 16 // px/sec upward (slightly increased speed)

    const measure = () => batch.getBoundingClientRect().height
    let batchHeight = measure()
    // We maintain an integer version of the height to avoid cumulative
    // sub‑pixel translation seams between the primary batch and its clone.
    let batchHeightInt = Math.round(batchHeight)
    const resizeObserver = new ResizeObserver(() => {
      batchHeight = measure()
      batchHeightInt = Math.round(batchHeight)
    })
    resizeObserver.observe(batch)

    // Apply transforms. We snap to whole pixels to avoid a faint 1px horizontal seam
    // that can appear on iOS Safari when two large translated layers abut with
    // sub‑pixel fractional values (the black "thin bar" you observed). Rounding
    // removes the gap. We also use translate3d to promote to its own layer.
    const applyTransforms = () => {
      // Keep subpixel precision for smoothness; rounding caused visible jitter because
      // frame deltas (<0.5px) accumulated then jumped. We instead maintain full float
      // precision and rely on a small overlap to mask any seam.
      const overlap = 0.5
      const y = offset
      batch.style.transform = `translate3d(0, ${y}px, 0)`
      clone.style.transform = `translate3d(0, ${y + batchHeightInt - overlap}px, 0)`
    }

    const normalize = () => {
      if (Math.abs(offset) >= batchHeightInt) {
        offset += batchHeightInt
      }
      if (offset > 0) {
        offset -= batchHeightInt
      }
    }

    const step = (now: number) => {
      // Clamp dt to avoid large jumps after tab inactivity
      const dtRaw = (now - last) / 1000
      const dt = Math.min(dtRaw, 1/30) // max ~33ms logical step
      last = now
      if (now >= resumeAt) {
        offset -= SPEED * dt
        normalize()
        applyTransforms()
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    // --- User Interaction (Wheel) ---
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const now = performance.now()
      resumeAt = now + 3000 // pause auto for 3s after interaction
      offset -= e.deltaY
      normalize()
      applyTransforms()
    }
    wrap.addEventListener('wheel', onWheel, { passive: false })

    // --- Touch (Mobile) ---
    const onTouchStart = (e: TouchEvent) => {
      const now = performance.now()
      resumeAt = now + 3000
      lastTouchY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (lastTouchY == null) return
      e.preventDefault()
      const y = e.touches[0].clientY
      const dy = y - lastTouchY
      lastTouchY = y
      const now = performance.now()
      resumeAt = now + 3000
      offset += dy // finger direction mirrors content direction for familiarity
      normalize()
      applyTransforms()
    }
    const onTouchEnd = () => { lastTouchY = null }
    wrap.addEventListener('touchstart', onTouchStart, { passive: false })
    wrap.addEventListener('touchmove', onTouchMove, { passive: false })
    wrap.addEventListener('touchend', onTouchEnd)
    wrap.addEventListener('touchcancel', onTouchEnd)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      wrap.removeEventListener('wheel', onWheel)
      wrap.removeEventListener('touchstart', onTouchStart)
      wrap.removeEventListener('touchmove', onTouchMove)
      wrap.removeEventListener('touchend', onTouchEnd)
      wrap.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [prefersReduced, mosaic.length, columnCount])

  // Build waterfall columns using responsive state (already initialized above)
  const makeColumns = (imgs: string[], count: number) => {
    const cols: string[][] = Array.from({ length: count }, () => [])
    imgs.forEach((src, i) => cols[i % count].push(src))
    return cols
  }
  const columns = useMemo(() => makeColumns(mosaic, columnCount), [mosaic, columnCount])
  const renderColumnSet = (keyPrefix: string) => (
    <div className="flex gap-8 md:gap-10" key={keyPrefix}>
      {columns.map((col, ci) => (
        <div key={`${keyPrefix}-col-${ci}`} className="flex flex-col gap-6 md:gap-8 w-[calc(50%-0.5rem)] sm:w-auto">
          {col.map((src, i) => (
            <figure
              key={`${keyPrefix}-${ci}-${i}-${src}`}
              data-photo
              role="button"
              tabIndex={0}
              aria-label="Open photo"
              onClick={() => open(src)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(src) } }}
              className="relative overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 cursor-zoom-in group">
              <img
                src={src}
                alt="Photo"
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out select-none"
                draggable={false}
              />
              <figcaption className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </figure>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <div ref={rootRef} className="relative">
  <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm h-[70vh] md:h-[78vh]">
        {/* Top fade */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/60 to-transparent z-20" />
        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/60 to-transparent z-20" />
        <div ref={scrollWrapRef} className="absolute inset-0 overflow-hidden px-10 md:px-14">
          {/* Stacked batches (absolute) for seamless loop; left-aligned now */}
          <div ref={batchRef} className="absolute top-0 left-0 will-change-transform pt-12 flex flex-col items-start gap-20">
            {renderColumnSet('batch-a')}
          </div>
          <div ref={cloneRef} className="absolute top-0 left-0 will-change-transform pt-12 flex flex-col items-start gap-20">
            {renderColumnSet('batch-b')}
          </div>
        </div>
    </div>
      {/* Lightbox */}
      {lightboxIndex != null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); goto(-1) }}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl select-none"
          >‹</button>
          <img
            src={all[lightboxIndex]}
            alt="Enlarged view"
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-lg shadow-black/50"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); goto(1) }}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl select-none"
          >›</button>
        </div>
      )}
    </div>
  )
}


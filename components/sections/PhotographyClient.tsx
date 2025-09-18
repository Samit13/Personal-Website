"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import GlassSphere from '@/components/GlassSphere'

export default function PhotographyClient({ photos }: { photos: string[] }) {
  const prefersReduced = useReducedMotion()

  // Build items once
  const items = useMemo(() => photos.map((url, i) => ({ id: `local-${i}`, url })), [photos])
  const all = items.slice(0, Math.min(items.length, 10))
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])
  const slides = ready ? all : all.slice(0, Math.min(all.length, 4))

  // Ring rotation
  const ringRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ringRef.current
    if (!el) return
    let raf = 0
    let angle = 0 // degrees
    const BASE = prefersReduced ? 2 : 8 // base deg per second (slower)
    let vel = BASE // current deg/s
    let last = performance.now()
    const DAMP = 2.5 // higher = faster return to base
    const MAX = 60 // clamp speed

    const onWheel = (e: WheelEvent) => {
      // Horizontal scroll influences velocity; positive deltaX => rotate right
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0
      if (dx !== 0) {
        const K = 0.25 // sensitivity: px/s to deg/s
        vel += dx * K
        if (vel > MAX) vel = MAX
        if (vel < -MAX) vel = -MAX
      }
    }
    el.addEventListener('wheel', onWheel, { passive: true })

    // Pointer drag to rotate
    let dragging = false
    let lastX = 0
    let lastT = 0
    const onPointerDown = (e: PointerEvent) => {
      dragging = true
      el.setAttribute('data-dragging', 'true')
      lastX = e.clientX
      lastT = performance.now()
      el.setPointerCapture?.(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const now = performance.now()
      const dx = e.clientX - lastX
      const dt = Math.max(1, now - lastT) / 1000
      lastX = e.clientX
      lastT = now
      const K = 0.5 // drag sensitivity: px to deg
      angle = (angle + dx * K) % 360
      el.style.setProperty('--angleDeg', String(angle))
      // instantaneous velocity in deg/s from drag
      vel = dx * K / dt
      if (vel > MAX) vel = MAX
      if (vel < -MAX) vel = -MAX
    }
    const stopDrag = (e?: PointerEvent) => {
      if (!dragging) return
      dragging = false
      el.removeAttribute('data-dragging')
      if (e) el.releasePointerCapture?.(e.pointerId)
    }
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)

    const step = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      // Integrate angle
      angle = (angle + vel * dt) % 360
      el.style.setProperty('--angleDeg', String(angle))
      // Ease velocity back to BASE
      const k = Math.max(0, Math.min(1, DAMP * dt))
      vel += (BASE - vel) * k
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', stopDrag)
      window.removeEventListener('pointercancel', stopDrag)
      cancelAnimationFrame(raf)
    }
  }, [prefersReduced])

  // Set ring height based on the first image's natural height times the item scale
  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget as HTMLImageElement
    const el = ringRef.current
    if (!el || !img?.naturalHeight) return
    const cs = getComputedStyle(el)
    const scale = parseFloat(cs.getPropertyValue('--item-scale')) || 1
    const h = Math.max(1, Math.round(img.naturalHeight * scale))
    el.style.height = `${h}px`
  }

  // Toggle to show/hide the full photo grid
  const [showAll, setShowAll] = useState(false)
  const gridRef = useRef<HTMLUListElement | null>(null)

  // Reveal grid items when they come into view
  // IntersectionObserver reveal for grid items
  // Note: grid items exist even when collapsed; they won't be intersecting until expanded.
  // Reconnect observer once on mount.
  
  useEffect(() => {
    const root = gridRef.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('.reveal'))
    if (items.length === 0) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.setAttribute('data-inview', 'true')
          io.unobserve(e.target)
        }
      }
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 })
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* 3D rotating ring with natural-sized images */}
    {slides.length > 0 && (
  <div className="perspective-1200 mt-0 sm:mt-20 md:mt-48 mb-6 md:mb-8 relative z-10">
  <div ref={ringRef} className="ring3d ring3d--h-sm ring3d--sm ring3d--tilt-down ring3d--core-lg" role="region" aria-label="3D photo ring">
            {/* Center 3D glass sphere */}
            <div className="ring-core-3d" aria-hidden>
              <GlassSphere className="h-full w-full" rotateSpeed={0.2} />
            </div>
            {/* Spacer sets container height equal to the first image's natural height without resizing */}
            {slides[0] && (
              <img src={slides[0].url} alt="" aria-hidden className="ring-spacer hidden" onLoad={onImgLoad} loading="eager" />
            )}
            {slides.map((m, i) => {
              return (
                <div key={`ring-${m.id}`} className={`ring-item ring-pos-${(i % 10) + 1}`}>
                  <div className="ring-inner rounded-xl glass-border overflow-hidden">
                    {/* Use native <img> to preserve intrinsic size — no resizing */}
                    <img
                      src={m.url}
                      alt="photo"
                      loading={i < 3 ? 'eager' : 'lazy'}
                      fetchPriority={i < 3 ? 'high' : 'auto'}
                      decoding="async"
                      draggable={false}
                      onLoad={onImgLoad}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {/* Toggle button */}
  <div className="relative z-50 flex justify-center mt-20 md:mt-25 mb-3 md:mb-4 pointer-events-auto">
        <button
          type="button"
          aria-controls="photo-grid"
          onClick={() => setShowAll(v => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 font-medium shadow-sm hover:shadow transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {showAll ? 'Less' : 'More'}
          <span aria-hidden className={`transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}>⌄</span>
        </button>
      </div>
      {/* Collapsible Grid */}
      {items.length > 0 && (
        <div
          className={`transition-[max-height,opacity] duration-500 ease-out overflow-hidden ${showAll ? 'opacity-100 max-h-[4000px]' : 'opacity-0 max-h-0'}`}
        >
          <ul id="photo-grid" ref={gridRef} role="list" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
            {items.map((m, i) => (
              <li key={`g-${m.id}-${i}`} className="reveal hover-shine rounded-xl overflow-hidden glass-border [--r-t:20px]">
                <img
                  src={m.url}
                  alt={`Photo ${i + 1}`}
                  loading="lazy"
                  draggable={false}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

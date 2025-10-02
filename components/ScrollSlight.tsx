"use client"
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/*
  ScrollSlight
  Applies a very lightweight continuous transform to any element with [data-scroll-slight].
  Effect: subtle translateY parallax + micro scale toward center of viewport.
  Avoids: layout, heavy filters, persistent will-change.
*/
export default function ScrollSlight() {
  const frame = useRef(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    let elements: HTMLElement[] = Array.from(document.querySelectorAll('[data-scroll-slight]'))

    const update = () => {
      frame.current = 0
      const vh = window.innerHeight || 1
      for (const el of elements) {
        const rect = el.getBoundingClientRect()
        // Distance of element center from viewport center
        const centerDist = (rect.top + rect.height / 2) - vh / 2
        // Normalize roughly to -1..1 (clamp)
        const norm = Math.max(-1, Math.min(1, centerDist / (vh * 0.9)))
        // Translate up/down up to 14px based on norm (inverted for subtle parallax)
        const ty = (-norm * 14).toFixed(2)
        // Scale slightly more when centered (norm near 0)
        const scale = (0.985 + (1 - Math.abs(norm)) * 0.015).toFixed(4)
        el.style.transform = `translate3d(0, ${ty}px, 0) scale(${scale})`
      }
    }

    const onScroll = () => {
      if (frame.current) return
      frame.current = requestAnimationFrame(update)
    }

    const onResize = () => {
      elements = Array.from(document.querySelectorAll('[data-scroll-slight]'))
      update()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    update()
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      // Clean transforms to not interfere with other modes
      for (const el of elements) el.style.transform = ''
    }
  }, [reduced])

  return null
}

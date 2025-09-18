"use client"
import { useEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Interest = { label: string; icon: string }

type Props = { items: Interest[] }

export default function InterestsChart({ items }: Props) {
  const prefersReduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  // Assign a few size variants for visual rhythm
  const sized = useMemo(() => {
    const sizes = [72, 84, 64, 92, 76]
    return items.map((it, i) => ({ ...it, size: sizes[i % sizes.length], delay: (i % 5) * 0.2 }))
  }, [items])

  useEffect(() => {
    if (prefersReduced) return
    const root = ref.current
    if (!root) return
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.setAttribute('data-inview', 'true')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' })
    cards.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [prefersReduced])

  return (
    <div ref={ref} className="relative mx-auto max-w-3xl">
      <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {sized.map((it, i) => (
          <li key={it.label} className="flex flex-col items-center">
            <div
              className="bubble-circle glass-border reveal"
              data-reveal
              data-size={it.size}
              data-delay={it.delay}
              aria-label={it.label}
            >
              <span aria-hidden className="text-xl leading-none">
                {it.icon}
              </span>
            </div>
            <span className="mt-2 text-sm text-white/90 text-center">{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

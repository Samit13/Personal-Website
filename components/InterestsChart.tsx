"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Interest = { label: string; icon: string }

type Props = { items: Interest[] }

export default function InterestsChart({ items }: Props) {
  const prefersReduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [compact, setCompact] = useState(false)
  const [tip, setTip] = useState<null | { x: number; y: number; text: React.ReactNode }>(null)
  const tipTimer = useRef<number | null>(null)
  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 480)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const sized = useMemo(() => {
    const weightMap: Record<string, number> = {
      Photography: 1.25,
      Traveling: 1.1,
      Technology: 1.2,
      'Embedded Systems': 1.35,
      Gym: 1.05,
    }
    const baseSizes = compact ? { min: 54, max: 100 } : { min: 70, max: 130 }
    return items.map((it, i) => {
      const w = weightMap[it.label] ?? 1
      const norm = Math.min(1, Math.max(0, (w - 0.8) / (1.4 - 0.8)))
      const size = baseSizes.min + (baseSizes.max - baseSizes.min) * norm
      return { ...it, size: Math.round(size), delay: (i % 6) * 0.16 }
    })
  }, [items, compact])

  const positioned = useMemo(() => {
    if (!sized.length) return []
  const gap = compact ? 14 : 6 // tighter desktop gap, keep mobile spacing
    const circles = [...sized]
      .map(s => ({ ...s, r: s.size / 2 }))
      .sort((a, b) => b.r - a.r) // largest first

    interface Placed { label: string; icon: string; size: number; delay: number; r: number; x: number; y: number }
    const placed: Placed[] = []

    const fits = (x: number, y: number, r: number) => {
      for (const p of placed) {
        const dx = x - p.x
        const dy = y - p.y
        const need = r + p.r + gap
        if (dx * dx + dy * dy < need * need) return false
      }
      return true
    }

    // Spiral search for each circle
    const maxRadius = 500 // virtual coordinate space; will normalize later
    for (const c of circles) {
      if (placed.length === 0) {
        placed.push({ ...c, x: 0, y: 0 })
        continue
      }
      let placedFlag = false
      const stepR = Math.max(4, c.r * 0.35)
      for (let R = 0; R <= maxRadius && !placedFlag; R += stepR) {
        const circumference = 2 * Math.PI * (R || 1)
        const steps = Math.max(8, Math.ceil(circumference / Math.max(8, c.r * 0.9)))
        for (let i = 0; i < steps; i++) {
          const theta = (i / steps) * Math.PI * 2
          const x = R * Math.cos(theta)
          const y = R * Math.sin(theta)
          if (fits(x, y, c.r)) {
            placed.push({ ...c, x, y })
            placedFlag = true
            break
          }
        }
      }
      if (!placedFlag) {
        // Fallback: place far outside (should rarely happen)
        placed.push({ ...c, x: maxRadius, y: 0 })
      }
    }

    // Normalize positions to fit inside square with padding
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const p of placed) {
      minX = Math.min(minX, p.x - p.r)
      maxX = Math.max(maxX, p.x + p.r)
      minY = Math.min(minY, p.y - p.r)
      maxY = Math.max(maxY, p.y + p.r)
    }
    const width = maxX - minX
    const height = maxY - minY
    const box = Math.max(width, height)
  const pad = (compact ? 0.04 : 0.015) * box // less outer padding on desktop to tighten cluster
    return placed.map(p => ({
      ...p,
      left: `${((p.x - minX + (box - width) / 2) / (box + pad * 2)) * 100}%`,
      top: `${((p.y - minY + (box - height) / 2) / (box + pad * 2)) * 100}%`
    }))
  }, [sized, compact])

  // Short descriptions for quick popups
  const desc = useMemo<Record<string, React.ReactNode>>(() => ({
    'Embedded Systems': 'I build low-level firmware and hardware–software systems.',
    Photography: (
      <a
        href="https://www.instagram.com/samit.shots/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        @samit.shots
      </a>
    ),
    Traveling: 'USA, Mexico, Canada, ABC islands, India, Germany, Italy, France, Switzerland',
    'Sports Cars': 'Audi is a favorite',
    Driving: 'I find it therapeutic and enjoy playing F1.',
    Gym: 'I like working out, but I don’t eat food so nothing happens.',
    Frisbee: 'Played Ultimate Frisbee in HighSchool and won a state tournament.',
    Physics: 'I like how everything works',
    Investing: 'I hate it',
    Technology: 'Always exploring new tools and tech.',
  }), [])

  const showTip = (target: HTMLElement, label: string) => {
    const root = ref.current
    if (!root) return
    const rRoot = root.getBoundingClientRect()
    const r = target.getBoundingClientRect()
    // Position slightly above the bubble center
    const x = r.left - rRoot.left + r.width / 2
    const y = Math.max(18, r.top - rRoot.top)
    const text = desc[label] ?? label
    setTip({ x, y, text })
    if (tipTimer.current) window.clearTimeout(tipTimer.current)
    tipTimer.current = window.setTimeout(() => setTip(null), 2000) as unknown as number
  }

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
    }, { threshold: 0.15 })
    cards.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [prefersReduced, positioned.length])

  // Apply positioning & sizing via direct style (post-mount) to satisfy linter (no inline in JSX) while still dynamic.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const nodes = el.querySelectorAll<HTMLLIElement>('ul[aria-label="Interests"] > li')
    nodes.forEach(li => {
      const x = li.getAttribute('data-x')
      const y = li.getAttribute('data-y')
      const size = li.getAttribute('data-size')
      const font = li.getAttribute('data-font')
      if (x && y) {
        li.style.left = x
        li.style.top = y
      }
      const bubble = li.querySelector<HTMLElement>('.interest-bubble')
      if (bubble && size) {
        bubble.style.width = size + 'px'
        bubble.style.height = size + 'px'
        if (font) bubble.style.fontSize = font + 'px'
        const icon = bubble.querySelector<HTMLElement>('[data-icon-size]')
        const label = bubble.querySelector<HTMLElement>('[data-label-size]')
        if (icon) {
          const f = icon.getAttribute('data-icon-size')
          if (f) icon.style.fontSize = f + 'px'
        }
        if (label) {
          const lf = label.getAttribute('data-label-size')
          if (lf) label.style.fontSize = lf + 'px'
        }
      }
    })
  }, [positioned])

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[520px] aspect-square">
      <ul
        aria-label="Interests"
        className="relative size-full list-none p-0 m-0"
      >
        {positioned.map((it) => {
          const d = it.size
          const iconFont = Math.max(22, d * 0.34)
          const labelFont = Math.max(10, Math.min(14, d * 0.16))
          return (
            <li
              key={it.label}
              className="absolute flex flex-col items-center"
              data-x={it.left}
              data-y={it.top}
              data-size={d}
              data-font={iconFont}
              /* positioning & sizing via CSS below */
            >
              <div
                className="bubble-circle glass-border reveal shadow-lg shadow-black/30 flex flex-col items-center justify-center text-white/90 interest-bubble overflow-hidden"
                data-reveal
                data-delay={it.delay}
                aria-label={it.label}
                role="button"
                tabIndex={0}
                onClick={(e) => showTip(e.currentTarget as HTMLElement, it.label)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showTip(e.currentTarget as HTMLElement, it.label) } }}
              >
                <span aria-hidden className="leading-none select-none block" data-icon-size={iconFont}>{it.icon}</span>
                <span className="mt-1 font-medium text-center leading-tight tracking-tight text-white/80" data-label-size={labelFont}>
                  {it.label}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
      {tip && (
        <div
          className="absolute z-20 rounded-lg px-3 py-2 bg-white/10 ring-1 ring-white/20 shadow-lg shadow-black/30 backdrop-blur-sm text-[13px] leading-snug edu-tip"
          role="status"
          aria-live="polite"
          ref={(el) => {
            if (!el) return
            el.style.setProperty('--tip-x', tip.x + 'px')
            el.style.setProperty('--tip-y', tip.y + 'px')
          }}
        >
          {tip.text}
        </div>
      )}
      <style jsx>{`
        ul[aria-label="Interests"] > li { position:absolute; transform:translate(-50%, -50%); }
        :global(.edu-tip) { left: var(--tip-x); top: var(--tip-y); transform: translate(-50%, calc(-100% - 10px)); }
      `}</style>
    </div>
  )
}

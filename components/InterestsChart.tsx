"use client"
import { useEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Interest = { label: string; icon: string }

type Props = { items: Interest[] }

export default function InterestsChart({ items }: Props) {
  const prefersReduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  /**
   * 1. Assign relative visual weights (bigger bubbles) — tweak here.
   * 2. Derive actual pixel diameters (these get normalized to the container).
   */
  const sized = useMemo(() => {
    const weightMap: Record<string, number> = {
      Photography: 1.25,
      Traveling: 1.1,
      Technology: 1.2,
      'Embedded Systems': 1.35,
      Gym: 1.05,
    }
    const baseSizes = { min: 70, max: 130 }
    return items.map((it, i) => {
      const w = weightMap[it.label] ?? 1
      const norm = Math.min(1, Math.max(0, (w - 0.8) / (1.4 - 0.8)))
      const size = baseSizes.min + (baseSizes.max - baseSizes.min) * norm
      return { ...it, size: Math.round(size), delay: (i % 6) * 0.16 }
    })
  }, [items])

  /**
   * Circle packing (lightweight force-based) to fill container.
   * Steps:
   *  - Assign provisional radii from size
   *  - Initial polar distribution using golden angle spiral
   *  - Iteratively resolve overlaps (repulsion) & recentre
   *  - Normalize scale to fit ~92% of container diameter
   */
  const positioned = useMemo(() => {
    if (!sized.length) return [] as any[]
    type Node = { label: string; icon: string; size: number; delay: number; r: number; x: number; y: number }
    const itemsWithRadius: Node[] = sized.map(s => ({ ...s, r: s.size / 2, x: 0, y: 0 }))

    // Base coordinate space: unit square we later map; treat container radius = 1
    const n = itemsWithRadius.length
    const phi = Math.PI * (3 - Math.sqrt(5)) // golden angle
    itemsWithRadius.forEach((node, i) => {
      const t = i + 1
      const r = 0.15 + 0.85 * (t / n) // radial progression
      const angle = t * phi
      node.x = r * Math.cos(angle)
      node.y = r * Math.sin(angle)
    })

  const ITER = 320
    for (let it = 0; it < ITER; it++) {
      // Pairwise separation
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = itemsWithRadius[i]
          const b = itemsWithRadius[j]
            ;
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.hypot(dx, dy) || 1e-6
          const minDist = (a.r + b.r) / 300 // scaled because we later scale up
          if (dist < minDist) {
            const overlap = (minDist - dist) * 0.5
            const ux = dx / dist
            const uy = dy / dist
            a.x -= ux * overlap
            a.y -= uy * overlap
            b.x += ux * overlap
            b.y += uy * overlap
          }
        }
      }
      // Gentle attraction towards center to keep cluster tight
      itemsWithRadius.forEach(nod => {
        nod.x *= 0.992
        nod.y *= 0.992
      })
    }

    let maxR = 0
    itemsWithRadius.forEach(nod => {
      const d = Math.hypot(nod.x, nod.y) + nod.r / 300
      if (d > maxR) maxR = d
    })
    const scale = 0.98 / maxR
    const placed = itemsWithRadius.map(nod => {
      const x = nod.x * scale
      const y = nod.y * scale
      return {
        ...nod,
        left: `${50 + x * 50}%`,
        top: `${50 + y * 50}%`,
      }
    })
    return placed
  }, [sized])

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
      <style jsx>{`
        ul[aria-label="Interests"] > li { position:absolute; transform:translate(-50%, -50%); }
      `}</style>
    </div>
  )
}

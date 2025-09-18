"use client"
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const PROJECTS = [
  {
    title: 'AI Fitness Tracker',
    desc: 'Full-stack app with Java Servlets, MySQL, and ChatGPT API for natural language diet input.',
    href: '#',
    media: '/placeholder/project1.jpg'
  },
  {
    title: 'Pipelined Processor (Verilog)',
    desc: '5-stage pipeline with hazard detection/forwarding; verified via waveforms in Vivado.',
    href: '#',
    media: '/placeholder/project2.jpg'
  },
  {
    title: 'Audio Amplifier Circuit',
    desc: 'Multi-stage amplifier with filters and LED volume, validated on lab equipment.',
    href: '#',
    media: '/placeholder/project3.jpg'
  }
]

export default function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<HTMLAnchorElement[]>([])
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Reveal when in view
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement
          if (e.isIntersecting) {
            el.setAttribute('data-inview', 'true')
          } else {
            el.removeAttribute('data-inview')
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -12% 0px' }
    )

    cardsRef.current.forEach((el) => {
      if (!el) return
      el.setAttribute('data-reveal', '')
      io.observe(el)
    })

    if (!prefersReduced) {
      let raf = 0
      const onScroll = () => {
        if (raf) return
        raf = requestAnimationFrame(() => {
          raf = 0
          const vh = window.innerHeight
          const mid = vh * 0.55
          const sectionRect = section.getBoundingClientRect()
          // Compute a stack factor s in [0,1]: 0 = fully stacked, 1 = fully expanded
          // Start stacking later (when section top reaches ~60% of viewport),
          // finish expansion around ~25% for a later, more satisfying unfold.
          const start = vh * 0.60
          const end = vh * 0.25
          const progress = (start - sectionRect.top) / Math.max(1, (start - end))
          const s = Math.min(1, Math.max(0, progress))

          // Determine center of the grid container to stack toward
          const grid = gridRef.current
          const gridRect = grid ? grid.getBoundingClientRect() : sectionRect
          const cx = gridRect.left + gridRect.width / 2
          const cy = gridRect.top + Math.min(gridRect.height, vh) / 2

          for (let i = 0; i < cardsRef.current.length; i++) {
            const el = cardsRef.current[i]
            if (!el) continue
            const r = el.getBoundingClientRect()
            // Parallax factor around screen center
            const center = r.top + r.height / 2
            let f = (center - mid) / vh // [-1,1]
            if (f < -1) f = -1
            if (f > 1) f = 1
            const translate = -16 * f * s // reduce parallax when stacked
            const pScale = 0.985 + (1 - Math.abs(f)) * 0.015
            el.style.setProperty('--p-t', `${translate}px`)
            el.style.setProperty('--p-s', `${pScale}`)

            // Stacking: translate each card toward the grid center when s -> 0
            const ex = r.left + r.width / 2
            const ey = r.top + r.height / 2
            const dx = cx - ex
            const dy = cy - ey
            const stackX = dx * (1 - s)
            const stackY = dy * (1 - s)
            const stackScale = 0.92 + 0.08 * s // 0.92 when stacked, 1 when expanded
            el.style.setProperty('--s-x', `${stackX}px`)
            el.style.setProperty('--s-y', `${stackY}px`)
            el.style.setProperty('--s-s', `${stackScale}`)

            // Layering: higher z-index when stacked so top items are clickable/visible
            el.style.zIndex = s < 0.999 ? String(200 - i) : ''
          }
        })
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
      return () => {
        if (raf) cancelAnimationFrame(raf)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
      }
    }

    return () => io.disconnect()
  }, [prefersReduced])

  return (
    <section ref={sectionRef} id="projects" aria-labelledby="projects-title" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <h2 id="projects-title" className="mb-10">Projects</h2>
      <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative">
        {PROJECTS.map((p, i) => (
          <a
            key={p.title}
            href={p.href}
            ref={(el) => { if (el) cardsRef.current[i] = el }}
            className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 rounded-2xl overflow-hidden glass hover-highlight reveal transition-transform duration-500 [transform:translate(calc(var(--s-x,0px)),_calc(var(--r-t,16px)_+_var(--p-t,0px)_+_var(--s-y,0px)))_scale(calc(var(--r-s,0.985)*var(--p-s,1)*var(--s-s,1)))] will-change-transform"
          >
            <div className="aspect-video w-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0 group-hover:scale-[1.02] transition-transform" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className="mt-1 text-muted text-sm">{p.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

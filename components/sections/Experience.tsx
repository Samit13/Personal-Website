"use client"
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EXPERIENCE } from '@/content/experience'
import ViewTransition from '@/components/ViewTransition'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Timeline with scroll-driven reveals and a vertical progress rail
export default function Experience() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const list = listRef.current
    if (!section || !list) return

    // Reveal items as they enter viewport
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-reveal]'))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-inview', 'true')
          } else {
            ;(e.target as HTMLElement).removeAttribute('data-inview')
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    )
    items.forEach((el) => io.observe(el))

    // Scroll progress for the vertical rail
    const progressEl = progressRef.current
    let raf = 0
    const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const rect = section.getBoundingClientRect()
        const vh = window.innerHeight
        const scrolled = vh - rect.top
        const total = rect.height + vh
        const p = clamp(scrolled / total)
        if (progressEl) progressEl.style.setProperty('--p', String(p))

        // Vertical stack/collapse animation (0=stacked, 1=expanded)
        if (!prefersReduced) {
          // Start unfolding when section top hits ~60% viewport, finish by ~25%
          const start = vh * 0.60
          const end = vh * 0.25
          const progressS = (start - rect.top) / Math.max(1, (start - end))
          const s = clamp(progressS, 0, 1)

          const listRect = list.getBoundingClientRect()
          const cy = listRect.top + Math.min(listRect.height, vh) / 2

          items.forEach((el, i) => {
            const r = el.getBoundingClientRect()
            const ec = r.top + r.height / 2
            const dy = cy - ec
            const stackY = dy * (1 - s)
            const stackScale = 0.96 + 0.04 * s // 0.96 when stacked, 1 when expanded
            el.style.setProperty('--s-y', `${stackY}px`)
            el.style.setProperty('--s-s', `${stackScale}`)
            // ensure layering when stacked so top items appear on top
            ;(el as HTMLElement).style.zIndex = s < 0.999 ? String(200 - i) : ''
          })
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      items.forEach((el) => io.unobserve(el))
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Smooth expansion using View Transitions API when supported
  const onCardClick = (e: React.MouseEvent, href: string) => {
    // Let modified clicks (new tab/middle-click) behave normally
    // @ts-ignore button exists on MouseEvent
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e as any).button !== 0) return
    e.preventDefault()
  const nav = () => router.push(href as any, { scroll: false })
    // @ts-ignore experimental API check
    if (typeof (document as any).startViewTransition === 'function') {
      // @ts-ignore
      ;(document as any).startViewTransition(nav)
    } else {
      nav()
    }
  }

  return (
    <section ref={sectionRef} aria-labelledby="experience-title" className="relative mx-auto max-w-6xl px-6 py-24 md:py-32" id="experience">
      <div className="relative">
        <header className="mb-4">
          <h2 id="experience-title">Experience</h2>
          <p className="mt-2 text-muted">Scroll the timeline — tap any card for details.</p>
        </header>

        <div className="relative">
          {/* Vertical rail */}
          <div className="absolute left-0 top-0 h-full timeline-rail" aria-hidden />
          {/* Progress line */}
          <div ref={progressRef} className="absolute left-0 top-0 timeline-progress" aria-hidden />

          <ul ref={listRef} role="list" className="ml-6 max-w-3xl space-y-6">
            {EXPERIENCE.map((job) => (
              <li key={job.slug} className="relative">
                {/* Rail dot */}
                <span aria-hidden className="timeline-dot absolute -left-6 top-4" />

                <Link
                  href={`/experience/${job.slug}`}
                  scroll={false}
                  className="group block"
                  aria-label={`${job.company} — ${job.time}`}
                  onClick={(e) => onCardClick(e, `/experience/${job.slug}`)}
                >
                  <ViewTransition
                    name={`exp-${job.slug}`}
                    as="article"
                    className="glass hover-highlight hover-shine reveal rounded-2xl px-4 py-3.5 ring-1 ring-white/10 border border-white/5 shadow-2xl shadow-black/40 transition-transform transition-colors duration-300 transform-gpu [transform-style:preserve-3d] [will-change:transform] hover:scale-[1.03] hover:-translate-y-0.5 [transform:translate(calc(var(--s-x,0px)),_calc(var(--r-t,16px)_+_var(--p-t,0px)_+_var(--s-y,0px)))_scale(calc(var(--r-s,0.985)*var(--p-s,1)*var(--s-s,1)))]"
                    data-reveal
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-2xl md:text-3xl leading-tight">{job.company}</h3>
                      <span className="text-sm text-muted whitespace-nowrap">{job.time}</span>
                    </div>
                    <div className="pointer-events-none max-h-0 opacity-0 translate-y-1 overflow-hidden transition-all duration-300 ease-out group-hover:max-h-40 group-hover:opacity-100 group-hover:translate-y-0">
                      <p className="mt-2 text-sm text-muted">{job.role}</p>
                      <ul className="mt-2 space-y-1.5 text-sm text-muted">
                        {job.bullets.slice(0, 2).map((b: string) => (
                          <li key={b} className="list-disc pl-5">{b}</li>
                        ))}
                      </ul>
                    </div>
                  </ViewTransition>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

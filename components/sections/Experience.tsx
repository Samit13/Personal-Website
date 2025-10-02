"use client"
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EXPERIENCE } from '@/content/experience'
import ViewTransition from '@/components/ViewTransition'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import Image from 'next/image'

// Timeline with scroll-driven reveals and a vertical progress rail
export default function Experience() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    // Prefetch experience detail routes to reduce first-click latency
    try {
      EXPERIENCE.forEach((job) => {
        // Best-effort; ignore if router.prefetch not available
        // @ts-ignore typedRoutes is enabled but prefetch may be optional
        router.prefetch?.(`/experience/${job.slug}`)
      })
    } catch {}

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

        <div className="relative grid grid-cols-[8px_1fr] gap-4">
          {/* Vertical rail */}
          <div className="relative">
            <div className="timeline-rail absolute left-1/2 top-0 h-full -translate-x-1/2" aria-hidden />
            {/* Progress line */}
            <div ref={progressRef} className="timeline-progress absolute left-1/2 top-0 -translate-x-1/2" aria-hidden />
          </div>

          <ul ref={listRef} role="list" className="max-w-3xl space-y-6">
            {EXPERIENCE.map((job) => (
              <li key={job.slug} className="relative">
                {/* Rail dot */}
                <span aria-hidden className="timeline-dot absolute -left-8 top-4" />

                <Link
                  href={`/experience/${job.slug}`}
                  prefetch
                  scroll={false}
                  className="group block"
                  aria-label={`${job.company} — ${job.role}${job.location ? ' — ' + job.location : ''} — ${job.time}`}
                  onClick={(e) => onCardClick(e, `/experience/${job.slug}`)}
                >
                  <ViewTransition
                    name={`exp-${job.slug}`}
                    as="article"
                    className="glass hover-highlight hover-shine reveal rounded-2xl px-4 py-3.5 ring-1 ring-white/10 border border-white/5 shadow-2xl shadow-black/40 transition-colors duration-300 transform-gpu [transform-style:preserve-3d] [will-change:transform]"
                    data-reveal
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <h3 className="text-2xl md:text-3xl leading-tight flex items-center gap-3 flex-1 min-w-[220px]">
                        {job.logo ? (
                          <Image
                            src={job.logo}
                            alt={`${job.company} logo`}
                            width={48}
                            height={48}
                            className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-sm bg-white/5 p-0.5 border border-white/10"
                            priority
                          />
                        ) : null}
                        <span className="flex flex-col">
                          <span>{job.company}</span>
                          {job.context ? (
                            <span className="text-[0.65rem] md:text-xs font-medium tracking-wide uppercase text-white/50 mt-0.5">{job.context}</span>
                          ) : null}
                        </span>
                      </h3>
                      <div className="flex flex-col items-end text-right">
                        {job.location ? (
                          <span className="text-xs md:text-sm text-white/60 whitespace-nowrap leading-snug">{job.location}</span>
                        ) : null}
                        <span className="text-xs md:text-sm text-muted whitespace-nowrap mt-0.5">{job.time}</span>
                      </div>
                    </div>
                    <div className="pointer-events-none max-h-0 opacity-0 translate-y-1 overflow-hidden transition-all duration-300 ease-out group-hover:max-h-40 group-hover:opacity-100 group-hover:translate-y-0">
                      <p className="mt-2 text-sm text-muted font-medium">{job.role}</p>
                      {job.location ? <p className="text-[0.65rem] uppercase tracking-wide text-white/40 mt-1">{job.location}</p> : null}
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

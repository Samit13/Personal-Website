"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { featuredAcademics, type AcademicItem, type AcademicKind } from '@/content/academics'

type KindNoEssay = Exclude<AcademicKind, 'essay'>

const LABEL: Record<KindNoEssay, string> = {
  thesis: 'Thesis',
  project: 'Projects',
  assignment: 'Assignments',
}

function Card({ item }: { item: AcademicItem & { kind: KindNoEssay } }) {
  return (
    <Link
      href={`/coursework/${item.slug}`}
      data-ac-card
      data-kind={item.kind}
      className="group block glass rounded-2xl ring-1 ring-white/10 border border-white/5 hover:highlight transition-colors overflow-hidden"
    >
      <div className="p-5">
  <div className="text-xs uppercase tracking-wide text-white/60 mb-1">{LABEL[item.kind]}</div>
        <h3 className="text-lg font-semibold group-hover:underline underline-offset-4 decoration-white/30">{item.title}</h3>
        {item.description && <p className="mt-1 text-muted text-sm">{item.description}</p>}
        {(item.course || item.term || (item as any).location) && (
          <p className="mt-3 text-[11px] uppercase tracking-wide text-white/40 flex flex-wrap gap-x-2 gap-y-0.5">
            {[item.course, item.term].filter(Boolean).join(' ')}
            {(item.course || item.term) && (item as any).location ? <span aria-hidden>•</span> : null}
            {(item as any).location ? <span className="normal-case text-white/45">{(item as any).location}</span> : null}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function Coursework() {
  const groups: Record<KindNoEssay, AcademicItem[]> = {
    thesis: [], project: [], assignment: []
  }
  for (const a of featuredAcademics) {
    if (a.kind === 'essay') continue
    groups[a.kind].push(a)
  }

  const sectionRef = useRef<HTMLElement | null>(null)
  const educationRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const pathRefs = useRef<Record<KindNoEssay, SVGPathElement | null>>({ thesis: null, project: null, assignment: null })
  const orbRefs = useRef<Record<KindNoEssay, SVGCircleElement | null>>({ thesis: null, project: null, assignment: null })
  const [pathReady, setPathReady] = useState(false)

  type Filter = 'all' | KindNoEssay
  const [filter, setFilter] = useState<Filter>('all')
  const kinds: KindNoEssay[] = ['thesis', 'project', 'assignment']

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Expand/collapse state for Education panels
  const [openPSU, setOpenPSU] = useState(false)
  const [openNA, setOpenNA] = useState(false)
  const toggleAllEducation = () => {
    const next = !(openPSU && openNA)
    setOpenPSU(next)
    setOpenNA(next)
  }
  const psuPanelRef = useRef<HTMLDivElement | null>(null)
  const naPanelRef = useRef<HTMLDivElement | null>(null)
  const measurePanel = (el: HTMLDivElement | null) => {
    if (!el) return
    const h = el.scrollHeight
    el.style.setProperty('--h', h + 'px')
  }
  useEffect(() => { measurePanel(psuPanelRef.current) }, [openPSU])
  useEffect(() => { measurePanel(naPanelRef.current) }, [openNA])
  useEffect(() => {
    const onResize = () => { measurePanel(psuPanelRef.current); measurePanel(naPanelRef.current) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleFilterClick = (k: Filter) => {
    if (k === filter) return
    if (prefersReduced) { setFilter(k); return }
    const stage = stageRef.current
    if (!stage) { setFilter(k); return }
    const currentCards = stage.querySelectorAll<HTMLElement>('[data-ac-card]')
    // Animate out existing cards, then swap filter and animate in
    gsap.to(currentCards, {
      y: -8,
      opacity: 0,
      stagger: 0.04,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => setFilter(k)
    })
  }

  // Build smooth paths connecting centers of visible cards per category
  useEffect(() => {
    const stage = stageRef.current
    const svg = svgRef.current
    if (!stage || !svg) return

    const build = () => {
      const bounds = stage.getBoundingClientRect()
      // Resize SVG to stage
      svg.setAttribute('width', String(bounds.width))
      svg.setAttribute('height', String(bounds.height))
      svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`)

  const activeKinds: KindNoEssay[] = filter === 'all' ? kinds.filter(k => groups[k].length > 0) : [filter]
      let any = false
      for (const k of kinds) {
        const pathEl = pathRefs.current[k]
        if (!pathEl) continue
        if (!activeKinds.includes(k)) {
          pathEl.setAttribute('d', '')
          continue
        }
        const cards = Array.from(stage.querySelectorAll<HTMLElement>(`[data-ac-card][data-kind="${k}"]`))
        if (cards.length < 2) { pathEl.setAttribute('d', ''); continue }
        const pts = cards.map((el) => {
          const r = el.getBoundingClientRect()
          return { x: r.left - bounds.left + r.width / 2, y: r.top - bounds.top + r.height / 2 }
        })
        let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1]
          const p1 = pts[i]
          const dx = p1.x - p0.x
          const dy = p1.y - p0.y
          const cx = dx * 0.35
          const cy = dy * 0.35
          const c1x = p0.x + cx
          const c1y = p0.y + cy
          const c2x = p1.x - cx
          const c2y = p1.y - cy
          d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`
        }
        pathEl.setAttribute('d', d)
        any = true
      }
      setPathReady(any)
    }

    const onResize = () => build()
    build()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [filter])

  // Scroll scrub: reveal paths and move the glow orbs per active category
  useEffect(() => {
    if (!pathReady) return
    const section = sectionRef.current
    if (!section) return

    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Only include kinds whose path has non-empty "d" data
    const activeKinds: KindNoEssay[] = (() => {
      const hasD = (k: KindNoEssay) => {
        const d = pathRefs.current[k]?.getAttribute('d') || ''
        return d.trim().length > 0
      }
      if (filter === 'all') return kinds.filter(hasD)
      const f = filter as KindNoEssay
      return hasD(f) ? [f] : []
    })()

    if (prefersReduced) {
      for (const k of activeKinds) {
        const p = pathRefs.current[k]
        const o = orbRefs.current[k]
        if (!p || !o) continue
        try {
          const totalLen = p.getTotalLength()
          p.style.strokeDasharray = `${totalLen}`
          p.style.strokeDashoffset = '0'
          const pt = p.getPointAtLength(totalLen)
          o.setAttribute('cx', pt.x.toFixed(1))
          o.setAttribute('cy', pt.y.toFixed(1))
          o.style.opacity = '0.75'
        } catch {
          // Ignore paths without valid data
          continue
        }
      }
      return
    }

    for (const k of activeKinds) {
      const p = pathRefs.current[k]
      if (p) {
        try {
          const total = p.getTotalLength()
          p.style.strokeDasharray = `${total}`
        } catch {
          // Skip invalid/empty paths
        }
      }
    }

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const r = section.getBoundingClientRect()
        const vh = window.innerHeight
        // Progress: starts when section top hits 85% of viewport, ends when bottom reaches 20%
        const start = vh * 0.85
        const end = vh * 0.20
        const raw = (start - r.top) / Math.max(1, start - end)
        const p = Math.min(1, Math.max(0, raw))
        for (const k of activeKinds) {
          const pe = pathRefs.current[k]
          const oe = orbRefs.current[k]
          if (!pe || !oe) continue
          try {
            const totalK = pe.getTotalLength()
            const len = totalK * p
            pe.style.strokeDashoffset = `${totalK - len}`
            const pt = pe.getPointAtLength(len)
            oe.setAttribute('cx', pt.x.toFixed(1))
            oe.setAttribute('cy', pt.y.toFixed(1))
            oe.setAttribute('r', String(5 + 2.5 * Math.sin(p * Math.PI)))
            // Fade in quickly once positioned
            oe.style.opacity = String(Math.max(0.6, 0.9 * p))
          } catch {
            // Skip if the path is invalid at this moment (e.g., resized to zero)
            continue
          }
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
  }, [pathReady, filter])

  // Enter animation for cards after filter changes
  useEffect(() => {
    if (prefersReduced) return
    const stage = stageRef.current
    if (!stage) return
    const cards = stage.querySelectorAll<HTMLElement>('[data-ac-card]')
    if (cards.length === 0) return
    gsap.fromTo(cards, { y: 14, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power3.out',
      stagger: 0.06
    })
  }, [filter])

  // Reveal animation for Education timeline
  useEffect(() => {
    if (prefersReduced) return
    const el = educationRef.current
    if (!el) return

    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-edu-item]'))
    // Set initial state
    gsap.set(el, { opacity: 0, y: 22, scale: 0.98, filter: 'blur(6px)' })
    gsap.set(items, { y: 12, opacity: 0 })

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target !== el) continue
        if (e.isIntersecting) {
          gsap.to(el, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' })
          gsap.to(items, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.08, delay: 0.05 })
        } else if (e.intersectionRatio === 0) {
          // reset so it can replay if the user scrolls away and back
          el.style.removeProperty('opacity')
          el.style.removeProperty('transform')
          el.style.removeProperty('filter')
          items.forEach(it => {
            it.style.removeProperty('opacity')
            it.style.removeProperty('transform')
          })
        }
      }
    }, { threshold: [0, 0.25] })
    io.observe(el)
    return () => io.disconnect()
  }, [prefersReduced])

  // Scroll-triggered (re)reveal: animate cards every time section re-enters viewport
  useEffect(() => {
    if (prefersReduced) return
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target !== section) continue
        if (e.isIntersecting) {
          const cards = Array.from(stage.querySelectorAll<HTMLElement>('[data-ac-card]'))
            .filter(c => !c.hasAttribute('data-revealed'))
          if (cards.length) {
            gsap.fromTo(cards, {
              opacity: 0,
              y: 28,
              scale: 0.96,
              filter: 'blur(6px)'
            }, {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 0.6,
              ease: 'power3.out',
              stagger: 0.07,
              onComplete: () => {
                cards.forEach(c => c.setAttribute('data-revealed', 'true'))
              }
            })
          }
        } else {
          // Fully out of view? reset so it can replay
          if (e.intersectionRatio === 0) {
            const cards = stage.querySelectorAll<HTMLElement>('[data-ac-card][data-revealed]')
            cards.forEach(c => {
              c.removeAttribute('data-revealed')
              c.style.removeProperty('opacity')
              c.style.removeProperty('transform')
              c.style.removeProperty('filter')
            })
          }
        }
      }
    }, { threshold: [0, 0.25] })
    io.observe(section)
    return () => io.disconnect()
  }, [prefersReduced, filter])

  return (
    <section ref={sectionRef} id="coursework" aria-labelledby="coursework-title" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      {/* Education timeline (unique display) */}
  <div ref={educationRef} className="mb-10 relative glass rounded-2xl p-5 md:p-6 ring-1 ring-white/10 border border-white/5 overflow-hidden">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 id="education-title" className="text-xl font-semibold">Education</h3>
          <div>
            <button
              type="button"
              aria-controls="edu-psu-panel edu-na-panel"
              onClick={toggleAllEducation}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition"
            >
              {(openPSU && openNA) ? 'Hide education details' : 'More about my education'}
              <span className={`transition-transform ${(openPSU && openNA) ? 'rotate-180' : ''}`} aria-hidden>▾</span>
            </button>
          </div>
        </div>
        {/* connector removed per request */}

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PSU (left on desktop) */}
          <div className="flex flex-col gap-3 min-w-0" data-edu-item>
            <div className="flex items-center gap-4 min-w-0">
              <img src="/logos/companies/schools/psu.png?v=20251009" alt="Penn State logo" className="h-12 w-12 rounded-full object-cover ring-1 ring-white/15" />
              <div className="min-w-0">
                <div className="font-medium">The Pennsylvania State University</div>
                <div className="text-xs text-white/70">Bachelor of Computer Engineering</div>
                <div className="text-[11px] uppercase tracking-wide text-white/45 mt-0.5">2022 – 2026</div>
              </div>
            </div>
            {/* master toggle above; per-item button removed */}
            <div
              id="edu-psu-panel"
              ref={psuPanelRef}
              data-open={openPSU ? 'true' : 'false'}
              className="edu-panel mt-1 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/85"
            >
              <div className="font-medium mb-1">Highlighted courses</div>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>CMPSC 473 Operating Systems</li>
                <li>CMPEN 431 Computer Architecture</li>
                <li>CMPEN 362 Communication Networks</li>
                <li>CMPEN 472 Microprocessors and Embedded Systems</li>
                <li>CMPSC 465 Data Structures and Algorithms</li>
                <li>EE 353 Signals and Systems</li>
                <li>CMPEN 482W Computer Engineering Project Design</li>
              </ul>w
              <div className="font-medium mt-3 mb-1">Clubs</div>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>Society of Automotive Engineers (SAE) — Chassis Design</li>
              </ul>
            </div>
          </div>
          {/* NA (right on desktop) */}
          <div className="flex flex-col gap-3 min-w-0" data-edu-item>
            <div className="flex items-center gap-4 min-w-0">
              <img src="/logos/companies/schools/na.png" alt="North Allegheny logo" className="h-12 w-12 rounded-full object-cover ring-1 ring-white/15" />
              <div className="min-w-0">
                <div className="font-medium">North Allegheny Senior High School</div>
                <div className="text-xs text-white/70">High School Diploma</div>
                <div className="text-[11px] uppercase tracking-wide text-white/45 mt-0.5">2020 – 2022</div>
              </div>
            </div>
            {/* master toggle above; per-item button removed */}
            <div
              id="edu-na-panel"
              ref={naPanelRef}
              data-open={openNA ? 'true' : 'false'}
              className="edu-panel mt-1 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/85"
            >
              <div className="font-medium mb-1">Clubs</div>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>Coming soon — add clubs, teams, and positions held.</li>
              </ul>
            </div>
          </div>
        </div>
        <style jsx>{`
          .edu-panel { max-height: 0; opacity: 0; transform: translateY(-4px); overflow: hidden; transition: max-height 500ms cubic-bezier(0.22,1,0.36,1), opacity 350ms ease, transform 450ms cubic-bezier(0.22,1,0.36,1); }
          .edu-panel[data-open="true"] { max-height: var(--h); opacity: 1; transform: translateY(0); }
        `}</style>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <h2 id="coursework-title">Academic Highlights</h2>
        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', ...kinds] as const).map((k) => (
            <button
              key={`chip-${k}`}
              type="button"
              onClick={() => handleFilterClick(k)}
              className={`rounded-full px-3.5 py-1.5 text-sm border transition-colors ${
                filter === k ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              {k === 'all' ? 'All' : LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      

      {/* Stage wraps the content and hosts the constellation overlay */}
      <div ref={stageRef} className="relative">
        {/* Constellation paths overlay */}
        <svg ref={svgRef} className="pointer-events-none absolute inset-0 z-[1]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ac-thesis" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9CE6FF" />
              <stop offset="100%" stopColor="#E0F6FF" />
            </linearGradient>
            <linearGradient id="ac-project" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B388FF" />
              <stop offset="100%" stopColor="#E8DAFF" />
            </linearGradient>
            <linearGradient id="ac-assignment" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7CFFBE" />
              <stop offset="100%" stopColor="#D7FFEE" />
            </linearGradient>
            
            <filter id="ac-glow2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {kinds.map((k) => (
            <g key={`g-${k}`} className="ac-group" opacity={filter === 'all' || filter === k ? 1 : 0}>
              <path ref={(el) => { pathRefs.current[k] = el }} d="" fill="none" stroke={`url(#ac-${k})`} strokeWidth="2" filter="url(#ac-glow2)" strokeDashoffset="0" />
              <circle ref={(el) => { orbRefs.current[k] = el }} cx="0" cy="0" r="5" fill={`url(#ac-${k})`} filter="url(#ac-glow2)" opacity="0" />
            </g>
          ))}
        </svg>

        {/* Content */}
        <div className="relative z-[2]">
          {/* Conditionally render per filter to keep layout focused */}
          {(filter === 'all' || filter === 'thesis') && groups.thesis.length > 0 && (
            <div className="mb-10" data-kind-section="thesis">
              <h3 className="mb-4 text-xl font-semibold">Thesis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {groups.thesis.map((i) => <Card key={i.title} item={i as AcademicItem & { kind: KindNoEssay }} />)}
              </div>
            </div>
          )}

          {(filter === 'all' || filter === 'project') && groups.project.length > 0 && (
            <div className="mb-10" data-kind-section="project">
              <h3 className="mb-4 text-xl font-semibold">Projects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.project.map((i) => <Card key={i.title} item={i as AcademicItem & { kind: KindNoEssay }} />)}
              </div>
            </div>
          )}

          {(filter === 'all' || filter === 'assignment') && (groups.assignment.length > 0) && (
            <div className="grid md:grid-cols-2 gap-8">
              {(filter === 'all' || filter === 'assignment') && groups.assignment.length > 0 && (
                <div data-kind-section="assignment">
                  <h3 className="mb-4 text-xl font-semibold">Assignments</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {groups.assignment.map((i) => <Card key={i.title} item={i as AcademicItem & { kind: KindNoEssay }} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

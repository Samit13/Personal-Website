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
        {(item.course || item.term) && (
          <p className="mt-3 text-xs text-white/50">{[item.course, item.term].filter(Boolean).join(' • ')}</p>
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
  const stageRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const pathRefs = useRef<Record<KindNoEssay, SVGPathElement | null>>({ thesis: null, project: null, assignment: null })
  const orbRefs = useRef<Record<KindNoEssay, SVGCircleElement | null>>({ thesis: null, project: null, assignment: null })
  const [pathReady, setPathReady] = useState(false)

  type Filter = 'all' | KindNoEssay
  const [filter, setFilter] = useState<Filter>('all')
  const kinds: KindNoEssay[] = ['thesis', 'project', 'assignment']

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

  return (
    <section ref={sectionRef} id="coursework" aria-labelledby="coursework-title" className="mx-auto max-w-6xl px-6 py-24 md:py-32 [content-visibility:auto] [contain-intrinsic-size:1000px]">
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

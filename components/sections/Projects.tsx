"use client"
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PROJECTS } from '@/content/projects'
// import ViewTransition from '@/components/ViewTransition'

export default function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardsRef = useRef<HTMLAnchorElement[]>([])
  const prefersReduced = useReducedMotion()
  const router = useRouter()

  useEffect(() => {
    // Prefetch project pages to remove first-click delay
    PROJECTS.forEach((p) => {
      try { router.prefetch?.(`/projects/${p.slug}`) } catch {}
    })

    // Simple one-time fade/raise reveal for cards
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement
          if (e.isIntersecting) {
            el.setAttribute('data-inview', 'true')
            io.unobserve(el)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )

    if (prefersReduced) {
      // Reveal immediately without animation
      cardsRef.current.forEach((el) => el?.setAttribute('data-inview', 'true'))
      return
    }

    cardsRef.current.forEach((el) => { if (el) io.observe(el) })
    return () => io.disconnect()
  }, [prefersReduced, router])

  // No custom click interception; use standard navigation to full page

  return (
    <section ref={sectionRef} id="projects" aria-labelledby="projects-title" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <h2 id="projects-title" className="mb-10">Projects</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative">
        {PROJECTS.map((p, i) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            prefetch
            ref={(el) => { if (el) (cardsRef.current[i] = el as unknown as HTMLAnchorElement) }}
            className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 rounded-2xl overflow-hidden glass hover-highlight card-fadeup will-change-transform"
            style={{ ['--c-delay' as any]: `${Math.min(i, 5) * 60}ms` }}
            aria-label={`${p.title}`}
          >
            {/* Removed ViewTransition wrapper for plain navigation */}
            <div className="aspect-video w-full overflow-hidden">
              {p.cardImage ? (
                <img src={p.cardImage} alt="" className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0 group-hover:scale-[1.02] transition-transform" />
              )}
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className="mt-1 text-muted text-sm">{p.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

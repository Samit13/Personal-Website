"use client"
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      const left = el.querySelector('[data-col="left"]') as HTMLElement
      const right = el.querySelector('[data-col="right"]') as HTMLElement
      const items = el.querySelectorAll('[data-anim]')

      // Ensure initial off-screen states so reversing works when scrolling up
      gsap.set(left, { xPercent: -30, opacity: 0, rotateY: -8, transformPerspective: 800 })
      gsap.set(right, { xPercent: 30, opacity: 0, rotateY: 8, transformPerspective: 800 })
      gsap.set(items, { y: 18, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 65%',
          end: 'bottom 30%', // extend range so it lingers
          scrub: 0.6,
          invalidateOnRefresh: true,
        }
      })

      // Converge to center
      tl.to(left, { xPercent: 0, opacity: 1, rotateY: 0, ease: 'power3.out', duration: 0.5 }, 0)
        .to(right, { xPercent: 0, opacity: 1, rotateY: 0, ease: 'power3.out', duration: 0.5 }, 0)
        .to(items, { y: 0, opacity: 1, stagger: 0.08, ease: 'power3.out', duration: 0.35 }, 0.1)

        // Hold centered state a bit longer before exiting
        .to({}, { duration: 0.4 })

        // Exit back outward as we scroll past, slower
        .to(items, { y: -18, opacity: 0, stagger: 0.08, ease: 'power3.in', duration: 0.5 }, '+=0')
        .to(left, { xPercent: -30, opacity: 0, rotateY: -8, ease: 'power3.in', duration: 0.6 }, '+=0.05')
        .to(right, { xPercent: 30, opacity: 0, rotateY: 8, ease: 'power3.in', duration: 0.6 }, '<')
    }, ref)
    return () => ctx.revert()
  }, [prefersReduced])

  const INTERESTS = [
    { label: 'Embedded Systems', icon: '💻' },
    { label: 'Photography', icon: '📷' },
    { label: 'Traveling', icon: '🌍' },
    { label: 'Sports Cars', icon: '🏎️' },
    { label: 'Driving', icon: '🛞' },
    { label: 'Gym', icon: '🏋️' },
    { label: 'Frisbee', icon: '🥏' },
  ]

  return (
    <section aria-labelledby="about-title" className="relative mx-auto max-w-6xl px-6 py-24 md:py-40">
      <div ref={ref} className="grid gap-10 md:grid-cols-12">
        {/* Left rail — sticky heading for alignment */}
        <div className="md:col-span-4" data-col="left">
          <div className="md:sticky md:top-24">
            <h2 id="about-title" data-anim>About Me</h2>
            <p className="mt-4 text-muted" data-anim>
            Computer Engineering Student at The Pennsylvania State University.
            </p>
            <div className="mt-6" data-anim>
              <a
                href="/resume.pdf"
                download
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-white/10 hover:bg-white/15 ring-1 ring-white/15 hover:ring-white/25 text-white transition-colors"
                aria-label="Download my resume as PDF"
              >
                <span>Download Resume</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right — interests as glass pills in a responsive grid */}
        <div className="md:col-span-8" data-col="right">
          <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 [perspective:1200px]">
            {INTERESTS.map((item) => (
              <li
                key={item.label}
                className="glass rounded-xl px-4 py-3 flex items-center gap-3 transition-transform duration-200 hover:scale-[1.03] hover:-translate-y-0.5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 border border-white/5 transform-gpu [transform-style:preserve-3d] [will-change:transform]"
              >
                <span aria-hidden className="text-lg">{item.icon}</span>
                <span className="text-base text-fg/90">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

"use client"
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          titleRef.current?.classList.remove('will-change-transform')
          subRef.current?.classList.remove('will-change-transform')
        }
      })
      titleRef.current?.classList.add('will-change-transform')
      subRef.current?.classList.add('will-change-transform')
      tl.fromTo(
        titleRef.current,
        { y: 18, opacity: 0, scale: 1.12, transformOrigin: '50% 50%' },
        { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }
      ).fromTo(
        subRef.current,
        { y: 26, opacity: 0, scale: 1.06, transformOrigin: '50% 50%' },
        { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out' },
        '-=0.55'
      )

      // Scroll effect simplified: no filter changes (filters are costly), smaller scale delta, shorter range
      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=260',
          scrub: 0.3,
          invalidateOnRefresh: true,
        }
      })
      .fromTo(
        titleRef.current,
        { scale: 1, y: 0, opacity: 1, immediateRender: false },
        { scale: 0.8, y: -8, opacity: 0.65, ease: 'none' },
        0
      )
      .fromTo(
        subRef.current,
        { scale: 1, y: 0, opacity: 1, immediateRender: false },
        { scale: 0.86, y: -6, opacity: 0.7, ease: 'none' },
        0
      )

      const resetHero = () => {
        gsap.to(titleRef.current, { scale: 1, y: 0, opacity: 1, duration: 0.2, overwrite: 'auto' })
        gsap.to(subRef.current, { scale: 1, y: 0, opacity: 1, duration: 0.2, overwrite: 'auto' })
      }
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        onEnter: resetHero,
        onEnterBack: resetHero,
      })

      // In case the page loads deep-linked (e.g., /#projects), refresh after first paint
      requestAnimationFrame(() => ScrollTrigger.refresh())
    })
    return () => ctx.revert()
  }, [prefersReduced])

  return (
    <section ref={sectionRef} aria-label="Intro" className="relative min-h-[100svh] overflow-hidden">

      {/* Overlay content */}
      <div className="relative z-10 mx-auto flex h-[100svh] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <h1 ref={titleRef} className="mb-4 bg-clip-text text-transparent bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.65)_60%,rgba(255,255,255,0.3)_100%)] text-elevate title-glow origin-center will-change-transform">
          Samit Madatanapalli
        </h1>
        <p ref={subRef} className="max-w-3xl text-lg md:text-2xl text-muted will-change-transform">
          Embedded Engineer at Honeywell
        </p>
      </div>

    </section>
  )
}

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
      const tl = gsap.timeline()
      // Name scales down from bigger to native size, with subtle rise and fade
      tl.fromTo(
        titleRef.current,
        { y: 12, opacity: 0, scale: 1.2, transformOrigin: '50% 50%' },
        { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out' }
      )
      // Subtitle follows shortly after
      tl.fromTo(
        subRef.current,
        { y: 20, opacity: 0, scale: 1.08, transformOrigin: '50% 50%' },
        { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' },
        '-=0.6'
      )

      // Lightweight scroll-driven effect using ScrollTrigger (no manual listeners)
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=400',
          scrub: 0.25,
          invalidateOnRefresh: true,
        }
      })
      .fromTo(
        titleRef.current,
        { scale: 1, y: 0, opacity: 1, filter: 'brightness(1)' },
        { scale: 0.68, y: -10, opacity: 0.55, filter: 'brightness(0.1)', ease: 'none' },
        0
      )
      .fromTo(
        subRef.current,
        { scale: 1, y: 0, opacity: 1, filter: 'brightness(1)' },
        { scale: 0.74, y: -8, opacity: 0.58, filter: 'brightness(0.2)', ease: 'none' },
        0
      )
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

"use client"
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.fromTo(
        titleRef.current,
        { y: 14, opacity: 0, scale: 1.18, transformOrigin: '50% 50%' },
        { y: 0, opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out' }
      ).fromTo(
        subRef.current,
        { y: 18, opacity: 0, scale: 1.05, transformOrigin: '50% 50%' },
        { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out' },
        '-=0.55'
      )
    })
    return () => ctx.revert()
  }, [prefersReduced])

  return (
    <section
      ref={sectionRef}
      aria-label="Intro"
      className="relative flex min-h-screen items-center justify-center"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <h1
          ref={titleRef}
          className="mb-4 bg-clip-text text-transparent bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.65)_60%,rgba(255,255,255,0.3)_100%)] text-elevate title-glow origin-center will-change-transform"
        >
          Samit Madatanapalli
        </h1>
        <p
          ref={subRef}
          className="max-w-3xl text-lg md:text-2xl text-muted will-change-transform mx-auto"
        >
          Embedded Engineer at Honeywell
        </p>
      </div>
    </section>
  )
}

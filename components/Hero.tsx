"use client"
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
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
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      )
    })
    return () => ctx.revert()
  }, [prefersReduced])

  return (
    <section aria-label="Intro" className="relative min-h-[100svh] overflow-hidden">

      {/* Overlay content */}
      <div className="relative z-10 mx-auto flex h-[100svh] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <h1 ref={titleRef} className="mb-4 bg-clip-text text-transparent bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.65)_60%,rgba(255,255,255,0.3)_100%)] text-elevate title-glow origin-center will-change-transform">
          Samit Madatanapalli
        </h1>
        <p ref={subRef} className="max-w-3xl text-lg md:text-2xl text-muted">
          Embedded Engineer at Honeywell
        </p>
      </div>

    </section>
  )
}

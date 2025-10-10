"use client"
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const prefersReduced = useReducedMotion()
  const [navExpanded, setNavExpanded] = useState(true)
  const hoverRef = useRef<HTMLDivElement>(null)
  const pillsRef = useRef<HTMLUListElement>(null)
  const iconRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (prefersReduced) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      // Animate both name & subtitle simultaneously on load
      tl.fromTo(
        titleRef.current,
        { y: 16, opacity: 0, scale: 1.18, transformOrigin: '50% 50%' },
        { y: 0, opacity: 1, scale: 1, duration: 1.05, ease: 'power3.out' },
        0
      )
      tl.fromTo(
        subRef.current,
        { y: 16, opacity: 0, scale: 1.14, transformOrigin: '50% 50%' },
        { y: 0, opacity: 1, scale: 1, duration: 1.05, ease: 'power3.out' },
        0
      )

      // Lightweight scroll-driven effect using ScrollTrigger (no manual listeners)
      const scrubTl = gsap.timeline({
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
        { scale: 1, y: 0, opacity: 1, filter: 'brightness(1)', immediateRender: false },
        { scale: 0.68, y: -10, opacity: 0.55, filter: 'brightness(0.1)', ease: 'none' },
        0
      )
      .fromTo(
        subRef.current,
        { scale: 1, y: 0, opacity: 1, filter: 'brightness(1)', immediateRender: false },
        { scale: 0.74, y: -8, opacity: 0.58, filter: 'brightness(0.2)', ease: 'none' },
        0
      )
      .fromTo(
        hoverRef.current,
        { scale: 1, y: 0, opacity: 1, filter: 'brightness(1)', immediateRender: false },
        { scale: 0.82, y: -6, opacity: 0.7, filter: 'brightness(0.35)', ease: 'none' },
        0
      )

      // Ensure hero resets to a crisp state whenever we re-enter the top of the page
      const resetHero = () => {
        gsap.to(titleRef.current, { scale: 1, y: 0, opacity: 1, filter: 'brightness(1)', duration: 0.2, overwrite: 'auto' })
        gsap.to(subRef.current, { scale: 1, y: 0, opacity: 1, filter: 'brightness(1)', duration: 0.2, overwrite: 'auto' })
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

  // Quick-nav animation: smooth staggered scale/opacity centered on About
  useEffect(() => {
    const el = hoverRef.current
    const list = pillsRef.current
    const icon = iconRef.current
    if (!el || !list || !icon) return

    const items = Array.from(list.querySelectorAll<HTMLAnchorElement>('a'))
    const aboutIndex = items.findIndex((it) => it.textContent?.trim().toLowerCase() === 'about')

    const showNav = () => {
      if (prefersReduced) { setNavExpanded(true); return }
      setNavExpanded(true)
      gsap.killTweensOf([list, icon, ...items])

      // Show list, hide compact chip
      gsap.set(list, { opacity: 1, y: 0, pointerEvents: 'auto' })
      gsap.set(icon, { opacity: 0, pointerEvents: 'none' })

      // Prepare items for a smooth reveal
      gsap.set(items, { scale: 0.9, opacity: 0 })
      gsap.to(items, {
        scale: 1,
        opacity: 1,
        duration: 0.35,
        ease: 'power3.out',
        stagger: { each: 0.05, from: aboutIndex >= 0 ? aboutIndex : 'center' }
      })
    }

    const hideNav = () => {
      if (prefersReduced) { setNavExpanded(false); return }
      setNavExpanded(false)
      gsap.killTweensOf([list, icon, ...items])
      const tl = gsap.timeline()
      tl.to(items, {
        scale: 0.92,
        opacity: 0,
        duration: 0.24,
        ease: 'power2.in',
        stagger: { each: 0.04, from: aboutIndex >= 0 ? aboutIndex : 'center' }
      })
      tl.to(list, { opacity: 0, y: -4, duration: 0.22, ease: 'power2.in' }, '<')
      tl.to(icon, { opacity: 1, pointerEvents: 'auto', duration: 0.22, ease: 'power2.out' }, '>-0.02')
    }

  // Initial: reveal then collapse after a short hold
  // Reveal anim duration is ~0.45s; hold for ~0.5s after reveal => ~0.95s total
  showNav()
  let initialTimeout: number | undefined = window.setTimeout(hideNav, 950)

    const onLeave = () => hideNav()
    const onLeaveFocus = (e: FocusEvent) => {
      const next = (e.relatedTarget as Node) || document.activeElement
      if (next && el.contains(next)) return
      hideNav()
    }
    // Only expand when hovering/focusing the About chip (icon) specifically
    const onIconEnter = () => {
      if (initialTimeout) { window.clearTimeout(initialTimeout); initialTimeout = undefined }
      showNav()
    }

  el.addEventListener('mouseleave', onLeave)
  el.addEventListener('focusout', onLeaveFocus)

    const onNavMouseOver = (e: MouseEvent) => {
      const t = e.target as Node
      if (icon.contains(t)) onIconEnter()
    }
    el.addEventListener('mouseover', onNavMouseOver)

  icon.addEventListener('mouseenter', onIconEnter)
  icon.addEventListener('pointerenter', onIconEnter)
  icon.addEventListener('touchstart', onIconEnter, { passive: true })
    icon.addEventListener('focus', onIconEnter)
    icon.addEventListener('click', onIconEnter)

    return () => {
      if (initialTimeout) window.clearTimeout(initialTimeout)
      el.removeEventListener('mouseleave', onLeave)
  el.removeEventListener('focusout', onLeaveFocus)
      el.removeEventListener('mouseover', onNavMouseOver)
      icon.removeEventListener('mouseenter', onIconEnter)
      icon.removeEventListener('pointerenter', onIconEnter)
      icon.removeEventListener('touchstart', onIconEnter)
      icon.removeEventListener('focus', onIconEnter)
      icon.removeEventListener('click', onIconEnter)
    }
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

        {/* Minimal quick nav with auto-collapse */}
        <div ref={hoverRef} className="mt-6 inline-block">
          <nav aria-label="Quick section navigation" className="relative">
            {/* Collapsed chip (shows when navExpanded is false) */}
            <button
              type="button"
              aria-label={navExpanded ? 'Collapse navigation' : 'Expand navigation'}
              ref={iconRef}
              className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${navExpanded ? 'pointer-events-none opacity-0' : 'opacity-100'}
                rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm text-white/80 hover:text-white/95 hover:bg-white/10 text-[11px] md:text-xs z-20 cursor-pointer select-none`}
            >
              About
            </button>

            {/* Expanded pills */}
            <ul
              ref={pillsRef}
              className={`flex flex-wrap md:flex-nowrap items-center justify-center gap-2 transition-all duration-500 ease-out
                ${navExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}
              `}
            >
              {[
                { href: '#experience', label: 'Experience' },
                { href: '#projects', label: 'Projects' },
                { href: '#about-title', label: 'About' },
                { href: '#coursework', label: 'Academics' },
                { href: '#photography', label: 'Photos' },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-[11px] md:text-xs text-white/70 hover:text-white/90 transition-colors rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur-sm md:whitespace-nowrap"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

    </section>
  )
}

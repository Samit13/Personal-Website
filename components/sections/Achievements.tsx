"use client"
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { label: 'Internships', value: 3 },
  { label: 'Projects', value: 8 },
  { label: 'GPA', value: 3.46, decimals: 2 },
]

export default function Achievements() {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      const numbers = el.querySelectorAll('[data-number]') as NodeListOf<HTMLElement>
      numbers.forEach((node: HTMLElement) => {
        const end = parseFloat(node.getAttribute('data-number') || '0')
        const decimals = parseInt(node.getAttribute('data-decimals') || '0', 10)
        const obj = { val: 0 }
        gsap.to(obj, {
          val: end,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: node as Element, start: 'top 80%', toggleActions: 'play none none reverse' },
          onUpdate: () => {
            const v = decimals ? obj.val.toFixed(decimals) : Math.round(obj.val).toString()
            node.textContent = v
          }
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [prefersReduced])

  return (
    <section aria-labelledby="achievements-title" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <h2 id="achievements-title" className="mb-10">Achievements</h2>
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-6">
            <div className="text-4xl md:text-5xl font-semibold">
              <span data-number={s.value} data-decimals={s.decimals ?? 0}>0</span>
            </div>
            <p className="mt-2 text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

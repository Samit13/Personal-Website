"use client"
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Props = {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
  delay?: number
}

export default function Reveal({ children, className, as = 'div', delay = 0 }: Props) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement | null>(null as any)
  const [shown, setShown] = useState(reduced)

  useEffect(() => {
    if (reduced) return
    const el = ref.current as unknown as Element
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setTimeout(() => setShown(true), delay)
          obs.disconnect()
          break
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay, reduced])

  const Tag = as as any
  return (
    <Tag
      ref={ref}
      onTransitionEnd={(e: React.TransitionEvent) => {
        if (e.target === e.currentTarget && shown) {
          // Remove will-change after the reveal to free up memory/compositor cost
          e.currentTarget.classList.remove('will-change-transform')
        }
      }}
      className={[
        className,
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 will-change-transform',
        'transition-all duration-700'
      ].filter(Boolean).join(' ')}
    >
      {children}
    </Tag>
  )
}

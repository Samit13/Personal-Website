"use client"
import dynamic from 'next/dynamic'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const LiquidGlass = dynamic(() => import('@/components/webgl/LiquidGlass'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" aria-hidden />
})

export default function GlobalBackground() {
  const prefersReduced = useReducedMotion()
  if (prefersReduced) {
    return (
      <div aria-hidden>
        <div className="fixed inset-0 -z-10 bg-black" />
        <div className="pointer-events-none fixed inset-x-0 top-0 h-40 -z-10 bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
      </div>
    )
  }
  return (
    <div aria-hidden>
      <LiquidGlass className="fixed inset-0 -z-10 h-full w-full" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 -z-10 bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
    </div>
  )
}

"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BackdropClose({ className = '' }: { className?: string }) {
  const router = useRouter()

  const animateAndClose = (navigate: () => void) => {
    const html = document.documentElement
    html.setAttribute('data-modal-closing', 'true')
    // Allow CSS animations to play before navigating
    window.setTimeout(() => {
      html.removeAttribute('data-modal-closing')
      navigate()
    }, 260)
  }

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore non-left clicks
    if ((e as any).button !== 0) return
    e.stopPropagation()
    if (typeof window !== 'undefined' && window.history.length > 1) {
      animateAndClose(() => router.back())
    } else {
      animateAndClose(() => router.push('/'))
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (window.history.length > 1) {
          animateAndClose(() => router.back())
        } else {
          animateAndClose(() => router.push('/'))
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [router])

  return (
    <div
      role="button"
      aria-label="Close"
      tabIndex={-1}
      className={className + ' modal-overlay'}
      onClick={onClick}
    />
  )
}

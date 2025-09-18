"use client"
import { useRouter } from 'next/navigation'

export default function CloseButton({ className = '' }: { className?: string }) {
  const router = useRouter()

  const animateAndClose = (navigate: () => void) => {
    const html = document.documentElement
    html.setAttribute('data-modal-closing', 'true')
    window.setTimeout(() => {
      html.removeAttribute('data-modal-closing')
      navigate()
    }, 260)
  }

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks (new tab, etc.) behave normally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (typeof window !== 'undefined' && window.history.length > 1) {
      animateAndClose(() => router.back())
    } else {
      animateAndClose(() => router.push('/'))
    }
  }

  return (
    <a
      href="/"
      onClick={onClick}
      className={className}
      aria-label="Close"
    >
      ✕
    </a>
  )
}

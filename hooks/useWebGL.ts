"use client"
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export type WebGLSetup = (opts: {
  canvas: HTMLCanvasElement
  renderer: THREE.WebGLRenderer
}) => { dispose: () => void; start?: () => void; stop?: () => void }

export function useWebGL(setup: WebGLSetup) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    rendererRef.current = renderer

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas
      renderer.setSize(w, h, false)
    }
    resize()
    window.addEventListener('resize', resize)

  const controls = setup({ canvas, renderer })
  const onBlur = () => controls.stop?.()
  const onFocus = () => controls.start?.()
  window.addEventListener('blur', onBlur)
  window.addEventListener('focus', onFocus)

    return () => {
      controls.dispose?.()
      window.removeEventListener('resize', resize)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
      renderer.dispose()
    }
  }, [setup])

  return { canvasRef, rendererRef }
}

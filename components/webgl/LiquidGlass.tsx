"use client"
import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import { useWebGL } from '@/hooks/useWebGL'
import frag from '@/shaders/liquidGlass.frag'
import vert from '@/shaders/basic.vert'

export default function LiquidGlass({ className }: { className?: string }) {
  const mouse = useRef(new THREE.Vector2(0.5, 0.5))

  const setup = useCallback(({ canvas, renderer }: { canvas: HTMLCanvasElement; renderer: THREE.WebGLRenderer }) => {
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) },
      u_mouse: { value: mouse.current.clone() }
    }

    const material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false
    })

    const geom = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geom, material)
    scene.add(mesh)

    const clock = new THREE.Clock()
    const onResize = () => {
      uniforms.u_resolution.value.set(canvas.clientWidth, canvas.clientHeight)
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    }

    const onPointerMove = (e: PointerEvent) => {
      const w = Math.max(window.innerWidth, 1)
      const h = Math.max(window.innerHeight, 1)
      mouse.current.set(e.clientX / w, 1.0 - (e.clientY / h))
      uniforms.u_mouse.value.copy(mouse.current)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('resize', onResize)

    const animate = () => {
      uniforms.u_time.value += clock.getDelta()
      renderer.render(scene, camera)
    }
    const start = () => renderer.setAnimationLoop(animate)
    const stop = () => renderer.setAnimationLoop(null)
    start()

    return {
      dispose: () => {
        stop()
        window.removeEventListener('resize', onResize)
        window.removeEventListener('pointermove', onPointerMove)
        geom.dispose()
        material.dispose()
      },
      start,
      stop
    }
  }, [])

  const { canvasRef } = useWebGL(setup)

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className ?? "absolute inset-0 h-full w-full"}
    />
  )
}

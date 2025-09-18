"use client"
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useWebGL } from '@/hooks/useWebGL'

type Props = {
  className?: string
  rotateSpeed?: number // radians per second
}

export default function GlassSphere({ className, rotateSpeed = 0.25 }: Props) {
  const setup = useMemo(() => {
    return ({ canvas, renderer }: { canvas: HTMLCanvasElement; renderer: THREE.WebGLRenderer }) => {
      const scene = new THREE.Scene()
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05

      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
      camera.position.set(0, 0, 4)

      // Environment for realistic reflections/refractions
      const pmrem = new THREE.PMREMGenerator(renderer)
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
      const envMap = envRT.texture
      scene.environment = envMap

  // Lights (subtle, env does most work)
  const ambient = new THREE.AmbientLight(0xffffff, 0.28)
      scene.add(ambient)
  const key = new THREE.DirectionalLight(0xffffff, 0.9)
      key.position.set(3, 3, 4)
      scene.add(key)
  const rim = new THREE.DirectionalLight(0x88aaff, 0.45)
  rim.position.set(-3, -2, -2)
      scene.add(rim)

  // Moving point lights to create dynamic glare oscillation
  const glint1 = new THREE.PointLight(0xffffff, 0.6, 10)
  const glint2 = new THREE.PointLight(0xaaccff, 0.5, 10)
  scene.add(glint1)
  scene.add(glint2)

      // Sphere
      const geo = new THREE.SphereGeometry(1, 96, 96)
      const mat = new THREE.MeshPhysicalMaterial({
        transmission: 0.95,
        thickness: 0.5,
        ior: 1.45,
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.1,
        attenuationColor: new THREE.Color(0xffffff),
        attenuationDistance: 2.0,
        color: 0xffffff,
      })
      const mesh = new THREE.Mesh(geo, mat)
      scene.add(mesh)

      let stop = false
      let raf = 0
      let last = performance.now()
      let t = 0
      const render = (now: number) => {
        const dt = (now - last) / 1000
        last = now
        t += dt
        
        // Base rotation
        mesh.rotation.y += rotateSpeed * dt

        // Animate light positions/intensities for oscillating glare
        key.position.set(
          3 + Math.sin(t * 0.7) * 0.4,
          3 + Math.cos(t * 0.6) * 0.3,
          4 + Math.sin(t * 0.8) * 0.25
        )
        key.intensity = 0.9 + 0.25 * Math.sin(t * 1.1)

        rim.position.set(
          -3 + Math.sin(t * 0.5 + 1.3) * 0.35,
          -2 + Math.sin(t * 0.65 + 0.5) * 0.25,
          -2 + Math.cos(t * 0.55 + 0.8) * 0.2
        )
        rim.intensity = 0.45 + 0.2 * Math.sin(t * 0.9 + 0.6)

        const r1 = 1.6, r2 = 1.2
        glint1.position.set(Math.cos(t * 0.9) * r1, 0.4 + Math.sin(t * 0.7) * 0.6, Math.sin(t * 0.9) * r1)
        glint1.intensity = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.7))
        glint2.position.set(Math.cos(t * 1.2 + 1.1) * r2, -0.2 + Math.sin(t * 1.0 + 0.6) * 0.5, Math.sin(t * 1.2 + 1.1) * r2)
        glint2.intensity = 0.4 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.3 + 0.4))

        // Subtle environment map intensity oscillation for extra life
        mat.envMapIntensity = 1.1 + 0.12 * Math.sin(t * 0.6)
        renderer.render(scene, camera)
        if (!stop) raf = requestAnimationFrame(render)
      }

      const onResize = () => {
        const w = canvas.clientWidth || 1
        const h = canvas.clientHeight || 1
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      onResize()

      raf = requestAnimationFrame(render)

      return {
        dispose: () => {
          stop = true
          cancelAnimationFrame(raf)
          geo.dispose()
          mat.dispose()
          pmrem.dispose()
          envRT.dispose()
        },
        start: () => {
          if (stop) {
            stop = false
            last = performance.now()
            raf = requestAnimationFrame(render)
          }
        },
        stop: () => { stop = true; cancelAnimationFrame(raf) }
      }
    }
  }, [rotateSpeed])

  const { canvasRef } = useWebGL(setup)

  useEffect(() => {
    // No-op; hook handles lifecycle
  }, [])

  return (
    <div className={className} aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full block" />
    </div>
  )
}

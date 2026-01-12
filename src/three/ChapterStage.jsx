import { Canvas, useFrame } from '@react-three/fiber'
import { AdaptiveDpr, ContactShadows, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { WeaponModel } from './WeaponModel'
import { WeaponCallouts } from './WeaponCallouts'

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="w-[min(680px,92vw)] border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8">
            <div className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-[var(--amber)]">
              ASSET STREAM ERROR
            </div>
            <div className="mt-2 font-[var(--title)] text-[22px] text-white">Vehicle model failed to load</div>
            <div className="mt-3 font-[var(--mono)] text-[12px] leading-6 text-white/60">
              Verify the glb file exists at:
              <div className="mt-2 text-white/70">/public/models/ac_-_audi_r8_lms_2016_free.glb</div>
              <div className="text-white/70">/public/models/ac_-_mclaren_p1_free.glb</div>
              <div className="text-white/70">/public/models/free_ai_based_conceptcar_050_public_domain_cc0.glb</div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function lerpV3(out, a, b, t) {
  out.set(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t))
  return out
}

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const set = () => setIsMobile(mq.matches)
    set()
    mq.addEventListener?.('change', set)
    return () => mq.removeEventListener?.('change', set)
  }, [])

  return isMobile
}

function ChapterRig({ weapon, index, experienceRef, groupRef }) {
  const camPos = useMemo(() => new THREE.Vector3(), [])
  const lookAt = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera }) => {
    const exp = experienceRef?.current
    if (!exp) return

    const p = THREE.MathUtils.clamp(exp.chapterProgress[index] ?? 0, 0, 1)
    const t = smoothstep(p)

    lerpV3(camPos, weapon.camera.from, weapon.camera.to, t)
    lookAt.set(weapon.camera.lookAt[0], weapon.camera.lookAt[1], weapon.camera.lookAt[2])

    camera.position.lerp(camPos, 0.12)
    camera.lookAt(lookAt)

    const base = weapon.model.rotation
    const rotY = base[1] + p * Math.PI * 2
    if (groupRef.current) {
      groupRef.current.rotation.set(base[0], rotY, base[2] ?? 0)
    }
  })

  return null
}

export function ChapterStage({ weapon, index, experienceRef, isActive }) {
  const isMobile = useIsMobile()
  const groupRef = useRef()

  return (
    <div
      className="h-screen w-screen pointer-events-none absolute inset-0 z-0"
      
    >
      <Canvas
        className=""
        camera={{ position: weapon.camera.from, fov: 35, near: 0.1, far: 100 }}
        dpr={isMobile ? [1, 1.4] : [1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#05070c']} />
        <fog attach="fog" args={['#05070c', 8, 18]} />

        <AdaptiveDpr pixelated />

        <ambientLight intensity={0.35} />
        <directionalLight position={[3.2, 5.2, 2.5]} intensity={1.35} color={'#cfefff'} />
        <directionalLight position={[-4.2, 2.2, -2.5]} intensity={0.65} color={'#ffd9b0'} />

        <Suspense fallback={null}>
          <SceneErrorBoundary>
            <Environment preset="warehouse" />

            <WeaponModel
              url={weapon.modelUrl}
              groupRef={groupRef}
              position={weapon.model.position}
              rotation={weapon.model.rotation}
              scale={weapon.model.scale}
            />

            <ContactShadows
              position={[0, -1.1, 0]}
              opacity={0.35}
              scale={10}
              blur={2.2}
              far={3.5}
              resolution={isMobile ? 512 : 1024}
            />

            <ChapterRig weapon={weapon} index={index} experienceRef={experienceRef} groupRef={groupRef} />

            {isActive && <WeaponCallouts weapon={weapon} weaponRootRef={groupRef} visible />}

            {!isMobile && isActive && (
              <EffectComposer multisampling={0}>
                <Bloom intensity={0.55} luminanceThreshold={0.28} luminanceSmoothing={0.2} mipmapBlur />
                <Noise opacity={0.045} />
                <Vignette eskil={false} offset={0.2} darkness={0.75} />
              </EffectComposer>
            )}
          </SceneErrorBoundary>
        </Suspense>
      </Canvas>
    </div>
  )
}

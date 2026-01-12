import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, ContactShadows, Environment, Html } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { WEAPONS } from '../data/weapons'
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
        <Html fullscreen>
          <div className="pointer-events-none fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur">
            <div className="w-[min(680px,92vw)] border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8">
              <div className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-[var(--amber)]">
                ASSET STREAM ERROR
              </div>
              <div className="mt-2 font-[var(--title)] text-[22px] text-white">Weapon models failed to load</div>
              <div className="mt-3 font-[var(--mono)] text-[12px] leading-6 text-white/60">
                Verify the glTF files exist at:
                <div className="mt-2 text-white/70">/public/models/w1/scene.gltf</div>
                <div className="text-white/70">/public/models/w2/scene.gltf</div>
                <div className="text-white/70">/public/models/w3/scene.gltf</div>
              </div>
            </div>
          </div>
        </Html>
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

function applyOpacity(root, opacity) {
  if (!root) return
  const o = Math.max(0, Math.min(1, opacity))
  root.visible = o > 0.001
  root.traverse((obj) => {
    if (!obj.isMesh) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    mats.forEach((m) => {
      if (!m) return
      if (m.userData.__baseOpacity == null) m.userData.__baseOpacity = m.opacity ?? 1
      const base = m.userData.__baseOpacity
      m.transparent = true
      m.opacity = base * o
      m.depthWrite = o > 0.98
      m.needsUpdate = true
    })
  })
}

function StageSync({ experienceRef, weaponRefs, setCalloutWeaponIndex, setCalloutsVisible }) {
  const last = useRef({ idx: -1, visible: true, o: [NaN, NaN, NaN] })
  const warmedRef = useRef(false)

  useFrame(() => {
    if (!warmedRef.current && weaponRefs.every((r) => r.current)) {
      weaponRefs.forEach((r) => applyOpacity(r.current, 0.02))
      warmedRef.current = true
    }

    const exp = experienceRef?.current
    if (!exp) return

    const blend = exp.blend

    let opacities = [0, 0, 0]
    let active = exp.activeChapter ?? -1
    let calloutsVisible = true

    if (active < 0 || active > 2) {
      calloutsVisible = false
    }

    if (blend && blend.t != null) {
      const t = Math.max(0, Math.min(1, blend.t))
      opacities[blend.from] = 1 - t
      opacities[blend.to] = t
      active = blend.to
      calloutsVisible = false
    } else {
      if (active >= 0 && active <= 2) opacities[active] = 1
    }

    // Apply material opacities without React re-render.
    for (let i = 0; i < 3; i++) {
      const prev = last.current.o[i]
      const next = opacities[i]
      const root = weaponRefs[i]?.current
      if (!root) continue
      if (Number.isNaN(prev) || Math.abs(prev - next) > 0.01) {
        applyOpacity(root, next)
        last.current.o[i] = next
      }
    }

    if (active >= 0 && active <= 2 && last.current.idx !== active) {
      last.current.idx = active
      setCalloutWeaponIndex(active)
    }

    if (last.current.visible !== calloutsVisible) {
      last.current.visible = calloutsVisible
      setCalloutsVisible(calloutsVisible)
    }
  })

  return null
}

function ShaderWarmup({ weaponRefs }) {
  const { gl, scene, camera } = useThree()
  const doneRef = useRef(false)

  useFrame(() => {
    if (doneRef.current) return
    if (!weaponRefs.every((r) => r.current)) return
    gl.compile(scene, camera)
    doneRef.current = true
  })

  return null
}

function Rig({ experienceRef, weaponRefs, isMobile }) {
  const camPos = useMemo(() => new THREE.Vector3(), [])
  const lookAt = useMemo(() => new THREE.Vector3(), [])
  const rot = useMemo(() => new THREE.Euler(), [])

  useFrame(({ camera }) => {
    const exp = experienceRef?.current
    if (!exp) return

    const blend = exp.blend

    let from = exp.activeChapter ?? 0
    let to = from
    let t = 0

    if (blend && blend.t != null) {
      from = blend.from
      to = blend.to
      t = smoothstep(blend.t)
    }

    // Camera choreography
    if (blend && blend.t != null) {
      const fromCam = WEAPONS[from].camera.to
      const toCam = WEAPONS[to].camera.from
      lerpV3(camPos, fromCam, toCam, t)
      lerpV3(lookAt, WEAPONS[from].camera.lookAt, WEAPONS[to].camera.lookAt, t)
    } else {
      const p = exp.chapterProgress[from] ?? 0
      const weapon = WEAPONS[from]
      lerpV3(camPos, weapon.camera.from, weapon.camera.to, smoothstep(p))
      lookAt.set(weapon.camera.lookAt[0], weapon.camera.lookAt[1], weapon.camera.lookAt[2])
    }

    if (isMobile) camPos.z += 0.45

    camera.position.lerp(camPos, 0.12)
    camera.lookAt(lookAt)

    // Model choreography
    const LEFT_OFFSET_X = -0.46
    const UP_OFFSET_Y = 0.12

    // Keep all weapons aligned to the same left offset so switching feels consistent.
    weaponRefs.forEach((r) => {
      const g = r.current
      if (!g) return
      g.position.x = THREE.MathUtils.lerp(g.position.x, LEFT_OFFSET_X, 0.12)
      g.position.y = THREE.MathUtils.lerp(g.position.y, UP_OFFSET_Y, 0.12)
      g.position.z = THREE.MathUtils.lerp(g.position.z, 0, 0.12)
    })

    // Clean 360° self-rotation directly tied to scroll progress.
    // 0% -> 0°, 25% -> 90°, 50% -> 180°, 75% -> 270°, 100% -> 360°
    const progress = THREE.MathUtils.clamp(exp.chapterProgress[from] ?? 0, 0, 1)
    const base = WEAPONS[from].model.rotation
    rot.set(base[0], base[1] + progress * Math.PI * 2, base[2])

    const activeRoot = weaponRefs[from]?.current
    if (activeRoot && !(blend && blend.t != null)) {
      activeRoot.rotation.set(rot.x, rot.y, rot.z)
    }

    // Keep non-active weapons calm
    weaponRefs.forEach((r, idx) => {
      if (idx === from || idx === to) return
      const g = r.current
      if (!g) return
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, WEAPONS[idx].model.rotation[1], 0.08)
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, WEAPONS[idx].model.rotation[0], 0.08)
    })

    // During blend, keep rotations stable (avoids visual drift while fading).
    if (blend && blend.t != null) {
      const incoming = weaponRefs[to]?.current
      if (incoming) {
        const ibase = WEAPONS[to].model.rotation
        incoming.rotation.y = THREE.MathUtils.lerp(incoming.rotation.y, ibase[1], 0.12)
        incoming.rotation.x = THREE.MathUtils.lerp(incoming.rotation.x, ibase[0], 0.12)
        incoming.rotation.z = THREE.MathUtils.lerp(incoming.rotation.z, ibase[2] ?? 0, 0.12)
      }
    }
  })

  return null
}

export function WeaponStage({ experienceRef }) {
  const isMobile = useIsMobile()

  const w0 = useRef()
  const w1 = useRef()
  const w2 = useRef()
  const weaponRefs = useMemo(() => [w0, w1, w2], [])

  const [calloutWeaponIndex, setCalloutWeaponIndex] = useState(0)
  const [calloutsVisible, setCalloutsVisible] = useState(true)

  const calloutWeapon = WEAPONS[calloutWeaponIndex]
  const calloutRootRef = weaponRefs[calloutWeaponIndex]

  return (
    <Canvas
      camera={{ position: [0.55, 0.25, 4.6], fov: 35, near: 0.1, far: 100 }}
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
            url={WEAPONS[0].modelUrl}
            groupRef={w0}
            position={WEAPONS[0].model.position}
            rotation={WEAPONS[0].model.rotation}
            scale={WEAPONS[0].model.scale}
          />
          <WeaponModel
            url={WEAPONS[1].modelUrl}
            groupRef={w1}
            position={WEAPONS[1].model.position}
            rotation={WEAPONS[1].model.rotation}
            scale={WEAPONS[1].model.scale}
          />
          <WeaponModel
            url={WEAPONS[2].modelUrl}
            groupRef={w2}
            position={WEAPONS[2].model.position}
            rotation={WEAPONS[2].model.rotation}
            scale={WEAPONS[2].model.scale}
          />

          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.35}
            scale={10}
            blur={2.2}
            far={3.5}
            resolution={isMobile ? 512 : 1024}
          />

          <StageSync
            experienceRef={experienceRef}
            weaponRefs={weaponRefs}
            setCalloutWeaponIndex={setCalloutWeaponIndex}
            setCalloutsVisible={setCalloutsVisible}
          />
          <ShaderWarmup weaponRefs={weaponRefs} />
          <Rig experienceRef={experienceRef} weaponRefs={weaponRefs} isMobile={isMobile} />
          <WeaponCallouts weapon={calloutWeapon} weaponRootRef={calloutRootRef} visible={calloutsVisible} />

          {!isMobile && (
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.55} luminanceThreshold={0.28} luminanceSmoothing={0.2} mipmapBlur />
              <Noise opacity={0.045} />
              <Vignette eskil={false} offset={0.2} darkness={0.75} />
            </EffectComposer>
          )}
        </SceneErrorBoundary>
      </Suspense>
    </Canvas>
  )
}

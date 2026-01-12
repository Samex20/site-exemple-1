import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

export function WeaponModel({ url, groupRef, position, rotation, scale = 1 }) {
  // Enable Draco decoding (harmless for non-Draco assets, fixes Sketchfab exports when used).
  const gltf = useGLTF(url, true)

  const innerRef = useRef(null)
  const loggedRef = useRef(false)

  const cloned = useMemo(() => {
    // Clone so we can safely normalize transforms per instance.
    return gltf.scene.clone(true)
  }, [gltf.scene])

  useLayoutEffect(() => {
    const root = innerRef.current
    if (!root) return

    // Reset any previous normalization.
    root.position.set(0, 0, 0)
    root.rotation.set(0, 0, 0)
    root.scale.set(1, 1, 1)
    root.updateWorldMatrix(true, true)

    // Compute bounds like the working TS version: union per-mesh bounds using setFromObject.
    const box = new THREE.Box3()
    const temp = new THREE.Box3()
    let meshCount = 0

    root.updateWorldMatrix(true, true)
    root.traverse((obj) => {
      if (!obj?.isMesh) return
      meshCount += 1
      temp.setFromObject(obj)
      box.union(temp)
    })

    if (meshCount === 0 || box.isEmpty()) return

    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const targetSize = 2.2
    const s = targetSize / maxDim

    if (import.meta.env.DEV && !loggedRef.current) {
      loggedRef.current = true
      // eslint-disable-next-line no-console
      console.log('[WeaponModel] normalized', {
        url,
        scale: Number(s.toFixed(4)),
        size: [Number(size.x.toFixed(4)), Number(size.y.toFixed(4)), Number(size.z.toFixed(4))],
      })
    }

    // IMPORTANT: position must be scaled too (matrix order is T * R * S).
    root.scale.setScalar(s)
    root.position.set(-center.x * s, -center.y * s, -center.z * s)

    // Small rendering tweaks (like TS version) to avoid overly dark exports.
    root.traverse((child) => {
      if (!child?.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => {
        if (!m) return
        m.toneMapped = true
        if (m.map) {
          m.map.colorSpace = THREE.SRGBColorSpace
          m.map.needsUpdate = true
        }
        m.needsUpdate = true
      })
    })

    root.updateWorldMatrix(true, true)
  }, [cloned, url])

  return (
    <group position={position}>
      <group ref={groupRef} rotation={rotation} scale={scale}>
        <group ref={innerRef}>
          <primitive object={cloned} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/ak-47.glb', true)
useGLTF.preload('/models/aps_pistol.glb', true)
useGLTF.preload('/models/pp-19-01_vityaz.glb', true)

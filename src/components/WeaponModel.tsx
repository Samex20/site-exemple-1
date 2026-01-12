import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Box3, Vector3, Object3D, Mesh } from 'three';
import * as THREE from 'three';

interface WeaponModelProps {
  modelPath: string;
  scrollProgress: number;
  isActive: boolean;
}

function computeMeshBounds(root: Object3D) {
  const box = new Box3();
  const temp = new Box3();
  let hasMesh = false;

  root.updateWorldMatrix(true, true);

  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if ((mesh as any).isMesh) {
      hasMesh = true;
      temp.setFromObject(mesh);
      box.union(temp);
    }
  });

  return { box, hasMesh };
}

function normalizeRoot(root: Object3D, targetSize = 2.2) {
  const { box, hasMesh } = computeMeshBounds(root);
  if (!hasMesh) return;

  const size = new Vector3();
  box.getSize(size);

  const center = new Vector3();
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? targetSize / maxDim : 1;

  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      // un peu plus "premium" (évite certains modèles trop noirs)
      child.material = Array.isArray(child.material)
        ? child.material.map((m) => {
            m.toneMapped = true;
            return m;
          })
        : (() => {
            child.material.toneMapped = true;
            return child.material;
          })();
    }
  });
}

function Model({ modelPath, scrollProgress, isActive }: WeaponModelProps) {
  const gltf = useGLTF(modelPath);
  const groupRef = useRef<Group>(null);

  // Clone pour éviter de polluer le cache useGLTF (important)
  const root = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useLayoutEffect(() => {
    normalizeRoot(root, 2.2);
  }, [root, modelPath]);

  useEffect(() => {
    // reset propre quand on change d'arme
    if (!groupRef.current) return;
    groupRef.current.position.set(0, 0, 0);
    groupRef.current.rotation.set(0, 0, 0);
  }, [modelPath, isActive]);

  useFrame(() => {
    if (!groupRef.current || !isActive) return;

    // Rotation 360° strictement liée au scroll (0..1 -> 0..2π)
    const p = THREE.MathUtils.clamp(scrollProgress, 0, 1);
    const twoPi = Math.PI * 2;

    // Mapping exact demandé:
    // 0% -> 0°, 25% -> 90°, 50% -> 180°, 75% -> 270°, 100% -> 360°
    // Rotation pure sur elle-même (pas de tilt, pas de drift).
    groupRef.current.rotation.set(0, p * twoPi, 0);
    // Arme légèrement à gauche pour laisser respirer le dossier UI à droite
    groupRef.current.position.set(-0.35, 0, 0);
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={root} />
    </group>
  );
}

export default function WeaponModel(props: WeaponModelProps) {
  return (
    <Suspense fallback={null}>
      <Model {...props} />
    </Suspense>
  );
}

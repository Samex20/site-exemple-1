import { Canvas, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Preload } from '@react-three/drei';
import { Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import WeaponModel from './WeaponModel';
// Callouts disabled (markers were distracting / not readable)
import { weapons } from '../data/weapons';
import { useScrollStore } from '../store/scrollStore';

function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      // Caméra fixe: c'est l'arme qui tourne sur elle-même.
      // Légère variation de distance pour un feeling cinématique sans orbit.
      const p = THREE.MathUtils.clamp(scrollProgress, 0, 1);
      // Un peu plus proche => arme plus "premier plan"
      const baseZ = 3.25;
      camera.position.x = 0;
      camera.position.z = baseZ - p * 0.35;
      camera.position.y = 1.35;
      // LookAt légèrement à gauche (puisque le modèle est décalé à gauche)
      camera.lookAt(-0.35, 0.05, 0);
    }
  });

  return null;
}

export default function Scene3D() {
  const { currentWeapon, scrollProgress } = useScrollStore();

  return (
    <div className="fixed inset-0 z-20">
      <Canvas
        camera={{ position: [0, 1.35, 3.25], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        shadows
      >
        {/* fond noir forcé (dark mode garanti) */}
        <color attach="background" args={['#000000']} />

        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <hemisphereLight intensity={0.25} groundColor="#000000" />
          <directionalLight position={[10, 10, 6]} intensity={1.0} castShadow />
          <pointLight position={[-8, 6, -6]} intensity={0.35} color="#ffffff" />

          <Environment preset="warehouse" />

          {weapons.map((w, index) => {
            const isVisible = index === currentWeapon;

            return (
              <group key={w.name} visible={isVisible}>
                <WeaponModel modelPath={w.modelPath} scrollProgress={scrollProgress} isActive={isVisible} />
              </group>
            );
          })}

          <ContactShadows position={[0, -1, 0]} opacity={0.45} scale={4} blur={2.2} far={3} />

          {/* Force le préchargement de toutes les textures/meshes référencés */}
          <Preload all />

          <CameraController scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}

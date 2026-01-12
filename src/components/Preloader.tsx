import { useEffect } from 'react';
import { gsap } from 'gsap';
import { useGLTF, useProgress } from '@react-three/drei';
import { weapons } from '../data/weapons';

interface PreloaderProps {
  onComplete: () => void;
}

// Précharger les modèles
weapons.forEach((weapon) => {
  useGLTF.preload(weapon.modelPath);
});

export default function Preloader({ onComplete }: PreloaderProps) {
  const { progress, active } = useProgress();

  useEffect(() => {
    // `useProgress` passe souvent à 100% juste avant que `active` devienne false.
    // On attend les deux pour éviter d'enlever le loader trop tôt.
    if (progress >= 100 && !active) {
      const tween = gsap.delayedCall(0.25, () => {
        gsap.to('.preloader', {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete,
        });
      });

      return () => {
        tween.kill();
      };
    }
  }, [progress, active, onComplete]);

  return (
    <div className="preloader fixed inset-0 z-50 bg-deep-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-white/90 mb-2 tracking-wider">
            WEAPON SYSTEMS ARCHIVE
          </h1>
          <div className="text-xs text-white/40 tracking-widest uppercase font-mono">
            CLASSIFIED ACCESS
          </div>
        </div>
        <div className="w-64 h-px bg-white/10 mb-4 relative">
          <div
            className="h-full bg-white/70 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-white/50 text-xs font-mono">
          {progress.toFixed(0)}% | LOADING SYSTEMS...
        </div>
      </div>
    </div>
  );
}

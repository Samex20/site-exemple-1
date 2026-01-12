import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WeaponSpec } from '../types/weapon';
import { useScrollStore } from '../store/scrollStore';

gsap.registerPlugin(ScrollTrigger);

interface WeaponSectionProps {
  weapon: WeaponSpec;
  index: number;
  sectionRef?: (el: HTMLElement | null) => void;
}

export default function WeaponSection({ weapon, index, sectionRef }: WeaponSectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const storyRef = useRef<HTMLParagraphElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const sectionElementRef = useRef<HTMLElement>(null);
  const { setCurrentWeapon, setScrollProgress } = useScrollStore();

  useEffect(() => {
    if (sectionRef && sectionElementRef.current) sectionRef(sectionElementRef.current);
  }, [sectionRef]);

  useEffect(() => {
    const el = sectionElementRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Chapter pin + scrub => progress ultra smooth (via tween scrubbé)
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=250%',
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onEnter: () => setCurrentWeapon(index),
          onEnterBack: () => setCurrentWeapon(index),
        },
        onUpdate: () => setScrollProgress(proxy.p),
      });

      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 70%' },
        }
      );

      gsap.fromTo(
        storyRef.current,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 65%' },
        }
      );

      gsap.fromTo(
        (() => {
          const children = specsRef.current ? Array.from(specsRef.current.children) : [];
          return children;
        })(),
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 55%' },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [index, setCurrentWeapon, setScrollProgress]);

  return (
    <section
      ref={sectionElementRef}
      className="min-h-screen flex items-center px-6 md:px-10 py-24 relative"
    >
      {/* Dark-only, fond "graphite" subtil (jamais blanc) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-graphite/30 to-deep-black" />
        <div className="absolute inset-0 hud-grid opacity-20" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Zone réservée au modèle 3D (à gauche) */}
        <div className="hidden lg:block lg:col-span-7" />

        {/* Dossier (droite) - laisse l'arme au premier plan à gauche */}
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="mb-10">
            <div className="text-[10px] text-amber-copper/70 tracking-[0.35em] uppercase font-mono mb-3">
              classified weapon dossier
            </div>

            <h2
              ref={titleRef}
              className="text-5xl md:text-7xl font-title font-semibold text-white tracking-wider uppercase"
            >
              {weapon.name}
            </h2>

            <div className="mt-3 text-white/55 text-xs uppercase tracking-[0.35em] font-mono">
              {weapon.type}
            </div>
          </div>

          <p
            ref={storyRef}
            className="text-lg md:text-xl text-white/75 leading-relaxed max-w-3xl"
          >
            {weapon.story}
          </p>

          {/* Panels “tactiques” (plus de contenu => plus premium) */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5" ref={specsRef}>
            {weapon.specs.map((spec, specIndex) => (
              <div
                key={specIndex}
                className="bg-military-gray/35 border border-white/10 rounded-lg p-6 backdrop-blur-sm hover:border-white/20 transition-colors"
              >
                <div className="text-white/45 text-[11px] uppercase tracking-[0.28em] font-mono mb-2">
                  {spec.label}
                </div>
                <div className="text-white text-lg font-semibold">{spec.value}</div>
                <div className="mt-3 h-px bg-gradient-to-r from-cyber-cyan/30 via-white/5 to-transparent" />
              </div>
            ))}
          </div>

          {/* Callouts visibles en UI (au lieu d'être collés au modèle) */}
          <div className="mt-8 bg-deep-black/70 border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-mono uppercase tracking-[0.35em] text-white/50">
                callouts
              </div>
              <div className="text-[11px] font-mono uppercase tracking-[0.35em] text-cyber-cyan/70">
                deployed
              </div>
            </div>

            <div className="space-y-3">
              {weapon.callouts.map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyber-cyan/80" />
                  <div className="text-white/80 text-xs font-mono uppercase tracking-[0.22em]">
                    {c.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


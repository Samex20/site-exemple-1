import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../store/scrollStore';

gsap.registerPlugin(ScrollTrigger);

interface TransitionSectionProps {
  text: string;
  fromIndex: number;
  toIndex: number;
  sectionRef?: (el: HTMLElement | null) => void;
}

export default function TransitionSection({ text, fromIndex, toIndex, sectionRef }: TransitionSectionProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const wipeARef = useRef<HTMLDivElement>(null);
  const wipeBRef = useRef<HTMLDivElement>(null);
  const sectionElementRef = useRef<HTMLElement>(null);
  const { setCurrentWeapon, setScrollProgress } = useScrollStore();

  useEffect(() => {
    if (sectionRef && sectionElementRef.current) {
      sectionRef(sectionElementRef.current);
    }
  }, [sectionRef]);

  useEffect(() => {
    if (!sectionElementRef.current) return;

    const ctx = gsap.context(() => {
      // Transition scroll (1–2s feeling) : pin + scrub
      // - zoom diagonale (bas gauche -> haut droit)
      // - inversion
      // - switch d'arme au milieu pendant que l'overlay couvre
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionElementRef.current,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 1,
        },
      });

      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set([wipeARef.current, wipeBRef.current], { opacity: 0, scale: 0.6 });
      gsap.set(textRef.current, { opacity: 0, y: 8, filter: 'blur(6px)' });

      // Phase 1: apparition overlay + wipe A (bas-gauche -> haut-droit)
      tl.to(overlayRef.current, { opacity: 1, duration: 0.12 }, 0);
      tl.to(textRef.current, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.18 }, 0.05);

      tl.to(wipeARef.current, { opacity: 1, scale: 1.15, duration: 0.35 }, 0.05);
      tl.to(wipeARef.current, { xPercent: 65, yPercent: -65, duration: 0.35 }, 0.05);

      // Switch d'arme pendant que l'écran est couvert
      tl.call(
        () => {
          setCurrentWeapon(toIndex);
          setScrollProgress(0);
        },
        [],
        0.38
      );

      // Phase 2: wipe B (haut-droit -> bas-gauche)
      tl.to(wipeBRef.current, { opacity: 1, scale: 1.15, duration: 0.35 }, 0.40);
      tl.to(wipeBRef.current, { xPercent: -65, yPercent: 65, duration: 0.35 }, 0.40);

      // Outro: nettoyage overlay
      tl.to([wipeARef.current, wipeBRef.current], { opacity: 0, duration: 0.12 }, 0.80);
      tl.to(textRef.current, { opacity: 0, filter: 'blur(10px)', duration: 0.12 }, 0.82);
      tl.to(overlayRef.current, { opacity: 0, duration: 0.15 }, 0.85);

      // Assure l'arme source si on remonte
      ScrollTrigger.create({
        trigger: sectionElementRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onEnterBack: () => {
          setCurrentWeapon(fromIndex);
          setScrollProgress(1);
        },
      });
    }, sectionElementRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionElementRef}
      className="min-h-[70vh] flex items-center justify-center relative overflow-hidden"
    >
      {/* Overlay transition au-dessus de tout */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60] pointer-events-none"
      >
        {/* voile sombre + blur */}
        <div className="absolute inset-0 bg-deep-black/75 backdrop-blur-md" />

        {/* wipe bas-gauche -> haut-droit */}
        <div
          ref={wipeARef}
          className="absolute left-[-40vw] bottom-[-40vh] w-[160vw] h-[160vh] rotate-[-20deg]"
          style={{
            background:
              'linear-gradient(90deg, rgba(74,144,164,0) 0%, rgba(74,144,164,0.55) 48%, rgba(255,147,79,0.25) 52%, rgba(74,144,164,0) 100%)',
          }}
        />

        {/* wipe haut-droit -> bas-gauche */}
        <div
          ref={wipeBRef}
          className="absolute right-[-40vw] top-[-40vh] w-[160vw] h-[160vh] rotate-[-20deg]"
          style={{
            background:
              'linear-gradient(90deg, rgba(74,144,164,0) 0%, rgba(255,147,79,0.22) 45%, rgba(74,144,164,0.6) 52%, rgba(74,144,164,0) 100%)',
          }}
        />

        <div className="absolute inset-0 hud-grid opacity-20" />

        <div ref={textRef} className="absolute left-6 md:left-10 bottom-10">
          <div className="text-[11px] font-mono uppercase tracking-[0.35em] text-white/45 mb-3">
            transition
          </div>
          <div className="text-3xl md:text-5xl font-mono font-bold text-white/80 tracking-wider uppercase">
            {text}
          </div>
        </div>
      </div>

      {/* contenu minimal (sert de trigger/pin) */}
      <div className="text-center z-10 opacity-0 select-none">{text}</div>
    </section>
  );
}


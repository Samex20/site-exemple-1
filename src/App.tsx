import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Preloader from './components/Preloader';
import Scene3D from './components/Scene3D';
import HUD from './components/HUD';
import WeaponSection from './components/WeaponSection';
import TransitionSection from './components/TransitionSection';
import { weapons } from './data/weapons';
import { useScrollStore } from './store/scrollStore';

gsap.registerPlugin(ScrollTrigger);

function IntroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power3.out',
          delay: 0.5,
        }
      );

      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 1.5,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col items-center justify-center relative"
    >
      <div className="text-center z-20 relative">
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-amber-copper font-mono uppercase tracking-widest mb-4 opacity-70">
            CLASSIFIED
          </div>
        </div>
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl font-mono font-bold text-white mb-8 tracking-wider uppercase"
        >
          WEAPON SYSTEMS
          <br />
          ARCHIVE
        </h1>
        <div
          ref={ctaRef}
          className="mt-12"
        >
          <div className="text-white/40 text-sm mb-4 font-mono uppercase tracking-wider">Scroll to inspect</div>
          <div className="w-px h-8 bg-white/30 mx-auto" />
        </div>
      </div>
      <div className="absolute inset-0 hud-grid opacity-30" />
    </section>
  );
}

function AgencyProof() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col items-center justify-center px-8 py-32"
    >
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-5xl md:text-7xl font-title font-bold text-cyber-cyan mb-12">
          Built with Precision
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-deep-black/60 border border-cyber-cyan/30 rounded-lg p-8 backdrop-blur-sm">
            <div className="text-amber-copper text-sm uppercase tracking-wider font-mono mb-4">
              Technology
            </div>
            <div className="text-white text-lg">
              WebGL / Three.js / GSAP
            </div>
          </div>
          <div className="bg-deep-black/60 border border-cyber-cyan/30 rounded-lg p-8 backdrop-blur-sm">
            <div className="text-amber-copper text-sm uppercase tracking-wider font-mono mb-4">
              Design
            </div>
            <div className="text-white text-lg">
              Awwwards-grade Motion Design
            </div>
          </div>
          <div className="bg-deep-black/60 border border-cyber-cyan/30 rounded-lg p-8 backdrop-blur-sm">
            <div className="text-amber-copper text-sm uppercase tracking-wider font-mono mb-4">
              Performance
            </div>
            <div className="text-white text-lg">
              60 fps target
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col items-center justify-center px-8 py-32"
    >
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-6xl font-mono font-bold text-white mb-8 uppercase tracking-wider">
          Want a site that wins awards?
        </h2>
        <div className="text-white/60 text-lg font-mono mb-12 uppercase tracking-wider">
          Contact Holink Innovation
        </div>
        <a
          href="mailto:contact@holink.innovation"
          className="inline-block px-8 py-3 bg-military-gray border border-white/20 rounded text-white font-mono text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
        >
          Get in Touch
        </a>
      </div>
    </section>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { currentWeapon } = useScrollStore();

  useEffect(() => {
    // Initialiser Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical' as const,
      gestureOrientation: 'vertical' as const,
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Connecter Lenis à GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
      <div className={`app ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000`}>
        <Scene3D />
        <HUD weaponIndex={currentWeapon} />
        
        <main className="relative z-30">
          <IntroSection />
          
          {weapons.map((weapon, index) => (
            <div key={weapon.name}>
              <WeaponSection
                weapon={weapon}
                index={index}
              />
              {index < weapons.length - 1 && (
                <TransitionSection
                  text={index === 0 ? 'SYSTEM SYNCING' : 'ENERGY OVERLOAD'}
                  fromIndex={index}
                  toIndex={index + 1}
                />
              )}
            </div>
          ))}

          <AgencyProof />
          <CTASection />
        </main>
      </div>
    </>
  );
}


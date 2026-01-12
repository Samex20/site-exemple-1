import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { WEAPONS } from './data/weapons'
import { useLenis } from './lib/useLenis'
import { useScrollStory } from './lib/useScrollStory'
import { Preloader } from './ui/Preloader'
import { HUDOverlay } from './ui/HUDOverlay'
import { TransitionOverlay } from './ui/TransitionOverlay'
import { ChapterStage } from './three/ChapterStage'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const experienceRef = useRef({
    chapterProgress: [0, 0, 0],
    activeChapter: 0,
    blend: null, // { from: number, to: number, t: number }
    transitionPulse: 0,
  })

  const [uiActiveIndex, setUiActiveIndex] = useState(0)
  const [uiBlend, setUiBlend] = useState(null)

  const weaponForHUD = useMemo(() => {
    if (uiBlend?.t != null && uiBlend.t > 0.02 && uiBlend.t < 0.98) return WEAPONS[uiBlend.to]
    return WEAPONS[uiActiveIndex]
  }, [uiActiveIndex, uiBlend])

  useLenis()

  useScrollStory({
    experienceRef,
    onChapterChange: (idx) => setUiActiveIndex(idx),
    onBlendChange: (blend) => setUiBlend(blend),
  })

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [])

  return (
    <div className="relative min-h-screen">
      <HUDOverlay weapon={weaponForHUD} blend={uiBlend} />
      <TransitionOverlay blend={uiBlend} />
      <Preloader />

      <main className="relative z-10">
        <section id="entry" className="relative h-screen overflow-hidden ">
          <div className="pointer-events-none absolute inset-0 hud-grid" />
          <div className="pointer-events-none absolute inset-0 hud-scanlines" />

          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-6">
            <div className="mb-5 inline-flex w-fit items-center gap-3 border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
              <span className="classified-stamp px-3 py-1 font-[var(--mono)] text-[11px] uppercase tracking-[0.24em]">
                HOMOLOGATION
              </span>
              <span className="text-xs uppercase tracking-[0.28em] text-white/55">
                Showroom link established
              </span>
            </div>

            <h1
              data-reveal
              data-scramble
              className="glitch-flicker secret-text font-[var(--title)] text-[44px] font-medium tracking-[-0.02em] text-white md:text-[70px]"
            >
              PERFORMANCE CAR ARCHIVE
            </h1>
            <p data-reveal data-scramble className="mt-4 max-w-xl font-[var(--mono)] text-[13px] leading-6 text-white/60">
              Accessing curated vehicle dossier. Three assets queued. Scroll to lock chapters and spin live model telemetry.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <a
                href="#chapter-0"
                className="group inline-flex items-center gap-3 border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 font-[var(--mono)] text-[12px] uppercase tracking-[0.26em] text-cyan-100 backdrop-blur transition hover:bg-cyan-300/15"
              >
                <span className="h-[7px] w-[7px] rounded-full bg-[var(--cyan)] shadow-[0_0_18px_rgba(127,232,255,0.55)]" />
                SCROLL TO EXPLORE
              </a>
              <span className="text-xs uppercase tracking-[0.26em] text-white/45">Pinned chapters - 60fps target</span>
            </div>
          </div>
        </section>

        <section id="chapter-0" className="chapter relative h-screen w-screen">
          <ChapterStage weapon={WEAPONS[0]} index={0} experienceRef={experienceRef} isActive={uiActiveIndex === 0} />
          <ChapterPanel weapon={WEAPONS[0]} indexLabel="01" />
        </section>

        <section id="chapter-1" className="chapter relative h-screen">
          <ChapterStage weapon={WEAPONS[1]} index={1} experienceRef={experienceRef} isActive={uiActiveIndex === 1} />
          <ChapterPanel weapon={WEAPONS[1]} indexLabel="02" />
        </section>

        <section id="chapter-2" className="chapter relative h-screen">
          <ChapterStage weapon={WEAPONS[2]} index={2} experienceRef={experienceRef} isActive={uiActiveIndex === 2} />
          <ChapterPanel weapon={WEAPONS[2]} indexLabel="03" />
        </section>

        <section id="proof" className="relative border-t border-white/10 bg-black/20 py-24 h-screen">
          <div className="mx-auto max-w-6xl px-6">
            <div className="font-[var(--mono)] text-[12px] uppercase tracking-[0.26em] text-white/60">
              Studio proof
            </div>
            <div className="mt-4 font-[var(--title)] text-[34px] text-white md:text-[48px]">
              Built for premium automotive storytelling.
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {["Built with WebGL / Three.js / GSAP", "Cinematic motion design", "Performance: 60 fps target"].map(
                (t) => (
                  <div key={t} className="border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <div className="font-[var(--mono)] text-[12px] uppercase tracking-[0.26em] text-white/80">{t}</div>
                    <div className="mt-3 text-sm leading-6 text-white/55">
                      Cinematic pinning, technical callouts anchored to 3D, and a performance showroom UI.
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="border border-white/10 bg-white/5 p-8 backdrop-blur md:p-12 mt-24">
              <div className="font-[var(--mono)] text-[12px] uppercase tracking-[0.26em] text-white/60">
                NEXT BUILD
              </div>
              <div className="mt-4 font-[var(--title)] text-[34px] text-white md:text-[52px]">
                Want a site that sells performance?
              </div>
              <div className="mt-3 font-[var(--mono)] text-[13px] leading-6 text-white/60">
                Contact Holink Studio - cinematic WebGL, scroll choreography, premium UI.
              </div>
            </div>
          </div>
        </section>

       
      </main>
    </div>
  )
}

function ChapterPanel({ weapon, indexLabel }) {
  return (
    <div className="relative z-10 h-full">
      <div className="pointer-events-none absolute inset-0 hud-scanlines" />
      <div className="pointer-events-none absolute inset-0 opacity-35 hud-grid" />

      <div className="mx-auto grid h-full max-w-6xl items-end gap-8 px-6 pb-16 md:grid-cols-12 md:pb-20">
        <div className="md:col-span-7">
          <div data-reveal data-scramble className="font-[var(--mono)] text-[12px] uppercase tracking-[0.28em] text-white/55">
            Chapter {indexLabel}
          </div>
          <div
            data-reveal
            data-scramble
            className="secret-text mt-3 font-[var(--title)] text-[40px] leading-[0.95] text-white md:text-[64px]"
          >
            {weapon.name}
          </div>
          <div
            data-reveal
            data-scramble
            className="mt-4 max-w-xl font-[var(--mono)] text-[13px] leading-6 text-white/60"
          >
            {weapon.story}
          </div>
        </div>

        <div className="md:col-span-5">
          <div data-reveal className="border border-white/10 bg-black/20 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  data-scramble
                  className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/55"
                >
                  TYPE
                </div>
                <div data-scramble className="mt-2 max-w-[200px] truncate text-sm text-white/85">
                  {weapon.type}
                </div>
              </div>
              <div className="text-right">
                <div
                  data-scramble
                  className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/55"
                >
                  SERIAL
                </div>
                <div
                  data-scramble
                  className="mt-2 max-w-[200px] truncate font-[var(--mono)] text-[12px] tracking-[0.22em] text-white/80"
                >
                  {weapon.serial}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {weapon.specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/55">{s.label}</div>
                  <div className="text-sm text-white/80">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal className="mt-4 border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/55">PERFORMANCE PANELS</div>
            <div className="mt-3 space-y-2 text-sm leading-6 text-white/60">
              {weapon.panels.map((p) => (
                <div key={p} className="flex items-center justify-between">
                  <span className="text-white/70">{p}</span>
                  <span className="font-[var(--mono)] text-[11px] uppercase tracking-[0.22em] text-white/45">ACTIVE</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

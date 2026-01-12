import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'

export function Preloader() {
  const { active, progress, item } = useProgress()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!active && progress >= 100) {
      window.dispatchEvent(new Event('assets-ready'))
      const t = setTimeout(() => setVisible(false), 900)
      return () => clearTimeout(t)
    }
  }, [active, progress])

  useEffect(() => {
    const lock = active || progress < 100
    const html = document.documentElement
    const body = document.body
    if (lock) {
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
    } else {
      html.style.overflow = ''
      body.style.overflow = ''
    }
    return () => {
      html.style.overflow = ''
      body.style.overflow = ''
    }
  }, [active, progress])

  useEffect(() => {
    const el = document.querySelector('[data-preloader]')
    if (!el) return
    gsap.to(el, {
      autoAlpha: active || progress < 100 ? 1 : 0,
      duration: 0.6,
      ease: 'power2.out',
    })
  }, [active, progress])

  if (!visible) return null

  const pct = Math.min(100, Math.max(0, Math.round(progress)))
  const isBlocking = active || progress < 100

  return (
    <div
      data-preloader
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black ${
        isBlocking ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div className="relative w-[min(520px,90vw)] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="absolute inset-0 loader-grid opacity-35" />
        <div className="absolute inset-0 loader-scan opacity-25" />
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full loader-orb" />
        <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full loader-orb-amber" />
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/55">
              Loading assets
            </div>
            <div className="mt-2 font-[var(--title)] text-[22px] text-white">Initializing inspection terminal</div>
            <div className="mt-2 font-[var(--mono)] text-[12px] text-white/55">
              {item ? `Streaming: ${item}` : 'Streaming: weapon scenes'}
            </div>
          </div>
          <div className="text-right">
            <div className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/55">Progress</div>
            <div className="mt-2 font-[var(--mono)] text-[22px] tracking-[0.14em] text-white/85">{pct}%</div>
          </div>
        </div>

        <div className="mt-5 h-[2px] w-full bg-white/10">
          <div
            className="h-full loader-bar"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.26em] text-white/40">
          <span className="font-[var(--mono)]">SECURE CHANNEL</span>
          <span className="font-[var(--mono)]">DECRYPT {pct}%</span>
        </div>
      </div>
    </div>
  )
}

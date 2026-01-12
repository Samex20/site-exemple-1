import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export function TransitionOverlay({ blend }) {
  const ref = useRef(null)
  const tweenRef = useRef(null)
  const [internalT, setInternalT] = useState(0)
  const [activeBlend, setActiveBlend] = useState(null)

  // When blend becomes non-null, start internal animation
  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (blend && !activeBlend) {
      // Starting a new transition
      setActiveBlend(blend)
      setInternalT(0)

      // Kill previous
      if (tweenRef.current) tweenRef.current.kill()

      // Fade in
      gsap.to(el, {
        autoAlpha: 1,
        duration: 0.45,
        ease: 'power2.out',
      })

      // Animate t from 0 to 1 internally
      const proxy = { t: 0 }
      tweenRef.current = gsap.to(proxy, {
        t: 1,
        duration: 2.6,
        ease: 'power2.inOut',
        onUpdate: () => {
          setInternalT(proxy.t)
        },
        onComplete: () => {
          // Fade out
          gsap.to(el, {
            autoAlpha: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              setActiveBlend(null)
              setInternalT(0)
            },
          })
        },
      })
    }

    return () => {
      // Don't kill on every render, only on unmount
    }
  }, [blend?.from, blend?.to])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tweenRef.current) tweenRef.current.kill()
    }
  }, [])

  const displayBlend = activeBlend || blend
  const t = internalT

  const title =
    displayBlend?.from === 0
      ? 'STUDIO SYNC'
      : displayBlend?.from === 1
        ? 'THERMAL CHECK'
        : 'VIEW REFRESH'

  const subtitle =
    displayBlend?.from === 0
      ? 'Loading vehicle telemetry. Rebuilding overlay mesh.'
      : displayBlend?.from === 1
        ? 'Cooling cycle required. Stabilizing interface.'
        : 'Model stream switching.'

  const body =
    displayBlend?.from === 0
      ? 'Lighting pass reconfigured. Paint reflections re-mapped. Model stream switching.'
      : displayBlend?.from === 1
        ? 'Battery heat detected. HUD recalibration in progress. Switching to endurance profile.'
        : 'Refreshing overlay primitives.'

    const wipe = getWipe(t)
    const wipeTone = displayBlend?.from === 1 ? 'rgba(207,162,103,0.95)' : 'rgba(127,232,255,0.95)'
    const wipeFill = 'rgba(0,0,0,0.90)'

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-40 opacity-0">
      {/* Full-screen cover */}
      <div className="absolute inset-0" style={{ background: wipeFill, opacity: 1 }} />

      {/* Diagonal wipe from bottom-left -> top-right */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: wipe.clipPath,
          background: wipeFill,
          opacity: wipe.coverOpacity,
        }}
      />
      <div
        className="absolute inset-0 hud-scanlines"
        style={{ clipPath: wipe.clipPath, opacity: wipe.coverOpacity * 0.32 }}
      />
      <div className="absolute inset-0 hud-grid" style={{ clipPath: wipe.clipPath, opacity: wipe.coverOpacity * 0.28 }} />

      {/* Wipe edge glow */}
      <svg className="absolute inset-0 h-full w-full" style={{ opacity: wipe.edgeOpacity }}>
        <line
          x1={`${wipe.edge.x1}%`}
          y1={`${wipe.edge.y1}%`}
          x2={`${wipe.edge.x2}%`}
          y2={`${wipe.edge.y2}%`}
          stroke={wipeTone}
          strokeWidth="2"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 14px ${wipeTone})` }}
        />
      </svg>

     
    </div>
  )
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v))
}

function getWipe(t) {
  const tt = clamp(t, 0, 1)
  // Ligne de transition: x - y = k, allant de -100 (bas gauche) à 100 (haut droit)
  // Quand t=0, k=-100 (tout est couvert sauf le coin bas gauche)
  // Quand t=1, k=100 (tout est révélé)
  const k = -100 + 200 * tt

  // Zone couverte: region x - y <= k (au-dessus de la ligne)
  let clipPath

  if (k <= -100) {
    // Tout est couvert
    clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
  } else if (k < 0) {
    // La ligne coupe les bords gauche et bas
    // À x=0: y = -k
    // À y=100: x = k + 100
    const yAtX0 = -k
    const xAtY100 = k + 100
    clipPath = `polygon(0% 0%, 100% 0%, 100% 100%, ${xAtY100.toFixed(3)}% 100%, 0% ${yAtX0.toFixed(3)}%)`
  } else if (k < 100) {
    // La ligne coupe les bords haut et droit
    // À x=100: y = 100 - k
    // À y=0: x = k
    const yAtX100 = 100 - k
    const xAtY0 = k
    clipPath = `polygon(0% 0%, ${xAtY0.toFixed(3)}% 0%, 100% ${yAtX100.toFixed(3)}%, 100% 100%, 0% 100%)`
  } else {
    // Rien n'est couvert
    clipPath = 'polygon(0% 0%, 0% 0%, 0% 0%)'
  }

  // Edge endpoints le long de la ligne x - y = k
  let edge
  if (k <= -100) {
    edge = { x1: 0, y1: 0, x2: 0, y2: 0 }
  } else if (k < 0) {
    const yAtX0 = -k
    const xAtY100 = k + 100
    edge = { x1: 0, y1: yAtX0, x2: xAtY100, y2: 100 }
  } else if (k < 100) {
    const yAtX100 = 100 - k
    const xAtY0 = k
    edge = { x1: xAtY0, y1: 0, x2: 100, y2: yAtX100 }
  } else {
    edge = { x1: 100, y1: 0, x2: 100, y2: 0 }
  }

  const coverOpacity = 1
  const edgeOpacity = Math.max(0, 1 - Math.abs(tt - 0.5) * 2.0)

  return {
    clipPath,
    edge,
    coverOpacity,
    edgeOpacity,
  }
}

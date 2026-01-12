import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v))
}

export function WeaponCallouts({ weapon, weaponRootRef, visible }) {
  const { camera, size } = useThree()
  const containerRef = useRef(null)
  const labelRefs = useRef([])
  const titleRefs = useRef([])
  const descRefs = useRef([])
  const lineRefs = useRef([])
  const dotRefs = useRef([])

  const temp = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (!weapon || !visible) return

    const tl = gsap.timeline()

    labelRefs.current.forEach((el) => {
      if (!el) return
      gsap.set(el, { autoAlpha: 0, y: 10, '--reveal': '0%' })
    })

    lineRefs.current.forEach((line) => {
      if (!line) return
      gsap.set(line, { strokeDashoffset: 160 })
    })

    weapon.callouts.forEach((c, i) => {
      const label = labelRefs.current[i]
      const titleEl = titleRefs.current[i]
      const descEl = descRefs.current[i]
      const line = lineRefs.current[i]

      if (!label || !titleEl || !descEl || !line) return

      tl.to(
        label,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
        },
        i === 0 ? 0.15 : '>-0.05',
      )
        .to(
          label,
          {
            '--reveal': '100%',
            duration: 0.6,
            ease: 'power2.out',
          },
          '<',
        )
        .to(
          line,
          {
            strokeDashoffset: 0,
            duration: 0.65,
            ease: 'power2.out',
          },
          '<0.05',
        )

      tl.add(() => {
        const full = c.title
        const obj = { n: 0 }
        titleEl.textContent = ''
        gsap.to(obj, {
          n: full.length,
          duration: 0.75,
          ease: 'none',
          onUpdate: () => {
            titleEl.textContent = full.slice(0, Math.round(obj.n))
          },
        })
        descEl.textContent = c.desc
      }, '<0.05')
    })

    return () => {
      tl.kill()
    }
  }, [weapon, visible])

  useFrame(() => {
    if (!weapon || !visible) return
    const root = weaponRootRef?.current
    if (!root) return

    const w = size.width
    const h = size.height

    weapon.callouts.forEach((c, i) => {
      const label = labelRefs.current[i]
      const line = lineRefs.current[i]
      const dot = dotRefs.current[i]
      if (!label || !line || !dot) return

      temp.set(c.anchor[0], c.anchor[1], c.anchor[2])
      root.localToWorld(temp)
      temp.project(camera)

      const sx = (temp.x * 0.5 + 0.5) * w
      const sy = (-temp.y * 0.5 + 0.5) * h

      const lx = clamp(sx + c.offset[0], 18, w - 18)
      const ly = clamp(sy + c.offset[1], 18, h - 18)

      label.style.transform = `translate3d(${lx}px, ${ly}px, 0)`
      dot.style.transform = `translate3d(${sx}px, ${sy}px, 0)`

      // Line from label -> anchor so the arrowhead points at the model.
      line.setAttribute('x1', `${lx.toFixed(2)}`)
      line.setAttribute('y1', `${ly.toFixed(2)}`)
      line.setAttribute('x2', `${sx.toFixed(2)}`)
      line.setAttribute('y2', `${sy.toFixed(2)}`)
    })
  })

  if (!weapon) return null

  const lineStroke = weapon.tone === 'amber' ? 'rgba(207,162,103,0.52)' : 'rgba(127,232,255,0.55)'
  const dotGlow = weapon.tone === 'amber' ? '0 0 22px rgba(207,162,103,0.20)' : '0 0 22px rgba(127,232,255,0.22)'
  const toneGlow = weapon.tone === 'amber' ? 'rgba(207,162,103,0.24)' : 'rgba(127,232,255,0.26)'

  return (
    <Html fullscreen zIndexRange={[20, 40]}>
      <div
        ref={containerRef}
        className="pointer-events-none fixed inset-0"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 240ms ease' }}
      >
        <svg className="absolute inset-0 h-full w-full" style={{ overflow: 'visible' }}>
          <defs>
            <marker
              id="calloutArrow"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={lineStroke} />
            </marker>
          </defs>
          {weapon.callouts.map((_, i) => (
            <line
              key={i}
              ref={(el) => (lineRefs.current[i] = el)}
              x1={0}
              y1={0}
              x2={0}
              y2={0}
              stroke={lineStroke}
              strokeWidth="1"
              strokeDasharray="160"
              strokeDashoffset="160"
              markerEnd="url(#calloutArrow)"
            />
          ))}
        </svg>

        {weapon.callouts.map((c, i) => (
          <div key={c.title}>
            <div
              ref={(el) => (dotRefs.current[i] = el)}
              className="absolute left-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/40"
              style={{ boxShadow: dotGlow }}
            />
            <div
              ref={(el) => (labelRefs.current[i] = el)}
              className="reveal-mask absolute left-0 top-0 w-[min(320px,72vw)] border border-white/10 bg-black/45 p-4 backdrop-blur"
              style={{
                '--reveal': '0%',
                '--toneGlow': toneGlow,
              }}
            >
              <div className="pointer-events-auto">
                <div
                  className="callout-card group cursor-default"
                  style={{
                    boxShadow: `0 0 0 1px ${
                      weapon.tone === 'amber' ? 'rgba(207,162,103,0.12)' : 'rgba(127,232,255,0.10)'
                    } inset`,
                  }}
                >
                  <div className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/55">
                    CALLOUT {String(i + 1).padStart(2, '0')}
                  </div>
                  <div
                    ref={(el) => (titleRefs.current[i] = el)}
                    className="mt-2 font-[var(--mono)] text-[12px] uppercase tracking-[0.22em] text-white/90"
                  />
                  <div
                    ref={(el) => (descRefs.current[i] = el)}
                    className="mt-2 text-sm leading-6 text-white/55"
                  />
                  <div className="mt-3 h-[1px] w-full bg-white/10" />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-white/45">
                    <span className="font-[var(--mono)] uppercase tracking-[0.22em]">ANCHOR LOCK</span>
                    <span className="font-[var(--mono)] uppercase tracking-[0.22em] text-[var(--cyan)]">OK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Html>
  )
}

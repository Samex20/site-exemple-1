import { useMemo } from 'react'

function Chip({ tone = 'cyan', children }) {
  const styles =
    tone === 'amber'
      ? 'border-[rgba(207,162,103,0.22)] bg-[rgba(207,162,103,0.10)] text-[rgba(255,226,186,0.86)]'
      : 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1 font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] backdrop-blur ${styles}`}
    >
      <span
        className={`h-[6px] w-[6px] rounded-full ${
          tone === 'amber' ? 'bg-[var(--amber)]' : 'bg-[var(--cyan)]'
        }`}
        style={{ boxShadow: tone === 'amber' ? '0 0 14px rgba(207,162,103,0.40)' : '0 0 16px rgba(127,232,255,0.55)' }}
      />
      {children}
    </span>
  )
}

export function HUDOverlay({ weapon, blend }) {
  const statusTone = useMemo(() => {
    if (blend?.t != null && blend.t > 0.02 && blend.t < 0.98) return 'amber'
    return 'cyan'
  }, [blend])

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <div className="absolute inset-0 hud-scanlines" />

      {/* Corner markers */}
      <div className="absolute left-6 top-6 h-6 w-6 border-l border-t border-white/20" />
      <div className="absolute right-6 top-6 h-6 w-6 border-r border-t border-white/20" />
      <div className="absolute bottom-6 left-6 h-6 w-6 border-b border-l border-white/20" />
      <div className="absolute bottom-6 right-6 h-6 w-6 border-b border-r border-white/20" />

      {/* Crosshair */}
      <div className="absolute left-1/2 top-1/2 h-[2px] w-[82px] -translate-x-1/2 bg-white/10" />
      <div className="absolute left-1/2 top-1/2 h-[82px] w-[2px] -translate-y-1/2 bg-white/10" />
      <div className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-start justify-between px-6 pt-6">
        <div className="max-w-[520px]">
          <div className="font-[var(--mono)] text-[11px] uppercase tracking-[0.28em] text-white/55">
            WEAPON SYSTEMS ARCHIVE
          </div>
          <div className="mt-2 flex items-end gap-4">
            <div className="max-w-[280px] truncate font-[var(--title)] text-[18px] text-white/90">
              {weapon?.name ?? '—'}
            </div>
            <div className="max-w-[220px] truncate font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/45">
              {weapon?.serial ?? 'NO SERIAL'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Chip tone={statusTone}>ARMED</Chip>
          <Chip tone={statusTone}>READY</Chip>
          <Chip tone={statusTone}>ONLINE</Chip>
        </div>
      </div>

      {/* Bottom-left telemetry */}
      <div className="absolute bottom-0 left-0 p-6">
        <div className="border border-white/10 bg-black/20 p-4 backdrop-blur">
          <div className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/55">Telemetry</div>
          <div className="mt-3 grid gap-2 text-[12px] text-white/60">
            <Row k="COORD" v="N 51.5074 / W 0.1278" />
            <Row k="GRID" v="SYNCED" />
            <Row k="HUD" v="LOCKED" />
          </div>
        </div>
      </div>

      {/* Bottom-right hint */}
      <div className="absolute bottom-0 right-0 p-6">
        <div className="border border-white/10 bg-white/5 px-4 py-3 font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/55 backdrop-blur">
          Scroll to inspect • Hover callouts
        </div>
      </div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-8 border-t border-white/10 pt-2">
      <div className="font-[var(--mono)] text-[11px] uppercase tracking-[0.26em] text-white/45">{k}</div>
      <div className="text-white/70">{v}</div>
    </div>
  )
}

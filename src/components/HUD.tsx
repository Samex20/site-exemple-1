import { weapons } from '../data/weapons';

interface HUDProps {
  weaponIndex: number;
}

export default function HUD({ weaponIndex }: HUDProps) {
  const weapon = weapons[weaponIndex];
  if (!weapon) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 hud-grid">
      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 border-b border-white/10 bg-deep-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-3 flex justify-between items-center">
          <div>
            <div className="text-white font-mono text-sm font-bold tracking-wider uppercase">
              {weapon.name}
            </div>
            <div className="text-xs text-white/50 font-mono">
              SERIAL: {weapon.name.replace(/\s/g, '')}-{String(weaponIndex + 1).padStart(3, '0')}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="px-3 py-1 bg-military-gray border border-white/20 rounded">
              <span className="text-white/80 text-xs font-mono uppercase">ARMED</span>
            </div>
            <div className="px-3 py-1 bg-military-gray border border-white/20 rounded">
              <span className="text-white/80 text-xs font-mono uppercase">READY</span>
            </div>
            <div className="px-3 py-1 bg-military-gray border border-white/20 rounded">
              <span className="text-white/80 text-xs font-mono uppercase">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crosshair - Plus discret */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-6 h-6 border border-white/20 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 transform -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-white/10 transform -translate-x-1/2" />
        </div>
      </div>

      {/* Scanning lines - Plus subtil */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent animate-scan" />
      </div>

      {/* Corner brackets - Plus discret */}
      <div className="absolute top-12 left-8 w-12 h-12 border-t border-l border-white/15" />
      <div className="absolute top-12 right-8 w-12 h-12 border-t border-r border-white/15" />
      <div className="absolute bottom-12 left-8 w-12 h-12 border-b border-l border-white/15" />
      <div className="absolute bottom-12 right-8 w-12 h-12 border-b border-r border-white/15" />
    </div>
  );
}

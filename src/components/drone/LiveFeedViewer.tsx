import { useDroneStore, type CameraMode } from '@/store/droneStore';
import { TargetOverlay } from './TargetOverlay';
import { CameraModeSwitcher } from './CameraModeSwitcher';

function FeedCanvas({ mode, className = '' }: { mode: 'EO' | 'IR'; className?: string }) {
  const { trackingEvents, targetIntelligence, selectedTargetId, selectTarget, telemetry } = useDroneStore();

  const bgClass = mode === 'IR'
    ? 'bg-gradient-to-br from-[#1a0a2e] via-[#0d1117] to-[#1a1a2e]'
    : 'bg-gradient-to-br from-[#1a2332] via-[#0f1923] to-[#162029]';

  return (
    <div className={`relative overflow-hidden ${bgClass} ${className}`}>
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-40" />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--tactical-green) / 0.06) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--tactical-green) / 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Crosshair */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-1/2 -translate-x-px w-0.5 h-5 bg-tactical-green/40" />
          <div className="absolute bottom-0 left-1/2 -translate-x-px w-0.5 h-5 bg-tactical-green/40" />
          <div className="absolute left-0 top-1/2 -translate-y-px h-0.5 w-5 bg-tactical-green/40" />
          <div className="absolute right-0 top-1/2 -translate-y-px h-0.5 w-5 bg-tactical-green/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full border border-tactical-green/60" />
        </div>
      </div>

      {/* Camera mode label */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className={`px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider border ${
          mode === 'IR' ? 'border-tactical-amber/50 text-tactical-amber bg-tactical-amber/10' : 'border-tactical-green/50 text-tactical-green bg-tactical-green/10'
        }`}>
          {mode === 'IR' ? '■ FLIR / THERMAL' : '■ EO / DAYLIGHT'}
        </div>
      </div>

      {/* Camera info */}
      <div className="absolute top-3 right-3 text-right">
        <div className="font-mono text-[9px] text-muted-foreground/70 space-y-0.5">
          <div>AZ {telemetry.position.azimuth.toFixed(2)}° EL {telemetry.position.elevation.toFixed(2)}°</div>
          <div>ZOOM {telemetry.sensors.zoom}x FOCUS {(telemetry.sensors.focus * 100).toFixed(0)}%</div>
          <div>REC ● {new Date().toISOString().slice(11, 19)}</div>
        </div>
      </div>

      {/* Targets from tracking events */}
      {trackingEvents.map((te) => {
        const intel = targetIntelligence.find(ti => ti.target_id === te.target_id);
        return (
          <TargetOverlay
            key={te._id}
            trackingEvent={te}
            intel={intel || null}
            selected={te.target_id === selectedTargetId}
            onClick={() => selectTarget(te.target_id)}
            isIR={mode === 'IR'}
          />
        );
      })}

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/60 backdrop-blur-sm px-3 py-1 flex items-center justify-between">
        <span className="font-mono text-[9px] text-muted-foreground">
          LAT {telemetry.geo.lat.toFixed(4)} LON {telemetry.geo.lon.toFixed(4)} ALT {Math.round(telemetry.geo.altitude)}m
        </span>
        <span className="font-mono text-[9px] text-tactical-green">
          {trackingEvents.length} TRACKED
        </span>
      </div>
    </div>
  );
}

export function LiveFeedViewer() {
  const { cameraMode } = useDroneStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-panel-header border-b border-panel-border">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-tactical-green animate-pulse" />
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-foreground">
            LIVE FEED
          </span>
        </div>
        <CameraModeSwitcher />
      </div>

      <div className="flex-1 relative">
        {cameraMode === 'EO' && <FeedCanvas mode="EO" className="absolute inset-0" />}
        {cameraMode === 'IR' && <FeedCanvas mode="IR" className="absolute inset-0" />}
        {cameraMode === 'SPLIT' && (
          <div className="absolute inset-0 flex">
            <FeedCanvas mode="EO" className="flex-1 border-r border-border" />
            <FeedCanvas mode="IR" className="flex-1" />
          </div>
        )}
        {cameraMode === 'PIP' && (
          <>
            <FeedCanvas mode="EO" className="absolute inset-0" />
            <div className="absolute bottom-12 right-3 w-[30%] aspect-video border border-tactical-cyan/50 shadow-lg">
              <FeedCanvas mode="IR" className="w-full h-full" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

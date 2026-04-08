import type { TrackingEvent, TargetIntelligence } from '@/store/droneStore';
import { useDroneStore } from '@/store/droneStore';

interface TargetOverlayProps {
  trackingEvent: TrackingEvent;
  intel: TargetIntelligence | null;
  selected: boolean;
  onClick: () => void;
  isIR?: boolean;
}

/** Small stable offsets per target so each detection shows distinct geo angles near the box. */
function targetOffsets(te: TrackingEvent) {
  const { x, y, w, h } = te.bbox;
  const cx = x;
  const cy = y;
  return {
    altM: (cy - 50) * 0.35 + (cx - 50) * 0.08,
    azDeg: (cx - 50) * 0.04,
    elDeg: (cy - 50) * 0.03 + w * 0.01,
  };
}

const threatBorder: Record<string, string> = {
  critical: 'border-tactical-red',
  high: 'border-tactical-red',
  medium: 'border-tactical-amber',
  low: 'border-tactical-green',
};

export function TargetOverlay({ trackingEvent, intel, selected, onClick, isIR }: TargetOverlayProps) {
  const telemetry = useDroneStore((s) => s.telemetry);
  const { altM, azDeg, elDeg } = targetOffsets(trackingEvent);
  const alt = Math.max(0, telemetry.geo.altitude + altM);
  const al = telemetry.position.azimuth + azDeg;
  const el = telemetry.position.elevation + elDeg;
  const fs = telemetry.sensors.zoom;
  const leftSpace = trackingEvent.bbox.x - trackingEvent.bbox.w / 2;
  const rightSpace = 100 - (trackingEvent.bbox.x + trackingEvent.bbox.w / 2);
  const topSpace = trackingEvent.bbox.y - trackingEvent.bbox.h / 2;
  const bottomSpace = 100 - (trackingEvent.bbox.y + trackingEvent.bbox.h / 2);
  const maxSpace = Math.max(leftSpace, rightSpace, topSpace, bottomSpace);
  const readoutPosition =
    maxSpace === rightSpace
      ? 'left-full top-1/2 -translate-y-1/2 ml-1'
      : maxSpace === leftSpace
        ? 'right-full top-1/2 -translate-y-1/2 mr-1 text-right'
        : maxSpace === topSpace
          ? 'bottom-full left-1/2 -translate-x-1/2 mb-1'
          : 'top-full left-1/2 -translate-x-1/2 mt-1';

  const threat = intel?.threat_level || 'low';
  const borderColor = selected
    ? (threat === 'high' || threat === 'critical' ? 'border-tactical-red' : isIR ? 'border-tactical-amber' : 'border-tactical-green')
    : (threatBorder[threat] || 'border-tactical-cyan/50');

  const glowClass = selected ? (threat === 'high' || threat === 'critical' ? 'glow-red' : 'glow-green') : '';

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-300 ${glowClass}`}
      style={{
        left: `${trackingEvent.bbox.x - trackingEvent.bbox.w / 2}%`,
        top: `${trackingEvent.bbox.y - trackingEvent.bbox.h / 2}%`,
        width: `${trackingEvent.bbox.w}%`,
        height: `${trackingEvent.bbox.h}%`,
      }}
      onClick={onClick}
    >
      {/* Corner brackets */}
      <div className={`absolute inset-0 border opacity-90 ${borderColor}`}>
        <div className={`absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 opacity-90 ${borderColor}`} />
        <div className={`absolute -top-px -right-px w-2 h-2 border-t-2 border-r-2 opacity-90 ${borderColor}`} />
        <div className={`absolute -bottom-px -left-px w-2 h-2 border-b-2 border-l-2 opacity-90 ${borderColor}`} />
        <div className={`absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 opacity-90 ${borderColor}`} />
      </div>

      {/* Label */}
      <div className="absolute -top-6 left-0 flex items-center gap-1.5">
        <span className={`font-mono text-[9px] font-bold tracking-wider ${selected ? 'text-tactical-green' : 'text-tactical-cyan/80'}`}>
          {trackingEvent.target_id}
        </span>
        <span className="font-mono text-[9px] text-white/80">
          {Math.round(trackingEvent.confidence * 100)}%
        </span>
        {intel && (
          <span className={`font-mono text-[8px] uppercase opacity-85 ${
            intel.classification === 'hostile' ? 'text-tactical-red/85' : 'text-white/40'
          }`}>
            {intel.classification}
          </span>
        )}
      </div>

      {/* Per-target geo / sensor readout — plain text, placed on side with most free space */}
      <div
        className={`absolute z-10 pointer-events-none ${readoutPosition}`}
      >
        <div
          className="font-mono text-[10px] leading-snug tabular-nums text-white/90 whitespace-nowrap"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.95)' }}
        >
          <span><span className="text-tactical-green font-semibold tracking-wide">ALT</span> {alt.toFixed(0)}m</span>
          <span className="text-white/40"> | </span>
          <span><span className="text-tactical-green font-semibold tracking-wide">AL</span> {al.toFixed(2)}deg</span>
          <span className="text-white/40"> | </span>
          <span><span className="text-tactical-green font-semibold tracking-wide">EL</span> {el.toFixed(2)}deg</span>
          <span className="text-white/40"> | </span>
          <span><span className="text-tactical-green font-semibold tracking-wide">FS</span> {fs.toFixed(1)}x</span>
        </div>
        {(Math.abs(trackingEvent.velocity.x) > 0.3 || Math.abs(trackingEvent.velocity.y) > 0.3) && (
          <div
            className="font-mono text-[9px] text-tactical-cyan/95 uppercase tracking-wider whitespace-nowrap"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.95)' }}
          >
            V {trackingEvent.velocity.x.toFixed(1)} / {trackingEvent.velocity.y.toFixed(1)}
          </div>
        )}
      </div>
    </div>
  );
}

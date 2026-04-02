import type { TrackingEvent, TargetIntelligence } from '@/store/droneStore';

interface TargetOverlayProps {
  trackingEvent: TrackingEvent;
  intel: TargetIntelligence | null;
  selected: boolean;
  onClick: () => void;
  isIR?: boolean;
}

const threatBorder: Record<string, string> = {
  critical: 'border-tactical-red',
  high: 'border-tactical-red',
  medium: 'border-tactical-amber',
  low: 'border-tactical-green',
};

export function TargetOverlay({ trackingEvent, intel, selected, onClick, isIR }: TargetOverlayProps) {
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
      <div className={`absolute inset-0 border ${borderColor}`}>
        <div className={`absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 ${borderColor}`} />
        <div className={`absolute -top-px -right-px w-2 h-2 border-t-2 border-r-2 ${borderColor}`} />
        <div className={`absolute -bottom-px -left-px w-2 h-2 border-b-2 border-l-2 ${borderColor}`} />
        <div className={`absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 ${borderColor}`} />
      </div>

      {/* Label */}
      <div className="absolute -top-5 left-0 flex items-center gap-1">
        <span className={`font-mono text-[8px] font-bold ${selected ? 'text-tactical-green' : 'text-tactical-cyan/70'}`}>
          {trackingEvent.target_id}
        </span>
        <span className="font-mono text-[8px] text-muted-foreground">
          {Math.round(trackingEvent.confidence * 100)}%
        </span>
        {intel && (
          <span className={`font-mono text-[7px] uppercase ${
            intel.classification === 'hostile' ? 'text-tactical-red' : 'text-muted-foreground'
          }`}>
            {intel.classification}
          </span>
        )}
      </div>

      {/* Velocity vector */}
      {(Math.abs(trackingEvent.velocity.x) > 0.3 || Math.abs(trackingEvent.velocity.y) > 0.3) && (
        <div className="absolute -bottom-4 left-0">
          <span className="font-mono text-[7px] text-tactical-cyan uppercase tracking-wider">
            V:{trackingEvent.velocity.x.toFixed(1)},{trackingEvent.velocity.y.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}

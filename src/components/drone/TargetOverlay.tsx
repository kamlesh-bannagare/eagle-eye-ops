import type { Target } from '@/store/droneStore';

interface TargetOverlayProps {
  target: Target;
  selected: boolean;
  onClick: () => void;
  isIR?: boolean;
}

export function TargetOverlay({ target, selected, onClick, isIR }: TargetOverlayProps) {
  const borderColor = selected
    ? isIR ? 'border-tactical-amber' : 'border-tactical-green'
    : 'border-tactical-cyan/50';

  const glowClass = selected ? (isIR ? 'glow-red' : 'glow-green') : '';

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-300 ${glowClass}`}
      style={{
        left: `${target.x - target.width / 2}%`,
        top: `${target.y - target.height / 2}%`,
        width: `${target.width}%`,
        height: `${target.height}%`,
      }}
      onClick={onClick}
    >
      {/* Corner brackets */}
      <div className={`absolute inset-0 border ${borderColor}`}>
        {/* Top-left */}
        <div className={`absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 ${borderColor}`} />
        {/* Top-right */}
        <div className={`absolute -top-px -right-px w-2 h-2 border-t-2 border-r-2 ${borderColor}`} />
        {/* Bottom-left */}
        <div className={`absolute -bottom-px -left-px w-2 h-2 border-b-2 border-l-2 ${borderColor}`} />
        {/* Bottom-right */}
        <div className={`absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 ${borderColor}`} />
      </div>

      {/* Label */}
      <div className="absolute -top-5 left-0 flex items-center gap-1">
        <span className={`font-mono text-[8px] font-bold ${selected ? 'text-tactical-green' : 'text-tactical-cyan/70'}`}>
          {target.id}
        </span>
        <span className="font-mono text-[8px] text-muted-foreground">
          {target.confidence}%
        </span>
      </div>

      {/* Tracking indicator */}
      {target.tracked && (
        <div className="absolute -bottom-4 left-0">
          <span className="font-mono text-[7px] text-tactical-green uppercase tracking-wider">tracking</span>
        </div>
      )}
    </div>
  );
}

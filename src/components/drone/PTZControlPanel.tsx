import { useDroneStore } from '@/store/droneStore';
import { PanelHeader } from './PanelHeader';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export function PTZControlPanel() {
  const { pan, tilt, zoom, focus, setPan, setTilt, setZoom, setFocus } = useDroneStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PanelHeader title="CAMERA CONTROL" status="active" />
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* PTZ Joystick */}
        <div>
          <div className="text-[9px] font-mono text-muted-foreground tracking-widest mb-2">PAN / TILT</div>
          <div className="flex flex-col items-center gap-1">
            <PTZButton icon={ChevronUp} onClick={() => setTilt(tilt + 5)} />
            <div className="flex items-center gap-1">
              <PTZButton icon={ChevronLeft} onClick={() => setPan(pan - 5)} />
              <button
                onClick={() => { setPan(0); setTilt(-15); }}
                className="w-8 h-8 flex items-center justify-center border border-border rounded-sm bg-muted/50 hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-muted-foreground" />
              </button>
              <PTZButton icon={ChevronRight} onClick={() => setPan(pan + 5)} />
            </div>
            <PTZButton icon={ChevronDown} onClick={() => setTilt(tilt - 5)} />
          </div>
          <div className="mt-2 text-center font-mono text-[9px] text-muted-foreground">
            P: {pan.toFixed(1)}° T: {tilt.toFixed(1)}°
          </div>
        </div>

        {/* Zoom */}
        <SliderControl
          label="ZOOM"
          value={zoom}
          min={1}
          max={30}
          step={0.5}
          onChange={setZoom}
          displayValue={`${zoom.toFixed(1)}x`}
        />

        {/* Focus */}
        <SliderControl
          label="FOCUS"
          value={focus}
          min={0}
          max={100}
          step={1}
          onChange={setFocus}
          displayValue={`${Math.round(focus)}%`}
        />

        {/* Quick actions */}
        <div>
          <div className="text-[9px] font-mono text-muted-foreground tracking-widest mb-2">QUICK ACTIONS</div>
          <div className="grid grid-cols-2 gap-1">
            <QuickAction label="AUTO FOCUS" onClick={() => setFocus(85)} />
            <QuickAction label="RESET PTZ" onClick={() => { setPan(0); setTilt(-15); setZoom(1); }} />
            <QuickAction label="ZOOM 10x" onClick={() => setZoom(10)} />
            <QuickAction label="ZOOM 20x" onClick={() => setZoom(20)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PTZButton({ icon: Icon, onClick }: { icon: React.ElementType; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center border border-border rounded-sm bg-secondary hover:bg-primary/20 hover:border-primary transition-colors active:bg-primary/30"
    >
      <Icon className="w-4 h-4 text-foreground" />
    </button>
  );
}

function SliderControl({
  label, value, min, max, step, onChange, displayValue,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; displayValue: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-mono text-muted-foreground tracking-widest">{label}</span>
        <span className="font-mono text-[11px] text-primary font-medium">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 appearance-none bg-border rounded-full cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:border-0"
      />
    </div>
  );
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1.5 text-[9px] font-mono font-semibold tracking-wider border border-border
        bg-secondary hover:bg-primary/10 hover:border-primary/50 transition-colors text-muted-foreground hover:text-foreground"
    >
      {label}
    </button>
  );
}

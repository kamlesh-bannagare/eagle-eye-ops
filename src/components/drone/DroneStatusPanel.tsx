import { useDroneStore } from '@/store/droneStore';
import { PanelHeader } from './PanelHeader';
import {
  Navigation, Gauge, Mountain, Compass, MapPin, Crosshair, Target,
} from 'lucide-react';

export function DroneStatusPanel() {
  const {
    altitude, speed, heading, batteryLevel, gpsLat, gpsLng,
    targets, selectedTargetId, selectTarget, trackingMode, setTrackingMode,
  } = useDroneStore();

  const selectedTarget = targets.find(t => t.id === selectedTargetId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PanelHeader title="DRONE STATUS" status="active" />

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Telemetry */}
        <Section title="TELEMETRY">
          <DataRow icon={Mountain} label="ALT" value={`${Math.round(altitude)} ft`} />
          <DataRow icon={Gauge} label="SPD" value={`${Math.round(speed)} kts`} />
          <DataRow icon={Compass} label="HDG" value={`${Math.round(heading)}°`} />
          <DataRow icon={Navigation} label="TRK" value={`${Math.round(heading + 3)}°`} />
          <DataRow icon={MapPin} label="POS" value={`${gpsLat.toFixed(4)}, ${gpsLng.toFixed(4)}`} />
        </Section>

        {/* Tracking Mode */}
        <Section title="TRACKING MODE">
          <div className="flex gap-1">
            {(['MANUAL', 'AUTO', 'LOCKED'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setTrackingMode(mode)}
                className={`flex-1 py-1 text-[10px] font-mono font-semibold tracking-wider border transition-colors ${
                  trackingMode === mode
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </Section>

        {/* Target List */}
        <Section title="TARGETS">
          <div className="space-y-1">
            {targets.map(t => (
              <button
                key={t.id}
                onClick={() => selectTarget(t.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-left border transition-colors ${
                  t.id === selectedTargetId
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent hover:border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.tracked ? (
                    <Crosshair className="w-3 h-3 text-tactical-green" />
                  ) : (
                    <Target className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className="font-mono text-[10px] text-foreground">{t.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-muted-foreground">{t.label}</span>
                  <span className={`font-mono text-[9px] ${t.confidence > 85 ? 'text-tactical-green' : 'text-tactical-amber'}`}>
                    {t.confidence}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Selected target detail */}
        {selectedTarget && (
          <Section title="TARGET DETAIL">
            <DataRow icon={Target} label="ID" value={selectedTarget.id} />
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">CLASS</span>
              <span className="text-foreground">{selectedTarget.label}</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">CONF</span>
              <span className="text-tactical-green">{selectedTarget.confidence}%</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">POS</span>
              <span className="text-foreground">X:{selectedTarget.x.toFixed(1)} Y:{selectedTarget.y.toFixed(1)}</span>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] font-mono text-muted-foreground tracking-widest mb-2 uppercase">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function DataRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
      </div>
      <span className="font-mono text-[11px] text-foreground font-medium">{value}</span>
    </div>
  );
}

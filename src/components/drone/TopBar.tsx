import { useDroneStore } from '@/store/droneStore';
import { Wifi, WifiOff, Battery, Clock, AlertTriangle, Radio } from 'lucide-react';

function formatFlightTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TopBar() {
  const { connected, signalStrength, latency, batteryLevel, flightTime, alerts, heading, altitude, speed } = useDroneStore();
  const unackAlerts = alerts.filter(a => !a.acknowledged);
  const hasCritical = unackAlerts.some(a => a.priority === 'CRITICAL');

  return (
    <div className="h-10 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
      {/* Left: System ID */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-tactical-green animate-pulse" />
          <span className="font-mono text-xs font-bold text-tactical-green tracking-widest">TC-300-UC</span>
        </div>
        <span className="text-muted-foreground text-[10px] font-mono">TRAKKA SYSTEMS</span>
      </div>

      {/* Center: Quick telemetry */}
      <div className="flex items-center gap-6">
        <TelemetryItem label="ALT" value={`${Math.round(altitude)}ft`} />
        <TelemetryItem label="SPD" value={`${Math.round(speed)}kts`} />
        <TelemetryItem label="HDG" value={`${Math.round(heading)}°`} />
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="font-mono text-xs text-foreground">{formatFlightTime(Math.round(flightTime))}</span>
        </div>
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-4">
        {/* Alerts */}
        {unackAlerts.length > 0 && (
          <div className={`flex items-center gap-1.5 ${hasCritical ? 'animate-pulse-alert' : ''}`}>
            <AlertTriangle className={`w-3.5 h-3.5 ${hasCritical ? 'text-tactical-red' : 'text-tactical-amber'}`} />
            <span className="font-mono text-[10px] text-tactical-amber">{unackAlerts.length}</span>
          </div>
        )}

        {/* Signal */}
        <div className="flex items-center gap-1.5">
          {connected ? <Wifi className="w-3.5 h-3.5 text-tactical-green" /> : <WifiOff className="w-3.5 h-3.5 text-tactical-red" />}
          <span className="font-mono text-[10px] text-muted-foreground">{Math.round(signalStrength)}%</span>
        </div>

        {/* Latency */}
        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-muted-foreground" />
          <span className={`font-mono text-[10px] ${latency > 50 ? 'text-tactical-amber' : 'text-muted-foreground'}`}>
            {Math.round(latency)}ms
          </span>
        </div>

        {/* Battery */}
        <div className="flex items-center gap-1.5">
          <Battery className={`w-3.5 h-3.5 ${batteryLevel < 20 ? 'text-tactical-red' : batteryLevel < 40 ? 'text-tactical-amber' : 'text-tactical-green'}`} />
          <span className="font-mono text-[10px] text-muted-foreground">{Math.round(batteryLevel)}%</span>
        </div>

        {/* UTC Time */}
        <span className="font-mono text-[10px] text-muted-foreground">
          {new Date().toISOString().slice(11, 19)}Z
        </span>
      </div>
    </div>
  );
}

function TelemetryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-mono text-muted-foreground uppercase">{label}</span>
      <span className="font-mono text-xs text-foreground font-medium">{value}</span>
    </div>
  );
}

import { useDroneStore } from '@/store/droneStore';
import { Wifi, WifiOff, Battery, Clock, AlertTriangle, Radio, Server } from 'lucide-react';

function formatFlightTime(startTime: Date) {
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TopBar() {
  const { device, telemetry, networkSession, alerts, missions } = useDroneStore();
  const unackAlerts = alerts.filter(a => a.status === 'active');
  const hasCritical = unackAlerts.some(a => a.severity === 'critical');
  const activeMission = missions.find(m => m.status === 'active');
  const isConnected = device.status === 'active';

  return (
    <div className="h-10 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
      {/* Left: Device ID */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-tactical-green animate-pulse' : 'bg-destructive'}`} />
          <span className="font-mono text-xs font-bold text-tactical-green tracking-widest">{device.device_id}</span>
        </div>
        <span className="text-muted-foreground text-[10px] font-mono">{device.model} v{device.firmware_version}</span>
        {activeMission && (
          <span className="text-[10px] font-mono text-tactical-cyan">{activeMission.mission_id} • {activeMission.region}</span>
        )}
      </div>

      {/* Center: Telemetry */}
      <div className="flex items-center gap-6">
        <TelemetryItem label="ALT" value={`${Math.round(telemetry.geo.altitude)}m`} />
        <TelemetryItem label="AZ" value={`${telemetry.position.azimuth.toFixed(2)}°`} />
        <TelemetryItem label="EL" value={`${telemetry.position.elevation.toFixed(2)}°`} />
        <TelemetryItem label="ZM" value={`${telemetry.sensors.zoom}x`} />
        {activeMission && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="font-mono text-xs text-foreground">{formatFlightTime(activeMission.start_time)}</span>
          </div>
        )}
      </div>

      {/* Right: Status */}
      <div className="flex items-center gap-4">
        {unackAlerts.length > 0 && (
          <div className={`flex items-center gap-1.5 ${hasCritical ? 'animate-pulse-alert' : ''}`}>
            <AlertTriangle className={`w-3.5 h-3.5 ${hasCritical ? 'text-tactical-red' : 'text-tactical-amber'}`} />
            <span className="font-mono text-[10px] text-tactical-amber">{unackAlerts.length}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {isConnected ? <Wifi className="w-3.5 h-3.5 text-tactical-green" /> : <WifiOff className="w-3.5 h-3.5 text-tactical-red" />}
          <span className="font-mono text-[10px] text-muted-foreground">{networkSession.protocol}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-muted-foreground" />
          <span className={`font-mono text-[10px] ${networkSession.latency_ms > 50 ? 'text-tactical-amber' : 'text-muted-foreground'}`}>
            {Math.round(networkSession.latency_ms)}ms
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Server className="w-3 h-3 text-muted-foreground" />
          <span className={`font-mono text-[10px] ${networkSession.packet_loss > 0.05 ? 'text-tactical-amber' : 'text-muted-foreground'}`}>
            {(networkSession.packet_loss * 100).toFixed(1)}% loss
          </span>
        </div>

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

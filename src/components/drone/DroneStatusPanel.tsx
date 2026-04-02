import { useDroneStore } from '@/store/droneStore';
import { PanelHeader } from './PanelHeader';
import {
  Crosshair, Target, Mountain, Compass, MapPin, Shield, Eye, Activity,
} from 'lucide-react';

const threatColors: Record<string, string> = {
  critical: 'text-tactical-red',
  high: 'text-tactical-red',
  medium: 'text-tactical-amber',
  low: 'text-tactical-green',
};

const classColors: Record<string, string> = {
  hostile: 'text-tactical-red',
  unknown: 'text-tactical-amber',
  neutral: 'text-muted-foreground',
  friendly: 'text-tactical-green',
};

export function DroneStatusPanel() {
  const {
    device, telemetry, trackingEvents, targetIntelligence,
    selectedTargetId, selectTarget, trackingMode, setTrackingMode,
    missions,
  } = useDroneStore();

  const activeMission = missions.find(m => m.status === 'active');
  const selectedIntel = targetIntelligence.find(t => t.target_id === selectedTargetId);
  const selectedTrack = trackingEvents.find(t => t.target_id === selectedTargetId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PanelHeader title="STATUS" status={device.status === 'active' ? 'active' : 'error'} />

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Device */}
        <Section title="DEVICE">
          <DataRow icon={Activity} label="ID" value={device.device_id} />
          <DataRow icon={Shield} label="MODEL" value={device.model} />
          <DataRow icon={Activity} label="FW" value={`v${device.firmware_version}`} />
          <DataRow icon={Activity} label="IP" value={device.ip_address} />
        </Section>

        {/* Telemetry */}
        <Section title="TELEMETRY">
          <DataRow icon={Mountain} label="ALT" value={`${Math.round(telemetry.geo.altitude)} m`} />
          <DataRow icon={Compass} label="AZ" value={`${telemetry.position.azimuth.toFixed(3)}°`} />
          <DataRow icon={Compass} label="EL" value={`${telemetry.position.elevation.toFixed(3)}°`} />
          <DataRow icon={MapPin} label="POS" value={`${telemetry.geo.lat.toFixed(4)}, ${telemetry.geo.lon.toFixed(4)}`} />
        </Section>

        {/* Active Mission */}
        {activeMission && (
          <Section title="MISSION">
            <DataRow icon={Shield} label="ID" value={activeMission.mission_id} />
            <DataRow icon={MapPin} label="REGION" value={activeMission.region} />
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">STATUS</span>
              <span className="text-tactical-green uppercase">{activeMission.status}</span>
            </div>
          </Section>
        )}

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
            {targetIntelligence.map(intel => {
              const track = trackingEvents.find(t => t.target_id === intel.target_id);
              return (
                <button
                  key={intel.target_id}
                  onClick={() => selectTarget(intel.target_id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 text-left border transition-colors ${
                    intel.target_id === selectedTargetId
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent hover:border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {intel.classification === 'hostile' ? (
                      <Crosshair className="w-3 h-3 text-tactical-red" />
                    ) : (
                      <Target className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="font-mono text-[10px] text-foreground">{intel.target_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[9px] uppercase ${classColors[intel.classification] || 'text-muted-foreground'}`}>
                      {intel.classification}
                    </span>
                    <span className={`font-mono text-[9px] ${track && track.confidence > 0.85 ? 'text-tactical-green' : 'text-tactical-amber'}`}>
                      {track ? `${Math.round(track.confidence * 100)}%` : '--'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Selected target detail */}
        {selectedIntel && (
          <Section title="TARGET INTEL">
            <DataRow icon={Target} label="ID" value={selectedIntel.target_id} />
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">CLASS</span>
              <span className={`uppercase ${classColors[selectedIntel.classification]}`}>{selectedIntel.classification}</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">THREAT</span>
              <span className={`uppercase ${threatColors[selectedIntel.threat_level]}`}>{selectedIntel.threat_level}</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-muted-foreground">PATTERN</span>
              <span className="text-foreground uppercase">{selectedIntel.movement_pattern}</span>
            </div>
            {selectedTrack && (
              <>
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-muted-foreground">CONF</span>
                  <span className="text-tactical-green">{Math.round(selectedTrack.confidence * 100)}%</span>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-muted-foreground">BBOX</span>
                  <span className="text-foreground">
                    {selectedTrack.bbox.x},{selectedTrack.bbox.y} {selectedTrack.bbox.w}×{selectedTrack.bbox.h}
                  </span>
                </div>
              </>
            )}
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

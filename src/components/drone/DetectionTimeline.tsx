import { useDroneStore } from '@/store/droneStore';
import { PanelHeader } from './PanelHeader';
import { AlertTriangle, Eye, Shield } from 'lucide-react';

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  VEHICLE_DETECTED: { icon: Eye, color: 'text-tactical-cyan' },
  MOTION_ALERT: { icon: AlertTriangle, color: 'text-tactical-amber' },
  PERIMETER_BREACH: { icon: Shield, color: 'text-tactical-red' },
};

function formatTime(date: Date) {
  return date.toISOString().slice(11, 19);
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

export function DetectionTimeline() {
  const { detectionEvents, alerts, acknowledgeAlert } = useDroneStore();
  const unackAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PanelHeader title="DETECTION LOG" status={unackAlerts.length > 0 ? 'warning' : 'active'}>
        <span className="font-mono text-[9px] text-muted-foreground">{detectionEvents.length} EVENTS</span>
      </PanelHeader>

      <div className="flex-1 overflow-hidden flex">
        {/* Alerts strip */}
        {unackAlerts.length > 0 && (
          <div className="w-64 border-r border-border p-2 space-y-1 overflow-y-auto">
            {unackAlerts.map(a => (
              <button
                key={a.id}
                onClick={() => acknowledgeAlert(a.id)}
                className={`w-full text-left px-2 py-1.5 border transition-colors ${
                  a.priority === 'CRITICAL'
                    ? 'border-tactical-red/50 bg-tactical-red/10 animate-pulse-alert'
                    : a.priority === 'MEDIUM'
                    ? 'border-tactical-amber/30 bg-tactical-amber/5'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className={`w-2.5 h-2.5 ${
                    a.priority === 'CRITICAL' ? 'text-tactical-red' : 'text-tactical-amber'
                  }`} />
                  <span className="font-mono text-[9px] text-foreground truncate">{a.message}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">TIME</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">TYPE</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">CONF</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">SECTOR</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">AGO</th>
              </tr>
            </thead>
            <tbody>
              {detectionEvents.map(evt => {
                const cfg = typeConfig[evt.type] || { icon: Eye, color: 'text-muted-foreground' };
                const Icon = cfg.icon;
                return (
                  <tr key={evt.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-1 font-mono text-[10px] text-muted-foreground">{formatTime(evt.timestamp)}</td>
                    <td className="px-3 py-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3 h-3 ${cfg.color}`} />
                        <span className={`font-mono text-[10px] ${cfg.color}`}>{evt.type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className={`px-3 py-1 font-mono text-[10px] ${evt.confidence > 85 ? 'text-tactical-green' : 'text-tactical-amber'}`}>
                      {evt.confidence}%
                    </td>
                    <td className="px-3 py-1 font-mono text-[10px] text-foreground">{evt.location}</td>
                    <td className="px-3 py-1 font-mono text-[10px] text-muted-foreground">{timeAgo(evt.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

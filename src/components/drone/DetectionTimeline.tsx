import { useState } from 'react';
import { useDroneStore } from '@/store/droneStore';
import { PanelHeader } from './PanelHeader';
import { AlertTriangle, Eye, Shield, Activity, Video, FileText } from 'lucide-react';

type TabView = 'alerts' | 'events' | 'logs' | 'video';

const logTypeConfig: Record<string, { color: string }> = {
  ERROR: { color: 'text-tactical-red' },
  WARNING: { color: 'text-tactical-amber' },
  INFO: { color: 'text-tactical-cyan' },
  DEBUG: { color: 'text-muted-foreground' },
};

const eventTypeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  TARGET_LOCK: { icon: Eye, color: 'text-tactical-green' },
  TARGET_LOST: { icon: AlertTriangle, color: 'text-tactical-red' },
  ZONE_ENTER: { icon: Shield, color: 'text-tactical-amber' },
  ZONE_EXIT: { icon: Shield, color: 'text-muted-foreground' },
  RECON_START: { icon: Activity, color: 'text-tactical-cyan' },
  RECON_END: { icon: Activity, color: 'text-muted-foreground' },
};

function formatTime(date: Date) {
  return date.toISOString().slice(11, 19);
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

const severityColors: Record<string, string> = {
  critical: 'border-tactical-red/50 bg-tactical-red/10',
  high: 'border-tactical-red/30 bg-tactical-red/5',
  medium: 'border-tactical-amber/30 bg-tactical-amber/5',
  low: 'border-border bg-muted/30',
};

export function DetectionTimeline() {
  const { alerts, acknowledgeAlert, missionEvents, systemLogs, videoEvents } = useDroneStore();
  const [activeTab, setActiveTab] = useState<TabView>('alerts');
  const activeAlerts = alerts.filter(a => a.status === 'active');

  const tabs: { key: TabView; label: string; count?: number }[] = [
    { key: 'alerts', label: 'ALERTS', count: activeAlerts.length },
    { key: 'events', label: 'MISSION' },
    { key: 'logs', label: 'SYSTEM' },
    { key: 'video', label: 'VIDEO' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-panel-header border-b border-panel-border">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${activeAlerts.length > 0 ? 'bg-warning' : 'bg-tactical-green'}`} />
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-foreground">
            DETECTION LOG
          </span>
        </div>
        <div className="flex items-center gap-px bg-background/50 rounded-sm overflow-hidden border border-border">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-2 py-0.5 text-[9px] font-mono font-semibold tracking-wider transition-colors flex items-center gap-1 ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-tactical-red/80 text-destructive-foreground px-1 rounded-sm text-[8px]">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'alerts' && (
          <div className="divide-y divide-border/50">
            {alerts.map(a => (
              <button
                key={a._id}
                onClick={() => a.status === 'active' ? acknowledgeAlert(a._id) : undefined}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-3 transition-colors hover:bg-muted/30 ${
                  a.status === 'active' ? '' : 'opacity-50'
                }`}
              >
                <AlertTriangle className={`w-3 h-3 shrink-0 ${
                  a.severity === 'critical' ? 'text-tactical-red' : a.severity === 'high' ? 'text-tactical-red' : 'text-tactical-amber'
                }`} />
                <span className="font-mono text-[10px] text-foreground flex-1 truncate">{a.message}</span>
                <span className={`font-mono text-[9px] uppercase ${
                  a.severity === 'critical' ? 'text-tactical-red' : 'text-tactical-amber'
                }`}>{a.severity}</span>
                <span className="font-mono text-[9px] text-muted-foreground shrink-0">{timeAgo(a.triggered_at)}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">TIME</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">EVENT</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">TARGET</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">DEVICE</th>
              </tr>
            </thead>
            <tbody>
              {missionEvents.map(evt => {
                const cfg = eventTypeConfig[evt.event_type] || { icon: Activity, color: 'text-muted-foreground' };
                const Icon = cfg.icon;
                return (
                  <tr key={evt._id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-1 font-mono text-[10px] text-muted-foreground">{formatTime(evt.timestamp)}</td>
                    <td className="px-3 py-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3 h-3 ${cfg.color}`} />
                        <span className={`font-mono text-[10px] ${cfg.color}`}>{evt.event_type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-3 py-1 font-mono text-[10px] text-foreground">{evt.target_id || '—'}</td>
                    <td className="px-3 py-1 font-mono text-[10px] text-muted-foreground">{evt.device_id}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'logs' && (
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">TIME</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">TYPE</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">CODE</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">MESSAGE</th>
              </tr>
            </thead>
            <tbody>
              {systemLogs.map(log => {
                const cfg = logTypeConfig[log.type] || { color: 'text-muted-foreground' };
                return (
                  <tr key={log._id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-1 font-mono text-[10px] text-muted-foreground">{formatTime(log.timestamp)}</td>
                    <td className={`px-3 py-1 font-mono text-[10px] font-semibold ${cfg.color}`}>{log.type}</td>
                    <td className="px-3 py-1 font-mono text-[10px] text-foreground">{log.code}</td>
                    <td className="px-3 py-1 font-mono text-[10px] text-muted-foreground truncate max-w-[300px]">{log.message}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'video' && (
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">TIME</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">VIDEO</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">EVENT</th>
                <th className="text-left px-3 py-1 font-mono text-[9px] text-muted-foreground font-semibold tracking-wider">CONF</th>
              </tr>
            </thead>
            <tbody>
              {videoEvents.map(ve => (
                <tr key={ve._id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-1 font-mono text-[10px] text-muted-foreground">{formatTime(ve.timestamp)}</td>
                  <td className="px-3 py-1 font-mono text-[10px] text-foreground">{ve.video_id}</td>
                  <td className="px-3 py-1">
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3 h-3 text-tactical-cyan" />
                      <span className="font-mono text-[10px] text-tactical-cyan">{ve.event.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className={`px-3 py-1 font-mono text-[10px] ${ve.confidence > 0.85 ? 'text-tactical-green' : 'text-tactical-amber'}`}>
                    {Math.round(ve.confidence * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

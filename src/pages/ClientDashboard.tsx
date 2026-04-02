import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useDroneStore } from '@/store/droneStore';
import { Shield, LogOut, Radio, Gauge, MapPin, Eye, AlertTriangle, Activity, Target, Server } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ClientDashboard() {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const { device, telemetry, networkSession, trackingEvents, alerts, missions, targetIntelligence, geoZones } = useDroneStore();

  if (!currentUser || currentUser.role !== 'client') {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const activeMission = missions.find(m => m.status === 'active');
  const hostileTargets = targetIntelligence.filter(t => t.classification === 'hostile');

  const stats = [
    { label: 'Device', value: device.status === 'active' ? 'ONLINE' : 'OFFLINE', icon: Radio, color: device.status === 'active' ? 'text-primary' : 'text-destructive' },
    { label: 'Altitude', value: `${Math.round(telemetry.geo.altitude)}m`, icon: Gauge, color: 'text-foreground' },
    { label: 'Latency', value: `${Math.round(networkSession.latency_ms)}ms`, icon: Activity, color: networkSession.latency_ms > 50 ? 'text-tactical-amber' : 'text-primary' },
    { label: 'Pkt Loss', value: `${(networkSession.packet_loss * 100).toFixed(1)}%`, icon: Server, color: networkSession.packet_loss > 0.05 ? 'text-tactical-amber' : 'text-primary' },
    { label: 'Targets', value: trackingEvents.length.toString(), icon: Eye, color: 'text-accent' },
    { label: 'Hostile', value: hostileTargets.length.toString(), icon: Target, color: hostileTargets.length > 0 ? 'text-tactical-red' : 'text-primary' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm font-semibold text-foreground tracking-wider">
            MISSION OVERVIEW
          </span>
          {activeMission && (
            <span className="text-[10px] font-mono text-tactical-cyan px-2 py-0.5 border border-tactical-cyan/30 bg-tactical-cyan/5">
              {activeMission.mission_id} • {activeMission.region}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">{currentUser.name}</span>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Welcome */}
          <div>
            <h2 className="text-lg font-mono font-semibold text-foreground">
              Welcome, {currentUser.name}
            </h2>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              {device.model} ({device.device_id}) • FW v{device.firmware_version} • {device.ip_address}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map(s => (
              <div key={s.label} className="bg-card border border-border rounded-md p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{s.label}</span>
                </div>
                <span className={`text-lg font-mono font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Geo position */}
          <div className="bg-card border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Position & Zones</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground">LAT</span>
                <div className="font-mono text-sm text-foreground font-medium">{telemetry.geo.lat.toFixed(4)}</div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted-foreground">LON</span>
                <div className="font-mono text-sm text-foreground font-medium">{telemetry.geo.lon.toFixed(4)}</div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted-foreground">ALT</span>
                <div className="font-mono text-sm text-foreground font-medium">{Math.round(telemetry.geo.altitude)}m</div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted-foreground">ZONES</span>
                <div className="font-mono text-sm text-foreground font-medium">{geoZones.length} defined</div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {activeAlerts.length > 0 && (
            <div className="bg-card border border-border rounded-md">
              <div className="px-4 py-2.5 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-tactical-amber" />
                  Active Alerts ({activeAlerts.length})
                </span>
              </div>
              <div className="divide-y divide-border/50">
                {activeAlerts.map(alert => (
                  <div key={alert._id} className="px-4 py-2.5 flex items-center gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      alert.severity === 'critical' ? 'bg-destructive animate-pulse-alert' :
                      alert.severity === 'high' ? 'bg-tactical-red' :
                      alert.severity === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                    }`} />
                    <span className="text-xs font-mono text-foreground flex-1">{alert.message}</span>
                    <span className={`text-[10px] font-mono uppercase ${
                      alert.severity === 'critical' ? 'text-tactical-red' : 'text-tactical-amber'
                    }`}>{alert.severity}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{alert.type.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Launch drone control */}
          <button
            onClick={() => navigate('/control')}
            className="w-full bg-card border border-primary/30 rounded-md p-6 hover:border-primary/60 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <span className="text-sm font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                  OPEN DRONE CONTROL
                </span>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Access live feed, gimbal controls, and target tracking
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Eye className="w-5 h-5 text-primary" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

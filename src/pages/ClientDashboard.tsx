import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useDroneStore } from '@/store/droneStore';
import { Shield, LogOut, Radio, Battery, Gauge, Navigation, Eye, AlertTriangle } from 'lucide-react';

export default function ClientDashboard() {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const { altitude, speed, batteryLevel, connected, signalStrength, targets, alerts } = useDroneStore();

  if (!currentUser || currentUser.role !== 'client') {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  const stats = [
    { label: 'Status', value: connected ? 'ONLINE' : 'OFFLINE', icon: Radio, color: connected ? 'text-primary' : 'text-destructive' },
    { label: 'Altitude', value: `${Math.round(altitude)}m`, icon: Gauge, color: 'text-foreground' },
    { label: 'Speed', value: `${Math.round(speed)} km/h`, icon: Navigation, color: 'text-foreground' },
    { label: 'Battery', value: `${Math.round(batteryLevel)}%`, icon: Battery, color: batteryLevel < 20 ? 'text-destructive' : 'text-primary' },
    { label: 'Signal', value: `${Math.round(signalStrength)}%`, icon: Radio, color: signalStrength < 70 ? 'text-tactical-amber' : 'text-primary' },
    { label: 'Targets', value: targets.length.toString(), icon: Eye, color: 'text-accent' },
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
              TrakkaCam TC-300-UC Ground Control Station
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

          {/* Alerts */}
          {unacknowledgedAlerts.length > 0 && (
            <div className="bg-card border border-border rounded-md">
              <div className="px-4 py-2.5 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-tactical-amber" />
                  Active Alerts ({unacknowledgedAlerts.length})
                </span>
              </div>
              <div className="divide-y divide-border/50">
                {unacknowledgedAlerts.map(alert => (
                  <div key={alert.id} className="px-4 py-2.5 flex items-center gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      alert.priority === 'CRITICAL' ? 'bg-destructive animate-pulse-alert' :
                      alert.priority === 'MEDIUM' ? 'bg-warning' : 'bg-muted-foreground'
                    }`} />
                    <span className="text-xs font-mono text-foreground flex-1">{alert.message}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{alert.priority}</span>
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
                  Access live feed, PTZ controls, and target tracking
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

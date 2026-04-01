import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDroneStore } from '@/store/droneStore';
import { TopBar } from '@/components/drone/TopBar';
import { DroneStatusPanel } from '@/components/drone/DroneStatusPanel';
import { LiveFeedViewer } from '@/components/drone/LiveFeedViewer';
import { PTZControlPanel } from '@/components/drone/PTZControlPanel';
import { DetectionTimeline } from '@/components/drone/DetectionTimeline';

export default function DroneControl() {
  const currentUser = useAuthStore(s => s.currentUser);
  const navigate = useNavigate();
  const updateTelemetry = useDroneStore(s => s.updateTelemetry);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const interval = setInterval(updateTelemetry, 1000);
    return () => clearInterval(interval);
  }, [updateTelemetry]);

  if (!currentUser) return null;

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-border shrink-0 overflow-hidden">
          <DroneStatusPanel />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <LiveFeedViewer />
          </div>
          <div className="h-44 border-t border-border shrink-0 overflow-hidden">
            <DetectionTimeline />
          </div>
        </div>
        <div className="w-56 border-l border-border shrink-0 overflow-hidden">
          <PTZControlPanel />
        </div>
      </div>
    </div>
  );
}

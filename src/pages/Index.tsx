import { useEffect } from 'react';
import { useDroneStore } from '@/store/droneStore';
import { TopBar } from '@/components/drone/TopBar';
import { DroneStatusPanel } from '@/components/drone/DroneStatusPanel';
import { LiveFeedViewer } from '@/components/drone/LiveFeedViewer';
import { PTZControlPanel } from '@/components/drone/PTZControlPanel';
import { DetectionTimeline } from '@/components/drone/DetectionTimeline';

export default function Index() {
  const updateTelemetry = useDroneStore(s => s.updateTelemetry);

  useEffect(() => {
    const interval = setInterval(updateTelemetry, 1000);
    return () => clearInterval(interval);
  }, [updateTelemetry]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-64 border-r border-border shrink-0 overflow-hidden">
          <DroneStatusPanel />
        </div>

        {/* Center Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <LiveFeedViewer />
          </div>

          {/* Bottom Panel */}
          <div className="h-44 border-t border-border shrink-0 overflow-hidden">
            <DetectionTimeline />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-56 border-l border-border shrink-0 overflow-hidden">
          <PTZControlPanel />
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDroneStore } from '@/store/droneStore';
import { LiveFeedViewer } from '@/components/drone/LiveFeedViewer';

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
    <div className="h-screen w-screen bg-black overflow-hidden">
      <LiveFeedViewer />
    </div>
  );
}

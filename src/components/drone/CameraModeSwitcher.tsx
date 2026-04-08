import { useDroneStore, type CameraMode } from '@/store/droneStore';

const modes: { value: CameraMode; label: string }[] = [
  { value: 'EO', label: 'EO' },
  { value: 'IR', label: 'IR' },
  { value: 'SPLIT', label: 'SPLIT' },
  { value: 'PIP', label: 'PIP' },
];

export function CameraModeSwitcher() {
  const { cameraMode, setCameraMode } = useDroneStore();

  return (
    <div className="flex items-center gap-px rounded-sm overflow-hidden border border-tactical-green/25 bg-black/5">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setCameraMode(mode.value)}
          className={`px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider transition-colors ${
            cameraMode === mode.value
              ? 'bg-tactical-green/30 text-tactical-green'
              : 'text-white/55 hover:text-tactical-green hover:bg-tactical-green/10'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

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
    <div className="flex items-center gap-px bg-background/50 rounded-sm overflow-hidden border border-border">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setCameraMode(mode.value)}
          className={`px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider transition-colors ${
            cameraMode === mode.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

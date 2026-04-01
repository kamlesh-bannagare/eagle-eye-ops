import { create } from 'zustand';

export type CameraMode = 'EO' | 'IR' | 'SPLIT' | 'PIP';
export type AlertPriority = 'LOW' | 'MEDIUM' | 'CRITICAL';
export type TrackingMode = 'MANUAL' | 'AUTO' | 'LOCKED';

export interface Target {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string;
  velocity: { dx: number; dy: number };
  tracked: boolean;
}

export interface Alert {
  id: string;
  message: string;
  priority: AlertPriority;
  timestamp: Date;
  acknowledged: boolean;
}

export interface DetectionEvent {
  id: string;
  timestamp: Date;
  type: string;
  confidence: number;
  location: string;
}

export interface DroneState {
  // Connection
  connected: boolean;
  signalStrength: number;
  latency: number;

  // Drone telemetry
  altitude: number;
  speed: number;
  heading: number;
  batteryLevel: number;
  gpsLat: number;
  gpsLng: number;
  flightTime: number;

  // Camera
  cameraMode: CameraMode;
  pan: number;
  tilt: number;
  zoom: number;
  focus: number;
  trackingMode: TrackingMode;

  // Targets
  targets: Target[];
  selectedTargetId: string | null;

  // Alerts
  alerts: Alert[];

  // Events
  detectionEvents: DetectionEvent[];

  // Actions
  setCameraMode: (mode: CameraMode) => void;
  setPan: (v: number) => void;
  setTilt: (v: number) => void;
  setZoom: (v: number) => void;
  setFocus: (v: number) => void;
  setTrackingMode: (mode: TrackingMode) => void;
  selectTarget: (id: string | null) => void;
  acknowledgeAlert: (id: string) => void;
  updateTelemetry: () => void;
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export const useDroneStore = create<DroneState>((set, get) => ({
  connected: true,
  signalStrength: 92,
  latency: 24,

  altitude: 1250,
  speed: 45,
  heading: 247,
  batteryLevel: 78,
  gpsLat: 33.9425,
  gpsLng: -118.4081,
  flightTime: 2847,

  cameraMode: 'EO',
  pan: 0,
  tilt: -15,
  zoom: 1,
  focus: 85,
  trackingMode: 'MANUAL',

  targets: [
    { id: 'TGT-001', x: 45, y: 40, width: 8, height: 6, confidence: 94, label: 'VEHICLE', velocity: { dx: 0.3, dy: 0.1 }, tracked: true },
    { id: 'TGT-002', x: 70, y: 60, width: 5, height: 5, confidence: 87, label: 'UNKNOWN', velocity: { dx: -0.1, dy: 0.2 }, tracked: false },
    { id: 'TGT-003', x: 25, y: 70, width: 6, height: 4, confidence: 72, label: 'VEHICLE', velocity: { dx: 0.5, dy: -0.1 }, tracked: false },
  ],
  selectedTargetId: 'TGT-001',

  alerts: [
    { id: 'ALT-001', message: 'New target detected in sector 7', priority: 'MEDIUM', timestamp: new Date(), acknowledged: false },
    { id: 'ALT-002', message: 'Signal degradation detected', priority: 'LOW', timestamp: new Date(Date.now() - 120000), acknowledged: false },
  ],

  detectionEvents: [
    { id: 'EVT-001', timestamp: new Date(Date.now() - 300000), type: 'VEHICLE_DETECTED', confidence: 94, location: 'S7-A3' },
    { id: 'EVT-002', timestamp: new Date(Date.now() - 240000), type: 'MOTION_ALERT', confidence: 78, location: 'S7-B1' },
    { id: 'EVT-003', timestamp: new Date(Date.now() - 180000), type: 'VEHICLE_DETECTED', confidence: 87, location: 'S8-A2' },
    { id: 'EVT-004', timestamp: new Date(Date.now() - 120000), type: 'PERIMETER_BREACH', confidence: 91, location: 'S6-C4' },
    { id: 'EVT-005', timestamp: new Date(Date.now() - 60000), type: 'VEHICLE_DETECTED', confidence: 72, location: 'S7-D2' },
  ],

  setCameraMode: (mode) => set({ cameraMode: mode }),
  setPan: (v) => set({ pan: Math.max(-180, Math.min(180, v)) }),
  setTilt: (v) => set({ tilt: Math.max(-90, Math.min(30, v)) }),
  setZoom: (v) => set({ zoom: Math.max(1, Math.min(30, v)) }),
  setFocus: (v) => set({ focus: Math.max(0, Math.min(100, v)) }),
  setTrackingMode: (mode) => set({ trackingMode: mode }),
  selectTarget: (id) => set({ selectedTargetId: id }),
  acknowledgeAlert: (id) => set((s) => ({
    alerts: s.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a)
  })),
  updateTelemetry: () => {
    const s = get();
    set({
      altitude: s.altitude + randomBetween(-2, 2),
      speed: Math.max(0, s.speed + randomBetween(-1, 1)),
      heading: (s.heading + randomBetween(-0.5, 0.5) + 360) % 360,
      batteryLevel: Math.max(0, s.batteryLevel - 0.002),
      signalStrength: Math.min(100, Math.max(60, s.signalStrength + randomBetween(-1, 1))),
      latency: Math.max(10, Math.min(80, s.latency + randomBetween(-2, 2))),
      gpsLat: s.gpsLat + randomBetween(-0.0001, 0.0001),
      gpsLng: s.gpsLng + randomBetween(-0.0001, 0.0001),
      flightTime: s.flightTime + 1,
      targets: s.targets.map(t => ({
        ...t,
        x: Math.max(5, Math.min(95, t.x + t.velocity.dx * randomBetween(0.5, 1.5))),
        y: Math.max(5, Math.min(95, t.y + t.velocity.dy * randomBetween(0.5, 1.5))),
        confidence: Math.min(99, Math.max(50, t.confidence + randomBetween(-0.5, 0.5))),
      })),
    });
  },
}));

import { create } from 'zustand';

// ─── 1. Devices ───
export interface Device {
  _id: string;
  device_id: string;
  model: string;
  firmware_version: string;
  ip_address: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: Date;
}

// ─── 2. Telemetry ───
export interface Telemetry {
  device_id: string;
  timestamp: Date;
  stream_index: number;
  position: { azimuth: number; elevation: number; roll: number };
  geo: { lat: number; lon: number; altitude: number };
  sensors: { zoom: number; focus: number; exposure: number };
  raw_channels: { channel: number; value: number }[];
}

// ─── 3. Commands ───
export type CommandClass = 'GIMBAL' | 'CAMERA' | 'SYSTEM' | 'TRACKING';
export interface Command {
  _id: string;
  device_id: string;
  command_class: CommandClass;
  command_code: string;
  payload: Record<string, unknown>;
  issued_by: string;
  timestamp: Date;
}

// ─── 4. Tracking Events ───
export interface TrackingEvent {
  _id: string;
  device_id: string;
  timestamp: Date;
  target_id: string;
  bbox: { x: number; y: number; w: number; h: number };
  confidence: number;
  velocity: { x: number; y: number };
}

// ─── 5. System Logs ───
export type LogType = 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
export interface SystemLog {
  _id: string;
  device_id: string;
  type: LogType;
  code: string;
  message: string;
  timestamp: Date;
}

// ─── 6. Missions ───
export type MissionStatus = 'active' | 'completed' | 'aborted' | 'planned';
export interface Mission {
  mission_id: string;
  start_time: Date;
  end_time: Date | null;
  devices: string[];
  region: string;
  status: MissionStatus;
}

// ─── 7. Target Intelligence ───
export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';
export type Classification = 'hostile' | 'friendly' | 'neutral' | 'unknown';
export interface TargetIntelligence {
  target_id: string;
  classification: Classification;
  threat_level: ThreatLevel;
  first_detected_at: Date;
  last_seen_at: Date;
  movement_pattern: string;
  linked_missions: string[];
}

// ─── 8. Mission Events ───
export type MissionEventType = 'TARGET_LOCK' | 'TARGET_LOST' | 'ZONE_ENTER' | 'ZONE_EXIT' | 'ENGAGEMENT' | 'RECON_START' | 'RECON_END';
export interface MissionEvent {
  _id: string;
  mission_id: string;
  timestamp: Date;
  event_type: MissionEventType;
  device_id: string;
  target_id: string;
  metadata: Record<string, unknown>;
}

// ─── 9. Users (extended) ───
export type UserRole = 'COMMANDER' | 'OPERATOR' | 'ANALYST' | 'ADMIN';
export type ClearanceLevel = 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
export interface MilitaryUser {
  user_id: string;
  role: UserRole;
  clearance_level: ClearanceLevel;
}

// ─── 10. Access Logs ───
export interface AccessLog {
  _id: string;
  user_id: string;
  action: string;
  resource: string;
  timestamp: Date;
}

// ─── 11. Network Sessions ───
export interface NetworkSession {
  _id: string;
  device_id: string;
  protocol: 'UDP' | 'TCP' | 'RTSP';
  latency_ms: number;
  packet_loss: number;
  started_at: Date;
}

// ─── 12. Target Tracks ───
export interface TargetTrack {
  target_id: string;
  trajectory: { lat: number; lon: number; timestamp: Date }[];
  speed: number;
  direction: string;
}

// ─── 13. Alerts ───
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'HIGH_THREAT' | 'PERIMETER_BREACH' | 'SIGNAL_LOSS' | 'LOW_BATTERY' | 'TARGET_DETECTED' | 'SYSTEM_ERROR';
export interface Alert {
  _id: string;
  type: AlertType;
  target_id: string | null;
  severity: AlertSeverity;
  triggered_at: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  message: string;
}

// ─── 14. Geo Zones ───
export type ZoneType = 'RESTRICTED' | 'SURVEILLANCE' | 'SAFE' | 'ENGAGEMENT';
export interface GeoZone {
  zone_id: string;
  type: ZoneType;
  polygon: { lat: number; lon: number }[];
  priority: 'low' | 'medium' | 'high';
}

// ─── 15. Video Events ───
export interface VideoEvent {
  _id: string;
  video_id: string;
  timestamp: Date;
  event: string;
  confidence: number;
}

// ─── 16. Audit Trail ───
export interface AuditEntry {
  _id: string;
  entity: string;
  entity_id: string;
  action: string;
  performed_by: string;
  timestamp: Date;
}

// ─── Camera modes ───
export type CameraMode = 'EO' | 'IR' | 'SPLIT' | 'PIP';
export type TrackingMode = 'MANUAL' | 'AUTO' | 'LOCKED';

// ─── Store ───
export interface DroneState {
  device: Device;
  telemetry: Telemetry;
  commands: Command[];
  trackingEvents: TrackingEvent[];
  systemLogs: SystemLog[];
  missions: Mission[];
  targetIntelligence: TargetIntelligence[];
  missionEvents: MissionEvent[];
  networkSession: NetworkSession;
  targetTracks: TargetTrack[];
  alerts: Alert[];
  geoZones: GeoZone[];
  videoEvents: VideoEvent[];
  auditTrail: AuditEntry[];

  // UI state
  cameraMode: CameraMode;
  trackingMode: TrackingMode;
  selectedTargetId: string | null;

  // Actions
  setCameraMode: (mode: CameraMode) => void;
  setTrackingMode: (mode: TrackingMode) => void;
  selectTarget: (id: string | null) => void;
  acknowledgeAlert: (id: string) => void;
  sendCommand: (commandClass: CommandClass, commandCode: string, payload: Record<string, unknown>) => void;
  updateTelemetry: () => void;
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const now = new Date();
const ago = (ms: number) => new Date(Date.now() - ms);

export const useDroneStore = create<DroneState>((set, get) => ({
  // 1. Device
  device: {
    _id: 'dev_001',
    device_id: 'TCU_001',
    model: 'TC-300-UC',
    firmware_version: '10.9',
    ip_address: '192.168.1.10',
    status: 'active',
    created_at: ago(86400000 * 30),
  },

  // 2. Telemetry
  telemetry: {
    device_id: 'TCU_001',
    timestamp: now,
    stream_index: 0,
    position: { azimuth: 2.308, elevation: 0.23, roll: 0.01 },
    geo: { lat: 18.5204, lon: 73.8567, altitude: 540 },
    sensors: { zoom: 10, focus: 0.8, exposure: 0.5 },
    raw_channels: [
      { channel: 0, value: 2.308 },
      { channel: 1, value: 0.23 },
    ],
  },

  // 3. Commands
  commands: [
    { _id: 'CMD_001', device_id: 'TCU_001', command_class: 'GIMBAL', command_code: 'SET_RATE_AZ', payload: { value: 0.5 }, issued_by: 'operator_1', timestamp: ago(30000) },
    { _id: 'CMD_002', device_id: 'TCU_001', command_class: 'CAMERA', command_code: 'SET_ZOOM', payload: { value: 10 }, issued_by: 'operator_1', timestamp: ago(60000) },
  ],

  // 4. Tracking Events
  trackingEvents: [
    { _id: 'TRK_001', device_id: 'TCU_001', timestamp: ago(120000), target_id: 'TGT_001', bbox: { x: 45, y: 40, w: 8, h: 6 }, confidence: 0.94, velocity: { x: 1.2, y: 0.5 } },
    { _id: 'TRK_002', device_id: 'TCU_001', timestamp: ago(90000), target_id: 'TGT_002', bbox: { x: 70, y: 60, w: 5, h: 5 }, confidence: 0.87, velocity: { x: -0.3, y: 0.8 } },
    { _id: 'TRK_003', device_id: 'TCU_001', timestamp: ago(45000), target_id: 'TGT_003', bbox: { x: 25, y: 70, w: 6, h: 4 }, confidence: 0.72, velocity: { x: 0.5, y: -0.1 } },
  ],

  // 5. System Logs
  systemLogs: [
    { _id: 'LOG_001', device_id: 'TCU_001', type: 'ERROR', code: 'UNKNOWN_CLASS', message: 'Invalid packet received', timestamp: ago(300000) },
    { _id: 'LOG_002', device_id: 'TCU_001', type: 'WARNING', code: 'SIG_DEGRADE', message: 'Signal degradation detected on CH2', timestamp: ago(180000) },
    { _id: 'LOG_003', device_id: 'TCU_001', type: 'INFO', code: 'TRACK_INIT', message: 'Target tracking initialized for TGT_001', timestamp: ago(120000) },
    { _id: 'LOG_004', device_id: 'TCU_001', type: 'INFO', code: 'CMD_EXEC', message: 'GIMBAL SET_RATE_AZ executed', timestamp: ago(30000) },
    { _id: 'LOG_005', device_id: 'TCU_001', type: 'WARNING', code: 'BATT_LOW', message: 'Battery level below 25%', timestamp: ago(15000) },
  ],

  // 6. Missions
  missions: [
    { mission_id: 'MIS_001', start_time: ago(7200000), end_time: ago(3600000), devices: ['TCU_001'], region: 'Sector A', status: 'completed' },
    { mission_id: 'MIS_002', start_time: ago(1800000), end_time: null, devices: ['TCU_001'], region: 'Sector B', status: 'active' },
  ],

  // 7. Target Intelligence
  targetIntelligence: [
    { target_id: 'TGT_001', classification: 'hostile', threat_level: 'high', first_detected_at: ago(600000), last_seen_at: ago(10000), movement_pattern: 'north-east', linked_missions: ['MIS_002'] },
    { target_id: 'TGT_002', classification: 'unknown', threat_level: 'medium', first_detected_at: ago(400000), last_seen_at: ago(30000), movement_pattern: 'stationary', linked_missions: ['MIS_002'] },
    { target_id: 'TGT_003', classification: 'neutral', threat_level: 'low', first_detected_at: ago(200000), last_seen_at: ago(45000), movement_pattern: 'south-west', linked_missions: ['MIS_002'] },
  ],

  // 8. Mission Events
  missionEvents: [
    { _id: 'ME_001', mission_id: 'MIS_002', timestamp: ago(1200000), event_type: 'RECON_START', device_id: 'TCU_001', target_id: '', metadata: {} },
    { _id: 'ME_002', mission_id: 'MIS_002', timestamp: ago(600000), event_type: 'TARGET_LOCK', device_id: 'TCU_001', target_id: 'TGT_001', metadata: { zoom: 20, confidence: 0.95 } },
    { _id: 'ME_003', mission_id: 'MIS_002', timestamp: ago(300000), event_type: 'ZONE_ENTER', device_id: 'TCU_001', target_id: 'TGT_001', metadata: { zone: 'ZONE_1' } },
  ],

  // 11. Network Session
  networkSession: {
    _id: 'NET_001',
    device_id: 'TCU_001',
    protocol: 'UDP',
    latency_ms: 20,
    packet_loss: 0.02,
    started_at: ago(3600000),
  },

  // 12. Target Tracks
  targetTracks: [
    {
      target_id: 'TGT_001',
      trajectory: [
        { lat: 18.5200, lon: 73.8560, timestamp: ago(600000) },
        { lat: 18.5202, lon: 73.8563, timestamp: ago(300000) },
        { lat: 18.5204, lon: 73.8567, timestamp: ago(60000) },
      ],
      speed: 45,
      direction: 'NE',
    },
  ],

  // 13. Alerts
  alerts: [
    { _id: 'ALT_001', type: 'HIGH_THREAT', target_id: 'TGT_001', severity: 'critical', triggered_at: ago(60000), status: 'active', message: 'High threat target TGT_001 approaching restricted zone' },
    { _id: 'ALT_002', type: 'TARGET_DETECTED', target_id: 'TGT_002', severity: 'medium', triggered_at: ago(120000), status: 'active', message: 'New unclassified target detected in Sector B' },
    { _id: 'ALT_003', type: 'SIGNAL_LOSS', target_id: null, severity: 'low', triggered_at: ago(300000), status: 'active', message: 'Intermittent signal degradation on channel 2' },
  ],

  // 14. Geo Zones
  geoZones: [
    { zone_id: 'ZONE_1', type: 'RESTRICTED', polygon: [{ lat: 18.52, lon: 73.85 }, { lat: 18.53, lon: 73.85 }, { lat: 18.53, lon: 73.86 }, { lat: 18.52, lon: 73.86 }], priority: 'high' },
    { zone_id: 'ZONE_2', type: 'SURVEILLANCE', polygon: [{ lat: 18.51, lon: 73.84 }, { lat: 18.52, lon: 73.84 }, { lat: 18.52, lon: 73.85 }, { lat: 18.51, lon: 73.85 }], priority: 'medium' },
  ],

  // 15. Video Events
  videoEvents: [
    { _id: 'VE_001', video_id: 'VID_001', timestamp: ago(180000), event: 'PERSON_DETECTED', confidence: 0.93 },
    { _id: 'VE_002', video_id: 'VID_001', timestamp: ago(120000), event: 'VEHICLE_DETECTED', confidence: 0.89 },
    { _id: 'VE_003', video_id: 'VID_001', timestamp: ago(60000), event: 'MOTION_ALERT', confidence: 0.78 },
  ],

  // 16. Audit Trail
  auditTrail: [
    { _id: 'AUD_001', entity: 'COMMAND', entity_id: 'CMD_001', action: 'EXECUTED', performed_by: 'USR_001', timestamp: ago(30000) },
    { _id: 'AUD_002', entity: 'ALERT', entity_id: 'ALT_001', action: 'TRIGGERED', performed_by: 'SYSTEM', timestamp: ago(60000) },
  ],

  // UI state
  cameraMode: 'EO',
  trackingMode: 'MANUAL',
  selectedTargetId: 'TGT_001',

  // Actions
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setTrackingMode: (mode) => set({ trackingMode: mode }),
  selectTarget: (id) => set({ selectedTargetId: id }),

  acknowledgeAlert: (id) => set((s) => ({
    alerts: s.alerts.map(a => a._id === id ? { ...a, status: 'acknowledged' as const } : a),
  })),

  sendCommand: (commandClass, commandCode, payload) => set((s) => ({
    commands: [
      ...s.commands,
      {
        _id: `CMD_${Date.now()}`,
        device_id: s.device.device_id,
        command_class: commandClass,
        command_code: commandCode,
        payload,
        issued_by: 'operator_1',
        timestamp: new Date(),
      },
    ],
    auditTrail: [
      ...s.auditTrail,
      {
        _id: `AUD_${Date.now()}`,
        entity: 'COMMAND',
        entity_id: `CMD_${Date.now()}`,
        action: 'EXECUTED',
        performed_by: 'operator_1',
        timestamp: new Date(),
      },
    ],
  })),

  updateTelemetry: () => {
    const s = get();
    const t = s.telemetry;
    set({
      telemetry: {
        ...t,
        timestamp: new Date(),
        position: {
          azimuth: t.position.azimuth + randomBetween(-0.01, 0.01),
          elevation: t.position.elevation + randomBetween(-0.005, 0.005),
          roll: t.position.roll + randomBetween(-0.002, 0.002),
        },
        geo: {
          lat: t.geo.lat + randomBetween(-0.0001, 0.0001),
          lon: t.geo.lon + randomBetween(-0.0001, 0.0001),
          altitude: Math.max(0, t.geo.altitude + randomBetween(-2, 2)),
        },
        sensors: {
          ...t.sensors,
          exposure: Math.min(1, Math.max(0, t.sensors.exposure + randomBetween(-0.01, 0.01))),
        },
        raw_channels: t.raw_channels.map(ch => ({
          ...ch,
          value: ch.value + randomBetween(-0.01, 0.01),
        })),
      },
      networkSession: {
        ...s.networkSession,
        latency_ms: Math.max(5, Math.min(100, s.networkSession.latency_ms + randomBetween(-2, 2))),
        packet_loss: Math.max(0, Math.min(0.1, s.networkSession.packet_loss + randomBetween(-0.002, 0.002))),
      },
      trackingEvents: s.trackingEvents.map(te => ({
        ...te,
        bbox: {
          ...te.bbox,
          x: Math.max(5, Math.min(90, te.bbox.x + te.velocity.x * randomBetween(0.3, 0.8))),
          y: Math.max(5, Math.min(90, te.bbox.y + te.velocity.y * randomBetween(0.3, 0.8))),
        },
        confidence: Math.min(0.99, Math.max(0.5, te.confidence + randomBetween(-0.005, 0.005))),
      })),
    });
  },
}));

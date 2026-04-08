import { useEffect, useMemo, useRef, useState } from 'react';
import { useDroneStore } from '@/store/droneStore';
import { TargetOverlay } from './TargetOverlay';
import { CameraModeSwitcher } from './CameraModeSwitcher';

/** Glass-style HUD: low-opacity fill + subtle blur so video stays visible */
const hudPanel =
  'bg-black/8 backdrop-blur-[2px] border border-tactical-green/25 rounded-md shadow-[0_0_14px_rgba(74,222,128,0.12)]';
const hudText = 'text-tactical-green/85';
const hudTextMuted = 'text-white/60';
const hudBtn =
  'border border-tactical-green/30 bg-black/5 hover:bg-tactical-green/10 active:bg-tactical-green/15 transition-colors duration-150';

function FeedCanvas({
  mode,
  className = '',
}: {
  mode: 'EO' | 'IR';
  className?: string;
}) {
  const {
    trackingEvents,
    targetIntelligence,
    selectedTargetId,
    selectTarget,
    telemetry,
    setCameraMode,
    sendCommand,
  } = useDroneStore();

  const VIDEO_SERVER_URL = 'http://localhost:8081';
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showScanline, setShowScanline] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [autoTrack, setAutoTrack] = useState(true);
  const [visionPreset, setVisionPreset] = useState<'DAYVISION' | 'THERMAL' | 'LP' | 'WHOT' | 'BHOT'>('DAYVISION');
  const [jammerOn, setJammerOn] = useState(false);
  const [jammerPower, setJammerPower] = useState(50);
  const [jammerBands, setJammerBands] = useState({
    lBand: true,
    sBand: false,
    cBand: false,
    xBand: false,
    kuBand: false,
    gps: true,
    rf24: false,
  });

  /** RF detector — UI + simulated live readings (replace with API / telemetry later). */
  const [rfDetectorOn, setRfDetectorOn] = useState(true);
  const [rfSweep, setRfSweep] = useState(true);
  const [rfGainDb, setRfGainDb] = useState(24);
  const [rfBandPreset, setRfBandPreset] = useState<'ISM_24' | 'ISM_58' | 'UHF_915' | 'FULL'>('ISM_24');
  const [rfData, setRfData] = useState({
    peakMhz: 2437,
    peakDbm: -43,
    floorDbm: -91,
    snrDb: 26,
    hits: 2,
    bearingDeg: 142,
  });
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rfDetectorOn) return;
    const t = setInterval(() => {
      setRfData((prev) => {
        const jitter = () => (Math.random() - 0.5);
        const base =
          rfBandPreset === 'ISM_24'
            ? 2400 + Math.random() * 83
            : rfBandPreset === 'ISM_58'
              ? 5725 + Math.random() * 150
              : rfBandPreset === 'UHF_915'
                ? 902 + Math.random() * 26
                : 500 + Math.random() * 6500;
        return {
          peakMhz: base + jitter() * 3,
          peakDbm: Math.min(-30, -48 + jitter() * 10 + (rfGainDb - 20) * 0.15),
          floorDbm: -90 + jitter() * 4,
          snrDb: Math.max(8, Math.min(42, prev.snrDb + jitter() * 3)),
          hits: Math.max(0, Math.min(12, Math.round(prev.hits + jitter() * 2))),
          bearingDeg: (prev.bearingDeg + jitter() * 4 + 360) % 360,
        };
      });
    }, 700);
    return () => clearInterval(t);
  }, [rfDetectorOn, rfBandPreset, rfGainDb]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!settingsMenuRef.current) return;
      if (!settingsMenuRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const formatFreq = (mhz: number) =>
    mhz >= 1000 ? `${(mhz / 1000).toFixed(3)} GHz` : `${mhz.toFixed(1)} MHz`;

  const targetLogs = useMemo(
    () => [...trackingEvents].slice(-4).reverse(),
    [trackingEvents],
  );
  const detectorState = selectedTargetId
    ? trackingEvents.find((te) => te.target_id === selectedTargetId) || null
    : null;
  
  // Logic to switch video files based on the camera mode
  const videoSrc = mode === 'IR' 
    ? `${VIDEO_SERVER_URL}/night_vision_drone.mp4` 
    : `${VIDEO_SERVER_URL}/day_vision_drone.mp4`;

  // Determine background based on mode (fallback if video fails)
  const bgClass =
    mode === 'IR'
      ? 'bg-[#0d1117]'
      : 'bg-[#0f1923]';
  const videoFilter =
    visionPreset === 'THERMAL'
      ? 'grayscale(1) brightness(1.22) contrast(1.16)'
      : visionPreset === 'LP'
        ? 'brightness(1.3) contrast(0.92) saturate(0.8)'
        : visionPreset === 'WHOT'
          ? 'grayscale(1) brightness(1.35) contrast(1.25)'
          : visionPreset === 'BHOT'
            ? 'grayscale(1) invert(1) brightness(1.12) contrast(1.2)'
            : mode === 'IR'
              ? 'grayscale(1) brightness(1.2) contrast(1.1)'
              : 'none';

  const movePTZ = (az: number, el: number) => {
    if (az !== 0) sendCommand('GIMBAL', 'SET_RATE_AZ', { value: az });
    if (el !== 0) sendCommand('GIMBAL', 'SET_RATE_EL', { value: el });
  };

  const zoomBy = (delta: number) => {
    const nextZoom = Math.max(1, Math.min(30, telemetry.sensors.zoom + delta));
    sendCommand('CAMERA', 'SET_ZOOM', { value: Number(nextZoom.toFixed(1)) });
  };

  const toggleBand = (band: keyof typeof jammerBands) => {
    setJammerBands((prev) => ({ ...prev, [band]: !prev[band] }));
  };

  return (
    <div className={`relative w-full h-full overflow-visible ${bgClass} ${className}`}>
      {/* ================= VIDEO FEED ================= */}
      <video
        key={mode} // Key ensures React remounts the video tag when switching files
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        style={{ 
          transform: 'translateZ(0)',
          // Thermal/palette effects based on selected vision preset
          filter: videoFilter,
        }}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
        onLoadedData={() => console.log(`${mode} VIDEO LOADED ✅`)}
        onError={(e) => console.error(`${mode} VIDEO ERROR ❌ Source: ${videoSrc}`)}
      />

      {/* OVERLAY LAYER (Static Graphics) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Soft vignette for consistent contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.18)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-24 h-24 bg-gradient-to-t from-black/25 to-transparent" />

        {/* Scanline & Grid */}
        {showScanline && <div className="absolute inset-0 scanline opacity-20" />}
        {showGrid && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--tactical-green) / 0.05) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--tactical-green) / 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        )}

        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-16 h-16">
            {showCrosshair && (
              <>
                <div className="absolute top-0 left-1/2 -translate-x-px w-0.5 h-5 bg-tactical-green/25" />
                <div className="absolute bottom-0 left-1/2 -translate-x-px w-0.5 h-5 bg-tactical-green/25" />
                <div className="absolute left-0 top-1/2 -translate-y-px h-0.5 w-5 bg-tactical-green/25" />
                <div className="absolute right-0 top-1/2 -translate-y-px h-0.5 w-5 bg-tactical-green/25" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* INTERACTIVE UI LAYER (Allows Clicks) */}
      <div className="absolute inset-0 z-20">
        {/* Camera mode label */}
        <div className="absolute top-3 left-3">
          <div
            className={`px-2.5 py-1 text-[11px] font-mono font-bold border backdrop-blur-[1px] bg-black/5 ${
              mode === 'IR'
                ? 'border-tactical-amber/50 text-tactical-amber/90'
                : 'border-tactical-green/50 text-tactical-green/90'
            }`}
          >
            {mode === 'IR' ? '■ FLIR / THERMAL' : '■ EO / DAYLIGHT'}
          </div>
        </div>

        {/* Mission HUD block */}
        <div
          className={`absolute top-10 left-3 ${hudPanel} px-2.5 py-1.5 font-mono text-[10px] ${hudText} leading-tight`}
        >
          <div className="text-tactical-green/80">OPS // EAGLE-EYE</div>
          <div>STATUS: LIVE</div>
          <div>FPS: 60</div>
          <div>SIGNAL: 98%</div>
        </div>

        {/* Top-right telemetry and settings */}
        <div className="absolute top-3 right-3 z-40 flex items-start gap-2" ref={settingsMenuRef}>
          <div
            className={`text-right font-mono text-[10px] ${hudText} ${hudPanel} px-2.5 py-1.5`}
          >
            <div>AZ {telemetry.position.azimuth.toFixed(2)}° EL {telemetry.position.elevation.toFixed(2)}°</div>
            <div>ZOOM {telemetry.sensors.zoom}x</div>
          </div>
          <div className="relative pointer-events-auto">
            <button
              type="button"
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={`h-8 w-8 rounded-sm ${hudBtn} text-white/55 hover:text-white/75 text-base`}
              aria-label="System settings"
              title="System settings"
            >
              ⚙
            </button>
            {settingsOpen && (
              <div
                className={`absolute right-0 mt-1 w-56 ${hudPanel} p-2.5 rounded-sm font-mono text-[11px] ${hudText}`}
              >
                <div className="mb-1 text-tactical-green/80 text-[10px]">SYSTEM SETTINGS</div>
                <label className="flex items-center justify-between py-0.5">
                  <span>Grid Overlay</span>
                  <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between py-0.5">
                  <span>Scanline FX</span>
                  <input type="checkbox" checked={showScanline} onChange={(e) => setShowScanline(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between py-0.5">
                  <span>Crosshair</span>
                  <input type="checkbox" checked={showCrosshair} onChange={(e) => setShowCrosshair(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between py-0.5">
                  <span>Auto Track</span>
                  <input type="checkbox" checked={autoTrack} onChange={(e) => setAutoTrack(e.target.checked)} />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* In-feed quick settings */}
          <div className="absolute top-12 right-3 z-30">
          <div className={`${hudPanel} px-2 py-1 rounded-sm`}>
            <div className={`text-[10px] ${hudTextMuted} font-mono mb-1 tracking-wide`}>CAMERA MODE</div>
            <CameraModeSwitcher />
          </div>
        </div>

        {/* Target boxes */}
        {trackingEvents.map((te) => (
          <TargetOverlay
            key={te._id}
            trackingEvent={te}
            intel={targetIntelligence.find(ti => ti.target_id === te.target_id) || null}
            selected={te.target_id === selectedTargetId}
            onClick={() => selectTarget(te.target_id)}
            isIR={mode === 'IR'}
          />
        ))}

        {/* Status Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 ${hudPanel} border-b-0 border-x-0 px-3 py-1.5 flex justify-between backdrop-blur-[3px]`}
        >
          <span className={`font-mono text-[10px] ${hudTextMuted}`}>
            LAT {telemetry.geo.lat.toFixed(4)} LON {telemetry.geo.lon.toFixed(4)}
          </span>
          <span className="font-mono text-[10px] text-tactical-green/75">
            {trackingEvents.length} TRACKED
          </span>
        </div>

        {/* Left-bottom: RF detector above PTZ / vision / jammer */}
        <div className="absolute left-3 bottom-8 z-40 flex flex-col items-start gap-2 pointer-events-auto max-w-[calc(100vw-1.5rem)]">
          <div className={`${hudPanel} p-2.5 font-mono text-[10px] ${hudText} w-full min-w-[19rem]`}>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-tactical-green/80 font-semibold tracking-wide">RF DETECTOR</span>
              <button
                type="button"
                onClick={() => {
                  setRfDetectorOn((v) => !v);
                  sendCommand('SYSTEM', 'RF_DETECTOR_POWER', { on: !rfDetectorOn });
                }}
                className={`px-2 py-1 text-[9px] ${hudBtn} ${rfDetectorOn ? 'border-tactical-green/40 text-tactical-green/90' : ''}`}
              >
                {rfDetectorOn ? 'ON' : 'STBY'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-1.5">
              <button
                type="button"
                onClick={() => {
                  setRfSweep((s) => !s);
                  sendCommand('SYSTEM', 'RF_DETECTOR_SWEEP', { enabled: !rfSweep });
                }}
                className={`px-2 py-1 text-[9px] ${hudBtn} ${rfSweep ? 'border-tactical-amber/40 text-tactical-amber/85' : ''}`}
              >
                SWEEP {rfSweep ? '●' : '○'}
              </button>
              {(['ISM_24', 'ISM_58', 'UHF_915', 'FULL'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setRfBandPreset(b);
                    sendCommand('SYSTEM', 'RF_DETECTOR_BAND', { preset: b });
                  }}
                  className={`px-2 py-1 text-[8px] ${hudBtn} ${
                    rfBandPreset === b ? 'border-tactical-green/45 text-tactical-green/90' : ''
                  }`}
                >
                  {b === 'ISM_24'
                    ? '2.4G'
                    : b === 'ISM_58'
                      ? '5.8G'
                      : b === 'UHF_915'
                        ? '915M'
                        : 'FULL'}
                </button>
              ))}
            </div>
            <div className="mb-1.5">
              <div className="flex justify-between text-[9px] mb-0.5">
                <span>GAIN</span>
                <span>{rfGainDb} dB</span>
              </div>
              <input
                type="range"
                min={0}
                max={48}
                step={1}
                value={rfGainDb}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setRfGainDb(v);
                  sendCommand('SYSTEM', 'RF_DETECTOR_GAIN', { db: v });
                }}
                className="w-full h-1 opacity-80"
              />
            </div>
            <div
              className={`border-t border-white/10 pt-1.5 mt-0.5 space-y-0.5 ${!rfDetectorOn ? 'opacity-40' : ''}`}
            >
              <div className="text-[9px] text-tactical-green/70 mb-0.5">RF DATA</div>
              <div className="flex justify-between gap-2">
                <span className={hudTextMuted}>PEAK</span>
                <span className="text-white/75 tabular-nums">
                  {formatFreq(rfData.peakMhz)} @ {rfData.peakDbm.toFixed(1)} dBm
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className={hudTextMuted}>FLOOR</span>
                <span className="text-white/75 tabular-nums">{rfData.floorDbm.toFixed(1)} dBm</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className={hudTextMuted}>SNR</span>
                <span className="text-white/75 tabular-nums">{rfData.snrDb.toFixed(1)} dB</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className={hudTextMuted}>AZ (RF)</span>
                <span className="text-white/75 tabular-nums">{rfData.bearingDeg.toFixed(0)}°</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className={hudTextMuted}>HITS</span>
                <span className="text-tactical-amber/80 tabular-nums">{rfData.hits}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2 flex-wrap">
          {/* PTZ controller */}
          <div className={`w-44 ${hudPanel} p-2.5 font-mono text-[10px] ${hudText}`}>
            <div className="text-tactical-green/80 mb-1">PTZ CONTROLLER</div>
            <div className="grid grid-cols-3 gap-1">
              <button onClick={() => movePTZ(-0.05, 0.05)} className={`h-8 ${hudBtn} text-white/65`}>↖</button>
              <button onClick={() => movePTZ(0, 0.05)} className={`h-8 ${hudBtn} text-white/65`}>↑</button>
              <button onClick={() => movePTZ(0.05, 0.05)} className={`h-8 ${hudBtn} text-white/65`}>↗</button>
              <button onClick={() => movePTZ(-0.05, 0)} className={`h-8 ${hudBtn} text-white/65`}>←</button>
              <button onClick={() => sendCommand('GIMBAL', 'RESET', {})} className={`h-8 ${hudBtn} text-white/65`}>•</button>
              <button onClick={() => movePTZ(0.05, 0)} className={`h-8 ${hudBtn} text-white/65`}>→</button>
              <button onClick={() => movePTZ(-0.05, -0.05)} className={`h-8 ${hudBtn} text-white/65`}>↙</button>
              <button onClick={() => movePTZ(0, -0.05)} className={`h-8 ${hudBtn} text-white/65`}>↓</button>
              <button onClick={() => movePTZ(0.05, -0.05)} className={`h-8 ${hudBtn} text-white/65`}>↘</button>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <button onClick={() => zoomBy(1)} className={`h-8 ${hudBtn} text-white/65`}>ZOOM +</button>
              <button onClick={() => zoomBy(-1)} className={`h-8 ${hudBtn} text-white/65`}>ZOOM -</button>
            </div>
            <div className={`mt-1 ${hudTextMuted}`}>AZ {telemetry.position.azimuth.toFixed(2)} | EL {telemetry.position.elevation.toFixed(2)}</div>
          </div>

          {/* Vision toggles */}
          <div className={`w-32 ${hudPanel} p-2.5 font-mono text-[10px] ${hudText}`}>
            <div className="text-tactical-green/80 mb-1">VISION</div>
            <div className="space-y-1">
              <button onClick={() => { setVisionPreset('DAYVISION'); setCameraMode('EO'); }} className={`w-full h-7 ${hudBtn} ${visionPreset === 'DAYVISION' ? 'border-tactical-green/50 text-tactical-green/90' : ''}`}>DAYVISION</button>
              <button onClick={() => { setVisionPreset('THERMAL'); setCameraMode('IR'); }} className={`w-full h-7 ${hudBtn} ${visionPreset === 'THERMAL' ? 'border-tactical-green/50 text-tactical-green/90' : ''}`}>THERMAL</button>
              <button onClick={() => setVisionPreset('LP')} className={`w-full h-7 ${hudBtn} ${visionPreset === 'LP' ? 'border-tactical-green/50 text-tactical-green/90' : ''}`}>LP</button>
              <button onClick={() => setVisionPreset('WHOT')} className={`w-full h-7 ${hudBtn} ${visionPreset === 'WHOT' ? 'border-tactical-green/50 text-tactical-green/90' : ''}`}>WHOT</button>
              <button onClick={() => setVisionPreset('BHOT')} className={`w-full h-7 ${hudBtn} ${visionPreset === 'BHOT' ? 'border-tactical-green/50 text-tactical-green/90' : ''}`}>BHOT</button>
            </div>
          </div>

          {/* Jammer controls (behind/next in stack) */}
          <div className={`w-60 ${hudPanel} p-2.5 font-mono text-[10px] ${hudText}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-tactical-green/80">JAMMER CONTROL</span>
              <button
                onClick={() => setJammerOn((prev) => !prev)}
                className={`px-2 py-1 ${hudBtn} ${jammerOn ? 'border-red-400/50 text-red-300/90' : ''}`}
              >
                {jammerOn ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="mb-1">
              <div className="flex items-center justify-between">
                <span>POWER</span>
                <span>{jammerPower}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={jammerPower}
                onChange={(e) => setJammerPower(parseInt(e.target.value, 10))}
                className="w-full h-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button onClick={() => toggleBand('lBand')} className={`h-7 ${hudBtn} ${jammerBands.lBand ? 'border-red-400/45 text-red-300/85' : ''}`}>L BAND</button>
              <button onClick={() => toggleBand('sBand')} className={`h-7 ${hudBtn} ${jammerBands.sBand ? 'border-red-400/45 text-red-300/85' : ''}`}>S BAND</button>
              <button onClick={() => toggleBand('cBand')} className={`h-7 ${hudBtn} ${jammerBands.cBand ? 'border-red-400/45 text-red-300/85' : ''}`}>C BAND</button>
              <button onClick={() => toggleBand('xBand')} className={`h-7 ${hudBtn} ${jammerBands.xBand ? 'border-red-400/45 text-red-300/85' : ''}`}>X BAND</button>
              <button onClick={() => toggleBand('kuBand')} className={`h-7 ${hudBtn} ${jammerBands.kuBand ? 'border-red-400/45 text-red-300/85' : ''}`}>KU BAND</button>
              <button onClick={() => toggleBand('gps')} className={`h-7 ${hudBtn} ${jammerBands.gps ? 'border-red-400/45 text-red-300/85' : ''}`}>GPS</button>
              <button onClick={() => toggleBand('rf24')} className={`h-7 ${hudBtn} ${jammerBands.rf24 ? 'border-red-400/45 text-red-300/85' : ''} col-span-2`}>2.4GHZ RF</button>
            </div>
          </div>
          </div>
        </div>

        {/* Detector panel (above target logs) */}
        <div className={`absolute right-3 bottom-24 w-64 ${hudPanel} p-2.5 font-mono text-[10px] ${hudText}`}>
          <div className="text-tactical-green/80 mb-1">DETECTOR</div>
          <div>MODE: {mode === 'IR' ? 'THERMAL' : 'VISUAL'}</div>
          <div>ACTIVE TARGETS: {trackingEvents.length}</div>
          <div>AUTO TRACK: {autoTrack ? 'ON' : 'OFF'}</div>
          <div>
            LOCK: {detectorState ? detectorState.target_id : 'NONE'}
          </div>
        </div>

        {/* Target logs at bottom-right */}
        <div className={`absolute right-3 bottom-8 w-64 ${hudPanel} p-2.5 font-mono text-[10px] ${hudText}`}>
          <div className="text-tactical-green/80 mb-1">TARGET LOGS</div>
          {targetLogs.length === 0 && <div className={hudTextMuted}>No detections</div>}
          {targetLogs.map((log) => (
            <div key={log._id} className="flex items-center justify-between border-t border-white/10 py-0.5">
              <span>{log.target_id}</span>
              <span className="text-tactical-amber/80">{Math.round(log.confidence * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LiveFeedViewer() {
  const { cameraMode } = useDroneStore();

  return (
    <div className="h-full w-full bg-black relative">
      {cameraMode === 'EO' && <FeedCanvas mode="EO" className="absolute inset-0" />}
      {cameraMode === 'IR' && <FeedCanvas mode="IR" className="absolute inset-0" />}
      {cameraMode === 'SPLIT' && (
        <div className="absolute inset-0 flex">
          <FeedCanvas mode="EO" className="flex-1 border-r border-white/10" />
          <FeedCanvas mode="IR" className="flex-1" />
        </div>
      )}
      {cameraMode === 'PIP' && (
        <>
          <FeedCanvas mode="EO" className="absolute inset-0" />
          <div className="absolute bottom-12 right-3 w-[30%] aspect-video border border-white/12 bg-black/5 backdrop-blur-[1px] shadow-none z-30">
            <FeedCanvas mode="IR" className="w-full h-full" />
          </div>
        </>
      )}
    </div>
  );
}
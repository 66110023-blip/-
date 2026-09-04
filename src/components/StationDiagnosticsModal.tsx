import React, { useState } from 'react';
import { FloorStation, MachineStatus } from '../types';
import { CATEGORY_METADATA } from '../data/defaultCadLayout';
import { useFactory } from '../context/FactoryContext';
import { normalizeAoiMachineId, normalizeXrayMachineId } from '../utils/machineLinkUtils';
import { MachineUphBarChart } from './MachineUphBarChart';
import {
  X,
  Activity,
  Gauge,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Flame,
  Wind,
  Layers,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Power,
  RefreshCw,
} from 'lucide-react';

interface StationDiagnosticsModalProps {
  station: FloorStation | null;
  onClose: () => void;
  onUpdateStation: (updated: FloorStation) => void;
}

export const StationDiagnosticsModal: React.FC<StationDiagnosticsModalProps> = ({
  station,
  onClose,
  onUpdateStation,
}) => {
  const { navigate, machines, ovenUnits, updateMachineStatus, updateOvenStatus } = useFactory();
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);

  if (!station) return null;

  const meta = CATEGORY_METADATA[station.category] || CATEGORY_METADATA.dispensing;

  // Find linked machine if any
  const linkedMachine = machines.find((m) => m.id === station.linkedMachineId);
  const linkedOven = ovenUnits.find((o) => o.id === station.linkedOvenId);

  const effectiveStatus = linkedMachine?.status || linkedOven?.status || station.status || 'RUNNING';
  const effectiveOee = linkedMachine?.oeePercent || station.oeePercent || 96.0;

  const handleStatusChange = (newStatus: MachineStatus) => {
    if (station.linkedMachineId) {
      updateMachineStatus(station.linkedMachineId, newStatus);
    } else if (station.linkedOvenId) {
      updateOvenStatus(station.linkedOvenId, newStatus);
    }
    onUpdateStation({ ...station, status: newStatus });
  };

  const handleTriggerCalibration = () => {
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
      setCalibrationSuccess(true);
      const updated: FloorStation = {
        ...station,
        calibrationOffset: {
          xMm: 0.0,
          yMm: 0.0,
          rotationDeg: 0.0,
          lastCalibrated: new Date().toISOString().replace('T', ' ').slice(0, 16),
        },
      };
      onUpdateStation(updated);
      setTimeout(() => setCalibrationSuccess(false), 3000);
    }, 1200);
  };

  const handleNavigateToDetail = () => {
    onClose();
    if (station.category === 'dispensing') {
      navigate('machine-detail', station.linkedMachineId || 'MC-04');
    } else if (station.category === 'oven-vacuum') {
      navigate('vacuum-process');
    } else if (station.category === 'oven-bake') {
      navigate('bake-process');
    } else if (station.category === 'fvmi') {
      navigate('fvmi-detail');
    } else if (station.category === 'xray' || station.category === 'ocr') {
      const xrayId = normalizeXrayMachineId(station.linkedOcrId || station.code || station.id);
      navigate('packout-xray', xrayId);
    } else if (station.category === 'aoi' || station.category === 'packout') {
      const aoiId = normalizeAoiMachineId(station.linkedPackoutId || station.code || station.id);
      navigate('packout-aoi', aoiId);
    } else {
      navigate('process-view');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-mono font-black text-sm shadow-xs"
              style={{ backgroundColor: meta.color }}
            >
              {station.code.slice(0, 3)}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-[#0f172a] font-mono">
                  {station.code} • {station.name}
                </h2>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${meta.badgeClass}`}
                >
                  {station.line} • {meta.label}
                </span>
              </div>
              <p className="text-xs text-[#64748b] font-medium truncate">
                Real-Time CAD Telemetry & Sensor Calibration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Status Control Bar */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-[#475569]" />
              <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">
                Operating State:
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {(['RUNNING', 'IDLE', 'STOP', 'JAM_CLEAR'] as MachineStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    effectiveStatus === st
                      ? st === 'RUNNING'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : st === 'STOP'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : st === 'JAM_CLEAR'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-[#64748b] border border-[#cbd5e1] hover:bg-[#f1f5f9]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* OEE Breakdown Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4" style={{ color: meta.color }} />
                Overall Equipment Effectiveness (OEE)
              </span>
              <span
                className="text-xs font-mono font-bold px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: `${meta.color}15`,
                  borderColor: `${meta.color}40`,
                  color: meta.color,
                }}
              >
                Target: ≥95.0%
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              <div
                className="border p-3 rounded-xl"
                style={{
                  backgroundColor: `${meta.color}12`,
                  borderColor: `${meta.color}40`,
                }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: meta.color }}
                >
                  Overall OEE
                </span>
                <span
                  className="font-mono font-black text-xl"
                  style={{ color: meta.color }}
                >
                  {effectiveOee.toFixed(1)}%
                </span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, effectiveOee)}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>

              <div
                className="border p-3 rounded-xl bg-white"
                style={{ borderColor: `${meta.color}25` }}
              >
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  Availability
                </span>
                <span className="font-mono font-black text-lg text-[#0f172a]">
                  {effectiveStatus === 'STOP' ? '0.0%' : '98.4%'}
                </span>
                <span className="text-[9px] text-[#64748b] block mt-1">Uptime 7h 45m</span>
              </div>

              <div
                className="border p-3 rounded-xl bg-white"
                style={{ borderColor: `${meta.color}25` }}
              >
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  Performance
                </span>
                <span className="font-mono font-black text-lg text-[#0f172a]">
                  {effectiveStatus === 'STOP' ? '0.0%' : '97.2%'}
                </span>
                <span className="text-[9px] text-[#64748b] block mt-1">
                  {station.cycleTimeSec ? `${station.cycleTimeSec}s / cycle` : 'Target 3.8s'}
                </span>
              </div>

              <div
                className="border p-3 rounded-xl bg-white"
                style={{ borderColor: `${meta.color}25` }}
              >
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  Quality Yield
                </span>
                <span className="font-mono font-black text-lg text-[#0f172a]">99.8%</span>
                <span className="text-[9px] text-[#64748b] block mt-1">0.2% Reject Rate</span>
              </div>
            </div>
          </div>

          {/* Real-time Hourly UPH Bar Chart with Downtime Click */}
          <MachineUphBarChart
            machineId={station.linkedMachineId || station.code}
            machineName={station.name}
            currentUph={linkedMachine?.uph || 950}
            targetUph={1000}
            status={effectiveStatus}
            downtimeReason={linkedMachine?.downtimeReason}
            downtimeDurationMins={linkedMachine?.downtimeDurationMins}
            downtimeHistory={linkedMachine?.downtimeHistory}
            themeColor={
              station.category === 'fvmi'
                ? 'orange'
                : station.category === 'aoi' || station.category === 'packout'
                ? 'purple'
                : station.category === 'xray' || station.category === 'ocr'
                ? 'pink'
                : 'sky'
            }
            title={`${station.code} - Hourly UPH Output & Downtime Breakdown`}
          />

          {/* Real-time Sensor Telemetry Readings */}
          <div>
            <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Activity className="w-4 h-4" style={{ color: meta.color }} />
              Live Sensor Telemetry
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <div
                className="border p-3 rounded-xl space-y-1 bg-white"
                style={{
                  backgroundColor: `${meta.color}08`,
                  borderColor: `${meta.color}30`,
                }}
              >
                <div className="flex items-center justify-between text-xs text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" style={{ color: meta.color }} /> Temp
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-600">NORMAL</span>
                </div>
                <div className="font-mono font-bold text-lg text-[#0f172a]">
                  {station.sensorTelemetry?.temperatureC ?? (linkedOven?.tempCelsius || 24.5)} °C
                </div>
                <span className="text-[9.5px] text-[#64748b] block">Setpoint: 24.0°C ± 2°C</span>
              </div>

              <div
                className="border p-3 rounded-xl space-y-1 bg-white"
                style={{
                  backgroundColor: `${meta.color}08`,
                  borderColor: `${meta.color}30`,
                }}
              >
                <div className="flex items-center justify-between text-xs text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" style={{ color: meta.color }} /> Pressure
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-600">STABLE</span>
                </div>
                <div className="font-mono font-bold text-lg text-[#0f172a]">
                  {station.sensorTelemetry?.pressureKpa ?? 312} kPa
                </div>
                <span className="text-[9.5px] text-[#64748b] block">Main Line: 6.2 bar</span>
              </div>

              <div
                className="border p-3 rounded-xl space-y-1 bg-white"
                style={{
                  backgroundColor: `${meta.color}08`,
                  borderColor: `${meta.color}30`,
                }}
              >
                <div className="flex items-center justify-between text-xs text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" style={{ color: meta.color }} /> Vibration RMS
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-600">&lt; 0.50</span>
                </div>
                <div className="font-mono font-bold text-lg text-[#0f172a]">
                  {station.sensorTelemetry?.vibrationMmS ?? 0.38} mm/s
                </div>
                <span className="text-[9.5px] text-[#64748b] block">Harmonic FFT normal</span>
              </div>
            </div>
          </div>

          {/* Zero-Cal Calibration Routine Section */}
          <div
            className="border p-4 rounded-xl space-y-3"
            style={{
              backgroundColor: `${meta.color}0a`,
              borderColor: `${meta.color}35`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: meta.color }}
                >
                  <ShieldCheck className="w-4 h-4" style={{ color: meta.color }} />
                  Kinematic Calibration & Zero-Cal Offsets
                </h4>
                <p className="text-[11px] font-medium text-slate-600">
                  Last calibrated:{' '}
                  <strong>{station.calibrationOffset?.lastCalibrated || '2026-08-16 08:00'}</strong>
                </p>
              </div>

              <button
                onClick={handleTriggerCalibration}
                disabled={calibrating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: meta.color }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${calibrating ? 'animate-spin' : ''}`} />
                <span>{calibrating ? 'Calibrating...' : 'Trigger Zero-Cal'}</span>
              </button>
            </div>

            {calibrationSuccess && (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-medium p-2.5 rounded-lg flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero-Calibration routine completed successfully. Machine offsets reset to nominal.</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div
                className="bg-white p-2 rounded-lg border"
                style={{ borderColor: `${meta.color}30` }}
              >
                <span className="text-[#64748b] text-[10px] block">X-Axis Offset</span>
                <span className="font-bold text-[#0f172a]">
                  {station.calibrationOffset?.xMm ?? 0.0} mm
                </span>
              </div>

              <div
                className="bg-white p-2 rounded-lg border"
                style={{ borderColor: `${meta.color}30` }}
              >
                <span className="text-[#64748b] text-[10px] block">Y-Axis Offset</span>
                <span className="font-bold text-[#0f172a]">
                  {station.calibrationOffset?.yMm ?? 0.0} mm
                </span>
              </div>

              <div
                className="bg-white p-2 rounded-lg border"
                style={{ borderColor: `${meta.color}30` }}
              >
                <span className="text-[#64748b] text-[10px] block">Theta Rotation</span>
                <span className="font-bold text-[#0f172a]">
                  {station.calibrationOffset?.rotationDeg ?? 0.0}°
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl text-xs font-bold text-[#475569] transition-colors cursor-pointer"
          >
            Close Diagnostics
          </button>

          <button
            onClick={handleNavigateToDetail}
            className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            style={{ backgroundColor: meta.color }}
          >
            <span>Open Dedicated Station View</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

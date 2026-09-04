import React, { useState } from 'react';
import {
  FloorStation,
  StationCategory,
  ProductionLine,
  SnapGridSize,
} from '../types';
import { CATEGORY_METADATA } from '../data/defaultCadLayout';
import { useFactory } from '../context/FactoryContext';
import { normalizeAoiMachineId, normalizeXrayMachineId } from '../utils/machineLinkUtils';
import {
  X,
  Sliders,
  Move,
  Maximize2,
  Copy,
  Trash2,
  RotateCcw,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Link,
  Target,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { MachineUphBarChart, ThemeColor } from './MachineUphBarChart';

interface StationInspectorDrawerProps {
  station: FloorStation | null;
  onClose: () => void;
  onUpdate: (updatedStation: FloorStation, addToHistory?: boolean) => void;
  onClone: (station: FloorStation) => void;
  onDelete: (stationId: string) => void;
  onResetStation: (stationId: string) => void;
}

export const StationInspectorDrawer: React.FC<StationInspectorDrawerProps> = ({
  station,
  onClose,
  onUpdate,
  onClone,
  onDelete,
  onResetStation,
}) => {
  const { machines, ovenUnits, navigate, setSelectedMachineId } = useFactory();
  const [nudgeStep, setNudgeStep] = React.useState<number>(0.5);

  if (!station) return null;

  const handleDirectNavigate = () => {
    onClose();
    if (station.category === 'dispensing') {
      navigate('machine-detail', station.linkedMachineId || station.code || 'MC-01');
    } else if (station.category === 'oven-vacuum') {
      navigate('vacuum-process');
    } else if (station.category === 'oven-bake') {
      navigate('bake-process');
    } else if (station.category === 'fvmi') {
      const fvmiCode = station.code?.startsWith('FVMI') ? station.code : 'FVMI-01';
      setSelectedMachineId(fvmiCode);
      navigate('fvmi-detail', fvmiCode);
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

  const meta = CATEGORY_METADATA[station.category] || CATEGORY_METADATA.dispensing;

  const handleNudge = (dx: number, dy: number) => {
    const newX = Math.max(0, Math.min(100 - station.w, Number((station.x + dx).toFixed(2))));
    const newY = Math.max(0, Math.min(100 - station.h, Number((station.y + dy).toFixed(2))));
    onUpdate({ ...station, x: newX, y: newY }, true);
  };

  const handleCoordinateChange = (field: 'x' | 'y' | 'w' | 'h', val: number) => {
    const clamped = Math.max(
      field === 'w' || field === 'h' ? 2 : 0,
      Math.min(field === 'w' || field === 'h' ? 40 : 100, val)
    );
    onUpdate({ ...station, [field]: Number(clamped.toFixed(1)) }, true);
  };

  return (
    <div className="fixed top-20 right-4 bottom-14 z-40 w-88 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-[#cbd5e1] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0"
            style={{ backgroundColor: meta.color }}
          />
          <div className="min-w-0">
            <h3 className="font-mono font-black text-sm text-[#0f172a] truncate">
              {station.code}
            </h3>
            <p className="text-[10px] text-[#64748b] font-medium truncate">
              WYSIWYG Inspector & Calibration
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-colors cursor-pointer"
          aria-label="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic Metadata */}
        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
              Station Code & Identifier
            </label>
            <input
              type="text"
              value={station.code}
              onChange={(e) => onUpdate({ ...station, code: e.target.value.toUpperCase() }, true)}
              className="w-full font-mono text-xs font-bold px-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={station.name}
              onChange={(e) => onUpdate({ ...station, name: e.target.value }, true)}
              className="w-full text-xs font-medium px-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Line Assignment
              </label>
              <select
                value={station.line}
                onChange={(e) => onUpdate({ ...station, line: e.target.value as any }, true)}
                className="w-full font-mono text-xs font-bold px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a]"
              >
                <option value="L1">Line 1 (L1)</option>
                <option value="L2">Line 2 (L2)</option>
                <option value="L3">Line 3 (L3)</option>
                <option value="L4">Line 4 (L4)</option>
                <option value="L5">Line 5 (L5)</option>
                <option value="L6">Line 6 (L6)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={station.category}
                onChange={(e) => onUpdate({ ...station, category: e.target.value as StationCategory }, true)}
                className="w-full text-xs font-medium px-2 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a]"
              >
                <option value="dispensing">Dispensing (Cyan)</option>
                <option value="fvmi">FVMI Inspection (Orange)</option>
                <option value="aoi">AOI Machine (Purple)</option>
                <option value="xray">X-ray Machine (Pink)</option>
                <option value="oven-vacuum">Vacuum Oven (Green)</option>
                <option value="oven-bake">Bake Oven (Yellow)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real-time Hourly UPH Bar Chart with 2 shades (Dark/Light) & Downtime Drilldown */}
        <div
          className="border p-3.5 rounded-xl space-y-2 bg-white"
          style={{
            borderColor: `${meta.color}35`,
            boxShadow: `0 2px 8px ${meta.color}08`,
          }}
        >
          <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: `${meta.color}20` }}>
            <span className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: meta.color }}>
              <BarChart3 className="w-3.5 h-3.5" style={{ color: meta.color }} />
              Hourly UPH Telemetry
            </span>
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
              style={{
                backgroundColor: `${meta.color}15`,
                borderColor: `${meta.color}35`,
                color: meta.color,
              }}
            >
              2-SHADE DOWNTIME
            </span>
          </div>

          <MachineUphBarChart
            machineId={station.linkedMachineId || station.linkedOvenId || station.code}
            machineName={station.name || station.code}
            currentUph={station.uph ?? (station.status === 'STOP' ? 0 : 950)}
            targetUph={station.targetUph ?? 1000}
            status={station.status || 'RUNNING'}
            downtimeReason={station.downtimeReason}
            downtimeDurationMins={station.downtimeDurationMins}
            downtimeHistory={station.downtimeHistory}
            colorTheme={
              station.category === 'dispensing'
                ? 'sky'
                : station.category === 'fvmi'
                ? 'orange'
                : station.category === 'aoi' || station.category === 'packout'
                ? 'purple'
                : station.category === 'xray' || station.category === 'ocr'
                ? 'pink'
                : station.category === 'oven-vacuum'
                ? 'emerald'
                : 'amber'
            }
            showCardWrapper={false}
          />
        </div>

        {/* Precision Coordinate Sliders & Inputs */}
        <div
          className="border p-3.5 rounded-xl space-y-3 bg-white"
          style={{
            borderColor: `${meta.color}35`,
            boxShadow: `0 2px 8px ${meta.color}08`,
          }}
        >
          <div
            className="flex items-center justify-between border-b pb-2"
            style={{ borderColor: `${meta.color}25` }}
          >
            <span
              className="text-[11px] font-bold flex items-center gap-1.5"
              style={{ color: meta.color }}
            >
              <Move className="w-3.5 h-3.5" style={{ color: meta.color }} />
              CAD Coordinates & Scale (%)
            </span>
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
              style={{
                backgroundColor: `${meta.color}15`,
                borderColor: `${meta.color}35`,
                color: meta.color,
              }}
            >
              X/Y/W/H
            </span>
          </div>

          {/* X Coordinate */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-[#64748b] font-medium">Position X</span>
              <span className="font-bold" style={{ color: meta.color }}>{station.x}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="95"
                step="0.1"
                value={station.x}
                onChange={(e) => handleCoordinateChange('x', parseFloat(e.target.value))}
                style={{ accentColor: meta.color }}
                className="flex-1 cursor-pointer"
              />
              <input
                type="number"
                step="0.1"
                value={station.x}
                onChange={(e) => handleCoordinateChange('x', parseFloat(e.target.value) || 0)}
                className="w-14 text-right font-mono text-xs px-1.5 py-0.5 border border-[#cbd5e1] rounded bg-white"
              />
            </div>
          </div>

          {/* Y Coordinate */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-[#64748b] font-medium">Position Y</span>
              <span className="font-bold" style={{ color: meta.color }}>{station.y}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="95"
                step="0.1"
                value={station.y}
                onChange={(e) => handleCoordinateChange('y', parseFloat(e.target.value))}
                style={{ accentColor: meta.color }}
                className="flex-1 cursor-pointer"
              />
              <input
                type="number"
                step="0.1"
                value={station.y}
                onChange={(e) => handleCoordinateChange('y', parseFloat(e.target.value) || 0)}
                className="w-14 text-right font-mono text-xs px-1.5 py-0.5 border border-[#cbd5e1] rounded bg-white"
              />
            </div>
          </div>

          {/* Width */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-[#64748b] font-medium">Width (W)</span>
              <span className="font-bold" style={{ color: meta.color }}>{station.w}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="2.5"
                max="25"
                step="0.1"
                value={station.w}
                onChange={(e) => handleCoordinateChange('w', parseFloat(e.target.value))}
                style={{ accentColor: meta.color }}
                className="flex-1 cursor-pointer"
              />
              <input
                type="number"
                step="0.1"
                value={station.w}
                onChange={(e) => handleCoordinateChange('w', parseFloat(e.target.value) || 2.5)}
                className="w-14 text-right font-mono text-xs px-1.5 py-0.5 border border-[#cbd5e1] rounded bg-white"
              />
            </div>
          </div>

          {/* Height */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-[#64748b] font-medium">Height (H)</span>
              <span className="font-bold" style={{ color: meta.color }}>{station.h}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="2.5"
                max="25"
                step="0.1"
                value={station.h}
                onChange={(e) => handleCoordinateChange('h', parseFloat(e.target.value))}
                style={{ accentColor: meta.color }}
                className="flex-1 cursor-pointer"
              />
              <input
                type="number"
                step="0.1"
                value={station.h}
                onChange={(e) => handleCoordinateChange('h', parseFloat(e.target.value) || 2.5)}
                className="w-14 text-right font-mono text-xs px-1.5 py-0.5 border border-[#cbd5e1] rounded bg-white"
              />
            </div>
          </div>
        </div>

        {/* 4-Way D-Pad Micro-Nudge Controller */}
        <div
          className="border p-3.5 rounded-xl space-y-3 bg-white"
          style={{
            borderColor: `${meta.color}35`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold flex items-center gap-1.5"
              style={{ color: meta.color }}
            >
              <Target className="w-3.5 h-3.5" style={{ color: meta.color }} />
              Micro-Nudge D-Pad
            </span>

            {/* Step size pills */}
            <div className="flex items-center gap-1">
              {[0.1, 0.5, 1.0, 2.5].map((step) => (
                <button
                  key={step}
                  onClick={() => setNudgeStep(step)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-colors cursor-pointer ${
                    nudgeStep === step
                      ? 'text-white'
                      : 'bg-white text-[#64748b] border border-[#cbd5e1] hover:bg-[#f1f5f9]'
                  }`}
                  style={nudgeStep === step ? { backgroundColor: meta.color } : {}}
                >
                  {step}%
                </button>
              ))}
            </div>
          </div>

          {/* D-Pad Layout */}
          <div className="flex flex-col items-center justify-center gap-1 py-1">
            <button
              onClick={() => handleNudge(0, -nudgeStep)}
              className="p-2 rounded-lg bg-white border border-[#cbd5e1] hover:border-current text-[#0f172a] active:scale-95 transition-all shadow-xs cursor-pointer"
              style={{ color: meta.color }}
              title="Nudge Up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNudge(-nudgeStep, 0)}
                className="p-2 rounded-lg bg-white border border-[#cbd5e1] hover:border-current text-[#0f172a] active:scale-95 transition-all shadow-xs cursor-pointer"
                style={{ color: meta.color }}
                title="Nudge Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                className="w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold"
                style={{
                  backgroundColor: `${meta.color}15`,
                  borderColor: `${meta.color}40`,
                  color: meta.color,
                }}
              >
                ±{nudgeStep}
              </div>

              <button
                onClick={() => handleNudge(nudgeStep, 0)}
                className="p-2 rounded-lg bg-white border border-[#cbd5e1] hover:border-current text-[#0f172a] active:scale-95 transition-all shadow-xs cursor-pointer"
                style={{ color: meta.color }}
                title="Nudge Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => handleNudge(0, nudgeStep)}
              className="p-2 rounded-lg bg-white border border-[#cbd5e1] hover:border-current text-[#0f172a] active:scale-95 transition-all shadow-xs cursor-pointer"
              style={{ color: meta.color }}
              title="Nudge Down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linked Telemetry Unit */}
        <div
          className="border p-3 rounded-xl space-y-2 bg-white"
          style={{ borderColor: `${meta.color}35` }}
        >
          <label
            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: meta.color }}
          >
            <Link className="w-3.5 h-3.5" style={{ color: meta.color }} />
            Linked Factory Unit / Machine
          </label>
          <select
            value={station.linkedMachineId || station.linkedOvenId || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('MC-')) {
                onUpdate({ ...station, linkedMachineId: val, linkedOvenId: undefined }, true);
              } else if (val.startsWith('oven-') || val.startsWith('bake-')) {
                onUpdate({ ...station, linkedOvenId: val, linkedMachineId: undefined }, true);
              } else {
                onUpdate({ ...station, linkedMachineId: undefined, linkedOvenId: undefined }, true);
              }
            }}
            className="w-full text-xs font-mono font-medium px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-lg text-[#0f172a]"
          >
            <option value="">-- No Direct Link (Standalone) --</option>
            <optgroup label="Dispensing Robots">
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} - {m.name} ({m.processType})
                </option>
              ))}
            </optgroup>
            <optgroup label="Ovens & Thermal Units">
              {ovenUnits.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} - {o.name} ({o.subType})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Direct Link to Machine Details & Telemetry */}
        <div className="pt-2">
          <button
            onClick={handleDirectNavigate}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-95"
            style={{ backgroundColor: meta.color }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Machine Diagnostics ({station.code})</span>
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc] grid grid-cols-3 gap-2">
        <button
          onClick={() => onClone(station)}
          className="flex items-center justify-center gap-1 py-2 px-2 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl text-xs font-bold text-[#0f172a] transition-colors cursor-pointer"
          title="Clone Station"
        >
          <Copy className="w-3.5 h-3.5 text-blue-600" />
          <span>Clone</span>
        </button>

        <button
          onClick={() => onResetStation(station.id)}
          className="flex items-center justify-center gap-1 py-2 px-2 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl text-xs font-bold text-[#475569] transition-colors cursor-pointer"
          title="Reset to Factory Default Position"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <button
          onClick={() => onDelete(station.id)}
          className="flex items-center justify-center gap-1 py-2 px-2 bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fecaca] rounded-xl text-xs font-bold text-[#dc2626] transition-colors cursor-pointer"
          title="Delete Station"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

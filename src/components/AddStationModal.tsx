import React, { useState } from 'react';
import { FloorStation, StationCategory, ProductionLine, MachineStatus } from '../types';
import { CATEGORY_METADATA } from '../data/defaultCadLayout';
import {
  X,
  Plus,
  Sparkles,
  Droplets,
  Eye,
  Flame,
  Package,
  Zap,
  RotateCw,
  Box,
  Radio,
  ScanLine,
} from 'lucide-react';

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStation: (newStation: FloorStation) => void;
  existingCount: number;
}

interface EquipmentPreset {
  name: string;
  desc: string;
  prefix: string;
  category: StationCategory;
  w: number;
  h: number;
  icon: React.ReactNode;
  color: string;
}

const EQUIPMENT_PRESETS: EquipmentPreset[] = [
  {
    name: 'Precision Dispenser',
    desc: 'Adhesive / Fluid Dispensing Unit',
    prefix: 'MC-DSP',
    category: 'dispensing',
    w: 5.5,
    h: 6.0,
    icon: <Droplets className="w-3.5 h-3.5" />,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    name: 'FVMI Camera Inspection',
    desc: 'First Visual Mechanical Optical Inspection',
    prefix: 'MC-FVMI',
    category: 'fvmi',
    w: 4.5,
    h: 5.5,
    icon: <Eye className="w-3.5 h-3.5" />,
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    name: 'AOI Inspection Machine',
    desc: 'Top & Bottom PCB Optical Inspection',
    prefix: 'MC-AOI',
    category: 'aoi',
    w: 5.5,
    h: 5.5,
    icon: <ScanLine className="w-3.5 h-3.5" />,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    name: 'X-ray Radiography Unit',
    desc: '90kV Radiography & BGA Diagnostics',
    prefix: 'MC-XRAY',
    category: 'xray',
    w: 5.5,
    h: 5.5,
    icon: <Radio className="w-3.5 h-3.5" />,
    color: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  {
    name: 'Vacuum Curing Oven',
    desc: 'Vacuum Degassing & Thermal Curing',
    prefix: 'OVEN-VAC',
    category: 'oven-vacuum',
    w: 6.0,
    h: 7.0,
    icon: <Flame className="w-3.5 h-3.5" />,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    name: 'Pre-Bake Oven',
    desc: 'Pre-cure Thermal Baking Chamber',
    prefix: 'OVEN-BAKE',
    category: 'oven-bake',
    w: 6.0,
    h: 6.5,
    icon: <Flame className="w-3.5 h-3.5" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
];

export const AddStationModal: React.FC<AddStationModalProps> = ({
  isOpen,
  onClose,
  onAddStation,
  existingCount,
}) => {
  const [code, setCode] = useState(`ST-${existingCount + 1}`);
  const [name, setName] = useState('New Production Unit');
  const [category, setCategory] = useState<StationCategory>('dispensing');
  const [line, setLine] = useState<ProductionLine>('L1');
  const [status, setStatus] = useState<MachineStatus>('RUNNING');
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [w, setW] = useState(5.5);
  const [h, setH] = useState(6.0);
  const [cycleTime, setCycleTime] = useState(4.2);

  if (!isOpen) return null;

  const applyPreset = (preset: EquipmentPreset) => {
    setCode(`${preset.prefix}-${existingCount + 1}`);
    setName(preset.name);
    setCategory(preset.category);
    setW(preset.w);
    setH(preset.h);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStation: FloorStation = {
      id: `st-custom-${Date.now()}`,
      code: code.trim().toUpperCase() || `ST-${Date.now().toString().slice(-4)}`,
      name: name.trim() || 'Custom Station',
      category,
      line: line === 'ALL' ? 'L1' : line,
      x: Number(x),
      y: Number(y),
      w: Number(w),
      h: Number(h),
      status,
      oeePercent: 95.0,
      cycleTimeSec: Number(cycleTime) || 4.0,
      linkedPackoutId: category === 'aoi' || category === 'packout' ? 'packout-aoi' : undefined,
      linkedOcrId: category === 'xray' || category === 'ocr' ? 'packout-xray' : undefined,
      calibrationOffset: {
        xMm: 0.0,
        yMm: 0.0,
        rotationDeg: 0.0,
        lastCalibrated: new Date().toISOString().replace('T', ' ').slice(0, 16),
      },
      sensorTelemetry: {
        temperatureC: category.includes('oven') ? 145.0 : category === 'xray' || category === 'ocr' ? 22.8 : 24.5,
        pressureKpa: category === 'oven-vacuum' ? 95 : 101,
        vibrationMmS: category === 'xray' || category === 'ocr' ? 0.12 : 0.28,
        currentAmps: category === 'xray' || category === 'ocr' ? 2.1 : category === 'aoi' || category === 'packout' ? 3.5 : 5.8,
      },
    };

    onAddStation(newStation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#cbd5e1] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0f172a]">
                Add Equipment to Floor Layout
              </h2>
              <p className="text-[11px] text-[#64748b]">
                Select a quick equipment preset or specify custom X/Y coordinates and dimensions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Equipment Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {EQUIPMENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-2 rounded-xl border text-left flex items-start space-x-2 transition-all hover:scale-[1.02] cursor-pointer ${
                  category === preset.category
                    ? `${preset.color} ring-2 ring-blue-400 font-bold`
                    : 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-white text-[#334155]'
                }`}
              >
                <div className="mt-0.5 shrink-0">{preset.icon}</div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold block truncate">{preset.name}</span>
                  <span className="text-[9px] text-[#64748b] block truncate">{preset.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Equipment Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full font-mono text-xs font-bold px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="e.g. MC-14, DSP-02"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Production Line
              </label>
              <select
                value={line}
                onChange={(e) => setLine(e.target.value as ProductionLine)}
                className="w-full font-mono text-xs font-bold px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a]"
              >
                <option value="L6">Line 6 (L6) - Dispensing</option>
                <option value="L5">Line 5 (L5) - High Speed</option>
                <option value="L4">Line 4 (L4) - Precision Underfill</option>
                <option value="L3">Line 3 (L3) - Dual Oven</option>
                <option value="L2">Line 2 (L2) - Standard</option>
                <option value="L1">Line 1 (L1) - Prototype</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
              Station / Equipment Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full text-xs font-medium px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="e.g. Underfill Dispenser 14"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Equipment Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StationCategory)}
                className="w-full text-xs font-medium px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a]"
              >
                <option value="dispensing">Dispensing Machine (Cyan)</option>
                <option value="fvmi">FVMI Optical Inspection (Orange)</option>
                <option value="aoi">AOI Inspection Machine (Purple)</option>
                <option value="xray">X-ray Radiography Machine (Pink)</option>
                <option value="oven-vacuum">Vacuum Curing Oven (Green)</option>
                <option value="oven-bake">Bake / Pre-Cure Oven (Yellow)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MachineStatus)}
                className="w-full text-xs font-bold px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a]"
              >
                <option value="RUNNING">RUNNING (Active / In Production)</option>
                <option value="WARNING">WARNING (Attention Required)</option>
                <option value="ERROR">ERROR (Halted / Fault)</option>
                <option value="IDLE">IDLE (Standby)</option>
              </select>
            </div>
          </div>

          {/* Coordinates & Size */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
              CAD Floor Coordinates & Dimensions (%)
            </label>
            <div className="grid grid-cols-4 gap-2 bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]">
              <div>
                <label className="text-[9px] font-mono text-[#64748b] block">X (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={x}
                  onChange={(e) => setX(parseFloat(e.target.value) || 0)}
                  className="w-full font-mono text-xs px-2 py-1 bg-white border border-[#cbd5e1] rounded"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-[#64748b] block">Y (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={y}
                  onChange={(e) => setY(parseFloat(e.target.value) || 0)}
                  className="w-full font-mono text-xs px-2 py-1 bg-white border border-[#cbd5e1] rounded"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-[#64748b] block">Width W (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={w}
                  onChange={(e) => setW(parseFloat(e.target.value) || 5)}
                  className="w-full font-mono text-xs px-2 py-1 bg-white border border-[#cbd5e1] rounded"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-[#64748b] block">Height H (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={h}
                  onChange={(e) => setH(parseFloat(e.target.value) || 6)}
                  className="w-full font-mono text-xs px-2 py-1 bg-white border border-[#cbd5e1] rounded"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl text-xs font-bold text-[#64748b] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Equipment to Layout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

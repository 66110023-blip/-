import React, { useState, useEffect, useMemo } from 'react';
import { MachineAnalyticsControlBar } from './MachineAnalyticsControlBar';
import {
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  Edit3,
  Sparkles,
  Check,
  X,
  Sliders,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Download,
  RotateCcw,
  Activity,
  Layers,
  Cpu,
  ScanLine,
  Filter,
  Calendar,
  Info,
  ArrowUp,
  ArrowDown,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import { Header } from './Header';
import { normalizeAoiMachineId } from '../utils/machineLinkUtils';

export interface AoiHourlySlot {
  hour: string; // e.g. "07:00 - 08:00"
  hourShort: string; // "07:00"
  runningModel: string; // "504-2187", "504-2268", etc.
  targetUph: number;
  actualIn: number;
  goodCount: number;
  ngCount: number;
  yieldPercent: number;
  cycleTimeSec: number;
  // Side specific counts
  topInspected: number;
  topGood: number;
  topNg: number;
  topYield: number;
  bottomInspected: number;
  bottomGood: number;
  bottomNg: number;
  bottomYield: number;
  defects: {
    tombstone: number;
    solderBridge: number;
    missingComp: number;
    offsetShift: number;
    polarityRev: number;
  };
}

export interface AoiMachineDataset {
  machineId: string;
  name: string;
  line: string;
  lineDesc: string;
  operatorId: string;
  runningModel: string;
  modelDesc?: string;
  pcbRev?: string;
  packageType?: string;
  status: 'ONLINE (HOURLY SYNC)' | 'STANDBY' | 'MAINTENANCE';
  targetUph: number;
  topCameraSpec: string;
  bottomCameraSpec: string;
  exposureTimeMs: number;
  hourlyData: AoiHourlySlot[];
}

const STORAGE_AOI_HOURLY_KEY = 'factory_aoi_hourly_monitoring_v7';

export const ROTATION_MODELS = ['504-2187', '504-2268', '504-2154', '504-2224', '504-2454'];

export interface AvailableAoiModel {
  id: string;
  name: string;
  title: string;
  desc: string;
  rev: string;
  packageType: string;
  productionRun: string;
  lotNumber: string;
  targetYield: number;
}

export const AVAILABLE_AOI_MODELS: AvailableAoiModel[] = [
  {
    id: '504-2187',
    name: 'Model 504-2187',
    title: 'Main Controller Board',
    desc: 'High-Density Dual-Core Host Processing PCB (FCBGA-676)',
    rev: 'Rev 2.1A',
    packageType: 'FCBGA-676 / DDR4',
    productionRun: 'Run: 3-4 Days (Active Batch)',
    lotNumber: 'LOT-2026-0901-A',
    targetYield: 99.5
  },
  {
    id: '504-2268',
    name: 'Model 504-2268',
    title: 'Power Delivery Module',
    desc: 'Multi-Phase Synchronous Buck PMIC & Power FETs',
    rev: 'Rev 1.4B',
    packageType: 'QFN-64 / PMIC U01',
    productionRun: 'Run: 3-4 Days (In Production)',
    lotNumber: 'LOT-2026-0830-B',
    targetYield: 99.4
  },
  {
    id: '504-2154',
    name: 'Model 504-2154',
    title: 'RF Transceiver Board',
    desc: 'Ultra-Low Noise RF Front-End & Shielded Baseband Unit',
    rev: 'Rev 3.0C',
    packageType: 'RF Shield / Dual BGA',
    productionRun: 'Run: 3-4 Days (Scheduled Batch)',
    lotNumber: 'LOT-2026-0902-C',
    targetYield: 99.6
  },
  {
    id: '504-2224',
    name: 'Model 504-2224',
    title: 'Sensor Interface Hub',
    desc: 'High-Density Mixed-Signal Sensor Gateway (CSP-144)',
    rev: 'Rev 1.8A',
    packageType: 'CSP-144 / QFN',
    productionRun: 'Run: 3-4 Days (In Production)',
    lotNumber: 'LOT-2026-0829-D',
    targetYield: 99.5
  },
  {
    id: '504-2454',
    name: 'Model 504-2454',
    title: 'High-Density Gateway',
    desc: '10GbE Network Processing Unit (FCBGA-1156 High-Speed)',
    rev: 'Rev 4.2D',
    packageType: 'FCBGA-1156 / High-Speed',
    productionRun: 'Run: 3-4 Days (Active Batch)',
    lotNumber: 'LOT-2026-0901-E',
    targetYield: 99.6
  }
];

export const getModelBadge = (modelId: string) => {
  switch (modelId) {
    case '504-2187':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-300',
        dot: 'bg-purple-600',
        bar: '#9333ea',
        name: '504-2187',
        shortDesc: 'Main Ctrl'
      };
    case '504-2268':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        dot: 'bg-blue-600',
        bar: '#2563eb',
        name: '504-2268',
        shortDesc: 'Power Mod'
      };
    case '504-2154':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        dot: 'bg-emerald-600',
        bar: '#059669',
        name: '504-2154',
        shortDesc: 'RF Trans'
      };
    case '504-2224':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-600',
        bar: '#d97706',
        name: '504-2224',
        shortDesc: 'Sensor Hub'
      };
    case '504-2454':
      return {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        border: 'border-rose-300',
        dot: 'bg-rose-600',
        bar: '#e11d48',
        name: '504-2454',
        shortDesc: 'Gateway'
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-300',
        dot: 'bg-slate-600',
        bar: '#64748b',
        name: modelId,
        shortDesc: 'PCB'
      };
  }
};

export const generateModelHourlySlots = (modelId: string, machineIndex: number = 0): AoiHourlySlot[] => {
  const baseSlots = [
    { hour: '07:00 - 08:00', hourShort: '07:00', baseActual: 960 },
    { hour: '08:00 - 09:00', hourShort: '08:00', baseActual: 1040 },
    { hour: '09:00 - 10:00', hourShort: '09:00', baseActual: 1145 },
    { hour: '10:00 - 11:00', hourShort: '10:00', baseActual: 1090 },
    { hour: '11:00 - 12:00', hourShort: '11:00', baseActual: 1135 },
    { hour: '12:00 - 13:00', hourShort: '12:00', baseActual: 880 },
    { hour: '13:00 - 14:00', hourShort: '13:00', baseActual: 1125 },
    { hour: '14:00 - 15:00', hourShort: '14:00', baseActual: 1110 },
    { hour: '15:00 - 16:00', hourShort: '15:00', baseActual: 1160 },
    { hour: '16:00 - 17:00', hourShort: '16:00', baseActual: 1140 },
    { hour: '17:00 - 18:00', hourShort: '17:00', baseActual: 1010 }
  ];

  const modelIdx = AVAILABLE_AOI_MODELS.findIndex(m => m.id === modelId);
  const mOffset = modelIdx >= 0 ? modelIdx : 0;

  return baseSlots.map((h, i) => {
    const seed = (mOffset * 13 + machineIndex * 19 + i * 7) % 23;
    const actual = h.baseActual + (seed - 11) * 4;
    const ng = Math.max(2, Math.min(8, ((mOffset + machineIndex + i) % 5) + 3));
    const good = actual - ng;
    const yieldPct = Number(((good / actual) * 100).toFixed(2));
    const topNg = Math.floor(ng / 2);
    const btmNg = ng - topNg;
    const topIn = Math.floor(actual / 2);
    const btmIn = actual - topIn;
    const topGood = topIn - topNg;
    const btmGood = btmIn - btmNg;
    const topYield = Number(((topGood / topIn) * 100).toFixed(2));
    const btmYield = Number(((btmGood / btmIn) * 100).toFixed(2));

    return {
      hour: h.hour,
      hourShort: h.hourShort,
      runningModel: modelId,
      targetUph: 1100,
      actualIn: actual,
      goodCount: good,
      ngCount: ng,
      yieldPercent: yieldPct,
      cycleTimeSec: Number((1.75 + ((seed % 10) * 0.015)).toFixed(2)),
      topInspected: topIn,
      topGood: topGood,
      topNg: topNg,
      topYield: topYield,
      bottomInspected: btmIn,
      bottomGood: btmGood,
      bottomNg: btmNg,
      bottomYield: btmYield,
      defects: {
        tombstone: Math.max(0, Math.floor(ng * 0.3)),
        solderBridge: Math.max(0, Math.floor(ng * 0.3)),
        missingComp: Math.max(0, Math.floor(ng * 0.15)),
        offsetShift: Math.max(0, Math.floor(ng * 0.2)),
        polarityRev: Math.max(0, ng - (Math.floor(ng * 0.3) * 2 + Math.floor(ng * 0.15) + Math.floor(ng * 0.2)))
      }
    };
  });
};

export const generateModelHourlyFleet = (modelId: string): Record<string, AoiMachineDataset> => {
  const modelInfo = AVAILABLE_AOI_MODELS.find((m) => m.id === modelId) || AVAILABLE_AOI_MODELS[0];
  const machines = [
    { id: 'AOI-01', name: 'AOI Unit 01 (Line 1)', line: 'Line 1', lineDesc: 'Top Fill & Pre-Pack', op: 'E8291', exp: 1.8 },
    { id: 'AOI-02', name: 'AOI Unit 02 (Line 2)', line: 'Line 2', lineDesc: 'Top Fill & Vacuum A', op: 'E6402', exp: 1.6 }
  ];

  const fleetRecord: Record<string, AoiMachineDataset> = {};
  machines.forEach((m, idx) => {
    fleetRecord[m.id] = {
      machineId: m.id,
      name: m.name,
      line: m.line,
      lineDesc: m.lineDesc,
      operatorId: m.op,
      runningModel: modelInfo.id,
      modelDesc: `${modelInfo.name} — ${modelInfo.title}`,
      pcbRev: modelInfo.rev,
      packageType: modelInfo.packageType,
      status: 'ONLINE (HOURLY SYNC)',
      targetUph: 1100,
      topCameraSpec: 'Koh Young Zenith 3D 12MP Telecentric',
      bottomCameraSpec: 'Keyence Dual-Coaxial 5.0MP Ultra-Fast',
      exposureTimeMs: m.exp,
      hourlyData: generateModelHourlySlots(modelInfo.id, idx)
    };
  });

  return fleetRecord;
};

const DEFAULT_HOURLY_SLOTS_AOI_1: AoiHourlySlot[] = [
  {
    hour: '07:00 - 08:00',
    hourShort: '07:00',
    runningModel: '504-2187',
    targetUph: 1100,
    actualIn: 960,
    goodCount: 955,
    ngCount: 5,
    yieldPercent: 99.48,
    cycleTimeSec: 1.85,
    topInspected: 480,
    topGood: 477,
    topNg: 3,
    topYield: 99.38,
    bottomInspected: 480,
    bottomGood: 478,
    bottomNg: 2,
    bottomYield: 99.58,
    defects: { tombstone: 2, solderBridge: 1, missingComp: 1, offsetShift: 1, polarityRev: 0 }
  },
  {
    hour: '08:00 - 09:00',
    hourShort: '08:00',
    runningModel: '504-2187',
    targetUph: 1100,
    actualIn: 1040,
    goodCount: 1035,
    ngCount: 5,
    yieldPercent: 99.52,
    cycleTimeSec: 1.80,
    topInspected: 520,
    topGood: 518,
    topNg: 2,
    topYield: 99.62,
    bottomInspected: 520,
    bottomGood: 517,
    bottomNg: 3,
    bottomYield: 99.42,
    defects: { tombstone: 1, solderBridge: 2, missingComp: 0, offsetShift: 2, polarityRev: 0 }
  },
  {
    hour: '09:00 - 10:00',
    hourShort: '09:00',
    runningModel: '504-2268',
    targetUph: 1100,
    actualIn: 1145,
    goodCount: 1141,
    ngCount: 4,
    yieldPercent: 99.65,
    cycleTimeSec: 1.78,
    topInspected: 572,
    topGood: 570,
    topNg: 2,
    topYield: 99.65,
    bottomInspected: 573,
    bottomGood: 571,
    bottomNg: 2,
    bottomYield: 99.65,
    defects: { tombstone: 1, solderBridge: 1, missingComp: 0, offsetShift: 1, polarityRev: 1 }
  },
  {
    hour: '10:00 - 11:00',
    hourShort: '10:00',
    runningModel: '504-2268',
    targetUph: 1100,
    actualIn: 1090,
    goodCount: 1082,
    ngCount: 8,
    yieldPercent: 99.27,
    cycleTimeSec: 1.88,
    topInspected: 545,
    topGood: 540,
    topNg: 5,
    topYield: 99.08,
    bottomInspected: 545,
    bottomGood: 542,
    bottomNg: 3,
    bottomYield: 99.45,
    defects: { tombstone: 3, solderBridge: 2, missingComp: 1, offsetShift: 2, polarityRev: 0 }
  },
  {
    hour: '11:00 - 12:00',
    hourShort: '11:00',
    runningModel: '504-2154',
    targetUph: 1100,
    actualIn: 1135,
    goodCount: 1129,
    ngCount: 6,
    yieldPercent: 99.47,
    cycleTimeSec: 1.79,
    topInspected: 568,
    topGood: 564,
    topNg: 4,
    topYield: 99.30,
    bottomInspected: 567,
    bottomGood: 565,
    bottomNg: 2,
    bottomYield: 99.65,
    defects: { tombstone: 2, solderBridge: 1, missingComp: 1, offsetShift: 1, polarityRev: 1 }
  },
  {
    hour: '12:00 - 13:00',
    hourShort: '12:00',
    runningModel: '504-2154',
    targetUph: 1100,
    actualIn: 880,
    goodCount: 878,
    ngCount: 2,
    yieldPercent: 99.77,
    cycleTimeSec: 1.75,
    topInspected: 440,
    topGood: 439,
    topNg: 1,
    topYield: 99.77,
    bottomInspected: 440,
    bottomGood: 439,
    bottomNg: 1,
    bottomYield: 99.77,
    defects: { tombstone: 0, solderBridge: 1, missingComp: 0, offsetShift: 1, polarityRev: 0 }
  },
  {
    hour: '13:00 - 14:00',
    hourShort: '13:00',
    runningModel: '504-2224',
    targetUph: 1100,
    actualIn: 1125,
    goodCount: 1120,
    ngCount: 5,
    yieldPercent: 99.56,
    cycleTimeSec: 1.80,
    topInspected: 562,
    topGood: 559,
    topNg: 3,
    topYield: 99.47,
    bottomInspected: 563,
    bottomGood: 561,
    bottomNg: 2,
    bottomYield: 99.64,
    defects: { tombstone: 1, solderBridge: 2, missingComp: 1, offsetShift: 1, polarityRev: 0 }
  },
  {
    hour: '14:00 - 15:00',
    hourShort: '14:00',
    runningModel: '504-2224',
    targetUph: 1100,
    actualIn: 1110,
    goodCount: 1104,
    ngCount: 6,
    yieldPercent: 99.46,
    cycleTimeSec: 1.82,
    topInspected: 555,
    topGood: 551,
    topNg: 4,
    topYield: 99.28,
    bottomInspected: 555,
    bottomGood: 553,
    bottomNg: 2,
    bottomYield: 99.64,
    defects: { tombstone: 2, solderBridge: 1, missingComp: 2, offsetShift: 1, polarityRev: 0 }
  },
  {
    hour: '15:00 - 16:00',
    hourShort: '15:00',
    runningModel: '504-2454',
    targetUph: 1100,
    actualIn: 1160,
    goodCount: 1156,
    ngCount: 4,
    yieldPercent: 99.66,
    cycleTimeSec: 1.76,
    topInspected: 580,
    topGood: 578,
    topNg: 2,
    topYield: 99.66,
    bottomInspected: 580,
    bottomGood: 578,
    bottomNg: 2,
    bottomYield: 99.66,
    defects: { tombstone: 1, solderBridge: 1, missingComp: 0, offsetShift: 1, polarityRev: 1 }
  },
  {
    hour: '16:00 - 17:00',
    hourShort: '16:00',
    runningModel: '504-2454',
    targetUph: 1100,
    actualIn: 1140,
    goodCount: 1136,
    ngCount: 4,
    yieldPercent: 99.65,
    cycleTimeSec: 1.77,
    topInspected: 570,
    topGood: 568,
    topNg: 2,
    topYield: 99.65,
    bottomInspected: 570,
    bottomGood: 568,
    bottomNg: 2,
    bottomYield: 99.65,
    defects: { tombstone: 1, solderBridge: 1, missingComp: 1, offsetShift: 1, polarityRev: 0 }
  },
  {
    hour: '17:00 - 18:00',
    hourShort: '17:00',
    runningModel: '504-2187',
    targetUph: 1100,
    actualIn: 1010,
    goodCount: 1005,
    ngCount: 5,
    yieldPercent: 99.50,
    cycleTimeSec: 1.81,
    topInspected: 505,
    topGood: 502,
    topNg: 3,
    topYield: 99.41,
    bottomInspected: 505,
    bottomGood: 503,
    bottomNg: 2,
    bottomYield: 99.60,
    defects: { tombstone: 2, solderBridge: 1, missingComp: 0, offsetShift: 2, polarityRev: 0 }
  }
];

const INITIAL_AOI_HOURLY_FLEET: Record<string, AoiMachineDataset> = {
  'AOI-01': {
    machineId: 'AOI-01',
    name: 'AOI Unit 01 (Line 1)',
    line: 'Line 1',
    lineDesc: 'Top Fill & Pre-Pack',
    operatorId: 'E8291',
    runningModel: 'Multi-Model (5 Models Alternating)',
    modelDesc: 'All 5 PCB Models in Shift Rotation',
    pcbRev: 'Rev 3.4B / 2.1A / 1.9C',
    packageType: 'FCBGA / QFN / CSP / BGA-676',
    status: 'ONLINE (HOURLY SYNC)',
    targetUph: 1100,
    topCameraSpec: 'Koh Young Zenith 3D 12MP Telecentric',
    bottomCameraSpec: 'Keyence Dual-Coaxial 5.0MP Ultra-Fast',
    exposureTimeMs: 1.8,
    hourlyData: DEFAULT_HOURLY_SLOTS_AOI_1
  },
  'AOI-02': {
    machineId: 'AOI-02',
    name: 'AOI Unit 02 (Line 2)',
    line: 'Line 2',
    lineDesc: 'Top Fill & Vacuum A',
    operatorId: 'E6402',
    runningModel: 'Multi-Model (5 Models Alternating)',
    modelDesc: 'All 5 PCB Models in Shift Rotation',
    pcbRev: 'Rev 2.1A / 1.9C / 4.0A',
    packageType: 'QFN-64 / High-Power FETs / BGA',
    status: 'ONLINE (HOURLY SYNC)',
    targetUph: 1100,
    topCameraSpec: 'Koh Young Zenith 3D 12MP Telecentric',
    bottomCameraSpec: 'Keyence Dual-Coaxial 5.0MP Ultra-Fast',
    exposureTimeMs: 1.6,
    hourlyData: DEFAULT_HOURLY_SLOTS_AOI_1.map((s, i) => {
      const modModel = ROTATION_MODELS[(Math.floor(i / 2) + 1) % ROTATION_MODELS.length];
      const modActual = i === 5 ? 850 : Math.round(s.actualIn * (0.97 + (i % 3) * 0.02));
      const modGood = Math.round(modActual * 0.995);
      const modNg = modActual - modGood;
      const topIn = Math.floor(modActual / 2);
      const btmIn = modActual - topIn;
      const topNg = Math.floor(modNg / 2);
      const btmNg = modNg - topNg;
      const topGood = topIn - topNg;
      const btmGood = btmIn - btmNg;

      return {
        ...s,
        runningModel: modModel,
        actualIn: modActual,
        goodCount: modGood,
        ngCount: modNg,
        yieldPercent: Number(((modGood / modActual) * 100).toFixed(2)),
        topInspected: topIn,
        topGood: topGood,
        topNg: topNg,
        topYield: Number(((topGood / topIn) * 100).toFixed(2)),
        bottomInspected: btmIn,
        bottomGood: btmGood,
        bottomNg: btmNg,
        bottomYield: Number(((btmGood / btmIn) * 100).toFixed(2))
      };
    })
  }
};

export const PackOutCountView: React.FC = () => {
  const { t } = useLanguage();
  const { selectedMachineId, setSelectedMachineId } = useFactory();

  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('504-2187');
  const [selectedMachineKey, setSelectedMachineKey] = useState<string>(() => normalizeAoiMachineId(selectedMachineId));
  const [selectedHourFilter, setSelectedHourFilter] = useState<string>('ALL');
  const [selectedOperator, setSelectedOperator] = useState<string>('All');
  const [selectedLot, setSelectedLot] = useState<string>('All');
  const [selectedRack, setSelectedRack] = useState<string>('All');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Sync selected machine from FactoryContext
  useEffect(() => {
    if (selectedMachineId) {
      const normalized = normalizeAoiMachineId(selectedMachineId);
      setSelectedMachineKey(normalized);
    }
  }, [selectedMachineId]);

  const handleMachineSelect = (mId: string) => {
    setSelectedMachineKey(mId);
    setSelectedMachineId(mId);
  };

  // Per-model datasets saved in localStorage
  const [modelFleets, setModelFleets] = useState<Record<string, Record<string, AoiMachineDataset>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AOI_HOURLY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed['504-2187']) {
          return parsed;
        }
      }
    } catch (e) {}

    const initial: Record<string, Record<string, AoiMachineDataset>> = {};
    AVAILABLE_AOI_MODELS.forEach((m) => {
      initial[m.id] = generateModelHourlyFleet(m.id);
    });
    return initial;
  });

  // Current fleet for the active selected model
  const fleet = useMemo(() => {
    return modelFleets[selectedModelFilter] || generateModelHourlyFleet(selectedModelFilter);
  }, [modelFleets, selectedModelFilter]);

  // All 5 machines for the selected model
  const fleetList = useMemo(() => Object.values(fleet) as AoiMachineDataset[], [fleet]);

  // Active Machine (AOI-01 or selected)
  const activeMachine = fleet[selectedMachineKey] || fleetList[0] || fleet['AOI-01'];

  // Current active model metadata
  const activeModelMeta = useMemo(() => {
    return AVAILABLE_AOI_MODELS.find((m) => m.id === selectedModelFilter) || AVAILABLE_AOI_MODELS[0];
  }, [selectedModelFilter]);

  // Handle model filter selection
  const handleModelSelect = (modelId: string) => {
    setSelectedModelFilter(modelId);
  };

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AOI_HOURLY_KEY, JSON.stringify(modelFleets));
    } catch (e) {}
  }, [modelFleets]);

  // Active machine slots for the selected model
  const activeMachineFilteredSlots = useMemo(() => {
    return activeMachine.hourlyData;
  }, [activeMachine]);

  // Aggregated Shift Totals for Active Machine
  const shiftSummary = useMemo(() => {
    const slots = activeMachineFilteredSlots;
    const totalIn = slots.reduce((sum, s) => sum + s.actualIn, 0);
    const totalGood = slots.reduce((sum, s) => sum + s.goodCount, 0);
    const totalNg = slots.reduce((sum, s) => sum + s.ngCount, 0);
    const avgYield = totalIn > 0 ? Number(((totalGood / totalIn) * 100).toFixed(2)) : 0;
    const avgCycle = Number((slots.reduce((sum, s) => sum + s.cycleTimeSec, 0) / (slots.length || 1)).toFixed(2));
    
    // Top Side Aggregation
    const totalTopIn = slots.reduce((sum, s) => sum + s.topInspected, 0);
    const totalTopGood = slots.reduce((sum, s) => sum + s.topGood, 0);
    const totalTopNg = slots.reduce((sum, s) => sum + s.topNg, 0);
    const avgTopYield = totalTopIn > 0 ? Number(((totalTopGood / totalTopIn) * 100).toFixed(2)) : 0;

    // Bottom Side Aggregation
    const totalBtmIn = slots.reduce((sum, s) => sum + s.bottomInspected, 0);
    const totalBtmGood = slots.reduce((sum, s) => sum + s.bottomGood, 0);
    const totalBtmNg = slots.reduce((sum, s) => sum + s.bottomNg, 0);
    const avgBtmYield = totalBtmIn > 0 ? Number(((totalBtmGood / totalBtmIn) * 100).toFixed(2)) : 0;

    // Defects
    const totalTombstone = slots.reduce((sum, s) => sum + s.defects.tombstone, 0);
    const totalBridge = slots.reduce((sum, s) => sum + s.defects.solderBridge, 0);
    const totalMissing = slots.reduce((sum, s) => sum + s.defects.missingComp, 0);
    const totalOffset = slots.reduce((sum, s) => sum + s.defects.offsetShift, 0);
    const totalPolarity = slots.reduce((sum, s) => sum + s.defects.polarityRev, 0);

    return {
      totalIn,
      totalGood,
      totalNg,
      avgYield,
      avgCycle,
      totalTopIn,
      totalTopGood,
      totalTopNg,
      avgTopYield,
      totalBtmIn,
      totalBtmGood,
      totalBtmNg,
      avgBtmYield,
      totalTombstone,
      totalBridge,
      totalMissing,
      totalOffset,
      totalPolarity,
      slotsCount: slots.length
    };
  }, [activeMachineFilteredSlots]);

  // Min and Max throughput across active machine slots for color gradient scaling
  const { minThroughput, maxThroughput } = useMemo(() => {
    const values = activeMachine.hourlyData.map((d) => d.actualIn);
    return {
      minThroughput: Math.min(...values),
      maxThroughput: Math.max(...values)
    };
  }, [activeMachine]);

  // Active slot for detailed view
  const activeSlot = useMemo(() => {
    if (selectedHourFilter === 'ALL') {
      return activeMachineFilteredSlots[activeMachineFilteredSlots.length - 1] || activeMachine.hourlyData[activeMachine.hourlyData.length - 1];
    }
    return (
      activeMachine.hourlyData.find((s) => s.hourShort === selectedHourFilter) ||
      activeMachine.hourlyData[0]
    );
  }, [activeMachine, activeMachineFilteredSlots, selectedHourFilter]);

  // Handle slot update
  const handleUpdateSlot = (idx: number, updatedSlot: Partial<AoiHourlySlot>) => {
    setModelFleets((prev) => {
      const curFleet = prev[selectedModelFilter] || generateModelHourlyFleet(selectedModelFilter);
      const curMachine = curFleet[selectedMachineKey] || curFleet['AOI-01'];
      const newSlots = [...curMachine.hourlyData];
      const target = { ...newSlots[idx], ...updatedSlot };
      
      // Sync totals if top/bottom changed
      if (updatedSlot.topGood !== undefined || updatedSlot.topNg !== undefined || updatedSlot.bottomGood !== undefined || updatedSlot.bottomNg !== undefined) {
        target.topInspected = target.topGood + target.topNg;
        target.bottomInspected = target.bottomGood + target.bottomNg;
        target.topYield = target.topInspected > 0 ? Number(((target.topGood / target.topInspected) * 100).toFixed(2)) : 100;
        target.bottomYield = target.bottomInspected > 0 ? Number(((target.bottomGood / target.bottomInspected) * 100).toFixed(2)) : 100;

        target.goodCount = target.topGood + target.bottomGood;
        target.ngCount = target.topNg + target.bottomNg;
        target.actualIn = target.goodCount + target.ngCount;
        target.yieldPercent = target.actualIn > 0 ? Number(((target.goodCount / target.actualIn) * 100).toFixed(2)) : 100;
      } else if (target.actualIn > 0) {
        target.yieldPercent = Number(((target.goodCount / target.actualIn) * 100).toFixed(2));
      }
      newSlots[idx] = target;

      const updatedMachine = {
        ...curMachine,
        hourlyData: newSlots
      };

      const updatedFleet = {
        ...curFleet,
        [selectedMachineKey]: updatedMachine
      };

      return {
        ...prev,
        [selectedModelFilter]: updatedFleet
      };
    });
  };

  // Reset to default
  const handleResetDefaults = () => {
    const initial: Record<string, Record<string, AoiMachineDataset>> = {};
    AVAILABLE_AOI_MODELS.forEach((m) => {
      initial[m.id] = generateModelHourlyFleet(m.id);
    });
    setModelFleets(initial);
    localStorage.removeItem(STORAGE_AOI_HOURLY_KEY);
  };

  // Export CSV of hourly slots
  const handleExportCsv = () => {
    const rows = [
      ['Hour Slot', 'Running Model', 'Target UPH', 'Actual In', 'Total Good', 'Total NG', 'Yield %', 'Top In', 'Top Good', 'Top NG', 'Top Yield %', 'Btm In', 'Btm Good', 'Btm NG', 'Btm Yield %', 'Cycle (s)'],
      ...activeMachine.hourlyData.map((s) => [
        s.hour,
        s.runningModel,
        s.targetUph.toString(),
        s.actualIn.toString(),
        s.goodCount.toString(),
        s.ngCount.toString(),
        s.yieldPercent.toString() + '%',
        s.topInspected.toString(),
        s.topGood.toString(),
        s.topNg.toString(),
        s.topYield.toString() + '%',
        s.bottomInspected.toString(),
        s.bottomGood.toString(),
        s.bottomNg.toString(),
        s.bottomYield.toString() + '%',
        s.cycleTimeSec.toString()
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AOI_${activeMachine.machineId}_Model_${selectedModelFilter}_Hourly_Records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for computing bar color (lighter for low throughput, deeper for high throughput)
  const getBarColor = (actualIn: number) => {
    const range = maxThroughput - minThroughput;
    const ratio = range <= 0 ? 1 : (actualIn - minThroughput) / range;
    if (ratio < 0.25) return '#e9d5ff';
    if (ratio < 0.50) return '#c084fc';
    if (ratio < 0.75) return '#a855f7';
    return '#7e22ce';
  };

  return (
    <div className="w-full pb-16 font-sans">
      <Header
        title="AOI Machine Monitoring"
        subtitle="Automated Optical Inspection Fleet — Dedicated 3-4 Day Model Production Runs & Hourly Records"
        badge={
          <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            2 AOI MACHINES ONLINE (AOI-01 &amp; AOI-02)
          </span>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Unified Standard Analytics Control Strip & Breakdown */}
        <MachineAnalyticsControlBar
          totalOutput={shiftSummary.totalGood}
          outputUnit="boards"
          activeHours={(activeMachine?.hourlyData || []).filter((s) => s.actualIn > 0).length || 8}
          peakHourLabel="02 SEPT 15:00"
          peakHourValue={
            activeMachine?.hourlyData && activeMachine.hourlyData.length > 0
              ? Math.max(...activeMachine.hourlyData.map((s) => s.goodCount), 120)
              : 120
          }
          avgPerActiveHour={Math.round(
            shiftSummary.totalGood /
              Math.max(1, (activeMachine?.hourlyData || []).filter((s) => s.actualIn > 0).length || 8)
          )}
          lines={['All AOI Fleet', ...fleetList.map((m) => `${m.line} (${m.machineId})`)]}
          selectedLine={`${activeMachine.line} (${activeMachine.machineId})`}
          onLineChange={(l) => {
            const found = fleetList.find((m) => l.includes(m.machineId));
            if (found) setSelectedMachineKey(found.machineId);
          }}
          products={['All', ...AVAILABLE_AOI_MODELS.map((m) => `${m.id} - ${m.title}`)]}
          selectedProduct={`${activeModelMeta.id} - ${activeModelMeta.title}`}
          onProductChange={(p) => {
            const found = AVAILABLE_AOI_MODELS.find((m) => p.includes(m.id));
            if (found) handleModelSelect(found.id);
          }}
          selectedOperator={selectedOperator}
          onOperatorChange={setSelectedOperator}
          selectedLot={selectedLot}
          onLotChange={setSelectedLot}
          selectedRack={selectedRack}
          onRackChange={setSelectedRack}
          breakdownData={{
            Line: fleetList.map((m) => ({
              name: `${m.line} (${m.machineId})`,
              count: m.hourlyData.reduce((sum, h) => sum + h.goodCount, 0)
            })),
            Product: AVAILABLE_AOI_MODELS.map((m) => ({
              name: `${m.name} (${m.title})`,
              count: m.id === activeModelMeta.id ? shiftSummary.totalGood : Math.round(shiftSummary.totalGood * 0.35)
            })),
            Operator: [
              { name: `${activeMachine.operatorId} (Lead Tech)`, count: Math.round(shiftSummary.totalGood * 0.65) },
              { name: 'OP-AOI-02 (Shift 2)', count: Math.round(shiftSummary.totalGood * 0.35) },
            ],
            Lot: [
              { name: 'LOT-2026-09A', count: Math.round(shiftSummary.totalGood * 0.50) },
              { name: 'LOT-2026-09B', count: Math.round(shiftSummary.totalGood * 0.35) },
              { name: 'LOT-2026-08F', count: Math.round(shiftSummary.totalGood * 0.15) },
            ],
            Rack: [
              { name: 'Rack R-01 (Infeed Top)', count: Math.round(shiftSummary.totalGood * 0.42) },
              { name: 'Rack R-02 (Infeed Bottom)', count: Math.round(shiftSummary.totalGood * 0.38) },
              { name: 'Rack R-03 (Re-inspection)', count: Math.round(shiftSummary.totalGood * 0.20) },
            ]
          }}
          extraActions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1.5 bg-white hover:bg-purple-100/60 text-purple-900 border border-purple-300 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                <span>Edit Hourly Data</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          }
        />

        {/* MACHINE QUICK SWITCHER (Compact AOI Units Bar) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-purple-50/60 p-2.5 rounded-2xl border border-purple-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-900 shrink-0 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-purple-600" />
              Select Machine:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {fleetList.map((m) => {
                const isSelected = m.machineId === selectedMachineKey;
                const mTotalIn = m.hourlyData.reduce((s, h) => s + h.actualIn, 0);
                const mTotalGood = m.hourlyData.reduce((s, h) => s + h.goodCount, 0);
                const mYield = mTotalIn > 0 ? ((mTotalGood / mTotalIn) * 100).toFixed(1) : '0';

                return (
                  <button
                    key={m.machineId}
                    onClick={() => handleMachineSelect(m.machineId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-purple-100/60 border-purple-200'
                    }`}
                  >
                    <span>{m.machineId}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                    <span className={`text-[10px] ${isSelected ? 'text-purple-100' : 'text-slate-500'}`}>
                      {mTotalIn.toLocaleString()} pcs ({mYield}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-purple-800">
            <span>Current Line: <strong>{activeMachine.line} ({activeMachine.lineDesc})</strong></span>
            <span className="text-purple-400">•</span>
            <span>Tech: <strong>{activeMachine.operatorId}</strong></span>
          </div>
        </div>

        {/* SHIFT OPERATIONAL QUALITY & YIELD METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Total Inspected (In)</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {shiftSummary.totalIn.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
            </div>
            <div className="text-[10px] text-purple-700 font-mono mt-1 font-bold">
              11 Hourly Batches
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Defective (Total NG)</div>
            <div className="text-2xl font-black font-mono text-rose-700 mt-1">
              {shiftSummary.totalNg} <span className="text-xs font-normal text-slate-400">pcs</span>
            </div>
            <div className="text-[10px] text-rose-600 font-mono mt-1 font-semibold">
              Top: {shiftSummary.totalTopNg} | Btm: {shiftSummary.totalBtmNg}
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Shift Yield Rate</div>
            <div className="text-2xl font-black font-mono text-purple-900 mt-1">
              {shiftSummary.avgYield}%
            </div>
            <div className="text-[10px] text-purple-600 font-mono mt-1 font-bold">
              Target &ge; 99.00%
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-mono text-purple-800 uppercase font-bold">Target UPH</div>
            <div className="text-2xl font-black font-mono text-purple-950 mt-1">
              {activeMachine.targetUph} <span className="text-xs font-normal text-purple-700">UPH</span>
            </div>
            <div className="text-[10px] text-purple-700 font-mono mt-1 font-bold">
              Avg Cycle: {shiftSummary.avgCycle}s
            </div>
          </div>
        </div>

        {/* HOURLY CHART & DEFECT PARETO (CLEAN BAR ONLY - NO LINES, LIGHT COLOR FOR LOW HOURS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Performance Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  AOI Hourly Output ({activeMachine.machineId})
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Inspected throughput per hour across alternating shift models (07:00 - 18:00)
                </p>
              </div>

              {/* Color Intensity Legend */}
              <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Volume Scale:</span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#e9d5ff] border border-purple-200" title="Low Volume" />
                  <span className="text-[10px] text-slate-600">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#c084fc]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#a855f7]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#7e22ce]" title="High Volume" />
                  <span className="text-[10px] text-slate-600 font-bold">Peak</span>
                </div>
              </div>
            </div>

            {/* Clean Chart: No grid lines, No yield lines - filtered by selected model */}
            <div className="h-72 w-full">
              {activeMachineFilteredSlots.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeMachineFilteredSlots} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <XAxis
                      dataKey="hourShort"
                      tick={{ fontSize: 11, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 1300]}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(243, 232, 255, 0.4)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as AoiHourlySlot;
                          const badge = getModelBadge(data.runningModel);
                          return (
                            <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs font-mono shadow-xl border border-slate-700 space-y-1.5">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                                <span className="font-bold text-purple-300 text-sm">{data.hour}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                                  Model {data.runningModel}
                                </span>
                              </div>
                              <div className="pt-1">
                                Inspected: <strong className="text-white text-sm">{data.actualIn} pcs</strong>
                              </div>
                              <div className="text-emerald-400">Total Good: {data.goodCount} pcs | Total NG: {data.ngCount} pcs</div>
                              <div className="text-blue-300">
                                Top Side: Good {data.topGood} / NG {data.topNg} ({data.topYield}%)
                              </div>
                              <div className="text-amber-300">
                                Bottom Side: Good {data.bottomGood} / NG {data.bottomNg} ({data.bottomYield}%)
                              </div>
                              <div className="text-purple-300 font-bold pt-1 border-t border-slate-800">
                                Overall Yield Rate: {data.yieldPercent}%
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="actualIn" radius={[8, 8, 0, 0]}>
                      {activeMachineFilteredSlots.map((entry) => {
                        return (
                          <Cell
                            key={`cell-${entry.hourShort}`}
                            fill={getBarColor(entry.actualIn)}
                            className="transition-all duration-300 hover:opacity-80"
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 font-mono text-xs">
                  <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                  <span>No inspection data found for Model {selectedModelFilter} on {activeMachine.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shift Defect Pareto Breakdown (1 col) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                Hourly Defect Distribution
              </h3>
              <p className="text-xs text-slate-500 font-mono mb-4">
                Shift Total NG: <strong className="text-rose-600">{shiftSummary.totalNg} pcs</strong> (Top: {shiftSummary.totalTopNg}, Btm: {shiftSummary.totalBtmNg})
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="font-semibold text-slate-700">Tombstone Shift</span>
                    <span className="font-bold text-purple-900">
                      {shiftSummary.totalTombstone} ({((shiftSummary.totalTombstone / (shiftSummary.totalNg || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${(shiftSummary.totalTombstone / (shiftSummary.totalNg || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="font-semibold text-slate-700">Solder Bridge</span>
                    <span className="font-bold text-purple-900">
                      {shiftSummary.totalBridge} ({((shiftSummary.totalBridge / (shiftSummary.totalNg || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${(shiftSummary.totalBridge / (shiftSummary.totalNg || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="font-semibold text-slate-700">Missing Component</span>
                    <span className="font-bold text-purple-900">
                      {shiftSummary.totalMissing} ({((shiftSummary.totalMissing / (shiftSummary.totalNg || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-600 rounded-full"
                      style={{ width: `${(shiftSummary.totalMissing / (shiftSummary.totalNg || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="font-semibold text-slate-700">Component Offset</span>
                    <span className="font-bold text-purple-900">
                      {shiftSummary.totalOffset} ({((shiftSummary.totalOffset / (shiftSummary.totalNg || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(shiftSummary.totalOffset / (shiftSummary.totalNg || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="font-semibold text-slate-700">Polarity Reversed</span>
                    <span className="font-bold text-purple-900">
                      {shiftSummary.totalPolarity} ({((shiftSummary.totalPolarity / (shiftSummary.totalNg || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${(shiftSummary.totalPolarity / (shiftSummary.totalNg || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Resolution: <strong>Hourly Aggregate</strong></span>
              <span className="text-emerald-700 font-bold">Class 3 Verified</span>
            </div>
          </div>
        </div>

        {/* FULL HOURLY AOI DATA TABLE */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Hourly AOI Inspection Records ({activeMachine.machineId} — Multi-Model Shift Log)
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Comprehensive hourly inspection log (07:00 - 18:00) with running model badge and Top/Bottom Side breakdown
              </p>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modify Hourly Slot Table</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 font-bold">Hour Slot</th>
                  <th className="p-2.5 font-bold">Model</th>
                  <th className="p-2.5 font-bold text-right">Target</th>
                  <th className="p-2.5 font-bold text-right">Inspected</th>
                  <th className="p-2.5 font-bold text-right text-emerald-700">Good</th>
                  <th className="p-2.5 font-bold text-right text-rose-700">NG</th>
                  <th className="p-2.5 font-bold text-right text-blue-800">Top Side (Good/NG)</th>
                  <th className="p-2.5 font-bold text-right text-amber-800">Btm Side (Good/NG)</th>
                  <th className="p-2.5 font-bold text-right">Yield %</th>
                  <th className="p-2.5 font-bold text-right">Cycle (s)</th>
                  <th className="p-2.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeMachineFilteredSlots.map((slot) => {
                  const badge = getModelBadge(slot.runningModel);
                  return (
                    <tr
                      key={slot.hour}
                      onClick={() => setSelectedHourFilter(slot.hourShort)}
                      className={`transition-colors cursor-pointer ${
                        selectedHourFilter === slot.hourShort
                          ? 'bg-purple-50/90 font-bold'
                          : 'hover:bg-purple-50/50'
                      }`}
                    >
                      <td className="p-2.5 text-slate-900 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-purple-500 opacity-70" />
                        {slot.hour}
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10.5px] border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {slot.runningModel}
                        </span>
                      </td>
                      <td className="p-2.5 text-right text-slate-500">{slot.targetUph}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{slot.actualIn}</td>
                      <td className="p-2.5 text-right text-emerald-700 font-bold">{slot.goodCount}</td>
                      <td className="p-2.5 text-right text-rose-700 font-bold">{slot.ngCount}</td>
                      <td className="p-2.5 text-right text-blue-800">
                        <span className="font-semibold">{slot.topGood}</span> / <span className="text-rose-600 font-semibold">{slot.topNg}</span>
                        <span className="text-[10px] text-blue-600 ml-1">({slot.topYield}%)</span>
                      </td>
                      <td className="p-2.5 text-right text-amber-800">
                        <span className="font-semibold">{slot.bottomGood}</span> / <span className="text-rose-600 font-semibold">{slot.bottomNg}</span>
                        <span className="text-[10px] text-amber-600 ml-1">({slot.bottomYield}%)</span>
                      </td>
                      <td className="p-2.5 text-right font-bold text-purple-900">{slot.yieldPercent}%</td>
                      <td className="p-2.5 text-right text-slate-600">{slot.cycleTimeSec}s</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            slot.yieldPercent >= 99.0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {slot.yieldPercent >= 99.0 ? 'NORMAL' : 'WATCH'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-200">
                <tr>
                  <td className="p-2.5" colSpan={2}>
                    {selectedModelFilter === 'ALL' ? 'SHIFT TOTAL' : `TOTAL FOR MODEL ${selectedModelFilter}`}
                  </td>
                  <td className="p-2.5 text-right">{activeMachine.targetUph * shiftSummary.slotsCount}</td>
                  <td className="p-2.5 text-right">{shiftSummary.totalIn}</td>
                  <td className="p-2.5 text-right text-emerald-800">{shiftSummary.totalGood}</td>
                  <td className="p-2.5 text-right text-rose-800">{shiftSummary.totalNg}</td>
                  <td className="p-2.5 text-right text-blue-900">
                    {shiftSummary.totalTopGood} / {shiftSummary.totalTopNg} ({shiftSummary.avgTopYield}%)
                  </td>
                  <td className="p-2.5 text-right text-amber-900">
                    {shiftSummary.totalBtmGood} / {shiftSummary.totalBtmNg} ({shiftSummary.avgBtmYield}%)
                  </td>
                  <td className="p-2.5 text-right text-purple-950">{shiftSummary.avgYield}%</td>
                  <td className="p-2.5 text-right">{shiftSummary.avgCycle}s</td>
                  <td className="p-2.5 text-center text-emerald-800">PASSED</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>

      {/* EDIT HOURLY DATA MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-purple-200 shadow-2xl max-w-5xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-white/20">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black">Edit Hourly AOI Inspection Records &amp; Model Assignment</h3>
                  <p className="text-xs text-purple-100">Machine: {activeMachine.name} (Interchangeable Model Configuration)</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="space-y-3">
                {activeMachine.hourlyData.map((slot, idx) => (
                  <div key={slot.hour} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-7 gap-2 text-xs font-mono items-center">
                    <div className="font-bold text-slate-800">
                      {slot.hourShort}
                      <span className="block text-[10px] text-slate-400">Total: {slot.actualIn} pcs</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-purple-800 block font-bold">Running Model:</span>
                      <select
                        value={slot.runningModel}
                        onChange={(e) => {
                          handleUpdateSlot(idx, { runningModel: e.target.value });
                        }}
                        className="w-full px-2 py-1 bg-purple-50 border border-purple-300 rounded-lg text-purple-950 font-bold text-xs"
                      >
                        {ROTATION_MODELS.map((mid) => (
                          <option key={mid} value={mid}>
                            {mid}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-blue-700 block font-bold">Top GOOD:</span>
                      <input
                        type="number"
                        value={slot.topGood}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateSlot(idx, { topGood: val });
                        }}
                        className="w-full px-2 py-1 bg-blue-50 border border-blue-300 rounded-lg text-blue-900 font-bold"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-blue-700 block font-bold">Top NG:</span>
                      <input
                        type="number"
                        value={slot.topNg}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateSlot(idx, { topNg: val });
                        }}
                        className="w-full px-2 py-1 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 font-bold"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-amber-700 block font-bold">Btm GOOD:</span>
                      <input
                        type="number"
                        value={slot.bottomGood}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateSlot(idx, { bottomGood: val });
                        }}
                        className="w-full px-2 py-1 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 font-bold"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-amber-700 block font-bold">Btm NG:</span>
                      <input
                        type="number"
                        value={slot.bottomNg}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateSlot(idx, { bottomNg: val });
                        }}
                        className="w-full px-2 py-1 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 font-bold"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Overall Yield:</span>
                      <div className="px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 font-black">
                        {slot.yieldPercent}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Reset Default Factory Data
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

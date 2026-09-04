import React, { useState, useEffect, useMemo } from 'react';
import { MachineAnalyticsControlBar } from './MachineAnalyticsControlBar';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  Edit3,
  Plus,
  Trash2,
  Sparkles,
  Check,
  X,
  Sliders,
  ArrowUpRight,
  Maximize2,
  ShieldCheck,
  Zap,
  Download,
  RotateCcw,
  Activity,
  Layers,
  Cpu,
  ScanLine,
  Thermometer,
  Shield,
  FileText,
  Calendar,
  Filter,
  Info
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
import { normalizeXrayMachineId } from '../utils/machineLinkUtils';

export interface XrayHourlySlot {
  hour: string; // "07:00 - 08:00"
  hourShort: string; // "07:00"
  runningModel: string; // Dynamic model for this hour slot
  targetUph: number;
  actualInspected: number;
  passCount: number;
  failCount: number;
  yieldPercent: number;
  avgVoidPercent: number;
  maxVoidPercent: number;
  tubeKvAvg: number;
  filamentMicroAmpAvg: number;
  radiationLeakageDose: number; // in uSv/hr (<0.1 is safe)
  defects: {
    bgaVoidExceed: number;
    solderBridging: number;
    wireDeformation: number;
    hipDefect: number;
  };
  representativeScan: {
    panelId: string;
    bgaZone: string;
    voidPercent: number;
    status: 'PASS' | 'NG';
    defectType?: string;
    timestamp: string;
    operator: string;
  };
}

export interface XrayMachineDataset {
  machineId: string;
  name: string;
  line: string;
  lineDesc: string;
  operatorId: string;
  lotNumber: string;
  activeRecipe: string;
  runningModel: string;
  modelDesc?: string;
  packageType?: string;
  status: 'ONLINE (HOURLY SYNC)' | 'STANDBY' | 'MAINTENANCE';
  targetUph: number;
  maxVoidThreshold: number; // 15.0%
  detectorTempCelsius: number;
  focalSpotMicron: number;
  radiationShieldStatus: 'ENGAGED / SAFE';
  hourlyData: XrayHourlySlot[];
}

export interface AvailableXrayModel {
  id: string;
  name: string;
  title: string;
  desc: string;
  rev: string;
  packageType: string;
  productionRun: string;
  lotNumber: string;
  bgaZone: string;
  recipeName: string;
}

export const AVAILABLE_XRAY_MODELS: AvailableXrayModel[] = [
  {
    id: '504-2187',
    name: 'Model 504-2187',
    title: 'Main Control PCB',
    desc: 'BGA Core U14 Solder Void Radiography Analysis (Line 1-5)',
    rev: 'Rev 2.1A',
    packageType: 'FCBGA-676 / DDR4',
    productionRun: 'Run Duration: 3-4 Days (Dedicated Batch)',
    lotNumber: 'LOT-XRAY-2026-0901-A',
    bgaZone: 'U14 (BGA Core 676)',
    recipeName: 'BGA-Underfill-Void-HighDensity-V3.2'
  },
  {
    id: '504-2268',
    name: 'Model 504-2268',
    title: 'Power Management Board',
    desc: 'PMIC U01 High-Power Thermal Pad Void Inspection',
    rev: 'Rev 1.4B',
    packageType: 'QFN-64 / PMIC U01',
    productionRun: 'Run Duration: 3-4 Days (Active Production)',
    lotNumber: 'LOT-XRAY-2026-0830-B',
    bgaZone: 'U01 (Power PMIC)',
    recipeName: 'PMIC-ThermalPad-Void-Spec-V2.1'
  },
  {
    id: '504-2154',
    name: 'Model 504-2154',
    title: 'Communication Module',
    desc: 'RF Shield Baseband Wire Bond & Solder Joint Verification',
    rev: 'Rev 3.0C',
    packageType: 'RF Shield / Dual BGA',
    productionRun: 'Run Duration: 3-4 Days (Dedicated Run)',
    lotNumber: 'LOT-XRAY-2026-0902-C',
    bgaZone: 'U08 (RF Transceiver)',
    recipeName: 'RF-Shield-WireBond-Joint-V4.0'
  },
  {
    id: '504-2224',
    name: 'Model 504-2224',
    title: 'Sensor Node Interface',
    desc: 'High-Density Mixed-Signal CSP-144 Solder Integrity',
    rev: 'Rev 1.8A',
    packageType: 'CSP-144 / QFN',
    productionRun: 'Run Duration: 3-4 Days (Active Batch)',
    lotNumber: 'LOT-XRAY-2026-0829-D',
    bgaZone: 'U22 (CSP-144 Sensor)',
    recipeName: 'CSP-MicroBGA-Interconnect-V1.9'
  },
  {
    id: '504-2454',
    name: 'Model 504-2454',
    title: 'High-Speed Processor Board',
    desc: 'FCBGA-1156 Micro-Bump & High-Density Interconnect',
    rev: 'Rev 4.2D',
    packageType: 'FCBGA-1156 / High-Speed',
    productionRun: 'Run Duration: 3-4 Days (Dedicated Run)',
    lotNumber: 'LOT-XRAY-2026-0901-E',
    bgaZone: 'U10 (FCBGA NPU Host)',
    recipeName: 'FCBGA-1156-Bump-Quality-V5.0'
  }
];

export const getModelBadge = (modelId: string) => {
  switch (modelId) {
    case '504-2187':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-600',
        bar: '#6366f1'
      };
    case '504-2268':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-600',
        bar: '#a855f7'
      };
    case '504-2154':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-600',
        bar: '#10b981'
      };
    case '504-2224':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-600',
        bar: '#f59e0b'
      };
    case '504-2454':
      return {
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-200',
        dot: 'bg-pink-600',
        bar: '#ec4899'
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-600',
        bar: '#94a3b8'
      };
  }
};

const STORAGE_XRAY_HOURLY_KEY = 'factory_xray_hourly_monitoring_v7';

const BASE_XRAY_HOURS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export const generateModelXraySlots = (modelId: string, lineOffset: number): XrayHourlySlot[] => {
  const modelSpecs: Record<string, { baseIn: number; avgVoid: number; tubeKv: number; zone: string }> = {
    '504-2187': { baseIn: 80, avgVoid: 5.2, tubeKv: 85.4, zone: 'U14 (BGA Core 676)' },
    '504-2268': { baseIn: 76, avgVoid: 6.8, tubeKv: 88.0, zone: 'U01 (Power PMIC)' },
    '504-2154': { baseIn: 85, avgVoid: 4.5, tubeKv: 82.5, zone: 'U08 (RF Transceiver)' },
    '504-2224': { baseIn: 82, avgVoid: 5.8, tubeKv: 84.0, zone: 'U22 (CSP-144 Sensor)' },
    '504-2454': { baseIn: 74, avgVoid: 5.0, tubeKv: 90.0, zone: 'U10 (FCBGA NPU Host)' }
  };

  const mSpec = modelSpecs[modelId] || { baseIn: 80, avgVoid: 5.0, tubeKv: 85.0, zone: 'BGA Zone' };

  const hourOffsets = [
    { inMod: -2, passMod: -1, voidMod: 0.2, maxMod: 3.2 },
    { inMod: 2, passMod: 0, voidMod: -0.4, maxMod: 2.1 },
    { inMod: 0, passMod: -1, voidMod: 0.9, maxMod: 11.2 },
    { inMod: -1, passMod: -1, voidMod: 0.0, maxMod: 3.9 },
    { inMod: 1, passMod: 0, voidMod: -0.3, maxMod: 1.8 },
    { inMod: -4, passMod: -1, voidMod: 0.5, maxMod: 6.0 },
    { inMod: 3, passMod: 0, voidMod: -0.6, maxMod: 1.5 },
    { inMod: 0, passMod: -1, voidMod: 0.3, maxMod: 10.6 },
    { inMod: 1, passMod: 0, voidMod: -0.5, maxMod: 2.0 },
    { inMod: -1, passMod: 0, voidMod: -0.2, maxMod: 2.5 },
    { inMod: 2, passMod: -1, voidMod: 0.1, maxMod: 4.2 }
  ];

  return BASE_XRAY_HOURS.map((hourShort, idx) => {
    const nextHour = (parseInt(hourShort.split(':')[0], 10) + 1).toString().padStart(2, '0') + ':00';
    const hourLabel = `${hourShort} - ${nextHour}`;
    const hConf = hourOffsets[idx];

    const actualInspected = Math.max(50, Math.round((mSpec.baseIn + hConf.inMod) * (1 + (lineOffset * 0.02 - 0.04))));
    const failCount = (idx === 2 || idx === 7 || (idx + lineOffset) % 4 === 0) ? 1 : 0;
    const passCount = Math.max(0, actualInspected - failCount);
    const yieldPercent = Number(((passCount / actualInspected) * 100).toFixed(2));
    const avgVoidPercent = Number(Math.max(2.0, mSpec.avgVoid + hConf.voidMod + (lineOffset * 0.1)).toFixed(2));
    const maxVoidPercent = Number(Math.min(25.0, avgVoidPercent + hConf.maxMod + (failCount > 0 ? 8.5 : 2.0)).toFixed(1));
    const tubeKvAvg = Number((mSpec.tubeKv + (idx * 0.05) - 0.2).toFixed(1));

    return {
      hour: hourLabel,
      hourShort,
      runningModel: modelId,
      targetUph: mSpec.baseIn,
      actualInspected,
      passCount,
      failCount,
      yieldPercent,
      avgVoidPercent,
      maxVoidPercent,
      tubeKvAvg,
      filamentMicroAmpAvg: 112 + lineOffset * 2,
      radiationLeakageDose: Number((0.038 + lineOffset * 0.003).toFixed(3)),
      defects: {
        bgaVoidExceed: maxVoidPercent > 15 ? 1 : 0,
        solderBridging: failCount > 0 && maxVoidPercent <= 15 ? 1 : 0,
        wireDeformation: 0,
        hipDefect: 0
      },
      representativeScan: {
        panelId: `PNL-${modelId.replace('504-', '')}-${hourShort.replace(':', '')}`,
        bgaZone: mSpec.zone,
        voidPercent: avgVoidPercent,
        status: maxVoidPercent > 15 ? 'NG' : 'PASS',
        defectType: maxVoidPercent > 15 ? 'BGA Voiding > 15.0% Spec Limit' : undefined,
        timestamp: `${hourShort}:30`,
        operator: `E829${lineOffset + 1}`
      }
    };
  });
};

export const generateModelXrayFleet = (modelId: string): Record<string, XrayMachineDataset> => {
  const modelMeta = AVAILABLE_XRAY_MODELS.find(m => m.id === modelId) || AVAILABLE_XRAY_MODELS[0];

  return {
    'X-RAY 01': {
      machineId: 'X-RAY 01',
      name: 'X-Ray Unit 01 (Line 1)',
      line: 'Line 1',
      lineDesc: 'Top Fill & Bake Radiography',
      operatorId: 'E8291',
      lotNumber: modelMeta.lotNumber,
      activeRecipe: modelMeta.recipeName,
      runningModel: modelId,
      status: 'ONLINE (HOURLY SYNC)',
      targetUph: 80,
      maxVoidThreshold: 15.0,
      detectorTempCelsius: 18.2,
      focalSpotMicron: 5.0,
      radiationShieldStatus: 'ENGAGED / SAFE',
      hourlyData: generateModelXraySlots(modelId, 0)
    },
    'X-RAY 02': {
      machineId: 'X-RAY 02',
      name: 'X-Ray Unit 02 (Line 2)',
      line: 'Line 2',
      lineDesc: 'Top Fill & Vacuum Inspection',
      operatorId: 'E6402',
      lotNumber: modelMeta.lotNumber,
      activeRecipe: modelMeta.recipeName,
      runningModel: modelId,
      status: 'ONLINE (HOURLY SYNC)',
      targetUph: 80,
      maxVoidThreshold: 15.0,
      detectorTempCelsius: 17.9,
      focalSpotMicron: 5.0,
      radiationShieldStatus: 'ENGAGED / SAFE',
      hourlyData: generateModelXraySlots(modelId, 1)
    },
    'X-RAY 03': {
      machineId: 'X-RAY 03',
      name: 'X-Ray Unit 03 (Line 3)',
      line: 'Line 3',
      lineDesc: 'Under Fill & Bake NDT',
      operatorId: 'E5198',
      lotNumber: modelMeta.lotNumber,
      activeRecipe: modelMeta.recipeName,
      runningModel: modelId,
      status: 'ONLINE (HOURLY SYNC)',
      targetUph: 80,
      maxVoidThreshold: 15.0,
      detectorTempCelsius: 18.5,
      focalSpotMicron: 5.0,
      radiationShieldStatus: 'ENGAGED / SAFE',
      hourlyData: generateModelXraySlots(modelId, 2)
    },
    'X-RAY 04': {
      machineId: 'X-RAY 04',
      name: 'X-Ray Unit 04 (Line 4)',
      line: 'Line 4',
      lineDesc: 'Under Fill & Vacuum Chamber',
      operatorId: 'E3341',
      lotNumber: modelMeta.lotNumber,
      activeRecipe: modelMeta.recipeName,
      runningModel: modelId,
      status: 'ONLINE (HOURLY SYNC)',
      targetUph: 80,
      maxVoidThreshold: 15.0,
      detectorTempCelsius: 18.1,
      focalSpotMicron: 5.0,
      radiationShieldStatus: 'ENGAGED / SAFE',
      hourlyData: generateModelXraySlots(modelId, 3)
    },
    'X-RAY 05': {
      machineId: 'X-RAY 05',
      name: 'X-Ray Unit 05 (Line 5)',
      line: 'Line 5',
      lineDesc: 'High-Density Micro-Focus Core',
      operatorId: 'E1109',
      lotNumber: modelMeta.lotNumber,
      activeRecipe: modelMeta.recipeName,
      runningModel: modelId,
      status: 'ONLINE (HOURLY SYNC)',
      targetUph: 80,
      maxVoidThreshold: 15.0,
      detectorTempCelsius: 18.3,
      focalSpotMicron: 5.0,
      radiationShieldStatus: 'ENGAGED / SAFE',
      hourlyData: generateModelXraySlots(modelId, 4)
    }
  };
};

const INITIAL_MODEL_XRAY_FLEETS: Record<string, Record<string, XrayMachineDataset>> = {
  '504-2187': generateModelXrayFleet('504-2187'),
  '504-2268': generateModelXrayFleet('504-2268'),
  '504-2154': generateModelXrayFleet('504-2154'),
  '504-2224': generateModelXrayFleet('504-2224'),
  '504-2454': generateModelXrayFleet('504-2454')
};

export const PackOutOcrView: React.FC = () => {
  const { t } = useLanguage();
  const { selectedMachineId, setSelectedMachineId } = useFactory();

  const [modelFleets, setModelFleets] = useState<Record<string, Record<string, XrayMachineDataset>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_XRAY_HOURLY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MODEL_XRAY_FLEETS;
  });

  const [selectedMachineKey, setSelectedMachineKey] = useState<string>(() => normalizeXrayMachineId(selectedMachineId));
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('504-2187');
  const [selectedHourFilter, setSelectedHourFilter] = useState<string>('ALL');
  const [selectedOperator, setSelectedOperator] = useState<string>('All');
  const [selectedLot, setSelectedLot] = useState<string>('All');
  const [selectedRack, setSelectedRack] = useState<string>('All');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Sync selected machine from FactoryContext
  useEffect(() => {
    if (selectedMachineId) {
      const normalized = normalizeXrayMachineId(selectedMachineId);
      setSelectedMachineKey(normalized);
    }
  }, [selectedMachineId]);

  const handleMachineSelect = (mId: string) => {
    setSelectedMachineKey(mId);
    setSelectedMachineId(mId);
  };

  // Active Model Meta
  const activeModelMeta = useMemo(() => {
    return AVAILABLE_XRAY_MODELS.find((m) => m.id === selectedModelFilter) || AVAILABLE_XRAY_MODELS[0];
  }, [selectedModelFilter]);

  // Active Fleet for selected Model
  const activeFleet = useMemo(() => {
    return modelFleets[selectedModelFilter] || modelFleets['504-2187'] || INITIAL_MODEL_XRAY_FLEETS['504-2187'];
  }, [modelFleets, selectedModelFilter]);

  // Active Machine
  const activeMachine = activeFleet[selectedMachineKey] || activeFleet['X-RAY 01'];

  // Full fleet list for currently selected model
  const fleetList = useMemo(() => {
    return Object.values(activeFleet) as XrayMachineDataset[];
  }, [activeFleet]);

  // Handle Model Selection
  const handleModelSelect = (modelId: string) => {
    setSelectedModelFilter(modelId);
  };

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_XRAY_HOURLY_KEY, JSON.stringify(modelFleets));
    } catch (e) {}
  }, [modelFleets]);

  // Aggregated Shift Summary
  const shiftSummary = useMemo(() => {
    const slots = activeMachine.hourlyData;
    const totalIn = slots.reduce((sum, s) => sum + s.actualInspected, 0);
    const totalPass = slots.reduce((sum, s) => sum + s.passCount, 0);
    const totalFail = slots.reduce((sum, s) => sum + s.failCount, 0);
    const avgYield = totalIn > 0 ? Number(((totalPass / totalIn) * 100).toFixed(2)) : 0;
    const avgVoid = Number((slots.reduce((sum, s) => sum + s.avgVoidPercent, 0) / (slots.length || 1)).toFixed(2));
    const maxShiftVoid = Math.max(...slots.map((s) => s.maxVoidPercent), 0);
    const avgTubeKv = Number((slots.reduce((sum, s) => sum + s.tubeKvAvg, 0) / (slots.length || 1)).toFixed(1));
    const avgRadiation = Number((slots.reduce((sum, s) => sum + s.radiationLeakageDose, 0) / (slots.length || 1)).toFixed(3));
    const totalBgaVoidDefect = slots.reduce((sum, s) => sum + s.defects.bgaVoidExceed, 0);
    const totalBridgeDefect = slots.reduce((sum, s) => sum + s.defects.solderBridging, 0);
    const totalWireDefect = slots.reduce((sum, s) => sum + s.defects.wireDeformation, 0);
    const totalHipDefect = slots.reduce((sum, s) => sum + s.defects.hipDefect, 0);

    return {
      totalIn,
      totalPass,
      totalFail,
      avgYield,
      avgVoid,
      maxShiftVoid,
      avgTubeKv,
      avgRadiation,
      totalBgaVoidDefect,
      totalBridgeDefect,
      totalWireDefect,
      totalHipDefect,
      slotCount: slots.length
    };
  }, [activeMachine]);

  // Hourly slots for active machine and selected model
  const displayHourlySlots = useMemo(() => {
    return activeMachine.hourlyData;
  }, [activeMachine]);

  // Calculate min and max inspected volume for dynamic intensity color scale (Low = light, High = dark)
  const { minSlotVal, maxSlotVal } = useMemo(() => {
    if (!displayHourlySlots || displayHourlySlots.length === 0) return { minSlotVal: 0, maxSlotVal: 100 };
    const vals = displayHourlySlots.map((s) => s.actualInspected);
    return {
      minSlotVal: Math.min(...vals),
      maxSlotVal: Math.max(...vals)
    };
  }, [displayHourlySlots]);

  // Volume scale color mapping (matching AOI)
  const getBarColor = (actualIn: number) => {
    const maxVal = Math.max(...displayHourlySlots.map((s) => s.actualInspected), 1);
    const minVal = Math.min(...displayHourlySlots.map((s) => s.actualInspected), 0);
    const range = maxVal - minVal;
    const ratio = range <= 0 ? 1 : (actualIn - minVal) / range;
    if (ratio < 0.25) return '#fbcfe8';
    if (ratio < 0.50) return '#f472b6';
    if (ratio < 0.75) return '#ec4899';
    return '#be185d';
  };

  // Helper function: Dynamic Pink Intensity Scale
  // ค่าน้อย -> สีชมพูอ่อน (Light Rose/Pink), ค่ามาก -> สีชมพูเข้ม/บานเย็นลึก (Deep Dark Magenta/Pink)
  const getDynamicSlotColor = (value: number, min: number, max: number) => {
    if (max === min) return '#ec4899';
    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const hue = 335;
    const sat = Math.round(68 + ratio * 24); // 68% -> 92%
    const light = Math.round(82 - ratio * 52); // 82% (สีชมพูอ่อน) -> 30% (สีชมพูเข้มมาก)
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  };

  // Helper for fail bar shading (light red for few, deep red for more)
  const getDynamicFailColor = (failCount: number) => {
    if (failCount <= 0) return 'transparent';
    if (failCount === 1) return '#fca5a5';
    if (failCount === 2) return '#f43f5e';
    return '#be123c';
  };

  // Active slot for detailed inspection sample
  const activeSlot = useMemo(() => {
    if (selectedHourFilter === 'ALL') {
      return displayHourlySlots[displayHourlySlots.length - 1] || displayHourlySlots[0];
    }
    return (
      displayHourlySlots.find((s) => s.hourShort === selectedHourFilter) ||
      displayHourlySlots[0]
    );
  }, [displayHourlySlots, selectedHourFilter]);

  // Handle slot update
  const handleUpdateSlot = (idx: number, updatedSlot: Partial<XrayHourlySlot>) => {
    setModelFleets((prev) => {
      const curFleet = prev[selectedModelFilter] || INITIAL_MODEL_XRAY_FLEETS[selectedModelFilter];
      const curMachine = curFleet[selectedMachineKey];
      const newSlots = [...curMachine.hourlyData];
      const target = { ...newSlots[idx], ...updatedSlot };
      
      // Recalculate yield
      if (target.actualInspected > 0) {
        target.yieldPercent = Number(((target.passCount / target.actualInspected) * 100).toFixed(2));
      }
      newSlots[idx] = target;

      return {
        ...prev,
        [selectedModelFilter]: {
          ...curFleet,
          [selectedMachineKey]: {
            ...curMachine,
            hourlyData: newSlots
          }
        }
      };
    });
  };

  // Reset to default
  const handleResetDefaults = () => {
    setModelFleets(INITIAL_MODEL_XRAY_FLEETS);
    localStorage.removeItem(STORAGE_XRAY_HOURLY_KEY);
  };

  // Export CSV of hourly slots
  const handleExportCsv = () => {
    const rows = [
      ['Hour Slot', 'Model ID', 'Model Name', 'Target UPH', 'Actual Inspected', 'Pass Count', 'Fail Count', 'Yield %', 'Avg Void %', 'Max Void %', 'Tube kV Avg', 'Radiation (uSv/h)', 'BGA Void Defects', 'Solder Bridge', 'Wire Deform', 'HIP Defects'],
      ...activeMachine.hourlyData.map((s) => [
        s.hour,
        s.runningModel,
        activeModelMeta.title,
        s.targetUph.toString(),
        s.actualInspected.toString(),
        s.passCount.toString(),
        s.failCount.toString(),
        s.yieldPercent.toString() + '%',
        s.avgVoidPercent.toString() + '%',
        s.maxVoidPercent.toString() + '%',
        s.tubeKvAvg.toString(),
        s.radiationLeakageDose.toString(),
        s.defects.bgaVoidExceed.toString(),
        s.defects.solderBridging.toString(),
        s.defects.wireDeformation.toString(),
        s.defects.hipDefect.toString()
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `XRAY_${selectedModelFilter}_${activeMachine.machineId.replace(' ', '_')}_Hourly_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full pb-16 font-sans">
      <Header
        title="X-ray Machine Monitoring"
        subtitle="Automated Radiography Fleet — Dedicated Model Production Runs & Micro-Focus NDT Analysis"
        badge={
          <span className="text-[11px] font-mono font-bold text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-pink-600" />
            5 X-RAY MACHINES ONLINE (XRAY-01 to XRAY-05)
          </span>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Unified Standard Analytics Control Strip & Breakdown */}
        <MachineAnalyticsControlBar
          totalOutput={shiftSummary.totalPass}
          outputUnit="boards"
          activeHours={8}
          peakHourLabel="02 SEPT 15:00"
          peakHourValue={Math.max(...activeMachine.hourlyData.map((s) => s.passCount), 125)}
          avgPerActiveHour={Math.round(shiftSummary.totalPass / 8)}
          lines={['All X-Ray Fleet', ...fleetList.map((m) => `${m.line} (${m.machineId})`)]}
          selectedLine={`${activeMachine.line} (${activeMachine.machineId})`}
          onLineChange={(l) => {
            const found = fleetList.find((m) => l.includes(m.machineId));
            if (found) setSelectedMachineKey(found.machineId);
          }}
          products={['All', ...AVAILABLE_XRAY_MODELS.map((m) => `${m.id} - ${m.name}`)]}
          selectedProduct={selectedModelFilter === 'ALL' ? 'All' : `${activeModelMeta.id} - ${activeModelMeta.name}`}
          onProductChange={(p) => {
            if (p === 'All') {
              handleModelSelect('ALL');
            } else {
              const found = AVAILABLE_XRAY_MODELS.find((m) => p.includes(m.id));
              if (found) handleModelSelect(found.id);
            }
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
              count: m.hourlyData.reduce((sum, h) => sum + h.passCount, 0)
            })),
            Product: AVAILABLE_XRAY_MODELS.map((m) => ({
              name: `${m.name} (${m.title})`,
              count: m.id === activeModelMeta.id ? shiftSummary.totalPass : Math.round(shiftSummary.totalPass * 0.35)
            })),
            Operator: [
              { name: `${activeMachine.operatorId || 'E8291'} (Lead Tech)`, count: Math.round(shiftSummary.totalPass * 0.65) },
              { name: 'OP-NDT-02 (Shift 2)', count: Math.round(shiftSummary.totalPass * 0.35) },
            ],
            Lot: [
              { name: 'LOT-2026-09A', count: Math.round(shiftSummary.totalPass * 0.45) },
              { name: 'LOT-2026-09B', count: Math.round(shiftSummary.totalPass * 0.35) },
              { name: 'LOT-2026-08F', count: Math.round(shiftSummary.totalPass * 0.20) },
            ],
            Rack: [
              { name: 'Magazine Mag-01 (Infeed A)', count: Math.round(shiftSummary.totalPass * 0.38) },
              { name: 'Magazine Mag-02 (Infeed B)', count: Math.round(shiftSummary.totalPass * 0.34) },
              { name: 'Magazine Mag-03 (Passed Tray)', count: Math.round(shiftSummary.totalPass * 0.28) },
            ]
          }}
          extraActions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1.5 bg-white hover:bg-pink-100 text-pink-800 border border-pink-300 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors text-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-pink-600" />
                <span>Edit Hourly Data</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Hourly CSV</span>
              </button>
            </div>
          }
        />

        {/* MACHINE QUICK SWITCHER (Compact 5 X-ray Units Bar) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-pink-50/60 p-2.5 rounded-2xl border border-pink-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-pink-900 shrink-0 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-pink-600" />
              Select Machine:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {fleetList.map((m) => {
                const isSelected = m.machineId === selectedMachineKey;
                const mTotalIn = m.hourlyData.reduce((s, h) => s + h.actualInspected, 0);
                const mTotalPass = m.hourlyData.reduce((s, h) => s + h.passCount, 0);
                const mYield = mTotalIn > 0 ? ((mTotalPass / mTotalIn) * 100).toFixed(1) : '0';

                return (
                  <button
                    key={m.machineId}
                    onClick={() => handleMachineSelect(m.machineId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                      isSelected
                        ? 'bg-pink-600 text-white border-pink-700 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-pink-100/60 border-pink-200'
                    }`}
                  >
                    <span>{m.machineId}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                    <span className={`text-[10px] ${isSelected ? 'text-pink-100' : 'text-slate-500'}`}>
                      {mTotalIn} pcs ({mYield}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-pink-800">
            <span>Current Line: <strong>{activeMachine.line} ({activeMachine.lineDesc})</strong></span>
            <span className="text-pink-400">•</span>
            <span>Tech: <strong>{activeMachine.operatorId || 'E8291'}</strong></span>
          </div>
        </div>

        {/* SHIFT OPERATIONAL QUALITY & YIELD METRICS (4 CARDS MATCHING AOI) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Total Inspected (In)</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {shiftSummary.totalIn.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
            </div>
            <div className="text-[10px] text-pink-700 font-mono mt-1 font-bold">
              {shiftSummary.slotCount} Hourly Batches
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Defective (NDT NG)</div>
            <div className="text-2xl font-black font-mono text-rose-700 mt-1">
              {shiftSummary.totalFail} <span className="text-xs font-normal text-slate-400">pcs</span>
            </div>
            <div className="text-[10px] text-rose-600 font-mono mt-1 font-semibold truncate">
              BGA Void: {shiftSummary.totalBgaVoidDefect} | Bridge: {shiftSummary.totalBridgeDefect}
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Shift Yield Rate</div>
            <div className="text-2xl font-black font-mono text-pink-900 mt-1">
              {shiftSummary.avgYield}%
            </div>
            <div className="text-[10px] text-pink-600 font-mono mt-1 font-bold">
              Target &ge; 98.50%
            </div>
          </div>

          <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl shadow-xs">
            <div className="text-[11px] font-mono text-pink-800 uppercase font-bold">Target UPH</div>
            <div className="text-2xl font-black font-mono text-pink-950 mt-1">
              {activeMachine.targetUph} <span className="text-xs font-normal text-pink-700">UPH</span>
            </div>
            <div className="text-[10px] text-pink-700 font-mono mt-1 font-bold truncate">
              Avg Void: {shiftSummary.avgVoid}% (Max: {shiftSummary.maxShiftVoid}%)
            </div>
          </div>
        </div>

        {/* HOURLY CHART & DEFECT BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly X-ray Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-pink-600" />
                  X-ray Hourly Output ({activeMachine.machineId})
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Hourly Radiography Scan Throughput (Pass vs NG Rejects)
                </p>
              </div>

              {/* Color Intensity Legend (Matching AOI) */}
              <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Volume Scale:</span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#fbcfe8] border border-pink-200" title="Low Volume" />
                  <span className="text-[10px] text-slate-600">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#f472b6]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#ec4899]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-[#be185d]" title="High Volume" />
                  <span className="text-[10px] text-slate-600 font-bold">Peak</span>
                </div>
              </div>
            </div>

            {/* Clean Single Bar Chart - No confusing dual bars */}
            <div className="h-72 w-full">
              {displayHourlySlots.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayHourlySlots} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="hourShort" tick={{ fontSize: 11, fontFamily: 'monospace' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      cursor={{ fill: 'rgba(253, 242, 248, 0.4)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as XrayHourlySlot;
                          const badge = getModelBadge(data.runningModel);
                          return (
                            <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs font-mono shadow-xl border border-slate-700 space-y-1.5">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                                <span className="font-bold text-pink-300 text-sm">{data.hour}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                                  Model {data.runningModel}
                                </span>
                              </div>
                              <div className="pt-1">
                                Inspected: <strong className="text-white text-sm">{data.actualInspected} pcs</strong>
                              </div>
                              <div className="text-emerald-400">Total Good: {data.passCount} pcs | Total NG: {data.failCount} pcs</div>
                              <div className="text-pink-300">
                                Radiography Void: Avg {data.avgVoidPercent}% (Max {data.maxVoidPercent}%)
                              </div>
                              <div className="text-slate-300">
                                Tube: {data.tubeKvAvg} kV | Filament: {data.filamentMicroAmpAvg} μA | Leakage: {data.radiationLeakageDose} μSv/h
                              </div>
                              <div className="text-pink-300 font-bold pt-1 border-t border-slate-800">
                                Overall Yield Rate: {data.yieldPercent}%
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="actualInspected" radius={[8, 8, 0, 0]}>
                      {displayHourlySlots.map((entry) => {
                        return (
                          <Cell
                            key={`cell-${entry.hourShort}`}
                            fill={getBarColor(entry.actualInspected)}
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
                <AlertTriangle className="w-4 h-4 text-pink-600" />
                Hourly X-ray Defect Distribution
              </h3>
              <p className="text-xs text-slate-500 font-mono mb-4">
                Shift Total NG: <strong className="text-rose-600">{shiftSummary.totalFail} pcs</strong>
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="font-semibold text-slate-700">BGA Voiding &gt; 15%</span>
                    <span className="font-bold text-pink-900">{shiftSummary.totalBgaVoidDefect} ({((shiftSummary.totalBgaVoidDefect / (shiftSummary.totalFail || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-600 rounded-full" style={{ width: `${(shiftSummary.totalBgaVoidDefect / (shiftSummary.totalFail || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="font-semibold text-slate-700">Solder Bridging (X-ray)</span>
                    <span className="font-bold text-pink-900">{shiftSummary.totalBridgeDefect} ({((shiftSummary.totalBridgeDefect / (shiftSummary.totalFail || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(shiftSummary.totalBridgeDefect / (shiftSummary.totalFail || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="font-semibold text-slate-700">Wire Bond Deformation</span>
                    <span className="font-bold text-pink-900">{shiftSummary.totalWireDefect} ({((shiftSummary.totalWireDefect / (shiftSummary.totalFail || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(shiftSummary.totalWireDefect / (shiftSummary.totalFail || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="font-semibold text-slate-700">Head-in-Pillow (HIP)</span>
                    <span className="font-bold text-pink-900">{shiftSummary.totalHipDefect} ({((shiftSummary.totalHipDefect / (shiftSummary.totalFail || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(shiftSummary.totalHipDefect / (shiftSummary.totalFail || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Standard: <strong>IPC-A-610 Class 3</strong></span>
              <span className="text-emerald-700 font-bold">15% Max Void Spec</span>
            </div>
          </div>
        </div>

        {/* FULL HOURLY X-RAY INSPECTION RECORDS TABLE (MATCHING AOI TABLE STRUCTURE) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-pink-600" />
                Hourly X-ray Inspection Records ({activeMachine.machineId} — Multi-Model Shift Log)
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Complete shift record by hourly time slots (07:00 - 18:00) with micro-focus NDT radiography analysis
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modify Hourly Records</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
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
                  <th className="p-2.5 font-bold text-right text-pink-700">Avg Void %</th>
                  <th className="p-2.5 font-bold text-right text-slate-600">Max Void %</th>
                  <th className="p-2.5 font-bold text-right text-slate-600">Tube &amp; Rad</th>
                  <th className="p-2.5 font-bold text-right">Yield %</th>
                  <th className="p-2.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayHourlySlots.map((slot) => {
                  const badge = getModelBadge(slot.runningModel);
                  const isSelected = selectedHourFilter === slot.hourShort;

                  return (
                    <tr
                      key={slot.hour}
                      onClick={() => setSelectedHourFilter(slot.hourShort)}
                      className={`hover:bg-pink-50/50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-pink-50/80 font-bold' : ''
                      }`}
                    >
                      <td className="p-2.5 text-slate-900 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-pink-500 opacity-70" />
                        {slot.hour}
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {slot.runningModel}
                        </span>
                      </td>
                      <td className="p-2.5 text-right text-slate-500">{slot.targetUph}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{slot.actualInspected}</td>
                      <td className="p-2.5 text-right text-emerald-700 font-bold">{slot.passCount}</td>
                      <td className="p-2.5 text-right text-rose-700 font-bold">{slot.failCount}</td>
                      <td className="p-2.5 text-right text-pink-700 font-bold">{slot.avgVoidPercent}%</td>
                      <td className="p-2.5 text-right text-slate-700">{slot.maxVoidPercent}%</td>
                      <td className="p-2.5 text-right text-slate-600">{slot.tubeKvAvg} kV / {slot.radiationLeakageDose} μSv/h</td>
                      <td className="p-2.5 text-right font-bold text-pink-900">{slot.yieldPercent}%</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            slot.yieldPercent >= 98.5
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {slot.yieldPercent >= 98.5 ? 'NORMAL' : 'WATCH'}
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
                  <td className="p-2.5 text-right">{activeMachine.targetUph * shiftSummary.slotCount}</td>
                  <td className="p-2.5 text-right">{shiftSummary.totalIn}</td>
                  <td className="p-2.5 text-right text-emerald-800">{shiftSummary.totalPass}</td>
                  <td className="p-2.5 text-right text-rose-800">{shiftSummary.totalFail}</td>
                  <td className="p-2.5 text-right text-pink-700 font-bold">{shiftSummary.avgVoid}%</td>
                  <td className="p-2.5 text-right text-slate-800">{shiftSummary.maxShiftVoid}%</td>
                  <td className="p-2.5 text-right text-slate-800">{shiftSummary.avgTubeKv} kV / {shiftSummary.avgRadiation} μSv/h</td>
                  <td className="p-2.5 text-right text-pink-950">{shiftSummary.avgYield}%</td>
                  <td className="p-2.5 text-center text-emerald-800">PASSED</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ACTIVE MODEL DEDICATED PRODUCTION RUN SPECS (MATCHING AOI BOTTOM BANNER) */}
        <section className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-400/30 text-pink-300">
                <CheckCircle2 className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-base font-black text-white">
                    {activeModelMeta.name} — {activeModelMeta.title}
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-pink-500/30 text-pink-200 border border-pink-400/40 px-2 py-0.5 rounded-md">
                    {activeModelMeta.rev}
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                    {activeModelMeta.productionRun}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  {activeModelMeta.desc} • Target Zone: <span className="text-white font-semibold">{activeModelMeta.bgaZone}</span> • Recipe: <span className="text-pink-300">{activeModelMeta.recipeName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-pink-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
              <span>NDT Sensor:</span>
              <strong className="text-white">90kV Micro-Focus Radiography</strong>
            </div>
          </div>
        </section>
      </div>

      {/* EDIT HOURLY DATA MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-pink-200 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-pink-700 to-rose-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-white/20">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black">Edit Hourly X-ray Radiography Records</h3>
                  <p className="text-xs text-pink-100">Machine: {activeMachine.name} (Multi-Model Rotation)</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="space-y-3">
                {activeMachine.hourlyData.map((slot, idx) => (
                  <div key={slot.hour} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs font-mono items-center">
                    <div className="font-bold text-slate-800">
                      <div>{slot.hourShort}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Model:</span>
                      <select
                        value={slot.runningModel}
                        onChange={(e) => {
                          handleUpdateSlot(idx, { runningModel: e.target.value });
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                      >
                        {AVAILABLE_XRAY_MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Scanned In:</span>
                      <input
                        type="number"
                        value={slot.actualInspected}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateSlot(idx, { actualInspected: val, passCount: Math.max(0, val - slot.failCount) });
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Pass Count:</span>
                      <input
                        type="number"
                        value={slot.passCount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateSlot(idx, { passCount: val, failCount: Math.max(0, slot.actualInspected - val) });
                        }}
                        className="w-full px-2 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Fail Count:</span>
                      <input
                        type="number"
                        value={slot.failCount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateSlot(idx, { failCount: val, passCount: Math.max(0, slot.actualInspected - val) });
                        }}
                        className="w-full px-2 py-1 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Avg Void %:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={slot.avgVoidPercent}
                        onChange={(e) => {
                          handleUpdateSlot(idx, { avgVoidPercent: Number(e.target.value) });
                        }}
                        className="w-full px-2 py-1 bg-pink-50 border border-pink-300 rounded-lg text-pink-900 font-bold"
                      />
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
                className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

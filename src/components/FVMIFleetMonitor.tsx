import React, { useState, useMemo } from 'react';
import { Header } from './Header';
import { useFactory } from '../context/FactoryContext';
import { MachineAnalyticsControlBar } from './MachineAnalyticsControlBar';
import { FVMIFleetCombinedChart } from './FVMIFleetCombinedChart';
import {
  INITIAL_FULL_9_FVMI_FLEET,
  FVMI_SUPPORTED_MODELS,
  FvmiHourlySlot,
  FVMI_HOURLY_SLOTS_DEF,
  FVMIDefectLog,
  FVMIPanelRecord
} from '../data/fvmiFleetData';
import {
  Scan,
  CheckCircle2,
  AlertOctagon,
  Activity,
  ChevronDown,
  Play,
  Square,
  AlertTriangle,
  Clock,
  User,
  Cpu,
  Layers,
  RotateCcw,
  Trash2,
  XCircle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Sliders,
  Filter,
  Flame,
  ShieldAlert,
  ExternalLink,
  Edit3,
  Download,
  Save,
  X,
  FileSpreadsheet,
  Camera,
  UserCheck,
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
import { MachineStatus } from '../types';

export interface FVMIMachineHourlyData {
  id: string; // 'FVMI-01' to 'FVMI-09'
  name: string;
  stationNumber: number;
  type: string;
  status: MachineStatus;
  activeModelId: string;
  runningModel: string;
  operatorId: string;
  operatorName: string;
  shiftTime: string;
  cameraStatus: {
    topCam: 'OK' | 'WARN' | 'ERROR';
    sideCam: 'OK' | 'WARN' | 'ERROR';
    coaxialLight: number;
    exposureUs: number;
  };
  downtimeReason?: string;
  downtimeDurationMins?: number;
  hourlyData: FvmiHourlySlot[];
  recentPanels: FVMIPanelRecord[];
  recentDefects: FVMIDefectLog[];
}

// Generate initial 9 stations with their 12 hourly slots from initial full fleet data
function getInitialFleetHourlyData(): FVMIMachineHourlyData[] {
  return INITIAL_FULL_9_FVMI_FLEET.map((st) => {
    const activeModel = st.activeModelId;
    const modelData = st.models[activeModel] || st.models['504-2224'];

    return {
      id: st.id,
      name: st.name,
      stationNumber: st.stationNumber,
      type: st.type,
      status: st.status as MachineStatus,
      activeModelId: activeModel,
      runningModel: `MODEL ${activeModel}`,
      operatorId: modelData.operatorId,
      operatorName: modelData.operatorName,
      shiftTime: st.shiftTime,
      cameraStatus: {
        topCam: st.cameraStatus.topCam,
        sideCam: st.cameraStatus.sideCam,
        coaxialLight: st.cameraStatus.coaxialLight,
        exposureUs: st.cameraStatus.exposureUs,
      },
      downtimeReason: st.downtimeReason,
      downtimeDurationMins: st.downtimeDurationMins,
      hourlyData: JSON.parse(JSON.stringify(modelData.hourlyData)),
      recentPanels: JSON.parse(JSON.stringify(modelData.recentPanels)),
      recentDefects: JSON.parse(JSON.stringify(modelData.recentDefects)),
    };
  });
}

const STORAGE_FVMI_FLEET_DATA = 'factory_fvmi_fleet_hourly_data_v2';
const STORAGE_FVMI_SELECTED_STATION = 'fvmi_fleet_selected_station_v2';
const STORAGE_FVMI_SELECTED_HOUR = 'fvmi_fleet_selected_hour_v2';

export const FVMIFleetMonitor: React.FC = () => {
  const { navigate, setSelectedMachineId, selectedDate, isToday } = useFactory();

  // Load persistent hourly data from localStorage or default
  const [fleet, setFleet] = useState<FVMIMachineHourlyData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FVMI_FLEET_DATA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 9) {
          return parsed;
        }
      }
    } catch (e) {}
    return getInitialFleetHourlyData();
  });

  const saveFleetData = (newFleet: FVMIMachineHourlyData[]) => {
    setFleet(newFleet);
    try {
      localStorage.setItem(STORAGE_FVMI_FLEET_DATA, JSON.stringify(newFleet));
    } catch (e) {}
  };

  // Selected station: 'ALL' (combined) or 'FVMI-01' ... 'FVMI-09'
  const [selectedStationId, setSelectedStationIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FVMI_SELECTED_STATION);
      if (saved) return saved;
    } catch (e) {}
    return 'ALL';
  });

  const setSelectedStationId = (id: string) => {
    setSelectedStationIdState(id);
    try {
      localStorage.setItem(STORAGE_FVMI_SELECTED_STATION, id);
    } catch (e) {}
  };

  // Selected hourly slot filter: 'ALL' or '07:00', '08:00', ...
  const [selectedHourSlot, setSelectedHourSlotState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FVMI_SELECTED_HOUR);
      if (saved) return saved;
    } catch (e) {}
    return 'ALL';
  });

  const setSelectedHourSlot = (hour: string) => {
    setSelectedHourSlotState(hour);
    try {
      localStorage.setItem(STORAGE_FVMI_SELECTED_HOUR, hour);
    } catch (e) {}
  };

  // Chart Metric Selection
  const [selectedChartMetric, setSelectedChartMetric] = useState<'all' | 'fail' | 'rework' | 'discard' | 'xout'>('all');

  // Edit Hourly Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStationId, setEditingStationId] = useState('FVMI-01');
  const [tempHourlySlots, setTempHourlySlots] = useState<FvmiHourlySlot[]>([]);

  // Traceability Modal State
  const [traceabilityPanelId, setTraceabilityPanelId] = useState<string | null>(null);

  // Compute station statistics from hourly slots
  const computedFleet = useMemo(() => {
    return fleet.map((st) => {
      const activeSlots = selectedHourSlot === 'ALL'
        ? st.hourlyData
        : st.hourlyData.filter((s) => s.hourShort === selectedHourSlot);

      const calculatedInput = activeSlots.reduce((sum, s) => sum + s.actualIn, 0);
      const calculatedPass = activeSlots.reduce((sum, s) => sum + s.passCount, 0);
      const calculatedFail = activeSlots.reduce((sum, s) => sum + s.failCount, 0);
      const calculatedXout = activeSlots.reduce((sum, s) => sum + s.xoutCount, 0);
      const calculatedRework = activeSlots.reduce((sum, s) => sum + s.reworkCount, 0);
      const calculatedDiscard = activeSlots.reduce((sum, s) => sum + s.discardCount, 0);

      const calculatedPassRate = calculatedInput > 0 ? Number(((calculatedPass / calculatedInput) * 100).toFixed(2)) : 100;
      const calculatedFailRate = calculatedInput > 0 ? Number(((calculatedFail / calculatedInput) * 100).toFixed(2)) : 0;
      const calculatedXoutRate = calculatedInput > 0 ? Number(((calculatedXout / calculatedInput) * 100).toFixed(2)) : 0;
      const calculatedReworkRate = calculatedInput > 0 ? Number(((calculatedRework / calculatedInput) * 100).toFixed(2)) : 0;
      const calculatedDiscardRate = calculatedInput > 0 ? Number(((calculatedDiscard / calculatedInput) * 100).toFixed(2)) : 0;

      // Current UPH is either selected hour's actual or latest slot's actual throughput
      const currentSlot = st.hourlyData[st.hourlyData.length - 1];
      const uph = st.status === 'STOP' ? 0 : (selectedHourSlot === 'ALL' ? (currentSlot ? currentSlot.actualIn : Math.round(calculatedInput / Math.max(1, st.hourlyData.length))) : calculatedInput);

      return {
        ...st,
        uph,
        calculatedInput,
        calculatedPass,
        calculatedFail,
        calculatedXout,
        calculatedRework,
        calculatedDiscard,
        calculatedPassRate,
        calculatedFailRate,
        calculatedXoutRate,
        calculatedReworkRate,
        calculatedDiscardRate,
      };
    });
  }, [fleet, selectedHourSlot]);

  // Total Fleet Summary Metrics
  const fleetSummary = useMemo(() => {
    const totalInput = computedFleet.reduce((sum, m) => sum + m.calculatedInput, 0);
    const totalPass = computedFleet.reduce((sum, m) => sum + m.calculatedPass, 0);
    const totalFail = computedFleet.reduce((sum, m) => sum + m.calculatedFail, 0);
    const totalXout = computedFleet.reduce((sum, m) => sum + m.calculatedXout, 0);
    const totalRework = computedFleet.reduce((sum, m) => sum + m.calculatedRework, 0);
    const totalDiscard = computedFleet.reduce((sum, m) => sum + m.calculatedDiscard, 0);

    const overallPassRate = totalInput > 0 ? Number(((totalPass / totalInput) * 100).toFixed(2)) : 100;
    const overallFailRate = totalInput > 0 ? Number(((totalFail / totalInput) * 100).toFixed(2)) : 0;
    const runningCount = computedFleet.filter((m) => m.status === 'RUNNING').length;

    return {
      totalInput,
      totalPass,
      totalFail,
      totalXout,
      totalRework,
      totalDiscard,
      overallPassRate,
      overallFailRate,
      runningCount,
      totalStations: computedFleet.length,
    };
  }, [computedFleet]);

  // Hourly Fleet Output Breakdown across all 9 stations
  const fleetHourlyTotals = useMemo(() => {
    return FVMI_HOURLY_SLOTS_DEF.map((slotDef, idx) => {
      let slotTotal = 0;
      let slotPass = 0;
      let slotFail = 0;
      let slotXout = 0;
      let slotRework = 0;
      let slotDiscard = 0;
      let slotTarget = 0;

      fleet.forEach((st) => {
        if (st.hourlyData && st.hourlyData[idx]) {
          slotTotal += st.hourlyData[idx].actualIn;
          slotPass += st.hourlyData[idx].passCount;
          slotFail += st.hourlyData[idx].failCount;
          slotXout += st.hourlyData[idx].xoutCount;
          slotRework += st.hourlyData[idx].reworkCount;
          slotDiscard += st.hourlyData[idx].discardCount;
          slotTarget += st.hourlyData[idx].targetUph;
        }
      });

      const yieldPercent = slotTotal > 0 ? Number(((slotPass / slotTotal) * 100).toFixed(2)) : 100;

      return {
        hourShort: slotDef.hourShort,
        hourFull: slotDef.hour,
        total: slotTotal,
        pass: slotPass,
        fail: slotFail,
        xout: slotXout,
        rework: slotRework,
        discard: slotDiscard,
        target: slotTarget || 9900,
        yieldPercent,
      };
    });
  }, [fleet]);

  const selectedMachine = computedFleet.find((m) => m.id === selectedStationId) || computedFleet[0];
  const isSelectedRunning = selectedMachine.status === 'RUNNING';

  // Aggregate stats per Model for comparison
  const modelStats = useMemo(() => {
    const map = new Map<string, { modelId: string; total: number; pass: number; fail: number; xout: number; rework: number; discard: number }>();

    computedFleet.forEach((st) => {
      const model = st.runningModel;
      const existing = map.get(model) || {
        modelId: model,
        total: 0,
        pass: 0,
        fail: 0,
        xout: 0,
        rework: 0,
        discard: 0,
      };

      existing.total += st.calculatedInput;
      existing.pass += st.calculatedPass;
      existing.fail += st.calculatedFail;
      existing.xout += st.calculatedXout;
      existing.rework += st.calculatedRework;
      existing.discard += st.calculatedDiscard;

      map.set(model, existing);
    });

    const list = Array.from(map.values());
    list.sort((a, b) => b.fail - a.fail);
    return list;
  }, [computedFleet]);

  const worstModel = useMemo(() => {
    if (modelStats.length === 0) return null;
    return modelStats.reduce((worst, current) => {
      const currentFailPct = current.total > 0 ? current.fail / current.total : 0;
      const worstFailPct = worst.total > 0 ? worst.fail / worst.total : 0;
      return currentFailPct > worstFailPct ? current : worst;
    }, modelStats[0]);
  }, [modelStats]);

  // Model Badge Helper (matching AOI/X-ray styling)
  const getModelBadge = (modelId: string) => {
    const cleanId = modelId.replace('MODEL ', '').trim();
    switch (cleanId) {
      case '504-2187':
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' };
      case '504-2268':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
      case '504-2154':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
      case '504-2224':
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' };
      case '504-2454':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' };
    }
  };

  // Orange Volume Scale color helper (matching AOI)
  const getFvmiBarColor = (actualIn: number, slots: { actualIn: number }[]) => {
    const maxVal = Math.max(...slots.map((s) => s.actualIn), 1);
    const minVal = Math.min(...slots.map((s) => s.actualIn), 0);
    const range = maxVal - minVal;
    const ratio = range <= 0 ? 1 : (actualIn - minVal) / range;
    if (ratio < 0.25) return '#fed7aa'; // light orange
    if (ratio < 0.50) return '#fb923c'; // mid-light
    if (ratio < 0.75) return '#f97316'; // orange-500
    return '#c2410c'; // peak dark orange
  };

  const toggleStationStatus = (id: string) => {
    const updated = fleet.map((m) => {
      if (m.id === id) {
        const nextStatus: MachineStatus = m.status === 'RUNNING' ? 'STOP' : 'RUNNING';
        return {
          ...m,
          status: nextStatus,
          downtimeReason: nextStatus === 'STOP' ? 'Operator Manual Pause' : undefined,
          downtimeDurationMins: nextStatus === 'STOP' ? 1 : m.downtimeDurationMins,
        };
      }
      return m;
    });
    saveFleetData(updated);
  };

  const handleModelChange = (id: string, newModel: string) => {
    const cleanModelId = newModel.replace('MODEL ', '');
    const fullStation = INITIAL_FULL_9_FVMI_FLEET.find((st) => st.id === id);
    const stationModelData = fullStation?.models[cleanModelId] || fullStation?.models['504-2224'];

    const updated = fleet.map((m) => {
      if (m.id === id && stationModelData) {
        return {
          ...m,
          activeModelId: cleanModelId,
          runningModel: newModel,
          operatorId: stationModelData.operatorId,
          operatorName: stationModelData.operatorName,
          hourlyData: JSON.parse(JSON.stringify(stationModelData.hourlyData)),
          recentPanels: JSON.parse(JSON.stringify(stationModelData.recentPanels)),
          recentDefects: JSON.parse(JSON.stringify(stationModelData.recentDefects)),
        };
      }
      return m;
    });
    saveFleetData(updated);
  };

  // Open Edit Hourly Modal
  const openEditModal = (stId: string) => {
    const target = fleet.find((st) => st.id === stId);
    if (target) {
      setEditingStationId(stId);
      setTempHourlySlots(JSON.parse(JSON.stringify(target.hourlyData)));
      setIsEditModalOpen(true);
    }
  };

  // Handle Temp Hourly Edit
  const handleTempSlotChange = (
    index: number,
    field: 'actualIn' | 'passCount' | 'xoutCount' | 'reworkCount' | 'discardCount' | 'targetUph',
    val: number
  ) => {
    setTempHourlySlots((prev) => {
      const next = [...prev];
      const slot = { ...next[index] };
      const safeVal = Math.max(0, isNaN(val) ? 0 : val);

      (slot as any)[field] = safeVal;

      // Recalculate NG and Yield
      if (field === 'actualIn' || field === 'passCount' || field === 'xoutCount' || field === 'reworkCount' || field === 'discardCount') {
        const actual = field === 'actualIn' ? safeVal : slot.actualIn;
        const pass = field === 'passCount' ? safeVal : slot.passCount;
        const xout = field === 'xoutCount' ? safeVal : slot.xoutCount;
        const rework = field === 'reworkCount' ? safeVal : slot.reworkCount;
        const discard = field === 'discardCount' ? safeVal : slot.discardCount;

        slot.failCount = xout + rework + discard;
        slot.yieldPercent = actual > 0 ? Number(((pass / actual) * 100).toFixed(2)) : 100;
      }

      next[index] = slot;
      return next;
    });
  };

  const handleSaveHourlyEdit = () => {
    const updated = fleet.map((st) => {
      if (st.id === editingStationId) {
        return {
          ...st,
          hourlyData: tempHourlySlots,
        };
      }
      return st;
    });
    saveFleetData(updated);
    setIsEditModalOpen(false);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all 9 FVMI stations hourly data to standard factory default?')) {
      const initial = getInitialFleetHourlyData();
      saveFleetData(initial);
      setIsEditModalOpen(false);
    }
  };

  // Export CSV Functionality
  const exportHourlyCSV = () => {
    const headers = ['Station ID', 'Machine Type', 'Hour Slot', 'Model Code', 'Target UPH', 'Actual Inspected (Pcs)', 'Pass Count (Pcs)', 'Fail Count (Pcs)', 'X-Out Count (Pcs)', 'Rework Count (Pcs)', 'Discard Count (Pcs)', 'Pass Yield (%)'];
    const rows: string[][] = [];

    fleet.forEach((st) => {
      st.hourlyData.forEach((slot) => {
        rows.push([
          st.id,
          `"${st.type}"`,
          `"${slot.hour}"`,
          st.runningModel,
          slot.targetUph.toString(),
          slot.actualIn.toString(),
          slot.passCount.toString(),
          slot.failCount.toString(),
          slot.xoutCount.toString(),
          slot.reworkCount.toString(),
          slot.discardCount.toString(),
          slot.yieldPercent.toString(),
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FVMI_9_Fleet_Hourly_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#1b1b1d] pb-20 md:pb-8 font-sans">
      <Header
        title="FVMI Fleet Monitor (9 Stations)"
        subtitle="Automated Optical Inspection Fleet • Hourly Calculation & Defect Breakdown"
        badge={
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span>ORANGE CATEGORY</span>
          </span>
        }
      />

      <div className="pt-4 px-4 md:px-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Unified Standard Analytics Control Strip & Breakdown */}
        <MachineAnalyticsControlBar
          totalOutput={fleetSummary.totalPass}
          outputUnit="boards"
          activeHours={8}
          peakHourLabel="02 SEPT 15:00"
          peakHourValue={
            fleetHourlyTotals && fleetHourlyTotals.length > 0
              ? Math.max(...fleetHourlyTotals.map((h) => h.pass), 1250)
              : 1250
          }
          avgPerActiveHour={Math.round(fleetSummary.totalPass / 8)}
          lines={[
            'All FVMI Fleet',
            ...computedFleet.map((st) => 
              st.stationNumber <= 5 
                ? `Line 0${st.stationNumber} (${st.id})`
                : `Line 06 (${st.id} - Bay ${String.fromCharCode(65 + st.stationNumber - 6)})`
            )
          ]}
          selectedLine={
            selectedStationId === 'ALL'
              ? 'All FVMI Fleet'
              : (computedFleet.find((st) => st.id === selectedStationId)?.stationNumber || 1) <= 5
              ? `Line 0${computedFleet.find((st) => st.id === selectedStationId)?.stationNumber || 1} (${selectedStationId})`
              : `Line 06 (${selectedStationId} - Bay ${String.fromCharCode(65 + (computedFleet.find((st) => st.id === selectedStationId)?.stationNumber || 6) - 6)})`
          }
          onLineChange={(l) => {
            if (l.includes('All')) {
              setSelectedStationId('ALL');
            } else {
              const found = computedFleet.find((st) => l.includes(st.id));
              if (found) setSelectedStationId(found.id);
            }
          }}
          products={['All', ...FVMI_SUPPORTED_MODELS.map((m) => `Model ${m}`)]}
          selectedProduct={selectedStationId === 'ALL' ? 'All' : `Model ${fleet.find((m) => m.id === selectedStationId)?.activeModelId || '504-2187'}`}
          onProductChange={(p) => {
            const found = FVMI_SUPPORTED_MODELS.find((m) => p.includes(m));
            if (found && selectedStationId !== 'ALL') handleModelChange(selectedStationId, `MODEL ${found}`);
          }}
          breakdownData={{
            Line: computedFleet.map((st) => ({
              name: st.stationNumber <= 5 
                ? `Line 0${st.stationNumber} (${st.id})`
                : `Line 06 (${st.id} - Bay ${String.fromCharCode(65 + st.stationNumber - 6)})`,
              count: st.calculatedPass,
            })),
            Product: FVMI_SUPPORTED_MODELS.map((m, idx) => ({
              name: `Model ${m}`,
              count: idx === 0 ? Math.round(fleetSummary.totalPass * 0.45) : Math.round(fleetSummary.totalPass * (0.3 - idx * 0.08)),
            })),
            Operator: computedFleet.slice(0, 5).map((st) => ({
              name: `${st.operatorName} (${st.id})`,
              count: st.calculatedPass,
            })),
            Lot: [
              { name: 'LOT-2026-09A', count: Math.round(fleetSummary.totalPass * 0.45) },
              { name: 'LOT-2026-09B', count: Math.round(fleetSummary.totalPass * 0.35) },
              { name: 'LOT-2026-08F', count: Math.round(fleetSummary.totalPass * 0.20) },
            ],
            Rack: [
              { name: 'Rack R-01 (Infeed A)', count: Math.round(fleetSummary.totalPass * 0.38) },
              { name: 'Rack R-02 (Infeed B)', count: Math.round(fleetSummary.totalPass * 0.34) },
              { name: 'Rack R-03 (Passed Staging)', count: Math.round(fleetSummary.totalPass * 0.28) },
            ],
          }}
          extraActions={
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">
                  {fleetSummary.runningCount}/9 Online
                </span>
              </div>
              <button
                onClick={() => openEditModal(selectedStationId)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                <span>Edit Hourly Data</span>
              </button>
              <button
                onClick={exportHourlyCSV}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          }
        />

        {/* MACHINE QUICK SWITCHER (9 FVMI Stations + Fleet Overview) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-orange-50/60 p-2.5 rounded-2xl border border-orange-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-orange-900 shrink-0 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-orange-600" />
              Select Machine:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <button
                onClick={() => setSelectedStationId('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  selectedStationId === 'ALL'
                    ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-orange-100/60 border-orange-200'
                }`}
              >
                <span>ALL (Fleet)</span>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedStationId === 'ALL' ? 'bg-white' : 'bg-emerald-500'}`} />
                <span className={`text-[10px] ${selectedStationId === 'ALL' ? 'text-orange-100' : 'text-slate-500'}`}>
                  {fleetSummary.totalInput.toLocaleString()} pcs ({fleetSummary.overallPassRate}%)
                </span>
              </button>

              {computedFleet.map((m) => {
                const isSelected = m.id === selectedStationId;
                const isRunning = m.status === 'RUNNING';

                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedStationId(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                      isSelected
                        ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-orange-100/60 border-orange-200'
                    }`}
                  >
                    <span>{m.id}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : isRunning ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={`text-[10px] ${isSelected ? 'text-orange-100' : 'text-slate-500'}`}>
                      {m.calculatedInput.toLocaleString()} pcs ({m.calculatedPassRate}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {selectedStationId !== 'ALL' && (
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-orange-800">
              <span>Op: <strong>{selectedMachine.operatorName}</strong></span>
              <span className="text-orange-300">•</span>
              <span>Top: <strong className="text-emerald-700">{selectedMachine.cameraStatus.topCam}</strong></span>
              <span className="text-orange-300">•</span>
              <span>Side: <strong className="text-emerald-700">{selectedMachine.cameraStatus.sideCam}</strong></span>
              <span className="text-orange-300">•</span>
              <span>Light: <strong>{selectedMachine.cameraStatus.coaxialLight}%</strong></span>
              <span className="text-orange-300">•</span>
              <span>Exp: <strong>{selectedMachine.cameraStatus.exposureUs}μs</strong></span>
            </div>
          )}
        </div>

        {/* Global 9-Station Fleet KPI Metrics Cards - Shown on Consolidated ALL View */}
        {selectedStationId === 'ALL' && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-orange-500 p-5 shadow-xs">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
                Fleet Inspected (Shift Total)
              </span>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="font-mono font-black text-3xl text-[#0f172a]">
                  {fleetSummary.totalInput.toLocaleString()}
                </span>
                <span className="text-xs text-[#64748b] font-mono">pcs</span>
              </div>
              <div className="text-xs text-orange-700 font-bold mt-2 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 inline-block font-mono">
                Target: 8,000 pcs / shift
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-orange-500 p-5 shadow-xs">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
                Pass Yield Rate
              </span>
              <div className="flex items-baseline space-x-1 mt-2">
                <span className="font-mono font-black text-3xl text-emerald-700">
                  {fleetSummary.overallPassRate}%
                </span>
              </div>
              <div className="text-xs text-rose-700 font-bold mt-2 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block font-mono">
                Fail: {fleetSummary.overallFailRate}% ({fleetSummary.totalFail.toLocaleString()} pcs)
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-orange-500 p-5 shadow-xs">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
                Defect Classification
              </span>
              <div className="text-xs font-mono space-y-1 mt-2 text-[#475569]">
                <div className="flex justify-between">
                  <span>X-Out (XO):</span>
                  <strong className="text-amber-700">{fleetSummary.totalXout.toLocaleString()} pcs</strong>
                </div>
                <div className="flex justify-between">
                  <span>Rework (RW):</span>
                  <strong className="text-sky-700">{fleetSummary.totalRework.toLocaleString()} pcs</strong>
                </div>
                <div className="flex justify-between">
                  <span>Discard (DC):</span>
                  <strong className="text-rose-700">{fleetSummary.totalDiscard.toLocaleString()} pcs</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Unified 9-Station Real-Time Fleet Graph - Shown on Consolidated ALL View */}
        {selectedStationId === 'ALL' && (
          <FVMIFleetCombinedChart
            stations={computedFleet}
            selectedStationId={selectedStationId}
            onSelectStation={setSelectedStationId}
            selectedHourSlot={selectedHourSlot}
            onSelectHourSlot={setSelectedHourSlot}
            timeWindowLabel={selectedHourSlot === 'ALL' ? 'ALL SHIFT' : `SLOT ${selectedHourSlot}`}
          />
        )}

        {/* Selected Station Detailed Inspector - Matching AOI Window Layout */}
        {selectedStationId !== 'ALL' && (
          <div className="space-y-6">
            {/* Station Subheader Control Bar */}
            <div className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-orange-500 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h3 className="font-mono font-black text-xl text-[#0f172a]">
                    {selectedMachine.id}
                  </h3>
                  <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                    {selectedMachine.name}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono ${
                    isSelectedRunning ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isSelectedRunning ? 'ONLINE' : 'STOPPED'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    Recipe: {selectedMachine.runningModel}
                  </span>
                </div>
                <div className="text-xs text-[#64748b] font-medium mt-1 flex items-center gap-2">
                  <span>Op: <strong className="text-[#0f172a]">{selectedMachine.operatorName}</strong> ({selectedMachine.operatorId})</span>
                  <span>•</span>
                  <span>Shift: <strong className="font-mono text-[#0f172a]">{selectedMachine.shiftTime}</strong></span>
                  <span>•</span>
                  <button
                    onClick={() => setSelectedStationId('ALL')}
                    className="text-orange-700 hover:text-orange-900 font-bold underline cursor-pointer text-xs ml-1"
                  >
                    ← Back to Consolidated Fleet View
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={() => openEditModal(selectedMachine.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Edit Hourly Inspection Counts"
                >
                  <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Edit Hourly</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedMachineId(selectedMachine.id);
                    navigate('fvmi-detail');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0f172a] border border-[#cbd5e1] flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                  title="View Station Analytics Detail"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
                  <span>Detail View</span>
                </button>

                {/* Run / Stop Toggle */}
                <button
                  onClick={() => toggleStationStatus(selectedMachine.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs ${
                    isSelectedRunning
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  {isSelectedRunning ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>STOP</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>START</span>
                    </>
                  )}
                </button>

                {/* Return to Fleet Button */}
                <button
                  onClick={() => setSelectedStationId('ALL')}
                  className="text-xs font-mono font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                  title="Close and return to fleet overview"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* 4-Card KPI Grid (Matching AOI window) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                  Total Inspected (In)
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                  {selectedMachine.calculatedInput.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">pcs</span>
                </div>
                <div className="text-[10px] text-orange-700 font-mono mt-1 font-bold">
                  {selectedMachine.hourlyData.length} Hourly Batches
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                  Defective (Total NG)
                </span>
                <div className="text-2xl font-black font-mono text-rose-700 mt-1">
                  {selectedMachine.calculatedFail.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">pcs</span>
                </div>
                <div className="text-[10px] text-rose-600 font-mono mt-1 font-semibold">
                  XO: {selectedMachine.calculatedXout} | RW: {selectedMachine.calculatedRework} | DC: {selectedMachine.calculatedDiscard}
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                  Shift Yield Rate
                </span>
                <div className="text-2xl font-black font-mono text-orange-900 mt-1">
                  {selectedMachine.calculatedPassRate}%
                </div>
                <div className="text-[10px] text-orange-600 font-mono mt-1 font-bold">
                  Target ≥ 98.00%
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl shadow-xs">
                <span className="text-[11px] font-mono text-orange-800 uppercase font-bold">
                  Target UPH
                </span>
                <div className="text-2xl font-black font-mono text-orange-950 mt-1">
                  {selectedMachine.hourlyData[0]?.targetUph || 120}{' '}
                  <span className="text-xs font-normal text-orange-700">UPH</span>
                </div>
                <div className="text-[10px] text-orange-700 font-mono mt-1 font-bold">
                  Avg Cycle: 3.0s | Exp: {selectedMachine.cameraStatus.exposureUs}μs
                </div>
              </div>
            </div>

            {/* Hourly Single-Bar Output Chart & Defect Pareto Grid (Matching AOI window) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Single Clean Bar Chart with Volume Intensity Scale */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="font-mono font-black text-sm text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-orange-600" />
                      FVMI Hourly Output ({selectedMachine.id})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Inspected throughput per hour across alternating shift models (07:00 - 18:00)
                    </p>
                  </div>

                  {/* Volume Intensity Legend */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                    <span>Volume Scale:</span>
                    <span className="text-[9px] text-slate-400">Low</span>
                    <span className="w-3 h-3 rounded-xs bg-[#fed7aa] border border-orange-200 inline-block" title="Low volume" />
                    <span className="w-3 h-3 rounded-xs bg-[#fb923c] inline-block" title="Mid-low volume" />
                    <span className="w-3 h-3 rounded-xs bg-[#f97316] inline-block" title="Mid-high volume" />
                    <span className="w-3 h-3 rounded-xs bg-[#c2410c] inline-block" title="Peak volume" />
                    <span className="text-[9px] text-slate-400">Peak</span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedMachine.hourlyData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        domain={[0, 'auto']}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as FvmiHourlySlot;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs font-mono space-y-1.5 border border-slate-700 min-w-[210px]">
                                <div className="font-bold border-b border-slate-700 pb-1 flex items-center justify-between">
                                  <span>{data.hour}</span>
                                  <span className="text-[10px] bg-orange-950 text-orange-300 px-1.5 py-0.5 rounded border border-orange-800">
                                    {data.runningModel}
                                  </span>
                                </div>
                                <div className="text-orange-400 font-bold flex justify-between">
                                  <span>Inspected:</span>
                                  <span>{data.actualIn.toLocaleString()} pcs</span>
                                </div>
                                <div className="flex justify-between text-emerald-400">
                                  <span>Total Good:</span>
                                  <span>{data.passCount.toLocaleString()} pcs</span>
                                </div>
                                <div className="flex justify-between text-rose-400">
                                  <span>Total NG:</span>
                                  <span>{data.failCount.toLocaleString()} pcs</span>
                                </div>
                                <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex justify-between">
                                  <span>XO: {data.xoutCount} | RW: {data.reworkCount} | DC: {data.discardCount}</span>
                                  <span className="text-emerald-400 font-bold">{data.yieldPercent}%</span>
                                </div>
                                <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1">
                                  Top Cam OK • Side Cam OK • Exp: {selectedMachine.cameraStatus.exposureUs}μs
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="actualIn"
                        name="Inspected"
                        radius={[8, 8, 0, 0]}
                      >
                        {selectedMachine.hourlyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getFvmiBarColor(entry.actualIn, selectedMachine.hourlyData)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right 1 Col: Defect Distribution Pareto Progress */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-mono font-black text-sm text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      Hourly Defect Distribution
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Shift Total NG: {selectedMachine.calculatedFail} pcs (XO: {selectedMachine.calculatedXout}, RW: {selectedMachine.calculatedRework}, DC: {selectedMachine.calculatedDiscard})
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Defect 1: X-Out */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="font-semibold text-slate-700">X-Out (Die Reject)</span>
                        <span className="text-orange-700 font-bold">
                          {selectedMachine.calculatedXout} pcs ({selectedMachine.calculatedXoutRate}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(8, Number(selectedMachine.calculatedXoutRate) * 12))}%` }}
                        />
                      </div>
                    </div>

                    {/* Defect 2: Rework Required */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="font-semibold text-slate-700">Rework Required</span>
                        <span className="text-amber-700 font-bold">
                          {selectedMachine.calculatedRework} pcs ({selectedMachine.calculatedReworkRate}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(8, Number(selectedMachine.calculatedReworkRate) * 12))}%` }}
                        />
                      </div>
                    </div>

                    {/* Defect 3: Discard / Scrap */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="font-semibold text-slate-700">Discard / Scrap</span>
                        <span className="text-rose-700 font-bold">
                          {selectedMachine.calculatedDiscard} pcs ({selectedMachine.calculatedDiscardRate}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(8, Number(selectedMachine.calculatedDiscardRate) * 15))}%` }}
                        />
                      </div>
                    </div>

                    {/* Defect 4: Foreign Contamination */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="font-semibold text-slate-700">Foreign Contamination</span>
                        <span className="text-purple-700 font-bold">
                          {Math.max(1, Math.round(selectedMachine.calculatedFail * 0.14))} pcs (14.0%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: '14%' }}
                        />
                      </div>
                    </div>

                    {/* Defect 5: Surface Scratch / Blemish */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="font-semibold text-slate-700">Surface Scratch / Blemish</span>
                        <span className="text-indigo-700 font-bold">
                          {Math.max(1, Math.round(selectedMachine.calculatedFail * 0.12))} pcs (12.0%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: '12%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Standard: IPC-A-610 Class 3</span>
                  <span>100% Visual Verified</span>
                </div>
              </div>
            </div>

            {/* Full Hourly Inspection Records Table (Matching AOI window) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-mono font-black text-sm text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    Hourly FVMI Inspection Records ({selectedMachine.id} — Multi-Model Shift Log)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Comprehensive hourly visual inspection log (07:00 - 18:00) with running model badge and defect breakdown
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedMachine.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                    <span>Modify Hourly Slot Table</span>
                  </button>
                  <button
                    onClick={exportHourlyCSV}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#f8fafc] hover:bg-[#e2e8f0] text-slate-700 border border-[#cbd5e1] flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Hour Slot</th>
                      <th className="py-3 px-3">Model</th>
                      <th className="py-3 px-3 text-right">Target</th>
                      <th className="py-3 px-3 text-right">Inspected</th>
                      <th className="py-3 px-3 text-right text-emerald-700">Good</th>
                      <th className="py-3 px-3 text-right text-rose-700">NG</th>
                      <th className="py-3 px-3 text-right text-amber-700">XO / RW / DC</th>
                      <th className="py-3 px-3 text-right">Yield</th>
                      <th className="py-3 px-3 text-center">Optical Telemetry</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {selectedMachine.hourlyData.map((slot, idx) => {
                      const badge = getModelBadge(slot.runningModel);
                      const isHighDefect = slot.failCount > 5;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{slot.hour}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              <span>{slot.runningModel.replace('MODEL ', '')}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500">{slot.targetUph}</td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900">{slot.actualIn.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{slot.passCount.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-700">{slot.failCount.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">
                            <span className="text-amber-700 font-semibold">{slot.xoutCount}</span>
                            <span className="text-slate-300 mx-1">/</span>
                            <span className="text-sky-700 font-semibold">{slot.reworkCount}</span>
                            <span className="text-slate-300 mx-1">/</span>
                            <span className="text-rose-700 font-semibold">{slot.discardCount}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-700">{slot.yieldPercent}%</td>
                          <td className="py-2.5 px-3 text-center text-[10px] text-slate-500">
                            Exp {selectedMachine.cameraStatus.exposureUs}μs • Light {selectedMachine.cameraStatus.coaxialLight}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isHighDefect
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {isHighDefect ? 'WATCH' : 'NORMAL'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => openEditModal(selectedMachine.id)}
                              className="text-xs font-mono font-bold text-orange-700 hover:text-orange-900 underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bar Chart: Model Comparison (Pass / Fail / Rework / Discard / X-Out) - Shown on Consolidated ALL View */}
        {selectedStationId === 'ALL' && (
          <section className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-orange-500 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-[#0f172a] tracking-wider uppercase">
                  Model Defect Benchmark & Breakdown
                </h3>
              </div>
              <span className="text-xs font-mono text-[#64748b]">
                Comparison across all 9 Stations
              </span>
            </div>

            {/* Issue Highlight Banner */}
            {worstModel && (
              <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-bold text-orange-900">
                      Highest Defect Model: <span className="font-mono underline">{worstModel.modelId}</span>
                    </div>
                    <div className="text-xs text-orange-800 font-mono mt-0.5">
                      Fail: {worstModel.fail} pcs ({((worstModel.fail / worstModel.total) * 100).toFixed(2)}%) | Rework: {worstModel.rework} | Discard: {worstModel.discard} | X-Out: {worstModel.xout}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Metric Selector for Bar Chart */}
            <div className="flex items-center space-x-1.5 bg-[#f8fafc] border border-[#cbd5e1] p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSelectedChartMetric('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  selectedChartMetric === 'all' ? 'bg-orange-600 text-white shadow-xs font-mono' : 'text-[#64748b] hover:bg-[#e2e8f0]'
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setSelectedChartMetric('fail')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  selectedChartMetric === 'fail' ? 'bg-rose-600 text-white shadow-xs' : 'text-[#64748b] hover:bg-[#e2e8f0]'
                }`}
              >
                Fail Total
              </button>
              <button
                onClick={() => setSelectedChartMetric('rework')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  selectedChartMetric === 'rework' ? 'bg-sky-600 text-white shadow-xs' : 'text-[#64748b] hover:bg-[#e2e8f0]'
                }`}
              >
                Rework
              </button>
              <button
                onClick={() => setSelectedChartMetric('discard')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  selectedChartMetric === 'discard' ? 'bg-rose-600 text-white shadow-xs' : 'text-[#64748b] hover:bg-[#e2e8f0]'
                }`}
              >
                Discard
              </button>
              <button
                onClick={() => setSelectedChartMetric('xout')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  selectedChartMetric === 'xout' ? 'bg-amber-600 text-white shadow-xs' : 'text-[#64748b] hover:bg-[#e2e8f0]'
                }`}
              >
                X-Out
              </button>
            </div>

            {/* Visual Model Comparison Bars */}
            <div className="space-y-3 pt-1">
              {modelStats.map((item) => {
                const failPercent = item.total > 0 ? (item.fail / item.total) * 100 : 0;
                const passPercent = item.total > 0 ? (item.pass / item.total) * 100 : 0;
                const reworkPercent = item.total > 0 ? (item.rework / item.total) * 100 : 0;
                const discardPercent = item.total > 0 ? (item.discard / item.total) * 100 : 0;
                const xoutPercent = item.total > 0 ? (item.xout / item.total) * 100 : 0;

                return (
                  <div key={item.modelId} className="p-3 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[#0f172a]">
                          {item.modelId}
                        </span>
                        <span className="text-xs text-[#64748b] font-mono">
                          (Total: {item.total.toLocaleString()} pcs)
                        </span>
                      </div>

                      <div className="text-right font-mono text-xs">
                        {selectedChartMetric === 'all' && (
                          <span className="font-bold text-emerald-700">Pass: {passPercent.toFixed(1)}%</span>
                        )}
                        {selectedChartMetric === 'fail' && (
                          <span className="font-bold text-rose-700">Fail: {item.fail} ({failPercent.toFixed(2)}%)</span>
                        )}
                        {selectedChartMetric === 'rework' && (
                          <span className="font-bold text-sky-700">RW: {item.rework} ({reworkPercent.toFixed(2)}%)</span>
                        )}
                        {selectedChartMetric === 'discard' && (
                          <span className="font-bold text-rose-700">DC: {item.discard} ({discardPercent.toFixed(2)}%)</span>
                        )}
                        {selectedChartMetric === 'xout' && (
                          <span className="font-bold text-amber-700">XO: {item.xout} ({xoutPercent.toFixed(2)}%)</span>
                        )}
                      </div>
                    </div>

                    {/* Multi-segment distribution Bar */}
                    <div className="h-3.5 w-full bg-[#e2e8f0] rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${passPercent}%` }}
                        className="bg-emerald-500 transition-all duration-500"
                        title={`Pass: ${item.pass} (${passPercent.toFixed(1)}%)`}
                      />
                      <div
                        style={{ width: `${xoutPercent}%` }}
                        className="bg-amber-500 transition-all duration-500"
                        title={`X-out: ${item.xout}`}
                      />
                      <div
                        style={{ width: `${reworkPercent}%` }}
                        className="bg-sky-500 transition-all duration-500"
                        title={`Rework: ${item.rework}`}
                      />
                      <div
                        style={{ width: `${discardPercent}%` }}
                        className="bg-rose-500 transition-all duration-500"
                        title={`Discard: ${item.discard}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-[#64748b] pt-0.5">
                      <span className="text-emerald-700 font-bold">Pass: {item.pass.toLocaleString()}</span>
                      <span className="text-amber-700 font-bold">X-Out: {item.xout}</span>
                      <span className="text-sky-700 font-bold">Rework: {item.rework}</span>
                      <span className="text-rose-700 font-bold">Discard: {item.discard}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bar Chart Legend */}
            <div className="flex items-center justify-center space-x-4 pt-2 text-xs font-mono text-[#475569] border-t border-[#f1f5f9]">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span>Pass</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500" />
                <span>X-Out</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-sky-500" />
                <span>Rework</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                <span>Discard</span>
              </div>
            </div>
          </section>
        )}

        {/* Consolidated 9-Station Fleet Hourly Breakdown Table - Shown on Consolidated ALL View */}
        {selectedStationId === 'ALL' && (
          <section className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-orange-500 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div>
                <h3 className="font-mono font-black text-sm text-[#0f172a] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-orange-600" />
                  Consolidated Hourly Total Across All 9 Stations (07:00 - 18:00)
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Aggregated shift throughput across all stations
                </p>
              </div>
              <button
                onClick={exportHourlyCSV}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#f8fafc] hover:bg-[#e2e8f0] text-slate-700 border border-[#cbd5e1] flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#cbd5e1]">
              <table className="w-full text-left text-xs font-mono divide-y divide-[#cbd5e1]">
                <thead className="bg-[#f8fafc] text-[#64748b] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Hour Slot</th>
                    <th className="py-2.5 px-3">Scope</th>
                    <th className="py-2.5 px-3 text-right">Target</th>
                    <th className="py-2.5 px-3 text-right">Actual In</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">Pass</th>
                    <th className="py-2.5 px-3 text-right text-rose-700">Fail</th>
                    <th className="py-2.5 px-3 text-right text-amber-700">X-Out</th>
                    <th className="py-2.5 px-3 text-right text-sky-700">Rework</th>
                    <th className="py-2.5 px-3 text-right text-rose-700">Discard</th>
                    <th className="py-2.5 px-4 text-right">Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] bg-white">
                  {fleetHourlyTotals.map((slot, idx) => {
                    const isRowSelected = selectedHourSlot === slot.hourShort;
                    return (
                      <tr
                        key={idx}
                        onClick={() => setSelectedHourSlot(selectedHourSlot === slot.hourShort ? 'ALL' : slot.hourShort)}
                        className={`hover:bg-[#f8fafc] transition-colors cursor-pointer ${
                          isRowSelected ? 'bg-orange-50 font-bold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 font-bold text-[#0f172a]">{slot.hourFull}</td>
                        <td className="py-2.5 px-3 text-[#64748b]">All 9 Stations</td>
                        <td className="py-2.5 px-3 text-right text-[#64748b]">{slot.target.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-black text-[#0f172a]">{slot.total.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{slot.pass.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-700">{slot.fail.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-amber-700">{slot.xout.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-sky-700">{slot.rework.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-rose-700">{slot.discard.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right font-black text-emerald-700">{slot.yieldPercent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Edit Hourly Data Modal (Edit Hourly Data) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#cbd5e1] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#cbd5e1] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-[#0f172a] text-sm uppercase tracking-wider">
                  Edit Hourly Inspection Counts • {editingStationId}
                </h3>
              </div>

              {/* Station Switcher inside Modal */}
              <div className="flex items-center space-x-2">
                <select
                  value={editingStationId}
                  onChange={(e) => openEditModal(e.target.value)}
                  className="bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {fleet.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.id} ({st.runningModel.replace('MODEL ', '')})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 text-[#64748b] hover:text-[#0f172a] rounded-lg hover:bg-[#e2e8f0] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <div className="text-xs text-[#64748b]">
                Adjust hourly actual inspection input and defect counts for <strong>{editingStationId}</strong>. NG total and pass yields will update automatically.
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#cbd5e1]">
                <table className="w-full text-xs font-mono divide-y divide-[#cbd5e1]">
                  <thead className="bg-[#f8fafc] text-[#64748b] uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Hour</th>
                      <th className="py-2.5 px-2 text-center w-24">Target</th>
                      <th className="py-2.5 px-2 text-center w-24 text-[#0f172a]">Actual In</th>
                      <th className="py-2.5 px-2 text-center w-24 text-emerald-700">Pass</th>
                      <th className="py-2.5 px-2 text-center w-20 text-amber-700">X-Out</th>
                      <th className="py-2.5 px-2 text-center w-20 text-sky-700">Rework</th>
                      <th className="py-2.5 px-2 text-center w-20 text-rose-700">Discard</th>
                      <th className="py-2.5 px-2 text-center text-rose-700">Fail</th>
                      <th className="py-2.5 px-3 text-right text-emerald-700">Yield %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] bg-white">
                    {tempHourlySlots.map((slot, idx) => (
                      <tr key={idx} className="hover:bg-[#f8fafc]">
                        <td className="py-1.5 px-3 font-bold text-[#0f172a] whitespace-nowrap">
                          {slot.hour}
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            value={slot.targetUph}
                            onChange={(e) => handleTempSlotChange(idx, 'targetUph', parseInt(e.target.value, 10))}
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded px-1.5 py-1 text-center font-bold text-[#0f172a]"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            value={slot.actualIn}
                            onChange={(e) => handleTempSlotChange(idx, 'actualIn', parseInt(e.target.value, 10))}
                            className="w-full bg-white border border-[#cbd5e1] focus:border-orange-500 rounded px-1.5 py-1 text-center font-black text-[#0f172a]"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            value={slot.passCount}
                            onChange={(e) => handleTempSlotChange(idx, 'passCount', parseInt(e.target.value, 10))}
                            className="w-full bg-emerald-50 border border-emerald-200 focus:border-emerald-500 rounded px-1.5 py-1 text-center font-bold text-emerald-800"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            value={slot.xoutCount}
                            onChange={(e) => handleTempSlotChange(idx, 'xoutCount', parseInt(e.target.value, 10))}
                            className="w-full bg-amber-50 border border-amber-200 focus:border-amber-500 rounded px-1.5 py-1 text-center font-bold text-amber-800"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            value={slot.reworkCount}
                            onChange={(e) => handleTempSlotChange(idx, 'reworkCount', parseInt(e.target.value, 10))}
                            className="w-full bg-sky-50 border border-sky-200 focus:border-sky-500 rounded px-1.5 py-1 text-center font-bold text-sky-800"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            value={slot.discardCount}
                            onChange={(e) => handleTempSlotChange(idx, 'discardCount', parseInt(e.target.value, 10))}
                            className="w-full bg-rose-50 border border-rose-200 focus:border-rose-500 rounded px-1.5 py-1 text-center font-bold text-rose-800"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-center font-bold text-rose-700">
                          {slot.failCount}
                        </td>
                        <td className="py-1.5 px-3 text-right font-black text-emerald-700">
                          {slot.yieldPercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#cbd5e1] flex items-center justify-between bg-[#f8fafc]">
              <button
                onClick={handleResetToDefaults}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              >
                Reset to Factory Defaults
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveHourlyEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Hourly Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

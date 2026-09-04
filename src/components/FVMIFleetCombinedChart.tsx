import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Activity,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Trash2,
  BarChart3,
  Flame,
  Sparkles,
  ExternalLink,
  ChevronRight,
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
import { useLanguage } from '../context/LanguageContext';
import { FvmiHourlySlot, FVMI_HOURLY_SLOTS_DEF } from '../data/fvmiFleetData';

export interface FVMIStationRealtimeData {
  id: string;
  name: string;
  type: string;
  status: 'RUNNING' | 'STOP' | 'IDLE';
  operatorId: string;
  runningModel: string;
  uph: number;
  calculatedInput: number;
  calculatedPass: number;
  calculatedFail: number;
  calculatedXout: number;
  calculatedRework: number;
  calculatedDiscard: number;
  calculatedPassRate: number;
  calculatedFailRate: number;
  calculatedXoutRate: number;
  calculatedReworkRate: number;
  calculatedDiscardRate: number;
  hourlyData?: FvmiHourlySlot[];
  downtimeReason?: string;
  downtimeDurationMins?: number;
}

interface FVMIFleetCombinedChartProps {
  stations: FVMIStationRealtimeData[];
  selectedStationId: string; // 'ALL' or 'FVMI-01' ... 'FVMI-09'
  onSelectStation: (stationId: string) => void;
  selectedHourSlot?: string;
  onSelectHourSlot?: (hour: string) => void;
  timeWindowLabel?: string;
  liveTick?: number;
}

export const FVMIFleetCombinedChart: React.FC<FVMIFleetCombinedChartProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  selectedHourSlot = 'ALL',
  onSelectHourSlot,
  timeWindowLabel = 'Shift 1',
  liveTick = 0,
}) => {
  const { t } = useLanguage();
  const [chartMode, setChartMode] = useState<'hourly-chart' | '9-stations-compare' | 'defect-breakdown'>('hourly-chart');

  const TARGET_STATION_UPH = 1100;
  const TARGET_FLEET_TOTAL_UPH = TARGET_STATION_UPH * 9; // 9,900 UPH

  const isAllSelected = !selectedStationId || selectedStationId === 'ALL';
  const activeStation = useMemo(() => {
    if (isAllSelected) return null;
    return stations.find((s) => s.id === selectedStationId) || stations[0];
  }, [stations, selectedStationId, isAllSelected]);

  // Total Fleet Aggregated Metrics across all 9 stations
  const fleetTotals = useMemo(() => {
    const totalInput = stations.reduce((sum, s) => sum + s.calculatedInput, 0);
    const totalPass = stations.reduce((sum, s) => sum + s.calculatedPass, 0);
    const totalFail = stations.reduce((sum, s) => sum + s.calculatedFail, 0);
    const totalXout = stations.reduce((sum, s) => sum + s.calculatedXout, 0);
    const totalRework = stations.reduce((sum, s) => sum + s.calculatedRework, 0);
    const totalDiscard = stations.reduce((sum, s) => sum + s.calculatedDiscard, 0);
    const totalCurrentUph = stations.reduce((sum, s) => sum + (s.status === 'RUNNING' ? s.uph : 0), 0);
    const runningCount = stations.filter((s) => s.status === 'RUNNING').length;

    const passRate = totalInput > 0 ? Number(((totalPass / totalInput) * 100).toFixed(2)) : 100;
    const failRate = totalInput > 0 ? Number(((totalFail / totalInput) * 100).toFixed(2)) : 0;

    return {
      totalInput,
      totalPass,
      totalFail,
      totalXout,
      totalRework,
      totalDiscard,
      totalCurrentUph,
      runningCount,
      passRate,
      failRate,
    };
  }, [stations]);

  // Current scope metrics (All Fleet vs Active Station)
  const currentScopeMetrics = useMemo(() => {
    if (isAllSelected || !activeStation) {
      return {
        scopeName: 'All 9 Stations Consolidated',
        uph: fleetTotals.totalCurrentUph,
        targetUph: TARGET_FLEET_TOTAL_UPH,
        totalInput: fleetTotals.totalInput,
        totalPass: fleetTotals.totalPass,
        totalFail: fleetTotals.totalFail,
        totalXout: fleetTotals.totalXout,
        totalRework: fleetTotals.totalRework,
        totalDiscard: fleetTotals.totalDiscard,
        passRate: fleetTotals.passRate,
        failRate: fleetTotals.failRate,
        runningLabel: `${fleetTotals.runningCount}/9 Stations Online`,
        isRunning: fleetTotals.runningCount > 0,
      };
    }

    return {
      scopeName: `${activeStation.id} (${activeStation.name})`,
      uph: activeStation.status === 'RUNNING' ? activeStation.uph : 0,
      targetUph: TARGET_STATION_UPH,
      totalInput: activeStation.calculatedInput,
      totalPass: activeStation.calculatedPass,
      totalFail: activeStation.calculatedFail,
      totalXout: activeStation.calculatedXout,
      totalRework: activeStation.calculatedRework,
      totalDiscard: activeStation.calculatedDiscard,
      passRate: activeStation.calculatedPassRate,
      failRate: activeStation.calculatedFailRate,
      runningLabel: activeStation.status === 'RUNNING' ? 'ONLINE (Operating)' : 'STOPPED (Offline)',
      isRunning: activeStation.status === 'RUNNING',
    };
  }, [isAllSelected, activeStation, fleetTotals, TARGET_FLEET_TOTAL_UPH]);

  // Hourly slots data for the chart:
  // - If isAllSelected: SUM across all 9 stations for each hour (กราฟรวมทุกเครื่อง)
  // - If !isAllSelected: Hourly data for activeStation only (กราฟแยกเครื่อง)
  const currentHourlyData = useMemo(() => {
    return FVMI_HOURLY_SLOTS_DEF.map((slotDef, idx) => {
      if (isAllSelected || !activeStation) {
        // COMBINED: Sum all 9 stations
        let slotTotalActual = 0;
        let slotTotalPass = 0;
        let slotTotalFail = 0;
        let slotTotalXout = 0;
        let slotTotalRework = 0;
        let slotTotalDiscard = 0;
        let slotTarget = 0;

        stations.forEach((st) => {
          if (st.hourlyData && st.hourlyData[idx]) {
            const slot = st.hourlyData[idx];
            slotTotalActual += slot.actualIn;
            slotTotalPass += slot.passCount;
            slotTotalFail += slot.failCount;
            slotTotalXout += slot.xoutCount;
            slotTotalRework += slot.reworkCount;
            slotTotalDiscard += slot.discardCount;
            slotTarget += slot.targetUph;
          } else {
            const proportion = Math.round(st.calculatedInput / 12);
            slotTotalActual += proportion;
            slotTotalPass += Math.round(proportion * (st.calculatedPassRate / 100));
            slotTotalFail += Math.round(proportion * (st.calculatedFailRate / 100));
            slotTarget += TARGET_STATION_UPH;
          }
        });

        const yieldPercent = slotTotalActual > 0 ? Number(((slotTotalPass / slotTotalActual) * 100).toFixed(2)) : 100;

        return {
          hourShort: slotDef.hourShort,
          hourFull: slotDef.hour,
          actualIn: slotTotalActual,
          passCount: slotTotalPass,
          failCount: slotTotalFail,
          xoutCount: slotTotalXout,
          reworkCount: slotTotalRework,
          discardCount: slotTotalDiscard,
          targetUph: slotTarget || TARGET_FLEET_TOTAL_UPH,
          yieldPercent,
          scopeType: 'COMBINED',
          isCurrent: idx === 7,
        };
      } else {
        // INDIVIDUAL: Active station's hourly slots
        const slot = activeStation.hourlyData && activeStation.hourlyData[idx];
        const actualIn = slot ? slot.actualIn : Math.round(activeStation.calculatedInput / 12);
        const passCount = slot ? slot.passCount : Math.round(actualIn * (activeStation.calculatedPassRate / 100));
        const failCount = slot ? slot.failCount : (actualIn - passCount);
        const xoutCount = slot ? slot.xoutCount : Math.round(failCount * 0.5);
        const reworkCount = slot ? slot.reworkCount : Math.round(failCount * 0.3);
        const discardCount = slot ? slot.discardCount : Math.max(0, failCount - xoutCount - reworkCount);
        const targetUph = slot ? slot.targetUph : TARGET_STATION_UPH;
        const yieldPercent = actualIn > 0 ? Number(((passCount / actualIn) * 100).toFixed(2)) : 100;

        return {
          hourShort: slotDef.hourShort,
          hourFull: slotDef.hour,
          actualIn,
          passCount,
          failCount,
          xoutCount,
          reworkCount,
          discardCount,
          targetUph,
          yieldPercent,
          scopeType: 'INDIVIDUAL',
          isCurrent: idx === 7,
        };
      }
    });
  }, [isAllSelected, activeStation, stations, TARGET_FLEET_TOTAL_UPH]);

  // Volume color scaling - ONLY TWO TONES (มีแค่ 2 โทนเท่านั้น: อ่อน กับ เข้ม):
  // 1. โทนเข้ม: ปริมาณเยอะ ปกติ (>= Target * 0.85) -> #c2410c (Dark Orange)
  // 2. โทนอ่อน: ปริมาณน้อยเกิน (< Target * 0.85) -> #fed7aa (Light Peach Orange)
  const getDynamicSlotColor = (val: number, target: number): string => {
    if (val === 0) return '#fecdd3'; // rose-200 (stop)
    const ratio = target > 0 ? val / target : 1;
    if (ratio >= 0.85) return '#c2410c'; // โทนเข้ม
    return '#fed7aa'; // โทนอ่อน
  };

  const getDynamicSlotStroke = (val: number, target: number, isSelected: boolean): string => {
    if (isSelected) return '#0f172a'; // black ring for selected
    if (val === 0) return '#f43f5e';
    const ratio = target > 0 ? val / target : 1;
    if (ratio >= 0.85) return '#9a3412'; // dark rim for dark bar
    return '#ea580c'; // clear border for light bar
  };

  const getDynamicFailColor = (_fail: number): string => {
    return '#f43f5e'; // single consistent NG rose color
  };

  const yAxisMax = Math.ceil(Math.max(...currentHourlyData.map((d) => d.actualIn), currentScopeMetrics.targetUph) * 1.15);

  return (
    <section id="fvmi-fleet-chart" className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-orange-500 p-5 shadow-xs space-y-4">
      {/* Chart Section Header with Title and Mode Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0f172a]">
                {isAllSelected
                  ? 'Consolidated 9-Station FVMI Inspection Fleet'
                  : `Inspection Telemetry: ${activeStation?.id} (${activeStation?.name})`}
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                isAllSelected ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-slate-100 text-slate-800 border border-slate-300'
              }`}>
                {isAllSelected ? 'ALL FLEET' : activeStation?.id}
              </span>
            </div>
            <p className="text-xs text-[#64748b]">
              {isAllSelected
                ? 'Inspection volume, throughput yield, and defect rates across 9 stations in shift (07:00 - 18:00)'
                : `Station telemetry for ${activeStation?.id} • Model ${activeStation?.runningModel}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isAllSelected && onSelectStation && (
            <button
              onClick={() => onSelectStation('ALL')}
              className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>← View All 9 Stations</span>
            </button>
          )}

          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-[#cbd5e1] text-xs font-bold font-mono">
            <button
              onClick={() => setChartMode('hourly-chart')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                chartMode === 'hourly-chart'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Hourly Throughput
            </button>
            <button
              onClick={() => setChartMode('9-stations-compare')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                chartMode === '9-stations-compare'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              9-Station Comparison
            </button>
            <button
              onClick={() => setChartMode('defect-breakdown')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                chartMode === 'defect-breakdown'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Defect Breakdown
            </button>
          </div>
        </div>
      </div>

      {/* Operational KPI Highlights (Updates dynamically for All vs Individual Station) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3 rounded-xl border border-[#cbd5e1]">
        <div>
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
            {isAllSelected ? 'FLEET REAL-TIME UPH' : `${activeStation?.id} REAL-TIME UPH`}
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="font-mono font-black text-xl text-orange-600">
              {currentScopeMetrics.uph.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#64748b]">/ {currentScopeMetrics.targetUph.toLocaleString()} Target</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
            {isAllSelected ? 'FLEET STATUS' : 'STATION STATUS'}
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className={`font-mono font-black text-xl ${currentScopeMetrics.isRunning ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isAllSelected ? `${fleetTotals.runningCount}/9 ONLINE` : (currentScopeMetrics.isRunning ? 'ONLINE' : 'STOPPED')}
            </span>
            <span className="text-xs font-mono text-slate-500">
              {isAllSelected ? 'Fleet' : activeStation?.runningModel.replace('MODEL ', '')}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
            PASS YIELD RATE
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className={`font-mono font-black text-xl ${currentScopeMetrics.passRate >= 98 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {currentScopeMetrics.passRate}%
            </span>
            <span className="text-[10px] font-mono text-rose-700">({currentScopeMetrics.failRate}% NG)</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
            TOTAL INSPECTED ({timeWindowLabel})
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="font-mono font-black text-xl text-[#0f172a]">
              {currentScopeMetrics.totalInput.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#64748b]">pcs</span>
          </div>
        </div>
      </div>

      {/* 4. MAIN CHART AREA */}
      {chartMode === 'hourly-chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          {/* Left Column (2 Cols): Hourly Output Bar Chart */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0f172a]">
                  {isAllSelected
                    ? 'Consolidated inspection volume across all stations (07:00 - 18:00)'
                    : `Hourly inspection volume for ${activeStation?.id} (07:00 - 18:00)`}
                </span>
                <span className="text-[11px] text-slate-500">
                  Target: <strong>{currentScopeMetrics.targetUph.toLocaleString()} pcs/h</strong>
                </span>
              </div>

              {/* Volume Scale Legend - STRICTLY TWO TONES (มีแค่ 2 โทน: อ่อน กับ เข้ม) */}
              <div className="flex items-center gap-2.5 text-[11px] bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#c2410c] shadow-2xs" />
                  <strong className="text-[#0f172a]">Dark Tone: Normal / High (≥ Target)</strong>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#fed7aa] border border-orange-400" />
                  <span className="text-slate-700 font-bold">Light Tone: Below Target (&lt; Target)</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 w-full bg-white rounded-xl border border-slate-200 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentHourlyData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                  <XAxis
                    dataKey="hourShort"
                    tick={{ fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    domain={[0, yAxisMax]}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(254, 215, 170, 0.25)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const isHigh = data.actualIn >= data.targetUph * 0.85;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs font-mono shadow-xl border border-slate-700 space-y-1.5 z-50">
                            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-orange-400">{data.hourFull}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                  isHigh
                                    ? 'bg-orange-950/90 text-orange-300 border-orange-700'
                                    : 'bg-orange-200 text-orange-950 border-orange-300'
                                }`}>
                                  {isHigh ? '✓ Target Met / Normal' : '⚠ Below Target'}
                                </span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 font-bold border border-orange-800">
                                {isAllSelected ? 'All 9 Stations' : activeStation?.id}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-400">Total Inspected:</span>
                              <strong className="text-white text-sm">{data.actualIn.toLocaleString()} pcs</strong>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-emerald-400">
                              <span>Pass (Good):</span>
                              <strong>{data.passCount.toLocaleString()} pcs</strong>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-rose-400">
                              <span>Fail (Total NG):</span>
                              <strong>{data.failCount.toLocaleString()} pcs</strong>
                            </div>
                            <div className="text-[10px] text-slate-300 pl-2 border-l border-slate-700 space-y-0.5">
                              <div>X-Out (XO): {data.xoutCount} pcs</div>
                              <div>Rework (RW): {data.reworkCount} pcs</div>
                              <div>Discard (DC): {data.discardCount} pcs</div>
                            </div>
                            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
                              <span className="text-slate-400">Yield Rate:</span>
                              <strong className="text-orange-300 font-black">{data.yieldPercent}%</strong>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Target UPH: {data.targetUph.toLocaleString()} pcs/h
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="passCount" stackId="a" radius={[6, 6, 0, 0]}>
                    {currentHourlyData.map((slot, idx) => {
                      const isSlotSelected = selectedHourSlot === slot.hourShort;
                      const cellColor = getDynamicSlotColor(slot.actualIn, slot.targetUph);
                      const strokeColor = getDynamicSlotStroke(slot.actualIn, slot.targetUph, isSlotSelected);
                      const isLow = slot.actualIn < slot.targetUph * 0.85;
                      return (
                        <Cell
                          key={`fvmi-pass-${slot.hourShort}-${idx}`}
                          fill={cellColor}
                          stroke={strokeColor}
                          strokeWidth={isSlotSelected ? 2.5 : (isLow ? 1.5 : 0)}
                          className="cursor-pointer transition-all hover:opacity-90"
                          onClick={() => onSelectHourSlot && onSelectHourSlot(slot.hourShort)}
                        />
                      );
                    })}
                  </Bar>
                  <Bar dataKey="failCount" stackId="a" radius={[6, 6, 0, 0]}>
                    {currentHourlyData.map((slot, idx) => (
                      <Cell
                        key={`fvmi-fail-${slot.hourShort}-${idx}`}
                        fill={getDynamicFailColor(slot.failCount)}
                        className="cursor-pointer"
                        onClick={() => onSelectHourSlot && onSelectHourSlot(slot.hourShort)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column (1 Col): Shift Defect & Quality Breakdown */}
          <div className="bg-[#f8fafc] rounded-xl border border-slate-200 p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-orange-600" />
                  <span>
                    {isAllSelected ? 'Fleet Defect Breakdown' : `${activeStation?.id} Defect Breakdown`}
                  </span>
                </h4>
                <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">
                  {currentScopeMetrics.totalFail.toLocaleString()} NG
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                {isAllSelected ? 'Total Defect Volume (All 9 Stations)' : `Total Defect Volume (${activeStation?.id})`}
              </p>

              {/* Defect Classification Progress Bars */}
              <div className="space-y-2.5 mt-3 text-xs font-mono">
                {/* X-Out */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-amber-800">X-Out (XO)</span>
                    <span className="font-bold text-amber-900">
                      {currentScopeMetrics.totalXout.toLocaleString()} pcs ({((currentScopeMetrics.totalXout / Math.max(1, currentScopeMetrics.totalFail)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${(currentScopeMetrics.totalXout / Math.max(1, currentScopeMetrics.totalFail)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Rework */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-sky-800">Rework (RW)</span>
                    <span className="font-bold text-sky-900">
                      {currentScopeMetrics.totalRework.toLocaleString()} pcs ({((currentScopeMetrics.totalRework / Math.max(1, currentScopeMetrics.totalFail)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all"
                      style={{ width: `${(currentScopeMetrics.totalRework / Math.max(1, currentScopeMetrics.totalFail)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Discard */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-rose-800">Discard / Scrap (DC)</span>
                    <span className="font-bold text-rose-900">
                      {currentScopeMetrics.totalDiscard.toLocaleString()} pcs ({((currentScopeMetrics.totalDiscard / Math.max(1, currentScopeMetrics.totalFail)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all"
                      style={{ width: `${(currentScopeMetrics.totalDiscard / Math.max(1, currentScopeMetrics.totalFail)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scope Summary Box */}
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Display Mode:</span>
                <strong className="text-[#0f172a]">{isAllSelected ? 'All 9 Stations' : `Station ${activeStation?.id}`}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Average Yield:</span>
                <strong className={currentScopeMetrics.passRate >= 98 ? 'text-emerald-700' : 'text-amber-700'}>
                  {currentScopeMetrics.passRate}%
                </strong>
              </div>
              {!isAllSelected && (
                <div className="flex justify-between text-slate-600">
                  <span>Operator:</span>
                  <strong className="text-[#0f172a]">{activeStation?.operatorId}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: 9-Stations Comparison View */}
      {chartMode === '9-stations-compare' && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono px-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#c2410c] shadow-2xs" />
                <span className="text-[#0f172a] font-bold">Dark tone: Normal / High (≥ 1,100 UPH)</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#fed7aa] border border-orange-400" />
                <span className="text-slate-700 font-bold">Light Tone: Below Target (&lt; 1,100 UPH)</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-100 border border-rose-300" />
                <span className="text-rose-700 font-bold">Red: Stopped (STOP)</span>
              </span>
            </div>
            <span className="text-[11px] text-orange-700 font-bold">
              💡 Click machine bar to inspect hourly station telemetry
            </span>
          </div>

          <div className="relative border-l border-b border-[#cbd5e1] pl-2 pt-3">
            <div className="flex items-end justify-between space-x-2 sm:space-x-3 h-48 px-1 relative z-10">
              {stations.map((st) => {
                const isSelected = !isAllSelected && st.id === selectedStationId;
                const isRunning = st.status === 'RUNNING';
                const currentUph = isRunning ? st.uph : 0;
                const heightPercent = (currentUph / 1600) * 100;
                const isHigh = currentUph >= TARGET_STATION_UPH;

                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      onSelectStation(st.id);
                      setChartMode('hourly-chart');
                    }}
                    className="flex-1 flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-full flex flex-col items-center justify-end h-40 relative">
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono font-bold px-1 py-0.5 rounded-xs mb-1 z-20 transition-all ${
                          !isRunning
                            ? 'text-rose-700 bg-rose-50 border border-rose-200'
                            : !isHigh
                            ? 'text-orange-950 bg-orange-100 border border-orange-300'
                            : 'text-[#0f172a] bg-white border border-[#cbd5e1]'
                        } ${isSelected ? 'scale-110 shadow-xs ring-2 ring-orange-500' : ''}`}
                      >
                        {currentUph > 0 ? currentUph : 'STOP'}
                      </span>

                      <div
                        style={{ height: `${Math.max(6, heightPercent)}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 relative ${
                          !isRunning
                            ? 'bg-rose-100 border border-rose-300'
                            : isHigh
                            ? 'bg-orange-700 shadow-xs hover:bg-orange-800'
                            : 'bg-orange-200 border-2 border-orange-400 hover:bg-orange-300'
                        } ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
                      >
                        {isRunning && (
                          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </div>
                    </div>

                    <div className="text-center mt-2 w-full">
                      <span
                        className={`text-[10px] sm:text-xs font-mono font-bold block truncate ${
                          isSelected ? 'text-orange-600 underline font-black' : 'text-[#0f172a]'
                        }`}
                      >
                        {st.id}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1 rounded-xs inline-block ${
                          isRunning ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {st.calculatedPassRate}% Yld
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: 9-Station Defect Breakdown & Yield Distribution */}
      {chartMode === 'defect-breakdown' && (
        <div className="space-y-3 pt-1">
          <div className="text-xs text-[#64748b] font-mono">
            Defect distribution by station: <strong>Pass (Green)</strong> | <strong>X-Out (Amber)</strong> | <strong>Rework (Sky)</strong> | <strong>Discard (Rose)</strong>
          </div>

          <div className="space-y-2">
            {stations.map((st) => {
              const passPct = st.calculatedPassRate;
              const xoutPct = st.calculatedXoutRate;
              const reworkPct = st.calculatedReworkRate;
              const discardPct = st.calculatedDiscardRate;
              const isSelected = !isAllSelected && st.id === selectedStationId;

              return (
                <div
                  key={st.id}
                  onClick={() => {
                    onSelectStation(st.id);
                    setChartMode('hourly-chart');
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                      : 'border-[#cbd5e1] bg-[#f8fafc] hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-[#0f172a]">{st.id}</span>
                      <span className="text-[#64748b]">({st.runningModel})</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        st.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {st.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px]">
                      <span className="text-emerald-700 font-bold">Pass: {passPct}%</span>
                      <span className="text-amber-700">XO: {st.calculatedXout}</span>
                      <span className="text-sky-700">RW: {st.calculatedRework}</span>
                      <span className="text-rose-700">DC: {st.calculatedDiscard}</span>
                    </div>
                  </div>

                  <div className="h-3 w-full bg-[#e2e8f0] rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${passPct}%` }}
                      className="bg-emerald-500 transition-all duration-300"
                      title={`Pass: ${passPct}%`}
                    />
                    <div
                      style={{ width: `${xoutPct}%` }}
                      className="bg-amber-500 transition-all duration-300"
                      title={`X-Out: ${xoutPct}%`}
                    />
                    <div
                      style={{ width: `${reworkPct}%` }}
                      className="bg-sky-500 transition-all duration-300"
                      title={`Rework: ${reworkPct}%`}
                    />
                    <div
                      style={{ width: `${discardPct}%` }}
                      className="bg-rose-500 transition-all duration-300"
                      title={`Discard: ${discardPct}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

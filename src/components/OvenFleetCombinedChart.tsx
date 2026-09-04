import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import {
  Flame,
  Wind,
  Layers,
  RotateCcw,
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { OvenUnit } from '../types';
import { OVEN_SHIFT_HOURS, computeOvenHourlyData, OvenHourlySlot } from '../utils/ovenChartUtils';

interface OvenFleetCombinedChartProps {
  title?: string;
  subTitle?: string;
  units: OvenUnit[];
  processType: 'Bake' | 'Vacuum' | 'Thermal-All';
  colorTheme?: 'amber' | 'emerald';
  selectedUnitId?: string;
  onSelectUnit?: (unitId: string) => void;
  children?: React.ReactNode;
}

export const OvenFleetCombinedChart: React.FC<OvenFleetCombinedChartProps> = ({
  title,
  subTitle,
  units,
  processType = 'Bake',
  colorTheme = 'amber',
  selectedUnitId = 'ALL',
  onSelectUnit,
  children,
}) => {
  const [viewUnit, setViewUnit] = useState<'magazines' | 'boards'>('magazines');
  const [chartMode, setChartMode] = useState<'hourly' | 'comparison'>('hourly');

  const isEmerald = colorTheme === 'emerald';
  const isAllSelected = selectedUnitId === 'ALL';
  const activeUnit = units.find((u) => u.id === selectedUnitId);

  // Filtered units based on selectedUnitId
  const effectiveUnits = isAllSelected ? units : (activeUnit ? [activeUnit] : units);

  // Compute hourly records for each unit
  const unitsHourlyMap = useMemo(() => {
    const map = new Map<string, OvenHourlySlot[]>();
    units.forEach((u) => {
      map.set(u.id, computeOvenHourlyData(u));
    });
    return map;
  }, [units]);

  // Aggregate combined hourly data for current scope (All or Single unit)
  const combinedHourlyData = useMemo(() => {
    return OVEN_SHIFT_HOURS.map((hour, index) => {
      let totalMagazines = 0;
      let totalBoards = 0;
      let targetMagazines = 0;
      let targetBoards = 0;
      const breakdown: { unitId: string; unitName: string; mag: number; boards: number; status: string }[] = [];

      effectiveUnits.forEach((u) => {
        const slots = unitsHourlyMap.get(u.id) || [];
        const slot = slots[index];
        if (slot) {
          totalMagazines += slot.magazinesPerHour;
          totalBoards += slot.totalUph;
          targetMagazines += slot.targetMagazinesPerHour;
          targetBoards += slot.targetUph;
          breakdown.push({
            unitId: u.id,
            unitName: u.name,
            mag: slot.magazinesPerHour,
            boards: slot.totalUph,
            status: u.status,
          });
        }
      });

      const targetRef = viewUnit === 'magazines' ? targetMagazines : targetBoards;
      const actualVal = viewUnit === 'magazines' ? totalMagazines : totalBoards;
      
      // Volume classification:
      // High/Normal (เยอะ ปกติ) if >= 85% of target
      // Low (น้อยเกิน) if < 85% of target
      const isZero = actualVal === 0;
      const isHigh = actualVal >= targetRef * 0.85;
      const isLow = !isZero && !isHigh;

      const efficiencyPercent = targetRef > 0 ? Number(((actualVal / targetRef) * 100).toFixed(1)) : 100;

      return {
        hour,
        timeRange: `${hour} - ${(parseInt(hour.split(':')[0], 10) + 1).toString().padStart(2, '0')}:00`,
        totalMagazines,
        totalBoards,
        targetMagazines,
        targetBoards,
        targetRef,
        actualVal,
        efficiencyPercent,
        isHigh,
        isLow,
        isZero,
        breakdown,
        isCurrent: index === 9,
      };
    });
  }, [effectiveUnits, unitsHourlyMap, viewUnit]);

  // Comparison data between units (for Comparison tab)
  const perUnitComparisonData = useMemo(() => {
    return units.map((u) => {
      const slots = unitsHourlyMap.get(u.id) || [];
      const totalMag = slots.reduce((acc, s) => acc + s.magazinesPerHour, 0);
      const totalBrd = slots.reduce((acc, s) => acc + s.totalUph, 0);
      const targetTotalMag = slots.reduce((acc, s) => acc + s.targetMagazinesPerHour, 0);
      const targetTotalBrd = slots.reduce((acc, s) => acc + s.targetUph, 0);

      const actual = viewUnit === 'magazines' ? totalMag : totalBrd;
      const target = viewUnit === 'magazines' ? targetTotalMag : targetTotalBrd;
      const isZero = actual === 0;
      const isHigh = actual >= target * 0.85;
      const isLow = !isZero && !isHigh;

      return {
        unitId: u.id,
        unitName: u.name,
        status: u.status,
        runningModel: u.runningModel,
        operatorId: u.operatorId,
        totalMag,
        totalBrd,
        actual,
        target,
        isHigh,
        isLow,
        isZero,
        efficiencyPercent: target > 0 ? Math.round((actual / target) * 100) : 100,
      };
    });
  }, [units, unitsHourlyMap, viewUnit]);

  // Overall KPIs
  const totalFleetBoards = useMemo(() => {
    return combinedHourlyData.reduce((acc, h) => acc + h.totalBoards, 0);
  }, [combinedHourlyData]);

  const totalFleetMagazines = useMemo(() => {
    return combinedHourlyData.reduce((acc, h) => acc + h.totalMagazines, 0);
  }, [combinedHourlyData]);

  const activeRunningCount = units.filter((u) => u.status === 'RUNNING').length;

  const currentHourSlot = combinedHourlyData[combinedHourlyData.length - 1];
  const fleetUphNow = currentHourSlot ? currentHourSlot.totalBoards : 0;
  const targetFleetUph = currentHourSlot ? currentHourSlot.targetBoards : 1;

  // Chart max value
  const maxSlotVal = Math.max(
    ...combinedHourlyData.map((d) => d.actualVal),
    ...combinedHourlyData.map((d) => d.targetRef),
    10
  );
  const yAxisMax = Math.ceil(maxSlotVal * 1.15);

  // Color mappings
  // Dark for High/Normal (เยอะ ปกติ)
  // Light for Low (น้อยเกิน)
  const getDynamicBarColor = (isHigh: boolean, isLow: boolean, isZero: boolean) => {
    if (isZero) return '#fecdd3'; // rose-200
    if (isHigh) {
      return isEmerald ? '#047857' : '#b45309'; // emerald-700 / amber-700 (เข้ม)
    }
    return isEmerald ? '#a7f3d0' : '#fde68a'; // emerald-200 / amber-200 (อ่อน)
  };

  const getDynamicBarBorder = (isHigh: boolean, isLow: boolean, isZero: boolean) => {
    if (isZero) return '#f43f5e';
    if (isHigh) {
      return isEmerald ? '#065f46' : '#92400e'; // darker rim
    }
    return isEmerald ? '#34d399' : '#f59e0b'; // clear boundary for light bar
  };

  const defaultTitle = isAllSelected
    ? processType === 'Bake'
      ? '📊 5-Bake Ovens Consolidated Fleet'
      : processType === 'Vacuum'
      ? '📊 Vacuum Chambers Consolidated Fleet'
      : '📊 All Thermal Chambers Fleet Overview'
    : `📈 Production Volume: ${activeUnit?.name || selectedUnitId} (${activeUnit?.id})`;

  const defaultSub = isAllSelected
    ? `Consolidated hourly thermal throughput across all ${units.length} chambers in shift (08:00 - 17:00)`
    : `Chamber: ${activeUnit?.name} • Model: ${activeUnit?.runningModel} • OP: ${activeUnit?.operatorId}`;

  return (
    <section className={`bg-white rounded-2xl border border-[#cbd5e1] border-l-4 ${isEmerald ? 'border-l-emerald-500' : 'border-l-amber-500'} p-5 shadow-xs space-y-4`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
        <div>
          <div className="flex items-center space-x-2">
            {processType === 'Vacuum' ? (
              <Wind className="w-5 h-5 text-emerald-600" />
            ) : processType === 'Bake' ? (
              <Flame className="w-5 h-5 text-amber-600" />
            ) : (
              <Layers className="w-5 h-5 text-slate-700" />
            )}
            <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
              <span>{title || defaultTitle}</span>
              {isAllSelected ? (
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${isEmerald ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                  All Ovens ({units.length} Units)
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full text-white ${isEmerald ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                    Oven {activeUnit?.id}
                  </span>
                  {onSelectUnit && (
                    <button
                      onClick={() => onSelectUnit('ALL')}
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border cursor-pointer transition-colors flex items-center gap-1 ${
                        isEmerald
                          ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                          : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'
                      }`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Consolidated Fleet</span>
                    </button>
                  )}
                </div>
              )}
            </h3>
          </div>
          <p className="text-xs text-[#64748b] mt-1 font-mono">
            {subTitle || defaultSub}
          </p>
        </div>

        {/* View Unit and Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Toggle: Magazines vs Boards */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-[#cbd5e1] text-xs font-bold font-mono">
            <button
              onClick={() => setViewUnit('magazines')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewUnit === 'magazines'
                  ? isEmerald
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-amber-600 text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Magazines (Mag)
            </button>
            <button
              onClick={() => setViewUnit('boards')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewUnit === 'boards'
                  ? isEmerald
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-amber-600 text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Boards (Pcs)
            </button>
          </div>

          {/* Mode: Hourly vs Comparison */}
          {isAllSelected && (
            <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-[#cbd5e1] text-xs font-bold font-mono">
              <button
                onClick={() => setChartMode('hourly')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartMode === 'hourly'
                    ? isEmerald
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-amber-600 text-white shadow-2xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Consolidated Hourly
              </button>
              <button
                onClick={() => setChartMode('comparison')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartMode === 'comparison'
                    ? isEmerald
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-amber-600 text-white shadow-2xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Unit Comparison
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Operational KPI Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc] p-3 rounded-xl border border-[#cbd5e1]">
        <div>
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
            {isAllSelected ? 'Combined Output (Boards)' : 'Total Output (Boards)'}
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="font-mono font-black text-xl text-[#0f172a]">
              {totalFleetBoards.toLocaleString()}
            </span>
            <span className="text-xs text-[#64748b] font-mono">boards</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
            {isAllSelected ? 'Total Magazines Baked' : 'Magazines Processed'}
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="font-mono font-black text-xl text-[#0f172a]">
              {totalFleetMagazines}
            </span>
            <span className="text-xs text-[#64748b] font-mono">magazines</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
            Real-time Fleet UPH
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className={`font-mono font-black text-xl ${fleetUphNow >= targetFleetUph * 0.85 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {fleetUphNow.toLocaleString()}
            </span>
            <span className="text-xs text-[#64748b] font-mono">/ {targetFleetUph.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
            Active Chambers
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="font-mono font-black text-xl text-emerald-700">
              {activeRunningCount} / {units.length}
            </span>
            <span className="text-xs text-[#64748b] font-mono">Online</span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      {chartMode === 'hourly' ? (
        <div className="space-y-2">
          {/* Target Line & Visual Color Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#64748b] px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-rose-500 inline-block" />
                <span className="text-[#0f172a] font-bold">
                  Target Line: {viewUnit === 'magazines' ? `${currentHourSlot?.targetMagazines || 30} Mag/h` : `${(currentHourSlot?.targetBoards || 2000).toLocaleString()} Boards/h`}
                </span>
              </span>
            </div>

            {/* Crucial Color Intensity Legend */}
            <div className="flex items-center gap-3 bg-white px-2.5 py-1 rounded-lg border border-[#cbd5e1]">
              <span className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-xs shadow-2xs ${isEmerald ? 'bg-emerald-700' : 'bg-amber-700'}`} />
                <strong className="text-[#0f172a]">Dark: Normal / High (≥ Target)</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-xs border ${isEmerald ? 'bg-emerald-200 border-emerald-400' : 'bg-amber-200 border-amber-400'}`} />
                <span className="text-slate-600 font-bold">Light: Below Target (&lt; Target)</span>
              </span>
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={combinedHourlyData}
                margin={{ top: 12, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  domain={[0, yAxisMax]}
                />
                <ReferenceLine
                  y={currentHourSlot?.targetRef || (viewUnit === 'magazines' ? 30 : 2000)}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Tooltip
                  cursor={{ fill: isEmerald ? 'rgba(209, 250, 229, 0.3)' : 'rgba(254, 243, 199, 0.3)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs font-mono shadow-xl border border-slate-700 space-y-2 z-50 min-w-56">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className={`font-bold ${isEmerald ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {data.timeRange}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              data.isHigh
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {data.isHigh ? '✓ Target Met / Normal' : '⚠ Below Target'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Throughput Total:</span>
                            <strong className="text-white text-sm">
                              {viewUnit === 'magazines'
                                ? `${data.totalMagazines} Magazines`
                                : `${data.totalBoards.toLocaleString()} Boards`}
                            </strong>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-300">
                            <span>Target Benchmark:</span>
                            <span>
                              {viewUnit === 'magazines'
                                ? `${data.targetMagazines} Mag/h`
                                : `${data.targetBoards.toLocaleString()} Boards/h`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Target Fulfillment:</span>
                            <strong className={data.efficiencyPercent >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                              {data.efficiencyPercent}%
                            </strong>
                          </div>

                          {/* Per-oven breakdown inside tooltip */}
                          {data.breakdown && data.breakdown.length > 1 && (
                            <div className="pt-2 border-t border-slate-800 space-y-1 text-[10px]">
                              <span className="text-slate-400 uppercase tracking-wider block font-bold">
                                Contribution per Chamber:
                              </span>
                              <div className="space-y-0.5">
                                {data.breakdown.map((item: any) => (
                                  <div key={item.unitId} className="flex items-center justify-between text-slate-300">
                                    <span>{item.unitName || item.unitId}:</span>
                                    <span className="font-bold text-white">
                                      {viewUnit === 'magazines' ? `${item.mag} Mag` : `${item.boards} Pcs`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="actualVal" radius={[6, 6, 0, 0]}>
                  {combinedHourlyData.map((entry, index) => {
                    const fillColor = getDynamicBarColor(entry.isHigh, entry.isLow, entry.isZero);
                    const strokeColor = getDynamicBarBorder(entry.isHigh, entry.isLow, entry.isZero);

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={entry.isHigh ? 1 : 1.5}
                        className="cursor-pointer transition-all hover:opacity-90"
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Comparison View Mode */
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#64748b]">
            <span>Cumulative Output Comparison by Chamber</span>
            <div className="flex items-center gap-3 bg-white px-2.5 py-1 rounded-lg border border-[#cbd5e1]">
              <span className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-xs shadow-2xs ${isEmerald ? 'bg-emerald-700' : 'bg-amber-700'}`} />
                <strong className="text-[#0f172a]">Dark: Normal / High</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-xs border ${isEmerald ? 'bg-emerald-200 border-emerald-400' : 'bg-amber-200 border-amber-400'}`} />
                <span className="text-slate-600 font-bold">Light: Below Target</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {perUnitComparisonData.map((item) => {
              const barColor = getDynamicBarColor(item.isHigh, item.isLow, item.isZero);
              const borderColor = getDynamicBarBorder(item.isHigh, item.isLow, item.isZero);

              return (
                <div
                  key={item.unitId}
                  onClick={() => onSelectUnit && onSelectUnit(item.unitId)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:shadow-md ${
                    selectedUnitId === item.unitId
                      ? isEmerald
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/30'
                        : 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/30'
                      : 'border-[#cbd5e1] bg-[#f8fafc] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-sm text-[#0f172a] block">
                        {item.unitName}
                      </span>
                      <span className="text-[10px] text-[#64748b] font-mono">
                        OP: {item.operatorId} • {item.runningModel}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      item.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-[#64748b]">Total Output:</span>
                      <span className="font-black text-sm text-[#0f172a]">
                        {viewUnit === 'magazines' ? `${item.totalMag} Mag` : `${item.totalBrd.toLocaleString()} Boards`}
                      </span>
                    </div>

                    {/* Bar visualization of volume */}
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                      <div
                        style={{
                          width: `${Math.min(100, (item.actual / Math.max(1, item.target)) * 100)}%`,
                          backgroundColor: barColor,
                          borderColor: borderColor,
                        }}
                        className="h-full rounded-full transition-all duration-300 border"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono mt-1.5">
                      <span className={item.isHigh ? (isEmerald ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold') : 'text-amber-800 font-bold'}>
                        {item.isHigh ? '✓ Target Met / Normal' : '⚠ Below Target'}
                      </span>
                      <span className="text-[#64748b]">
                        {item.efficiencyPercent}% of Target
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {children && (
        <div className="pt-4 border-t border-[#cbd5e1]/60">
          {children}
        </div>
      )}
    </section>
  );
};

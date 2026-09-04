import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { ArrowUpRight, Edit3, X, BarChart3, Layers, TrendingUp, Flame, Wind } from 'lucide-react';

/**
 * TotalLineCombinedChart
 * Master Total Chart for Process View: Aggregates total throughput across all 5 SMT stages.
 * Uses dropped/muted colors for a calm, professional, eye-friendly display.
 */
export const TotalLineCombinedChart: React.FC = () => {
  const { chartsData, navigate } = useFactory();
  const [viewMode, setViewMode] = useState<'comparison' | 'aggregate'>('comparison');
  const [hoveredItem, setHoveredItem] = useState<{ hr: string; stage?: string; val?: number; mag?: number } | null>(null);

  // Common hours across processes
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];

  const ovenData = chartsData.oven;
  const dispensingData = chartsData.dispensing;
  const fvmiData = chartsData.fvmi;
  const aoiData = chartsData.aoi || {
    hours,
    unit1: [940, 1110, 1170, 1030, 1150, 1090],
    unit2: [960, 1130, 1190, 1050, 1170, 1110],
    uph: [950, 1120, 1180, 1040, 1160, 1100]
  };
  const xrayData = chartsData.xray || {
    hours,
    uph: [960, 1100, 1150, 1060, 1180, 1120]
  };

  // Normalized UPH comparisons per hour (Normalized to 0 - 2,400 scale)
  const maxComparisonVal = 2600;

  // Compute stats in UPH (Vacuum & Bake: 1 Magazine = ~200 units UPH)
  const totalVacuumUph = ovenData.vacuum.reduce((a, b) => a + b, 0) * 200;
  const totalBakeUph = ovenData.bake.reduce((a, b) => a + b, 0) * 200;
  const totalDispenseUph = dispensingData.topFill.reduce((a, b) => a + b, 0) + dispensingData.underFill.reduce((a, b) => a + b, 0);
  const totalFvmiUph = fvmiData.total.reduce((a, b) => a + b, 0);
  const totalAoiUph = hours.reduce((acc, _, i) => acc + (aoiData.unit1[i] ?? 1100) + (aoiData.unit2[i] ?? 1100), 0);
  const totalXrayUph = xrayData.uph.reduce((a, b) => a + b, 0);
  const avgLineThroughput = Math.round((totalVacuumUph + totalBakeUph + totalDispenseUph + totalFvmiUph + totalAoiUph + totalXrayUph) / (hours.length * 6));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all duration-150">
      {/* Chart Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Total SMT Line Throughput (All Stages Combined)
            </h3>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            HOURLY PROCESS FLOW &amp; TOTAL UPH — SEPARATED VACUUM, BAKE &amp; DOWNSTREAM STAGES
          </p>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'comparison'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6-Stage Breakdown (UPH)
            </button>
            <button
              onClick={() => setViewMode('aggregate')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'aggregate'
                  ? 'bg-white text-slate-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Total Line Output (UPH)
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Pills (Vacuum, Bake, Dispense, FVMI, AOI, X-ray - All in UPH) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5 text-xs">
        <div
          onClick={() => navigate('vacuum-process')}
          className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-100/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-1.5 text-emerald-800">
            <span className="w-2 h-2 rounded-xs bg-emerald-600"></span>
            <span className="font-semibold">Vacuum Oven</span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-950 mt-1">
            {totalVacuumUph.toLocaleString()} <span className="text-[10px] font-sans font-bold text-emerald-700">UPH</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-mono mt-0.5">2 Vacuum Units</div>
        </div>

        <div
          onClick={() => navigate('bake-process')}
          className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 hover:bg-amber-100/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-1.5 text-amber-800">
            <span className="w-2 h-2 rounded-xs bg-amber-600/75"></span>
            <span className="font-semibold">Bake Oven</span>
          </div>
          <div className="text-base font-bold font-mono text-amber-900 mt-1">
            {totalBakeUph.toLocaleString()} <span className="text-[10px] font-sans font-bold text-amber-700">UPH</span>
          </div>
          <div className="text-[10px] text-amber-600 font-mono mt-0.5">5 Bake Units</div>
        </div>

        <div
          onClick={() => navigate('machine-detail', 'MC-01')}
          className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-200/60 hover:bg-sky-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-1.5 text-sky-800">
            <span className="w-2 h-2 rounded-xs bg-sky-600/70"></span>
            <span className="font-semibold">Total Dispense</span>
          </div>
          <div className="text-base font-bold font-mono text-sky-900 mt-1">
            {totalDispenseUph.toLocaleString()} <span className="text-[10px] font-sans font-bold text-sky-700">UPH</span>
          </div>
          <div className="text-[10px] text-sky-600 font-mono mt-0.5">12 MC Top &amp; Under</div>
        </div>

        <div
          onClick={() => navigate('fvmi')}
          className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/80 hover:bg-orange-100/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-1.5 text-orange-800">
            <span className="w-2 h-2 rounded-xs bg-orange-500"></span>
            <span className="font-semibold">Total FVMI</span>
          </div>
          <div className="text-base font-bold font-mono text-orange-950 mt-1">
            {totalFvmiUph.toLocaleString()} <span className="text-[10px] font-sans font-bold text-orange-700">UPH</span>
          </div>
          <div className="text-[10px] text-orange-600 font-mono mt-0.5">9 Stations Total</div>
        </div>

        <div
          onClick={() => navigate('packout-aoi')}
          className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200/60 hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-1.5 text-indigo-800">
            <span className="w-2 h-2 rounded-xs bg-indigo-500/70"></span>
            <span className="font-semibold">Total AOI</span>
          </div>
          <div className="text-base font-bold font-mono text-indigo-900 mt-1">
            {totalAoiUph.toLocaleString()} <span className="text-[10px] font-sans font-bold text-indigo-700">UPH</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-mono mt-0.5">2 Optical Lines</div>
        </div>

        <div
          onClick={() => navigate('packout-xray')}
          className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-200/60 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-1.5 text-rose-800">
            <span className="w-2 h-2 rounded-xs bg-rose-500/70"></span>
            <span className="font-semibold">Total X-ray</span>
          </div>
          <div className="text-base font-bold font-mono text-rose-900 mt-1">
            {totalXrayUph.toLocaleString()} <span className="text-[10px] font-sans font-bold text-rose-700">UPH</span>
          </div>
          <div className="text-[10px] text-rose-600 font-mono mt-0.5">5 Units NDT</div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative pt-6 pb-2 border-l border-b border-slate-300 pl-2">
        {/* Background Target Guidelines */}
        <div className="absolute inset-x-2 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>{viewMode === 'comparison' ? '2,400 Target UPH / Stage' : '8,000 Target UPH (Capacity)'}</span>
            <span>Ceiling (UPH)</span>
          </div>
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>{viewMode === 'comparison' ? '1,600 Standard UPH' : '6,000 Target UPH (Output)'}</span>
            <span>Target (UPH)</span>
          </div>
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>{viewMode === 'comparison' ? '800 Baseline UPH' : '3,000 Baseline UPH'}</span>
            <span>Baseline (UPH)</span>
          </div>
          <div className="w-full border-b border-solid border-slate-400"></div>
        </div>

        {/* Chart Bars */}
        <div className="flex items-end justify-between space-x-3 sm:space-x-6 h-52 px-2 relative z-10">
          {hours.map((hr, i) => {
            const vMag = ovenData.vacuum[i] ?? 6;
            const bMag = ovenData.bake[i] ?? 6;
            const vUph = vMag * 200; // ~200 units/uph per magazine
            const bUph = bMag * 200; // ~200 units/uph per magazine
            const dsUph = (dispensingData.topFill[i] ?? 800) + (dispensingData.underFill[i] ?? 800);
            const fvUph = fvmiData.total[i] ?? 1100;
            const aoUph = (aoiData.unit1[i] ?? 1100) + (aoiData.unit2[i] ?? 1100);
            const xrUph = xrayData.uph[i] ?? 1100;

            if (viewMode === 'aggregate') {
              // Aggregate Total of all 6 stages per hour in UPH
              const combinedTotalUph = vUph + bUph + dsUph + fvUph + aoUph + xrUph;
              const maxAggregate = 9500;
              const height = (combinedTotalUph / maxAggregate) * 100;
              const isHigh = combinedTotalUph >= 6500;
              const isHov = hoveredItem?.hr === hr;

              return (
                <div key={hr} className="flex-1 flex flex-col items-center">
                  <div
                    onMouseEnter={() => setHoveredItem({ hr, val: combinedTotalUph })}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="w-full flex flex-col items-center justify-end h-44 relative group cursor-pointer"
                  >
                    {isHov && (
                      <div className="absolute -top-10 bg-slate-800 text-white text-[11px] font-mono px-2 py-1 rounded-md shadow-md z-30 whitespace-nowrap">
                        Total {hr}: {combinedTotalUph.toLocaleString()} UPH
                      </div>
                    )}
                    <span className="text-[10px] font-mono font-bold text-slate-600 mb-1 flex items-baseline gap-0.5">
                      {combinedTotalUph.toLocaleString()} <span className="text-[8px] font-normal text-slate-400">UPH</span>
                    </span>
                    <div
                      style={{ height: `${Math.max(8, height)}%` }}
                      className={`w-full max-w-[48px] rounded-t-sm transition-all duration-300 group-hover:opacity-90 ${
                        isHigh ? 'bg-slate-600 shadow-xs' : 'bg-slate-300 border border-slate-400'
                      }`}
                    ></div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600 mt-2.5">
                    {hr}
                  </span>
                </div>
              );
            }

            // Comparison View (6 stages side-by-side: Vacuum, Bake, Dispensing, FVMI, AOI, X-ray) All in UPH
            const vH = (vUph / maxComparisonVal) * 100;
            const bH = (bUph / maxComparisonVal) * 100;
            const dsH = (dsUph / maxComparisonVal) * 100;
            const fvH = (fvUph / maxComparisonVal) * 100;
            const aoH = (aoUph / maxComparisonVal) * 100;
            const xrH = (xrUph / maxComparisonVal) * 100;

            return (
              <div key={hr} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center space-x-1 sm:space-x-1.5 h-44">
                  {/* Vacuum Oven Bar */}
                  <div
                    onMouseEnter={() => setHoveredItem({ hr, stage: 'Vacuum Oven', val: vUph })}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  >
                    {hoveredItem?.hr === hr && hoveredItem?.stage === 'Vacuum Oven' && (
                      <div className="absolute -top-8 bg-emerald-950 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                        Vacuum: {vUph.toLocaleString()} UPH
                      </div>
                    )}
                    <div
                      style={{ height: `${Math.max(6, vH)}%` }}
                      className="w-full bg-emerald-600/85 hover:bg-emerald-600 rounded-t-xs transition-all duration-200"
                    ></div>
                  </div>

                  {/* Bake Oven Bar */}
                  <div
                    onMouseEnter={() => setHoveredItem({ hr, stage: 'Bake Oven', val: bUph })}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  >
                    {hoveredItem?.hr === hr && hoveredItem?.stage === 'Bake Oven' && (
                      <div className="absolute -top-8 bg-amber-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                        Bake: {bUph.toLocaleString()} UPH
                      </div>
                    )}
                    <div
                      style={{ height: `${Math.max(6, bH)}%` }}
                      className="w-full bg-amber-600/80 hover:bg-amber-600 rounded-t-xs transition-all duration-200"
                    ></div>
                  </div>

                  {/* Dispensing Total Bar */}
                  <div
                    onMouseEnter={() => setHoveredItem({ hr, stage: 'Dispensing', val: dsUph })}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  >
                    {hoveredItem?.hr === hr && hoveredItem?.stage === 'Dispensing' && (
                      <div className="absolute -top-8 bg-sky-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                        Dispensing: {dsUph.toLocaleString()} UPH
                      </div>
                    )}
                    <div
                      style={{ height: `${Math.max(6, dsH)}%` }}
                      className="w-full bg-sky-600/75 hover:bg-sky-600 rounded-t-xs transition-all duration-200"
                    ></div>
                  </div>

                  {/* FVMI Total Bar */}
                  <div
                    onMouseEnter={() => setHoveredItem({ hr, stage: 'FVMI', val: fvUph })}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  >
                    {hoveredItem?.hr === hr && hoveredItem?.stage === 'FVMI' && (
                      <div className="absolute -top-8 bg-orange-950 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                        FVMI: {fvUph.toLocaleString()} UPH
                      </div>
                    )}
                    <div
                      style={{ height: `${Math.max(6, fvH)}%` }}
                      className="w-full bg-orange-500/85 hover:bg-orange-500 rounded-t-xs transition-all duration-200"
                    ></div>
                  </div>

                  {/* AOI Total Bar */}
                  <div
                    onMouseEnter={() => setHoveredItem({ hr, stage: 'AOI', val: aoUph })}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  >
                    {hoveredItem?.hr === hr && hoveredItem?.stage === 'AOI' && (
                      <div className="absolute -top-8 bg-indigo-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                        AOI: {aoUph.toLocaleString()} UPH
                      </div>
                    )}
                    <div
                      style={{ height: `${Math.max(6, aoH)}%` }}
                      className="w-full bg-indigo-500/70 hover:bg-indigo-500 rounded-t-xs transition-all duration-200"
                    ></div>
                  </div>

                  {/* X-ray Total Bar */}
                  <div
                    onMouseEnter={() => setHoveredItem({ hr, stage: 'X-ray', val: xrUph })}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  >
                    {hoveredItem?.hr === hr && hoveredItem?.stage === 'X-ray' && (
                      <div className="absolute -top-8 bg-rose-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                        X-ray: {xrUph.toLocaleString()} UPH
                      </div>
                    )}
                    <div
                      style={{ height: `${Math.max(6, xrH)}%` }}
                      className="w-full bg-rose-500/70 hover:bg-rose-500 rounded-t-xs transition-all duration-200"
                    ></div>
                  </div>
                </div>
                <span className="text-xs font-mono font-medium text-slate-600 mt-2.5">
                  {hr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600/85"></span>
            <span>Vacuum Oven</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-600/80"></span>
            <span>Bake Oven</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-600/75"></span>
            <span>Dispensing</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-orange-500/85"></span>
            <span>FVMI</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500/70"></span>
            <span>AOI</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500/70"></span>
            <span>X-ray</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Average Flow: {avgLineThroughput.toLocaleString()} UPH / Stage
        </div>
      </div>
    </div>
  );
};

/**
 * TotalOvenChart
 * Shows Total Combined Oven Throughput (Vacuum + Bake Consolidated (7 Units Total))
 * Single bar per hour, muted/dropped color tones.
 */
export const TotalOvenChart: React.FC = () => {
  const { chartsData, navigate, updateProcessChartPoint } = useFactory();
  const { hours, vacuum, bake } = chartsData.oven;
  const maxVal = 20;
  const threshold = 12; // Combined target: 6 Vacuum + 6 Bake

  const [isEditing, setIsEditing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalOvenOutput = vacuum.reduce((a, b) => a + b, 0) + bake.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all duration-150 relative flex flex-col justify-between">
      {/* Header & Legends */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div
            onClick={() => navigate('oven-selection')}
            className="cursor-pointer group flex-1"
          >
            <div className="flex items-center space-x-1.5">
              <BarChart3 className="w-5 h-5 text-slate-700 group-hover:text-sky-600 transition-colors" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                Total Oven Process
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
            </div>
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
              TOTAL VACUUM + BAKE (7 UNITS • TARGET: 12 MAG/HR)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span className="w-2.5 h-2.5 bg-slate-600 rounded-xs"></span>
              <span className="text-slate-700 font-semibold text-[11px]">Normal (≥ 12)</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span className="w-2.5 h-2.5 bg-slate-200 border border-slate-300 rounded-xs"></span>
              <span className="text-slate-600 text-[11px]">Below Target (&lt; 12)</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
              title="Edit hourly chart numbers"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Total Summary Strip */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-3 bg-slate-50/80 rounded-lg border border-slate-200/70 text-xs font-mono">
          <span className="text-slate-500">Cumulative Total Output:</span>
          <span className="font-bold text-slate-800">{totalOvenOutput} Mag <span className="font-normal text-slate-500 font-sans text-[11px]">(7 Ovens)</span></span>
        </div>

        {/* Chart Canvas */}
        <div className="relative pt-6 pb-2 border-l border-b border-slate-300 pl-2">
          {/* Background Grid Guidelines */}
          <div className="absolute inset-x-2 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
            <div className="w-full border-b border-dashed border-slate-400 flex justify-between text-[9px] text-slate-400 font-mono">
              <span>20</span>
              <span>Ceiling</span>
            </div>
            <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
              <span>12</span>
              <span>Target (12 Mag)</span>
            </div>
            <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
              <span>6</span>
              <span>Half</span>
            </div>
            <div className="w-full border-b border-solid border-slate-400"></div>
          </div>

          <div className="flex items-end justify-between space-x-2 h-44 px-1 relative z-10">
            {hours.map((hr, i) => {
              const vVal = vacuum[i] ?? 6;
              const bVal = bake[i] ?? 6;
              const totalVal = vVal + bVal;
              const height = (totalVal / maxVal) * 100;

              const isHigh = totalVal >= threshold;
              const bgClass = isHigh
                ? 'bg-slate-600 hover:bg-slate-700 shadow-xs'
                : 'bg-slate-200 border border-slate-300 text-slate-700';

              const isHovered = hoveredIndex === i;

              return (
                <div key={hr} className="flex-1 flex flex-col items-center">
                  <div
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="w-full flex flex-col items-center justify-end h-36 relative group cursor-pointer"
                  >
                    {isHovered && (
                      <div className="absolute -top-10 bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                        Total Oven: {totalVal} mag (Vac: {vVal}, Bake: {bVal})
                      </div>
                    )}
                    <span className="text-[10px] font-mono font-semibold text-slate-600 px-0.5 mb-1">
                      {totalVal}
                    </span>
                    <div
                      style={{ height: `${Math.max(8, height)}%` }}
                      className={`w-full max-w-[36px] ${bgClass} rounded-t-sm transition-all duration-200`}
                    ></div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600 mt-3">
                    {hr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Edit Popup */}
      {isEditing && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-slate-700">
            <span>Edit Oven Hourly Vacuum &amp; Bake</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {hours.map((hr, idx) => (
              <div key={hr} className="bg-white p-1.5 rounded border border-slate-200">
                <span className="font-mono font-bold text-[10px] text-slate-500 block">{hr}</span>
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    value={vacuum[idx]}
                    onChange={(e) => updateProcessChartPoint('oven', 'vacuum', idx, Number(e.target.value))}
                    className="w-1/2 px-1 py-0.5 bg-slate-50 border border-slate-300 rounded font-mono text-[11px]"
                    title="Vacuum"
                  />
                  <input
                    type="number"
                    value={bake[idx]}
                    onChange={(e) => updateProcessChartPoint('oven', 'bake', idx, Number(e.target.value))}
                    className="w-1/2 px-1 py-0.5 bg-slate-50 border border-slate-300 text-slate-700 rounded font-mono text-[11px]"
                    title="Bake"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Export OvenChart as alias for TotalOvenChart to guarantee backwards compatibility
export const OvenChart = TotalOvenChart;

/**
 * VacuumOvenChart
 * Shows Dedicated Vacuum Oven Throughput (Dedicated Vacuum Chambers - 2 Units)
 * Single bar per hour, muted/dropped color tones.
 */
export const VacuumOvenChart: React.FC = () => {
  const { chartsData, navigate, updateProcessChartPoint } = useFactory();
  const { hours, vacuum } = chartsData.oven;
  const maxVal = 12;
  const threshold = 6; // Target: 6 Mag/hr for 2 Vacuum units

  const [isEditing, setIsEditing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalVacuumOutput = vacuum.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all duration-150 relative flex flex-col justify-between">
      {/* Header & Legends */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div
            onClick={() => navigate('vacuum-process')}
            className="cursor-pointer group flex-1"
          >
            <div className="flex items-center space-x-1.5">
              <Wind className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                Vacuum Oven
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
              VACUUM DE-GASSING (2 UNITS • TARGET: 6 MAG/HR)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <div className="flex items-center space-x-1.5 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span>
              <span className="text-emerald-800 font-semibold text-[11px]">Normal (≥ 6)</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-emerald-50/50 px-2 py-1 rounded-lg border border-emerald-200/60">
              <span className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-300 rounded-xs"></span>
              <span className="text-emerald-700 text-[11px]">Below Target (&lt; 6)</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
              title="Edit Vacuum numbers"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Total Summary Strip */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-3 bg-slate-50/80 rounded-lg border border-slate-200/70 text-xs font-mono">
          <span className="text-slate-500">Cumulative Total Output:</span>
          <span className="font-bold text-slate-800">{totalVacuumOutput} Mag <span className="font-normal text-slate-500 font-sans text-[11px]">(2 Units)</span></span>
        </div>

        {/* Chart Canvas */}
        <div className="relative pt-6 pb-2 border-l border-b border-slate-300 pl-2">
          {/* Background Grid Guidelines */}
          <div className="absolute inset-x-2 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
            <div className="w-full border-b border-dashed border-slate-400 flex justify-between text-[9px] text-slate-400 font-mono">
              <span>12</span>
              <span>Max Capacity</span>
            </div>
            <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
              <span>6</span>
              <span>Target (6 Mag)</span>
            </div>
            <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
              <span>3</span>
              <span>Low</span>
            </div>
            <div className="w-full border-b border-solid border-slate-400"></div>
          </div>

          <div className="flex items-end justify-between space-x-2 h-44 px-1 relative z-10">
            {hours.map((hr, i) => {
              const val = vacuum[i] ?? 6;
              const height = (val / maxVal) * 100;

              const isHigh = val >= threshold;
              const bgClass = isHigh
                ? 'bg-emerald-600/85 hover:bg-emerald-600 shadow-xs'
                : 'bg-emerald-100 border border-emerald-200 text-emerald-800';

              const isHovered = hoveredIndex === i;

              return (
                <div key={hr} className="flex-1 flex flex-col items-center">
                  <div
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="w-full flex flex-col items-center justify-end h-36 relative group cursor-pointer"
                  >
                    {isHovered && (
                      <div className="absolute -top-10 bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                        Vacuum: {val} mag (2 Units)
                      </div>
                    )}
                    <span className="text-[10px] font-mono font-semibold text-slate-600 px-0.5 mb-1">
                      {val}
                    </span>
                    <div
                      style={{ height: `${Math.max(8, height)}%` }}
                      className={`w-full max-w-[36px] ${bgClass} rounded-t-sm transition-all duration-200`}
                    ></div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600 mt-3">
                    {hr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Edit Popup */}
      {isEditing && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-slate-700">
            <span>Edit Vacuum Hourly Output (Mag)</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {hours.map((hr, idx) => (
              <div key={hr} className="bg-white p-1.5 rounded border border-slate-200">
                <span className="font-mono font-bold text-[10px] text-slate-500 block">{hr}</span>
                <input
                  type="number"
                  value={vacuum[idx]}
                  onChange={(e) => updateProcessChartPoint('oven', 'vacuum', idx, Number(e.target.value))}
                  className="w-full mt-1 px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded font-mono text-[11px]"
                  title="Vacuum Mag"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * BakeOvenChart
 * Shows Dedicated Thermal Bake Oven Throughput (Dedicated Thermal Bake Ovens - 5 Units)
 * Single bar per hour, muted/dropped color tones.
 */
export const BakeOvenChart: React.FC = () => {
  const { chartsData, navigate, updateProcessChartPoint } = useFactory();
  const { hours, bake } = chartsData.oven;
  const maxVal = 12;
  const threshold = 6; // Target: 6 Mag/hr for 5 Bake units

  const [isEditing, setIsEditing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalBakeOutput = bake.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all duration-150 relative flex flex-col justify-between">
      {/* Header & Legends */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div
            onClick={() => navigate('bake-process')}
            className="cursor-pointer group flex-1"
          >
            <div className="flex items-center space-x-1.5">
              <Flame className="w-5 h-5 text-amber-600 group-hover:text-amber-700 transition-colors" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                Bake Oven
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
            </div>
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
              THERMAL CURING (5 UNITS • TARGET: 6 MAG/HR)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span className="w-2.5 h-2.5 bg-amber-600/75 rounded-xs"></span>
              <span className="text-slate-700 font-semibold text-[11px]">Normal (≥ 6)</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <span className="w-2.5 h-2.5 bg-amber-100 border border-amber-300 rounded-xs"></span>
              <span className="text-slate-600 text-[11px]">Below Target (&lt; 6)</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
              className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
              title="Edit Bake numbers"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Total Summary Strip */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-3 bg-amber-50/50 rounded-lg border border-amber-200/60 text-xs font-mono">
          <span className="text-amber-800">Cumulative Total Output:</span>
          <span className="font-bold text-amber-900">{totalBakeOutput} Mag <span className="font-normal text-amber-700 font-sans text-[11px]">(5 Units)</span></span>
        </div>

        {/* Chart Canvas */}
        <div className="relative pt-6 pb-2 border-l border-b border-slate-300 pl-2">
          {/* Background Grid Guidelines */}
          <div className="absolute inset-x-2 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
            <div className="w-full border-b border-dashed border-slate-400 flex justify-between text-[9px] text-slate-400 font-mono">
              <span>12</span>
              <span>Max Capacity</span>
            </div>
            <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
              <span>6</span>
              <span>Target (6 Mag)</span>
            </div>
            <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
              <span>3</span>
              <span>Low</span>
            </div>
            <div className="w-full border-b border-solid border-slate-400"></div>
          </div>

          <div className="flex items-end justify-between space-x-2 h-44 px-1 relative z-10">
            {hours.map((hr, i) => {
              const val = bake[i] ?? 6;
              const height = (val / maxVal) * 100;

              const isHigh = val >= threshold;
              const bgClass = isHigh
                ? 'bg-amber-600/75 hover:bg-amber-700 shadow-xs'
                : 'bg-amber-100 border border-amber-300 text-amber-900';

              const isHovered = hoveredIndex === i;

              return (
                <div key={hr} className="flex-1 flex flex-col items-center">
                  <div
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="w-full flex flex-col items-center justify-end h-36 relative group cursor-pointer"
                  >
                    {isHovered && (
                      <div className="absolute -top-10 bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                        Bake: {val} mag (5 Units)
                      </div>
                    )}
                    <span className="text-[10px] font-mono font-semibold text-slate-600 px-0.5 mb-1">
                      {val}
                    </span>
                    <div
                      style={{ height: `${Math.max(8, height)}%` }}
                      className={`w-full max-w-[36px] ${bgClass} rounded-t-sm transition-all duration-200`}
                    ></div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600 mt-3">
                    {hr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Edit Popup */}
      {isEditing && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-slate-700">
            <span>Edit Bake Hourly Output (Mag)</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {hours.map((hr, idx) => (
              <div key={hr} className="bg-white p-1.5 rounded border border-slate-200">
                <span className="font-mono font-bold text-[10px] text-slate-500 block">{hr}</span>
                <input
                  type="number"
                  value={bake[idx]}
                  onChange={(e) => updateProcessChartPoint('oven', 'bake', idx, Number(e.target.value))}
                  className="w-full mt-1 px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded font-mono text-[11px]"
                  title="Bake Mag"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * DispensingChart
 * Shows Total Dispensing Throughput (Consolidated 12 Machines: Top & Under Fill)
 * Single bar per hour, muted/dropped color tones.
 */
export const DispensingChart: React.FC = () => {
  const { chartsData, navigate, updateProcessChartPoint } = useFactory();
  const { hours, topFill, underFill } = chartsData.dispensing;
  const maxVal = 2000;
  const threshold = 1600; // Combined target: 800 Top + 800 Under

  const [isEditing, setIsEditing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all duration-150 relative">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div
          onClick={() => navigate('machine-detail', 'MC-01')}
          className="cursor-pointer group flex-1"
        >
          <div className="flex items-center space-x-1.5">
            <BarChart3 className="w-5 h-5 text-sky-600 group-hover:text-sky-700 transition-colors" />
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
              Dispensing Process (Fleet Total)
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
            TOTAL TOP &amp; UNDER FILL (TARGET: 1,600 PCS/HR)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium">
          <div className="flex items-center space-x-1.5 bg-sky-50/70 px-2.5 py-1 rounded-lg border border-sky-200/80">
            <span className="w-2.5 h-2.5 bg-sky-600/75 rounded-xs"></span>
            <span className="text-sky-800 font-semibold">Normal (≥ 1,600 Pcs)</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-sky-50/50 px-2.5 py-1 rounded-lg border border-sky-200/50">
            <span className="w-2.5 h-2.5 bg-sky-100 border border-sky-200 rounded-xs"></span>
            <span className="text-sky-700 font-medium">Below Target (&lt; 1,600)</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
            title="Edit hourly chart numbers"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative pt-6 pb-2 border-l border-b border-slate-300 pl-2">
        {/* Background Grid Guidelines */}
        <div className="absolute inset-x-2 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
          <div className="w-full border-b border-dashed border-slate-400 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>2,000</span>
            <span>Max Capacity</span>
          </div>
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>1,600</span>
            <span>Target Output (1,600 Pcs Combined)</span>
          </div>
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>1,000</span>
            <span>Minimum Standard</span>
          </div>
          <div className="w-full border-b border-solid border-slate-400"></div>
        </div>

        <div className="flex items-end justify-between space-x-2 h-44 px-1 relative z-10">
          {hours.map((hr, i) => {
            const tfVal = topFill[i] ?? 800;
            const ufVal = underFill[i] ?? 800;
            const totalVal = tfVal + ufVal;
            const height = (totalVal / maxVal) * 100;

            const isHigh = totalVal >= threshold;
            const bgClass = isHigh
              ? 'bg-sky-600/75 hover:bg-sky-600 shadow-xs'
              : 'bg-sky-100 border border-sky-200 text-sky-800';

            const isHovered = hoveredIndex === i;

            return (
              <div key={hr} className="flex-1 flex flex-col items-center">
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="w-full flex flex-col items-center justify-end h-36 relative group cursor-pointer"
                >
                  {isHovered && (
                    <div className="absolute -top-10 bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                      Total Dispensing: {totalVal} pcs (Top: {tfVal}, Under: {ufVal})
                    </div>
                  )}
                  <span className="text-[10px] font-mono font-semibold text-slate-600 px-0.5 mb-1">
                    {totalVal}
                  </span>
                  <div
                    style={{ height: `${Math.max(8, height)}%` }}
                    className={`w-full max-w-[36px] ${bgClass} rounded-t-sm transition-all duration-200`}
                  ></div>
                </div>
                <span className="text-xs font-mono font-medium text-slate-600 mt-3">
                  {hr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-slate-700">
            <span>Edit Dispensing Hourly Top &amp; Under Fill Outputs</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {hours.map((hr, idx) => (
              <div key={hr} className="bg-white p-1.5 rounded border border-slate-200">
                <span className="font-mono font-bold text-[10px] text-slate-500 block">{hr}</span>
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    value={topFill[idx]}
                    onChange={(e) => updateProcessChartPoint('dispensing', 'topFill', idx, Number(e.target.value))}
                    className="w-1/2 px-1 py-0.5 bg-slate-50 border border-slate-300 rounded font-mono text-[11px]"
                    title="Top Fill"
                  />
                  <input
                    type="number"
                    value={underFill[idx]}
                    onChange={(e) => updateProcessChartPoint('dispensing', 'underFill', idx, Number(e.target.value))}
                    className="w-1/2 px-1 py-0.5 bg-sky-50 border border-sky-300 text-sky-800 rounded font-mono text-[11px]"
                    title="Under Fill"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * FvmiChart
 * Shows Total FVMI Inspection (Consolidated 9 Machines)
 * Single bar per hour, muted/dropped color tones.
 */
export const FvmiChart: React.FC = () => {
  const { chartsData, navigate, updateProcessChartPoint } = useFactory();
  const { hours, total } = chartsData.fvmi;
  const maxVal = 1400;
  const threshold = 1100;

  const [isEditing, setIsEditing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all duration-150 relative">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div
          onClick={() => navigate('fvmi')}
          className="cursor-pointer group flex-1"
        >
          <div className="flex items-center space-x-1.5">
            <BarChart3 className="w-5 h-5 text-orange-500 group-hover:text-orange-600 transition-colors" />
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
              FVMI Inspection (Fleet Total)
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
            TOTAL 9 STATIONS THROUGHPUT (TARGET: 1,100 PCS/HR)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium">
          <div className="flex items-center space-x-1.5 bg-orange-50/70 px-2.5 py-1 rounded-lg border border-orange-200/80">
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-xs"></span>
            <span className="text-orange-900 font-semibold">Normal (≥ 1,100 Pcs)</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-orange-50/40 px-2.5 py-1 rounded-lg border border-orange-200/50">
            <span className="w-2.5 h-2.5 bg-orange-100 border border-orange-200 rounded-xs"></span>
            <span className="text-orange-800 font-medium">Below Target (&lt; 1,100)</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
            title="Edit hourly chart numbers"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative pt-6 pb-2 border-l border-b border-slate-300 pl-2">
        {/* Background Grid Guidelines */}
        <div className="absolute inset-x-2 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
          <div className="w-full border-b border-dashed border-slate-400 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>1,400</span>
            <span>Max Capacity</span>
          </div>
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>1,100</span>
            <span>Target Output (1,100 Pcs)</span>
          </div>
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>700</span>
            <span>Standard Line</span>
          </div>
          <div className="w-full border-b border-solid border-slate-400"></div>
        </div>

        <div className="flex items-end justify-between space-x-2 h-44 px-1 relative z-10">
          {hours.map((hr, i) => {
            const val = total[i];
            const height = (val / maxVal) * 100;
            const isHigh = val >= threshold;
            const bgClass = isHigh
              ? 'bg-orange-500/85 hover:bg-orange-500 shadow-xs'
              : 'bg-orange-100 border border-orange-200 text-orange-900';
            const isHovered = hoveredIndex === i;

            return (
              <div key={hr} className="flex-1 flex flex-col items-center">
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="w-full flex flex-col items-center justify-end h-36 relative group cursor-pointer"
                >
                  {isHovered && (
                    <div className="absolute -top-10 bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                      Total FVMI: {val} pcs/hr
                    </div>
                  )}
                  <span className="text-[10px] font-mono font-semibold text-slate-600 px-0.5 mb-1">
                    {val}
                  </span>
                  <div
                    style={{ height: `${Math.max(8, height)}%` }}
                    className={`w-full max-w-[36px] ${bgClass} rounded-t-sm transition-all duration-200`}
                  ></div>
                </div>
                <span className="text-xs font-mono font-medium text-slate-600 mt-3">
                  {hr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-slate-700">
            <span>Edit FVMI Hourly Inspected Units</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {hours.map((hr, idx) => (
              <div key={hr} className="bg-white p-1.5 rounded border border-slate-200">
                <span className="font-mono font-bold text-[10px] text-slate-500 block">{hr}</span>
                <input
                  type="number"
                  value={total[idx]}
                  onChange={(e) => updateProcessChartPoint('fvmi', 'total', idx, Number(e.target.value))}
                  className="w-full mt-1 px-1 py-0.5 bg-amber-50 border border-amber-300 text-amber-900 rounded font-mono text-[11px]"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * AOIChart
 * Shows Total AOI Inspection (Consolidated 2 Machines: AOI-01 + AOI-02)
 * Single unified bar per hour, no separated machine buttons, muted/dropped color tones.
 */
export const AOIChart: React.FC = () => {
  const { chartsData, navigate, updateProcessChartPoint } = useFactory();
  const aoiData = chartsData.aoi || {
    hours: chartsData.packout.hours,
    uph: chartsData.packout.count,
    unit1: [940, 1110, 1170, 1030, 1150, 1090, 1130, 1070, 1180, 1110, 1140],
    unit2: [960, 1130, 1190, 1050, 1170, 1110, 1150, 1090, 1200, 1130, 1160]
  };
  const { hours, uph } = aoiData;
  const unit1 = aoiData.unit1 || hours.map((_, i) => Math.max(700, (uph[i] ?? 1100) - 15));
  const unit2 = aoiData.unit2 || hours.map((_, i) => Math.min(1380, (uph[i] ?? 1100) + 15));
  
  // Target for 2 machines combined: 1,100 * 2 = 2,200 UPH
  const maxVal = 2800;
  const threshold = 2200;

  const [isEditing, setIsEditing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all duration-150 relative">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div
          onClick={() => navigate('packout-aoi')}
          className="cursor-pointer group flex-1"
        >
          <div className="flex items-center space-x-1.5">
            <BarChart3 className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
              AOI Inspection (Fleet Total)
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
            TOTAL AOI THROUGHPUT (TARGET: 2,200 UPH — 2 MACHINES COMBINED)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium">
          <div className="flex items-center space-x-1.5 bg-indigo-50/70 px-2.5 py-1 rounded-lg border border-indigo-200/80">
            <span className="w-2.5 h-2.5 bg-indigo-500/70 rounded-xs"></span>
            <span className="text-indigo-900 font-semibold">Normal (≥ 2,200 UPH)</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-indigo-50/40 px-2.5 py-1 rounded-lg border border-indigo-200/50">
            <span className="w-2.5 h-2.5 bg-indigo-100 border border-indigo-200 rounded-xs"></span>
            <span className="text-indigo-800 font-medium">Below Target (&lt; 2,200)</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
            title="Edit hourly chart numbers"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AOI Machine Direct Jump Bar */}
      <div className="flex items-center gap-2 mb-3 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 text-xs">
        <span className="font-mono font-bold text-indigo-900 shrink-0">Open Machine:</span>
        <button
          onClick={() => navigate('packout-aoi', 'AOI-01')}
          className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 rounded-lg font-mono font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
          title="Open AOI-01 Machine View (Line 1)"
        >
          <span>AOI-01</span>
          <span className="text-[10px] opacity-75">(Line 1)</span>
        </button>
        <button
          onClick={() => navigate('packout-aoi', 'AOI-02')}
          className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 rounded-lg font-mono font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
          title="Open AOI-02 Machine View (Line 2)"
        >
          <span>AOI-02</span>
          <span className="text-[10px] opacity-75">(Line 2)</span>
        </button>
      </div>

      <div className="relative pt-6 pb-2 border-l border-b border-slate-300 pl-2">
        {/* Background Grid Guidelines */}
        <div className="absolute inset-x-2 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
          <div className="w-full border-b border-dashed border-slate-400 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>2,800 UPH</span>
            <span>Max Capacity</span>
          </div>
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>2,200 UPH</span>
            <span>Target Output (2,200 UPH Combined)</span>
          </div>
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>1,400 UPH</span>
            <span>Standard Line</span>
          </div>
          <div className="w-full border-b border-solid border-slate-400"></div>
        </div>

        <div className="flex items-end justify-between space-x-2 h-44 px-1 relative z-10">
          {hours.map((hr, i) => {
            const v1 = unit1[i] ?? 1100;
            const v2 = unit2[i] ?? 1100;
            const totalVal = v1 + v2;
            const height = (totalVal / maxVal) * 100;

            const isHigh = totalVal >= threshold;
            const bgClass = isHigh
              ? 'bg-indigo-500/70 hover:bg-indigo-500 shadow-xs'
              : 'bg-indigo-100 border border-indigo-200 text-indigo-900';

            const isHovered = hoveredIndex === i;

            return (
              <div key={hr} className="flex-1 flex flex-col items-center">
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="w-full flex flex-col items-center justify-end h-36 relative group cursor-pointer"
                >
                  {isHovered && (
                    <div className="absolute -top-10 bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                      Total AOI: {totalVal} UPH (Line 1: {v1}, Line 2: {v2})
                    </div>
                  )}
                  <span className="text-[10px] font-mono font-semibold text-slate-600 px-0.5 mb-1">
                    {totalVal}
                  </span>
                  <div
                    style={{ height: `${Math.max(8, height)}%` }}
                    className={`w-full max-w-[36px] ${bgClass} rounded-t-sm transition-all duration-200`}
                  ></div>
                </div>
                <span className="text-xs font-mono font-medium text-slate-600 mt-3">
                  {hr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-slate-700">
            <span>Edit AOI Units Hourly Throughput (Target: 1,100 each / 2,200 Total)</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {hours.map((hr, idx) => (
              <div key={hr} className="bg-white p-1.5 rounded border border-slate-200">
                <span className="font-mono font-bold text-[10px] text-slate-500 block">{hr}</span>
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    value={unit1[idx]}
                    onChange={(e) => updateProcessChartPoint('aoi', 'unit1', idx, Number(e.target.value))}
                    className="w-1/2 px-1 py-0.5 bg-slate-50 border border-slate-300 text-slate-800 rounded font-mono text-[11px]"
                    title="AOI-01"
                  />
                  <input
                    type="number"
                    value={unit2[idx]}
                    onChange={(e) => updateProcessChartPoint('aoi', 'unit2', idx, Number(e.target.value))}
                    className="w-1/2 px-1 py-0.5 bg-indigo-50 border border-indigo-300 text-indigo-900 rounded font-mono text-[11px]"
                    title="AOI-02"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * XrayChart
 * Shows Total X-ray Radiography (Consolidated 5 Units)
 * Single bar per hour, muted/dropped color tones.
 */
export const XrayChart: React.FC = () => {
  const { chartsData, navigate, updateProcessChartPoint } = useFactory();
  const xrayData = chartsData.xray || {
    hours: chartsData.packout.hours,
    uph: chartsData.packout.ocr
  };
  const { hours, uph } = xrayData;
  const maxVal = 1400;
  const threshold = 1100;

  const [isEditing, setIsEditing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all duration-150 relative">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div
          onClick={() => navigate('packout-xray')}
          className="cursor-pointer group flex-1"
        >
          <div className="flex items-center space-x-1.5">
            <BarChart3 className="w-5 h-5 text-rose-600 group-hover:text-rose-700 transition-colors" />
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
              X-ray Radiography (Fleet Total)
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
            TOTAL 90KV MICRO-FOCUS NDT DIAGNOSTICS (TARGET: 1,100 UPH)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium">
          <div className="flex items-center space-x-1.5 bg-rose-50/70 px-2.5 py-1 rounded-lg border border-rose-200/80">
            <span className="w-2.5 h-2.5 bg-rose-500/70 rounded-xs"></span>
            <span className="text-rose-900 font-semibold">Normal (≥ 1,100 UPH)</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-rose-50/40 px-2.5 py-1 rounded-lg border border-rose-200/50">
            <span className="w-2.5 h-2.5 bg-rose-100 border border-rose-200 rounded-xs"></span>
            <span className="text-rose-800 font-medium">Below Target (&lt; 1,100)</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
            title="Edit hourly chart numbers"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* X-ray Machine Direct Jump Bar */}
      <div className="flex items-center gap-1.5 mb-3 bg-rose-50/50 p-2 rounded-xl border border-rose-100 text-xs overflow-x-auto">
        <span className="font-mono font-bold text-rose-900 shrink-0">Open Unit:</span>
        {[1, 2, 3, 4, 5].map((num) => {
          const mKey = `X-RAY 0${num}`;
          return (
            <button
              key={num}
              onClick={() => navigate('packout-xray', mKey)}
              className="px-2.5 py-1 bg-white hover:bg-rose-600 hover:text-white text-rose-900 border border-rose-200 rounded-lg font-mono font-bold transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1"
              title={`Open ${mKey} Machine View (Line ${num})`}
            >
              <span>{mKey}</span>
              <span className="text-[10px] opacity-75">(Line {num})</span>
            </button>
          );
        })}
      </div>

      <div className="relative pt-6 pb-2 border-l border-b border-slate-300 pl-2">
        {/* Background Grid Guidelines */}
        <div className="absolute inset-x-2 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
          <div className="w-full border-b border-dashed border-slate-400 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>1,400 UPH</span>
            <span>Max Capacity</span>
          </div>
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>1,100 UPH</span>
            <span>Target Output (1,100 UPH)</span>
          </div>
          <div className="w-full border-b border-dashed border-slate-300 flex justify-between text-[9px] text-slate-400 font-mono">
            <span>700 UPH</span>
            <span>Standard Line</span>
          </div>
          <div className="w-full border-b border-solid border-slate-400"></div>
        </div>

        <div className="flex items-end justify-between space-x-2 h-44 px-1 relative z-10">
          {hours.map((hr, i) => {
            const val = uph[i] ?? 1100;
            const height = (val / maxVal) * 100;
            const isHigh = val >= threshold;
            const bgClass = isHigh
              ? 'bg-rose-500/70 hover:bg-rose-500 shadow-xs'
              : 'bg-rose-100 border border-rose-200 text-rose-900';
            const isHovered = hoveredIndex === i;

            return (
              <div key={hr} className="flex-1 flex flex-col items-center">
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="w-full flex flex-col items-center justify-end h-36 relative group cursor-pointer"
                >
                  {isHovered && (
                    <div className="absolute -top-10 bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                      Total X-ray: {val} UPH
                    </div>
                  )}
                  <span className="text-[10px] font-mono font-semibold text-slate-600 px-0.5 mb-1">
                    {val}
                  </span>
                  <div
                    style={{ height: `${Math.max(8, height)}%` }}
                    className={`w-full max-w-[36px] ${bgClass} rounded-t-sm transition-all duration-200`}
                  ></div>
                </div>
                <span className="text-xs font-mono font-medium text-slate-600 mt-3">
                  {hr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold text-slate-700">
            <span>Edit X-ray Hourly Fleet Throughput (Target: 1,100 UPH)</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {hours.map((hr, idx) => (
              <div key={hr} className="bg-white p-1.5 rounded border border-slate-200">
                <span className="font-mono font-bold text-[10px] text-slate-500 block">{hr}</span>
                <input
                  type="number"
                  value={uph[idx]}
                  onChange={(e) => updateProcessChartPoint('xray', 'uph', idx, Number(e.target.value))}
                  className="w-full mt-1 px-1 py-0.5 bg-rose-50 border border-rose-300 text-rose-900 rounded font-mono text-[11px]"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * PackoutChart (Fallback/Auxiliary)
 * Kept consistent with muted 2-tone colors.
 */
export const PackoutChart: React.FC = () => {
  const { chartsData, navigate, updateProcessChartPoint } = useFactory();
  const { hours, count, ocr } = chartsData.packout;
  const maxVal = 2800;
  const threshold = 2200;

  const [isEditing, setIsEditing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all duration-150 relative">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div
          onClick={() => navigate('packout-selection')}
          className="cursor-pointer group flex-1"
        >
          <div className="flex items-center space-x-1.5">
            <BarChart3 className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
              Packout Process (Fleet Total)
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
            TOTAL AOI &amp; X-RAY PACKOUT (TARGET: 2,200 UPH)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium">
          <div className="flex items-center space-x-1.5 bg-indigo-50/70 px-2.5 py-1 rounded-lg border border-indigo-200/80">
            <span className="w-2.5 h-2.5 bg-indigo-500/70 rounded-xs"></span>
            <span className="text-indigo-900 font-semibold">Normal (≥ 2,200 UPH)</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-indigo-50/40 px-2.5 py-1 rounded-lg border border-indigo-200/50">
            <span className="w-2.5 h-2.5 bg-indigo-100 border border-indigo-200 rounded-xs"></span>
            <span className="text-indigo-800 font-medium">Below Target (&lt; 2,200)</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
            title="Edit hourly chart numbers"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative pt-6 pb-2 border-l border-b border-slate-300 pl-2">
        <div className="flex items-end justify-between space-x-2 h-44 px-1 relative z-10">
          {hours.map((hr, i) => {
            const totalVal = (count[i] ?? 1100) + (ocr[i] ?? 1100);
            const height = (totalVal / maxVal) * 100;
            const isHigh = totalVal >= threshold;
            const bgClass = isHigh
              ? 'bg-indigo-500/70 hover:bg-indigo-500 shadow-xs'
              : 'bg-indigo-100 border border-indigo-200 text-indigo-900';
            const isHovered = hoveredIndex === i;

            return (
              <div key={hr} className="flex-1 flex flex-col items-center">
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="w-full flex flex-col items-center justify-end h-36 relative group cursor-pointer"
                >
                  {isHovered && (
                    <div className="absolute -top-10 bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-md z-30 whitespace-nowrap">
                      Packout Total: {totalVal} UPH
                    </div>
                  )}
                  <span className="text-[10px] font-mono font-semibold text-slate-600 px-0.5 mb-1">
                    {totalVal}
                  </span>
                  <div
                    style={{ height: `${Math.max(8, height)}%` }}
                    className={`w-full max-w-[36px] ${bgClass} rounded-t-sm transition-all duration-200`}
                  ></div>
                </div>
                <span className="text-xs font-mono font-medium text-slate-600 mt-3">
                  {hr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

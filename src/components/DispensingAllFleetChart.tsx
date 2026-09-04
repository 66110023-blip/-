import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Activity,
  Cpu,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Sliders,
  ScanLine
} from 'lucide-react';
import { Machine } from '../types';

export interface DispensingFleetHourlySlot {
  hourShort: string;
  hour: string;
  topFill: number;
  underFill: number;
  total: number;
  target: number;
  efficiencyPercent: number;
}

const DEFAULT_FLEET_HOURLY: DispensingFleetHourlySlot[] = [
  { hourShort: '07:00', hour: '07:00 - 08:00', topFill: 620, underFill: 540, total: 1160, target: 1400, efficiencyPercent: 99.2 },
  { hourShort: '08:00', hour: '08:00 - 09:00', topFill: 740, underFill: 630, total: 1370, target: 1400, efficiencyPercent: 99.4 },
  { hourShort: '09:00', hour: '09:00 - 10:00', topFill: 820, underFill: 710, total: 1530, target: 1400, efficiencyPercent: 99.5 },
  { hourShort: '10:00', hour: '10:00 - 11:00', topFill: 890, underFill: 780, total: 1670, target: 1400, efficiencyPercent: 99.6 },
  { hourShort: '11:00', hour: '11:00 - 12:00', topFill: 810, underFill: 700, total: 1510, target: 1400, efficiencyPercent: 99.4 },
  { hourShort: '12:00', hour: '12:00 - 13:00', topFill: 650, underFill: 580, total: 1230, target: 1400, efficiencyPercent: 99.1 },
  { hourShort: '13:00', hour: '13:00 - 14:00', topFill: 870, underFill: 760, total: 1630, target: 1400, efficiencyPercent: 99.5 },
  { hourShort: '14:00', hour: '14:00 - 15:00', topFill: 920, underFill: 810, total: 1730, target: 1400, efficiencyPercent: 99.7 },
  { hourShort: '15:00', hour: '15:00 - 16:00', topFill: 960, underFill: 840, total: 1800, target: 1400, efficiencyPercent: 99.6 },
  { hourShort: '16:00', hour: '16:00 - 17:00', topFill: 890, underFill: 780, total: 1670, target: 1400, efficiencyPercent: 99.4 },
  { hourShort: '17:00', hour: '17:00 - 18:00', topFill: 780, underFill: 690, total: 1470, target: 1400, efficiencyPercent: 99.3 },
];

interface DispensingAllFleetChartProps {
  machines: Machine[];
  onSelectMachine: (id: string) => void;
  openTraceabilityModal?: (id: string) => void;
}

export const DispensingAllFleetChart: React.FC<DispensingAllFleetChartProps> = ({
  machines,
  onSelectMachine,
  openTraceabilityModal
}) => {
  const [selectedHour, setSelectedHour] = useState<string>('ALL');
  const [chartMode, setChartMode] = useState<'stacked' | 'total'>('stacked');

  const totalOutput = machines.reduce((acc, m) => acc + (m.outputCount || 1102), 0);
  const totalInput = machines.reduce((acc, m) => acc + (m.inputCount || 1105), 0);
  const runningCount = machines.filter((m) => m.status === 'RUNNING').length;
  const avgUph = Math.round(machines.reduce((acc, m) => acc + (m.uph || 950), 0) / Math.max(1, machines.length));

  const topFillMachines = machines.filter((m) => m.processType === 'Top Fill');
  const underFillMachines = machines.filter((m) => m.processType === 'Under Fill');

  const topFillTotal = topFillMachines.reduce((acc, m) => acc + (m.outputCount || 1100), 0);
  const underFillTotal = underFillMachines.reduce((acc, m) => acc + (m.outputCount || 1100), 0);

  const getSlotIntensityColor = (totalVal: number) => {
    if (totalVal >= 1700) return '#0284c7'; // sky-600
    if (totalVal >= 1500) return '#38bdf8'; // sky-400
    if (totalVal >= 1300) return '#7dd3fc'; // sky-300
    return '#bae6fd'; // sky-200
  };

  return (
    <div className="space-y-6">
      {/* 4 Cumulative Fleet Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Total Dispensed Fleet</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {totalOutput.toLocaleString()} <span className="text-xs font-normal text-slate-400">boards</span>
          </div>
          <div className="text-[10px] text-sky-700 font-mono mt-1 font-bold">
            All 13 Dispensing Robots
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Fleet Yield Rate</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            {((totalOutput / Math.max(1, totalInput)) * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-emerald-600 font-mono mt-1 font-semibold">
            Input: {totalInput.toLocaleString()} boards
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Process Split</div>
          <div className="text-lg font-black font-mono text-slate-900 mt-1">
            Top: {topFillTotal.toLocaleString()} | Under: {underFillTotal.toLocaleString()}
          </div>
          <div className="text-[10px] text-indigo-700 font-mono mt-1 font-bold">
            7 Top Fill &bull; 6 Under Fill
          </div>
        </div>

        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl shadow-xs">
          <div className="text-[11px] font-mono text-sky-800 uppercase font-bold">Active Robots Online</div>
          <div className="text-2xl font-black font-mono text-sky-950 mt-1">
            {runningCount} / {machines.length} <span className="text-xs font-normal text-sky-700">RUNNING</span>
          </div>
          <div className="text-[10px] text-sky-700 font-mono mt-1 font-bold">
            Fleet Avg UPH: ~{avgUph} pcs/h
          </div>
        </div>
      </div>

      {/* CUMULATIVE "ALL" DISPENSING HOURLY GRAPH */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              Cumulative Dispensing Fleet Hourly Output (All 13 Robots)
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Hourly throughput distribution across Top Fill (MC-01 to MC-07) & Under Fill (MC-08 to MC-13)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-mono">
              <button
                onClick={() => setChartMode('stacked')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  chartMode === 'stacked'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stacked (Top + Under)
              </button>
              <button
                onClick={() => setChartMode('total')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  chartMode === 'total'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Total Combined
              </button>
            </div>

            {/* Intensity Scale Legend */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Volume:</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-[#bae6fd]" title="Low" />
                <span className="text-[10px] text-slate-600">Low</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-[#7dd3fc]" />
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-[#0284c7]" title="Peak" />
                <span className="text-[10px] text-slate-600 font-bold">Peak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-sky-500 shadow-2xs" />
            <span className="text-slate-700 font-medium">Top Fill Process (MC-01 to MC-07)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-indigo-500 shadow-2xs" />
            <span className="text-slate-700 font-medium">Under Fill Process (MC-08 to MC-13)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-400" />
            <span>Target Line (1,400 boards/h)</span>
          </div>
        </div>

        {/* Clean Recharts Bar Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={DEFAULT_FLEET_HOURLY}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
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
                domain={[0, 2000]}
              />
              <ReferenceLine y={1400} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1.5} />
              <Tooltip
                cursor={{ fill: 'rgba(224, 242, 254, 0.4)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DispensingFleetHourlySlot;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs font-mono shadow-xl border border-slate-700 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                          <span className="font-bold text-sky-300 text-sm">{data.hour}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                            Combined 13 Robots
                          </span>
                        </div>
                        <div className="pt-1">
                          Total Dispensed: <strong className="text-white text-sm">{data.total.toLocaleString()} boards</strong>
                        </div>
                        <div className="text-sky-400 flex items-center justify-between">
                          <span>Top Fill (MC-01..07):</span>
                          <strong>{data.topFill.toLocaleString()} pcs</strong>
                        </div>
                        <div className="text-indigo-300 flex items-center justify-between">
                          <span>Under Fill (MC-08..13):</span>
                          <strong>{data.underFill.toLocaleString()} pcs</strong>
                        </div>
                        <div className="text-emerald-400 pt-1 border-t border-slate-800 flex items-center justify-between font-bold">
                          <span>Hourly Efficiency:</span>
                          <span>{data.efficiencyPercent}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {chartMode === 'stacked' ? (
                <>
                  <Bar dataKey="topFill" name="Top Fill" stackId="fleet" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="underFill" name="Under Fill" stackId="fleet" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </>
              ) : (
                <Bar dataKey="total" name="Total Dispensed" radius={[6, 6, 0, 0]}>
                  {DEFAULT_FLEET_HOURLY.map((entry) => (
                    <Cell
                      key={`total-${entry.hourShort}`}
                      fill={getSlotIntensityColor(entry.total)}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* FULL HOURLY FLEET BREAKDOWN TABLE */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              Dispensing Fleet Hourly Telemetry Table (07:00 - 18:00)
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Hourly aggregate across all Top Fill and Under Fill stations with target comparison
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5 font-bold">Hour Slot</th>
                <th className="p-2.5 font-bold text-right text-sky-700">Top Fill (MC-01..07)</th>
                <th className="p-2.5 font-bold text-right text-indigo-700">Under Fill (MC-08..13)</th>
                <th className="p-2.5 font-bold text-right">Combined Output</th>
                <th className="p-2.5 font-bold text-right text-slate-500">Fleet Target</th>
                <th className="p-2.5 font-bold text-right text-emerald-700">Efficiency</th>
                <th className="p-2.5 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DEFAULT_FLEET_HOURLY.map((slot) => {
                const isMeetingTarget = slot.total >= slot.target;
                return (
                  <tr
                    key={slot.hourShort}
                    onClick={() => setSelectedHour(slot.hourShort)}
                    className={`transition-colors cursor-pointer ${
                      selectedHour === slot.hourShort
                        ? 'bg-sky-50/90 font-bold'
                        : 'hover:bg-sky-50/50'
                    }`}
                  >
                    <td className="p-2.5 text-slate-900 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-sky-500 opacity-70" />
                      {slot.hour}
                    </td>
                    <td className="p-2.5 text-right font-bold text-sky-700">{slot.topFill.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-bold text-indigo-700">{slot.underFill.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-black text-slate-900">{slot.total.toLocaleString()} pcs</td>
                    <td className="p-2.5 text-right text-slate-500">{slot.target.toLocaleString()} pcs</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">{slot.efficiencyPercent}%</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isMeetingTarget
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isMeetingTarget ? 'ON TARGET' : 'SUB-TARGET'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 13-MACHINE INTERACTIVE FLEET GRID */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-600" />
              13 Individual Dispensing Robots Fleet Roster
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Select any robot to inspect its individual machine window, live syringe volume and UPH telemetry
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
            13 Machines Assigned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {machines.map((m) => {
            const isRun = m.status === 'RUNNING';
            const isTop = m.processType === 'Top Fill';
            const syringeRemaining = m.glueInfo?.remainingMins ?? 120;

            return (
              <div
                key={m.id}
                onClick={() => onSelectMachine(m.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md hover:border-sky-400 ${
                  isRun ? 'bg-white border-slate-200' : 'bg-rose-50/30 border-rose-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                        {m.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded ${
                          isRun ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isTop
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {m.processType}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-600 truncate">
                    Model: <strong className="text-slate-900">{m.runningModel.replace('Model ', '').replace('MODEL ', '')}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Output</span>
                      <strong className="text-slate-900">{m.outputCount.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">UPH</span>
                      <strong className="text-sky-700">{m.uph}</strong>
                    </div>
                  </div>

                  {/* Syringe Progress */}
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] font-mono">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-sky-500" />
                        <span>Syringe Level:</span>
                      </span>
                      <strong className="text-slate-800">{Math.min(100, Math.round((syringeRemaining / 180) * 100))}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((syringeRemaining / 180) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect Robot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

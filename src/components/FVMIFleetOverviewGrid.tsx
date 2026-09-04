import React from 'react';
import { Scan, RotateCcw, BarChart3, Edit3, ExternalLink } from 'lucide-react';
import { FvmiHourlySlot } from '../data/fvmiFleetData';

export interface FVMIFleetOverviewItem {
  id: string;
  name: string;
  status: 'RUNNING' | 'STOP' | 'IDLE';
  runningModel: string;
  operatorId: string;
  operatorName: string;
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
  hourlyData: FvmiHourlySlot[];
}

interface FVMIFleetOverviewGridProps {
  computedFleet: FVMIFleetOverviewItem[];
  selectedStationId: string;
  setSelectedStationId: (id: string) => void;
  selectedHourSlot?: string;
  openEditModal: (stationId: string) => void;
  setSelectedMachineId: (id: string) => void;
  navigate: (page: string) => void;
}

export const FVMIFleetOverviewGrid: React.FC<FVMIFleetOverviewGridProps> = ({
  computedFleet,
  selectedStationId,
  setSelectedStationId,
  selectedHourSlot = 'ALL',
  openEditModal,
  setSelectedMachineId,
  navigate,
}) => {
  return (
    <section className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-orange-500 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
        <div className="flex items-center space-x-2">
          <Scan className="w-4 h-4 text-orange-600" />
          <h3 className="text-xs font-bold text-[#0f172a] tracking-wider uppercase">
            FVMI Fleet Overview (9 Stations)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedStationId !== 'ALL' && (
            <button
              onClick={() => setSelectedStationId('ALL')}
              className="text-xs font-mono font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 cursor-pointer transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3 text-orange-600" />
              <span>Reset to All Fleet</span>
            </button>
          )}
          <span className="text-xs font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
            9 Stations Active
          </span>
        </div>
      </div>

      {/* 3-Column Grid for all 9 FVMI Machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {computedFleet.map((m) => {
          const isSelected = m.id === selectedStationId;
          const isRun = m.status === 'RUNNING';

          return (
            <div
              key={m.id}
              onClick={() => {
                setSelectedStationId(m.id);
                const chartEl = document.getElementById('fvmi-fleet-chart');
                if (chartEl) {
                  chartEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/40 shadow-xs'
                  : 'border-[#cbd5e1] bg-[#f8fafc] hover:border-orange-400 hover:bg-orange-50/20'
              }`}
            >
              <div>
                {/* Card Header: Station ID, Status, Model */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-sm text-[#0f172a]">
                      {m.id}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                      isRun ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isRun ? 'RUNNING' : 'STOP'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {isSelected && (
                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-orange-600 text-white shadow-2xs">
                        ✓ Viewing
                      </span>
                    )}
                    <span className="font-mono text-[10px] font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      {m.runningModel.replace('MODEL ', '')}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono text-[#64748b] truncate mt-1">
                  OP: <strong className="text-[#0f172a]">{m.operatorId}</strong> • {m.operatorName}
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#e2e8f0] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#64748b] block">Total Inspected</span>
                    <span className="font-black text-sm text-[#0f172a]">
                      {m.calculatedInput.toLocaleString()} <span className="text-[10px] font-normal text-[#64748b]">pcs</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748b] block">Pass Yield</span>
                    <span className={`font-black text-sm ${m.calculatedPassRate >= 98 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {m.calculatedPassRate}%
                    </span>
                  </div>
                </div>

                {/* Defect Summary Pill */}
                <div className="flex items-center justify-between text-[10px] font-mono mt-2 bg-white p-1.5 rounded-lg border border-[#cbd5e1]">
                  <span className="text-amber-700">XO: <strong>{m.calculatedXout}</strong></span>
                  <span className="text-sky-700">RW: <strong>{m.calculatedRework}</strong></span>
                  <span className="text-rose-700">DC: <strong>{m.calculatedDiscard}</strong></span>
                </div>
              </div>

              {/* Mini Hourly Bar Chart (07:00 to 18:00) */}
              <div className="mt-3 pt-2 border-t border-[#e2e8f0]">
                <div className="flex items-center justify-between text-[9px] font-mono text-[#64748b] mb-1">
                  <span>Hourly Output (07:00 - 18:00)</span>
                  <div className="flex items-center gap-1.5 text-[8.5px]">
                    <span className="text-orange-950 font-bold">■ Dark: Normal / High</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-orange-600 font-medium">□ Light: Below Target</span>
                  </div>
                </div>
                <div className="flex items-end space-x-0.5 h-10 w-full bg-white p-1 rounded-md border border-[#cbd5e1]">
                  {m.hourlyData.map((slot, sIdx) => {
                    const maxVal = 1600;
                    const heightPct = Math.min(100, Math.max(10, (slot.actualIn / maxVal) * 100));
                    const isSlotSelected = selectedHourSlot === slot.hourShort;
                    const targetVal = m.uph || 1150;
                    const isZero = slot.actualIn === 0;
                    const isHighVolume = slot.actualIn >= targetVal * 0.82;

                    // Color mapping: เข้ม (dark) for high/normal volume, อ่อน (light) for low volume
                    const barColor = isZero
                      ? 'bg-rose-100 border border-rose-300'
                      : isHighVolume
                      ? 'bg-orange-700 shadow-2xs hover:bg-orange-800'
                      : 'bg-orange-100 border border-orange-300 hover:bg-orange-200';

                    return (
                      <div
                        key={sIdx}
                        className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                        title={`${slot.hourShort}: ${slot.actualIn} pcs (${isHighVolume ? 'Normal / High Output' : isZero ? 'Stopped' : 'Below Target'})`}
                      >
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-sm transition-all ${
                            isSlotSelected
                              ? 'bg-orange-900 ring-1 ring-orange-500'
                              : barColor
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between mt-2.5 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStationId(m.id);
                      const chartEl = document.getElementById('fvmi-fleet-chart');
                      if (chartEl) {
                        chartEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    }}
                    className={`text-[11px] font-mono font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                        : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200'
                    }`}
                  >
                    <BarChart3 className="w-3 h-3" />
                    <span>{isSelected ? 'Active View' : 'Inspect Station'}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(m.id);
                      }}
                      className="text-[11px] font-mono font-bold text-orange-700 hover:text-orange-900 flex items-center space-x-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMachineId(m.id);
                        navigate('fvmi-detail');
                      }}
                      className="text-[11px] font-mono font-bold text-[#64748b] hover:text-[#0f172a] flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Telemetry</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

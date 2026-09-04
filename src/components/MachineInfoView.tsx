import React from 'react';
import { Header } from './Header';
import { useFactory } from '../context/FactoryContext';
import { Machine } from '../types';
import { MachineUphBarChart } from './MachineUphBarChart';
import { Cpu, ArrowUpRight, CheckCircle2, AlertTriangle, Play, Pause, Layers, ChevronRight } from 'lucide-react';

export const MachineInfoView: React.FC = () => {
  const { machines, navigate, setSelectedMachineId } = useFactory();

  const topFillMachines = machines.filter((m) => m.processType === 'Top Fill');
  const underFillMachines = machines.filter((m) => m.processType === 'Under Fill');

  const getStatusCounts = (list: Machine[]) => {
    const run = list.filter((m) => m.status === 'RUNNING').length;
    const stop = list.filter((m) => m.status === 'STOP' || m.status === 'JAM_CLEAR').length;
    return { run, stop };
  };

  const topFillCounts = getStatusCounts(topFillMachines);
  const underFillCounts = getStatusCounts(underFillMachines);

  const handleSelectMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    navigate('machine-detail', machineId);
  };

  const renderMachineCard = (m: Machine) => {
    const isRunning = m.status === 'RUNNING';

    return (
      <div
        key={m.id}
        id={`machine-card-${m.id}`}
        className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-sky-500 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-sky-500 transition-all duration-150 relative flex flex-col justify-between group"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleSelectMachine(m.id)}
              className="flex items-center space-x-2 text-left cursor-pointer"
            >
              <span className="font-mono font-black text-base text-[#0f172a] group-hover:text-sky-600 transition-colors">
                {m.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  isRunning ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {isRunning ? 'RUN' : 'STOP'}
              </span>
            </button>

            <div className="flex items-center space-x-1.5">
              <div className="font-mono font-bold text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                OEE: {m.oeePercent && m.oeePercent > 0 ? `${m.oeePercent.toFixed(1)}%` : '--'}
              </div>
              <button
                onClick={() => handleSelectMachine(m.id)}
                className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                title="View Full Station Details"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#475569] truncate">
              {m.runningModel}
            </div>

            {/* Output / Input Piece Count */}
            <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl p-2.5 my-2 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider block">
                  OUTPUT / INPUT
                </span>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="font-mono font-black text-sm text-[#0f172a]">
                    {m.outputCount.toLocaleString()}
                  </span>
                  <span className="font-mono text-[10px] text-[#64748b]">
                    / {m.inputCount.toLocaleString()} Pcs
                  </span>
                </div>
              </div>

              {isRunning ? (
                <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>RUNNING</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                  STOPPED
                </span>
              )}
            </div>

            {/* Machine Hourly UPH Bar Chart with Downtime Click */}
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <MachineUphBarChart
                machineId={m.id}
                machineName={m.name}
                currentUph={m.uph}
                targetUph={1000}
                status={m.status}
                downtimeReason={m.downtimeReason}
                downtimeDurationMins={m.downtimeDurationMins}
                downtimeHistory={m.downtimeHistory}
                themeColor="sky"
                showCardWrapper={false}
                title={`${m.name} Hourly Output`}
              />
            </div>

            <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-[#64748b] pt-2 border-t border-[#f1f5f9]">
              <span>Shift: {m.shiftTime || '10:00 - 13:00'}</span>
              <span className="font-bold text-sky-900 bg-sky-50/70 px-1.5 py-0.5 rounded">{m.operatorId}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#1b1b1d] pb-20 md:pb-8 font-sans">
      <Header
        title="Dispensing Stations"
        subtitle="Top Fill & Under Fill Fluid Dispensing Units • Yield & Flow Monitoring"
        badge={
          <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            DISPENSING FLEET (13 STATIONS)
          </span>
        }
      />

      <div className="pt-4 px-4 md:px-6 max-w-7xl mx-auto w-full space-y-8">
        {/* TOP FILL SECTION */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#cbd5e1]">
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-600" />
                <span>TOP FILL DISPENSING LINE</span>
              </h2>
              <span className="text-xs text-[#64748b]">{topFillMachines.length} Automated Stations Assigned</span>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold">
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{topFillCounts.run} Running</span>
              </span>
              <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>{topFillCounts.stop} Stopped</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topFillMachines.map(renderMachineCard)}
          </div>
        </section>

        {/* UNDER FILL SECTION */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#cbd5e1]">
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-700" />
                <span>UNDER FILL DISPENSING LINE</span>
              </h2>
              <span className="text-xs text-[#64748b]">{underFillMachines.length} Automated Stations Assigned</span>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold">
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{underFillCounts.run} Running</span>
              </span>
              <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>{underFillCounts.stop} Stopped</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {underFillMachines.map(renderMachineCard)}
          </div>
        </section>
      </div>
    </div>
  );
};

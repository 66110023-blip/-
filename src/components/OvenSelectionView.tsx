import React from 'react';
import { Header } from './Header';
import { useFactory } from '../context/FactoryContext';
import { Wind, Thermometer, ArrowRight, Activity, Flame, Sparkles, Layers } from 'lucide-react';

export const OvenSelectionView: React.FC = () => {
  const { navigate, ovenUnits } = useFactory();

  const vacuumUnits = ovenUnits.filter((u) => u.subType === 'Vacuum');
  const bakeUnits = ovenUnits.filter((u) => u.subType === 'Bake');

  const runningVacuum = vacuumUnits.filter((u) => u.status === 'RUNNING').length;
  const runningBake = bakeUnits.filter((u) => u.status === 'RUNNING').length;

  return (
    <div className="w-full min-h-screen bg-white text-[#1b1b1d] pb-20 md:pb-8 font-sans">
      <Header
        title="Oven Process Selection"
        subtitle="Select thermal sub-process to inspect chambers, temperatures and recipes"
        badge={
          <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            7 THERMAL CHAMBERS ACTIVE
          </span>
        }
      />

      <div className="pt-4 px-4 md:px-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Dynamic Header */}
        <div className="w-full border-b-2 border-slate-400 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#0f172a] tracking-tight flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-slate-700" />
              Thermal & Curing Sub-Processes
            </h1>
            <p className="text-xs text-[#64748b] font-medium mt-0.5">
              Choose a thermal processing zone to monitor real-time pressure, chamber heating profiles, and timers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              VACUUM (GREEN)
            </span>
            <span className="font-mono text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
              BAKE (YELLOW)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Vacuum Process Card (Green / Emerald) */}
          <div
            onClick={() => navigate('vacuum-process')}
            className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-emerald-500 p-6 shadow-xs hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50/20 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                  <Wind className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {runningVacuum}/{vacuumUnits.length} Running
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#0f172a] group-hover:text-emerald-700 transition-colors">
                Vacuum Oven Process
              </h2>
              <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                Monitor 2 multi-chamber vacuum units, atmospheric purge status, PID pressure control and sub-micron telemetry.
              </p>

              {/* Machine Quick Selection */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  Select Vacuum Machine:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {vacuumUnits.map((u) => (
                    <button
                      key={u.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('vacuum-process', u.id);
                      }}
                      className="px-2.5 py-2 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-emerald-900">{u.id}</div>
                        <div className="text-[10px] text-slate-600 truncate">{u.name}</div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${u.status === 'RUNNING' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Green Category
              </span>
              <div className="flex items-center gap-1 font-bold text-xs text-emerald-600 group-hover:translate-x-1 transition-transform">
                <span>View All Chambers</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Bake Process Card (Yellow / Amber) */}
          <div
            onClick={() => navigate('bake-process')}
            className="bg-white rounded-2xl border border-[#cbd5e1] border-l-4 border-l-amber-500 p-6 shadow-xs hover:shadow-md hover:border-amber-400 hover:bg-amber-50/20 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-xs">
                  <Flame className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {runningBake}/{bakeUnits.length} Running
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#0f172a] group-hover:text-amber-700 transition-colors">
                Bake Oven Process
              </h2>
              <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                Monitor 5 conveyorized and batch baking ovens with 4-zone thermal sensors, PID heaters and curing telemetry.
              </p>

              {/* Machine Quick Selection */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  Select Bake Machine:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {bakeUnits.map((u) => (
                    <button
                      key={u.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('bake-process', u.id);
                      }}
                      className="px-2 py-1.5 rounded-xl bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-amber-900">{u.id}</div>
                        <div className="text-[10px] text-slate-600 truncate">{u.name}</div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${u.status === 'RUNNING' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Yellow Category
              </span>
              <div className="flex items-center gap-1 font-bold text-xs text-amber-600 group-hover:translate-x-1 transition-transform">
                <span>View All Ovens</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

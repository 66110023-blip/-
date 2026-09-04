import React from 'react';
import { Header } from './Header';
import { useFactory } from '../context/FactoryContext';
import { TotalLineCombinedChart } from './ProcessCharts';
import { Activity, ChevronRight, Wind, Flame, Eye } from 'lucide-react';

export const ProcessView: React.FC = () => {
  const { processNodes, navigate } = useFactory();

  const handleNodeClick = (nodeNumber: number) => {
    if (nodeNumber === 1) navigate('vacuum-process');
    else if (nodeNumber === 2) navigate('bake-process');
    else if (nodeNumber === 3) navigate('machine-detail', 'ALL');
    else if (nodeNumber === 4) navigate('fvmi');
    else if (nodeNumber === 5) navigate('packout-aoi');
    else if (nodeNumber === 6) navigate('packout-xray');
    else navigate('analytics');
  };

  return (
    <div className="w-full pb-16">
      <Header
        title="Process View"
        subtitle="SMT Production Flow, Station Nodes & Real-Time Performance"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Process Flow Stepper Cards (Muted / Dropped Color Scheme) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <span>Sequential Process Nodes</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any process stage below to inspect stations and individual machine controls
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 hidden sm:inline-block">
              {processNodes.length} Active Stages
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {processNodes.map((node) => {
              // Muted, eye-friendly tones (drop intensity)
              const badgeBg =
                node.nodeNumber === 1
                  ? 'bg-emerald-600'
                  : node.nodeNumber === 2
                  ? 'bg-amber-600'
                  : node.nodeNumber === 3
                  ? 'bg-sky-600/75'
                  : node.nodeNumber === 4
                  ? 'bg-orange-500'
                  : node.nodeNumber === 5
                  ? 'bg-indigo-500/75'
                  : 'bg-rose-500/70';

              const pillStyle =
                node.nodeNumber === 1
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                  : node.nodeNumber === 2
                  ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                  : node.nodeNumber === 3
                  ? 'bg-sky-50 text-sky-800 border-sky-200/80'
                  : node.nodeNumber === 4
                  ? 'bg-orange-50 text-orange-800 border-orange-200/80'
                  : node.nodeNumber === 5
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200/80'
                  : 'bg-rose-50 text-rose-800 border-rose-200/80';

              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node.nodeNumber)}
                  className="flex flex-col justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200/80 hover:border-slate-400 hover:bg-white hover:shadow-xs cursor-pointer transition-all duration-150 group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-8 h-8 rounded-lg ${badgeBg} text-white font-bold flex items-center justify-center text-xs shadow-2xs group-hover:scale-105 transition-transform`}>
                      {node.nodeNumber}
                    </div>
                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${pillStyle}`}>
                      {node.assignedMachinesLabel}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center gap-1.5">
                      {node.nodeNumber === 1 && <Wind className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      {node.nodeNumber === 2 && <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      {node.nodeNumber === 4 && <Eye className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors leading-snug truncate">
                        {node.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {node.nodeNumber === 1 && 'Degassing & Bubble Elimination (2 Units)'}
                      {node.nodeNumber === 2 && 'Thermal Curing & Polymerization (5 Units)'}
                      {node.nodeNumber === 3 && 'Top & Under Fill Dispensers (MC-01 to MC-12)'}
                      {node.nodeNumber === 4 && 'Final Visual Inspection (FVMI-01 to 09)'}
                      {node.nodeNumber === 5 && 'Optical AOI Inspection (2 Units)'}
                      {node.nodeNumber === 6 && '90kV Micro-Focus Radiography (5 Units)'}
                    </p>

                    {/* Direct Machine Jump Pills for AOI (1, 2) and X-ray (1, 2, 3, 4, 5) */}
                    {node.nodeNumber === 5 && (
                      <div className="mt-2.5 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate('packout-aoi', 'AOI-01')}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 transition-colors cursor-pointer"
                          title="Open AOI-01 Machine View (Line 1)"
                        >
                          AOI-01
                        </button>
                        <button
                          onClick={() => navigate('packout-aoi', 'AOI-02')}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 transition-colors cursor-pointer"
                          title="Open AOI-02 Machine View (Line 2)"
                        >
                          AOI-02
                        </button>
                      </div>
                    )}

                    {node.nodeNumber === 6 && (
                      <div className="mt-2.5 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                        {[1, 2, 3, 4, 5].map((num) => {
                          const xrayKey = `X-RAY 0${num}`;
                          return (
                            <button
                              key={num}
                              onClick={() => navigate('packout-xray', xrayKey)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                              title={`Open ${xrayKey} Machine View (Line ${num})`}
                            >
                              X-0{num}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all">
                    <span>Open Stage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Master SMT Line Total Performance Chart */}
        <section>
          <TotalLineCombinedChart />
        </section>
      </div>
    </div>
  );
};

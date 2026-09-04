import React from 'react';
import { ArrowRight, Eye, Radio, CheckCircle2, Layers, Sparkles } from 'lucide-react';
import { useFactory } from '../context/FactoryContext';
import { Header } from './Header';

export const PackOutSelectionView: React.FC = () => {
  const { navigate } = useFactory();

  return (
    <div className="min-h-screen bg-white text-[#1b1b1d] flex flex-col pb-20 md:pb-8 font-sans">
      {/* Unified Header */}
      <Header
        title="Pack Out & Inspection Selection"
        subtitle="Packaging, AOI Quality Inspection & X-ray Radiography Workflows"
        badge={
          <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            PACK OUT STATION ACTIVE
          </span>
        }
      />

      {/* Main Content */}
      <main className="flex-grow pt-4 px-4 md:px-6 max-w-5xl mx-auto w-full flex flex-col justify-center">
        {/* Dynamic Group Header */}
        <div className="w-full border-b-2 border-purple-500 pb-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#0f172a] tracking-tight flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-purple-600" />
              Select Pack Out Workflow
            </h2>
            <p className="text-xs text-[#64748b] font-medium mt-0.5">
              Choose the appropriate inspection and pack out procedure: AOI Optical Inspection or X-ray Radiography Diagnostics.
            </p>
          </div>
          <span className="font-mono text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-200 self-start sm:self-auto">
            AOI & X-RAY PROCESSES
          </span>
        </div>

        {/* Grid Layout for Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AOI Process Card (Replaced Count) */}
          <button
            id="card-select-aoi-process"
            onClick={() => navigate('packout-aoi')}
            className="group relative bg-white border border-[#cbd5e1] rounded-2xl p-6 flex flex-col items-start text-left transition-all hover:bg-purple-50/30 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[260px] overflow-hidden border-l-4 border-l-purple-500 shadow-xs hover:shadow-md cursor-pointer"
          >
            <div className="mb-4 bg-purple-50 border border-purple-200 p-3.5 rounded-2xl text-purple-600 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xs">
              <Eye className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-[#0f172a] group-hover:text-purple-700 transition-colors">
                AOI Machine Process
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                AOI-01 / AOI-02
              </span>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed line-clamp-3 mb-3">
              Automated Optical Inspection for Top & Bottom side PCB analysis, solder bridge detection, component alignment, and hourly batch yield calculation (07:00 - 18:00).
            </p>

            {/* Direct Machine Jump Buttons */}
            <div className="flex items-center gap-2 mb-4 w-full" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] font-mono font-bold text-purple-900">Machines:</span>
              <button
                onClick={() => navigate('packout-aoi', 'AOI-01')}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-purple-100/80 hover:bg-purple-600 hover:text-white text-purple-900 rounded-lg border border-purple-300 transition-colors cursor-pointer"
                title="Direct link to AOI-01 Machine (Line 1)"
              >
                AOI-01 (Line 1)
              </button>
              <button
                onClick={() => navigate('packout-aoi', 'AOI-02')}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-purple-100/80 hover:bg-purple-600 hover:text-white text-purple-900 rounded-lg border border-purple-300 transition-colors cursor-pointer"
                title="Direct link to AOI-02 Machine (Line 2)"
              >
                AOI-02 (Line 2)
              </button>
            </div>

            <div className="mt-auto flex items-center w-full justify-between border-t border-[#f1f5f9] pt-3 text-xs">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Hourly Optical Inspection
              </span>
              <div className="flex items-center gap-1 font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                <span>View AOI (Hourly)</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* X-ray Process Card (Replaced OCR) */}
          <button
            id="card-select-xray-process"
            onClick={() => navigate('packout-xray')}
            className="group relative bg-white border border-[#cbd5e1] rounded-2xl p-6 flex flex-col items-start text-left transition-all hover:bg-pink-50/30 hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 min-h-[260px] overflow-hidden border-l-4 border-l-pink-500 shadow-xs hover:shadow-md cursor-pointer"
          >
            <div className="mb-4 bg-pink-50 border border-pink-200 p-3.5 rounded-2xl text-pink-600 group-hover:scale-105 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-xs">
              <Radio className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-[#0f172a] group-hover:text-pink-700 transition-colors">
                X-ray Machine Process
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-pink-100 text-pink-800 rounded-full border border-pink-200">
                90kV Micro-Focus
              </span>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed line-clamp-3 mb-3">
              90kV micro-focus non-destructive X-ray radiography inspection, BGA void percentage quantification, wire bonding validation, and hourly batch diagnostics summary.
            </p>

            {/* Direct Machine Jump Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4 w-full" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] font-mono font-bold text-pink-900 mr-1">Units:</span>
              {[1, 2, 3, 4, 5].map((num) => {
                const mKey = `X-RAY 0${num}`;
                return (
                  <button
                    key={num}
                    onClick={() => navigate('packout-xray', mKey)}
                    className="px-2 py-1 text-xs font-mono font-bold bg-pink-100/80 hover:bg-pink-600 hover:text-white text-pink-900 rounded-lg border border-pink-300 transition-colors cursor-pointer"
                    title={`Direct link to ${mKey} Machine (Line ${num})`}
                  >
                    X-0{num} (Line {num})
                  </button>
                );
              })}
            </div>

            <div className="mt-auto flex items-center w-full justify-between border-t border-[#f1f5f9] pt-3 text-xs">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                Hourly X-ray Diagnostics
              </span>
              <div className="flex items-center gap-1 font-bold text-pink-600 group-hover:translate-x-1 transition-transform">
                <span>View X-ray (Hourly)</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        {/* System Status Indicator Footer */}
        <div className="mt-6 flex items-center justify-between w-full pt-4 border-t border-[#e2e8f0]">
          <span className="text-xs text-[#64748b] font-medium">
            Pack Out: AOI & X-ray Machine Diagnostics & Quality Assurance
          </span>
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#cbd5e1] shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-mono text-xs font-bold text-[#0f172a] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              AOI & X-ray Operational
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};


import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { FloorStation, ProductionLine } from '../types';
import { CATEGORY_METADATA } from '../data/defaultCadLayout';
import { normalizeAoiMachineId, normalizeXrayMachineId } from '../utils/machineLinkUtils';
import {
  OvenChart,
  DispensingChart,
  FvmiChart,
  AOIChart,
  XrayChart,
} from './ProcessCharts';
import {
  Activity,
  Flame,
  Cpu,
  Scan,
  Package,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Maximize2,
  Gauge,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface FloorProcessSidePanelProps {
  selectedStation: FloorStation | null;
  selectedLine: ProductionLine;
  onSelectStation: (station: FloorStation | null) => void;
  onSelectCategoryFilter?: (category: string | null) => void;
  activeCategoryFilter?: string | null;
  onOpenDiagnostics: (station: FloorStation) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const FloorProcessSidePanel: React.FC<FloorProcessSidePanelProps> = ({
  selectedStation,
  selectedLine,
  onSelectStation,
  onSelectCategoryFilter,
  activeCategoryFilter,
  onOpenDiagnostics,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { processNodes, navigate, machines, ovens, isSimulating } = useFactory();
  const [activeTab, setActiveTab] = useState<'nodes' | 'charts' | 'selected'>('nodes');

  // Node navigation
  const handleNodeClick = (nodeNumber: number, category: string) => {
    if (onSelectCategoryFilter) {
      if (activeCategoryFilter === category) {
        onSelectCategoryFilter(null);
      } else {
        onSelectCategoryFilter(category);
      }
    }
  };

  const handleDeepLink = (nodeNumber: number) => {
    if (nodeNumber === 1) navigate('vacuum-process');
    else if (nodeNumber === 2) navigate('bake-process');
    else if (nodeNumber === 3) navigate('machine-detail', selectedStation?.linkedMachineId || 'MC-01');
    else if (nodeNumber === 4) navigate('fvmi');
    else if (nodeNumber === 5) {
      const aoiId = (selectedStation?.category === 'aoi' || selectedStation?.category === 'packout')
        ? normalizeAoiMachineId(selectedStation.linkedPackoutId || selectedStation.code)
        : 'AOI-01';
      navigate('packout-aoi', aoiId);
    } else if (nodeNumber === 6) {
      const xrayId = (selectedStation?.category === 'xray' || selectedStation?.category === 'ocr')
        ? normalizeXrayMachineId(selectedStation.linkedOcrId || selectedStation.code)
        : 'X-RAY 01';
      navigate('packout-xray', xrayId);
    } else navigate('analytics');
  };

  if (isCollapsed) {
    return (
      <div className="w-10 shrink-0 bg-white border-l border-[#e2e8f0] flex flex-col items-center py-4 justify-between select-none z-20 shadow-xs">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0284c7] transition-colors cursor-pointer"
          title="Expand Process View Panel"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="[writing-mode:vertical-rl] rotate-180 flex items-center gap-2 text-xs font-bold text-[#475569] tracking-wider uppercase">
          <Activity className="w-3.5 h-3.5 text-[#0284c7]" />
          <span>Process View & Telemetry</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    );
  }

  return (
    <aside className="w-96 lg:w-[420px] shrink-0 bg-white border-l border-[#e2e8f0] flex flex-col h-full select-none z-20 shadow-lg overflow-hidden transition-all duration-300">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">
              Process View & Workflow
            </h3>
            <p className="text-[10.5px] text-[#64748b] font-mono">
              Line: <span className="font-bold text-[#0284c7]">{selectedLine}</span> • 
              Status: <span className="text-emerald-600 font-bold">Synchronized</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => navigate('process-view')}
            className="p-1.5 text-slate-500 hover:text-[#0284c7] hover:bg-white rounded-md transition-colors cursor-pointer"
            title="Open Dedicated Fullscreen Process View"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-500 hover:text-[#0f172a] hover:bg-white rounded-md transition-colors cursor-pointer"
            title="Collapse Panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 bg-[#f1f5f9] p-1 border-b border-[#e2e8f0] text-xs font-bold">
        <button
          onClick={() => setActiveTab('nodes')}
          className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === 'nodes'
              ? 'bg-white text-[#0284c7] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          Process Nodes
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
            activeTab === 'charts'
              ? 'bg-white text-[#0284c7] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          Live Charts
        </button>
        <button
          onClick={() => setActiveTab('selected')}
          className={`py-1.5 rounded-lg text-center transition-all cursor-pointer relative ${
            activeTab === 'selected'
              ? 'bg-white text-[#0284c7] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <span>Equipment</span>
          {selectedStation && (
            <span className="w-2 h-2 rounded-full bg-[#0284c7] absolute top-1 right-2 animate-ping" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 bg-[#fbf8fb]/50">
        {/* TAB 1: PROCESS NODES */}
        {activeTab === 'nodes' && (
          <div className="space-y-3">
            {/* Quick Filter Reminder */}
            {activeCategoryFilter && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#e0f2fe] border border-[#bae6fd] text-xs text-[#0369a1]">
                <span className="font-medium">
                  Filtering Floor CAD by: <strong>{activeCategoryFilter.toUpperCase()}</strong>
                </span>
                <button
                  onClick={() => onSelectCategoryFilter && onSelectCategoryFilter(null)}
                  className="font-bold underline cursor-pointer text-[#0284c7] hover:text-[#0369a1]"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Step Pipeline Cards */}
            <div className="space-y-2.5">
              {processNodes.map((node) => {
                const categoryKey =
                  node.nodeNumber === 1
                    ? 'oven-vacuum'
                    : node.nodeNumber === 2
                    ? 'oven-bake'
                    : node.nodeNumber === 3
                    ? 'dispensing'
                    : node.nodeNumber === 4
                    ? 'fvmi'
                    : node.nodeNumber === 5
                    ? 'packout'
                    : 'ocr';

                const isCategoryActive = activeCategoryFilter === categoryKey;

                return (
                  <div
                    key={node.id}
                    className={`rounded-xl border transition-all duration-200 p-3 bg-white ${
                      isCategoryActive
                        ? 'border-pink-500 shadow-md ring-2 ring-pink-500/20 bg-pink-50/40'
                        : 'border-[#e2e8f0] hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => handleNodeClick(node.nodeNumber, categoryKey)}
                        className="flex items-center space-x-3 cursor-pointer flex-1"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
                            node.nodeNumber === 1
                              ? 'bg-[#16a34a] text-white'
                              : node.nodeNumber === 2
                              ? 'bg-[#ca8a04] text-white'
                              : node.nodeNumber === 3
                              ? 'bg-[#0284c7] text-white'
                              : node.nodeNumber === 4
                              ? 'bg-[#ea580c] text-white'
                              : node.nodeNumber === 5
                              ? 'bg-[#9333ea] text-white'
                              : 'bg-[#ec4899] text-white'
                          }`}
                        >
                          {node.nodeNumber}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#0f172a] hover:text-[#0284c7] transition-colors leading-tight">
                            {node.title}
                          </h4>
                          <p className="text-[11px] text-[#64748b] font-medium">
                            {node.nodeNumber === 1 && 'Degassing & Bubble Elimination (2 Units)'}
                            {node.nodeNumber === 2 && 'Thermal Curing & Polymerization (5 Units)'}
                            {node.nodeNumber === 3 && 'High Precision Jetting Valves (MC-01 to 12)'}
                            {node.nodeNumber === 4 && 'Final Visual Inspection (FVMI-01 to 09)'}
                            {node.nodeNumber === 5 && '2 Units: AOI-01 & AOI-02 Optical Inspection'}
                            {node.nodeNumber === 6 && '90kV Micro-Focus NDT Radiography (5 Units)'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0 ml-2">
                        <button
                          onClick={() => handleNodeClick(node.nodeNumber, categoryKey)}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                            isCategoryActive
                              ? 'bg-[#0284c7] text-white border-[#0284c7]'
                              : 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1] hover:bg-slate-200'
                          }`}
                          title="Highlight on Floor Map"
                        >
                          {isCategoryActive ? 'Active' : 'Highlight'}
                        </button>
                        <button
                          onClick={() => handleDeepLink(node.nodeNumber)}
                          className="p-1 rounded-md text-slate-400 hover:text-[#0284c7] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Open Module Screen"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Machine Assignment Badge */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#64748b] font-mono">Assigned Assets:</span>
                      <span className="font-mono font-bold text-[#0f172a] bg-[#f8fafc] px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {node.assignedMachinesLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Line Performance Summary Box */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                  Live Shift Telemetry
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                <div className="bg-white/10 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-300">Overall OEE</div>
                  <div className="text-base font-bold text-emerald-400">94.2%</div>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-300">Total Yield</div>
                  <div className="text-base font-bold text-sky-400">99.1%</div>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-300">Cartons Out</div>
                  <div className="text-base font-bold text-amber-400">2,840</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE PROCESS CHARTS */}
        {activeTab === 'charts' && (
          <div className="space-y-3">
            <div className="space-y-3">
              <OvenChart />
              <DispensingChart />
              <FvmiChart />
              <AOIChart />
              <XrayChart />
            </div>
          </div>
        )}

        {/* TAB 3: SELECTED EQUIPMENT DETAILS */}
        {activeTab === 'selected' && (
          <div>
            {selectedStation ? (
              <div className="space-y-3">
                {(() => {
                  const meta = CATEGORY_METADATA[selectedStation.category] || CATEGORY_METADATA.dispensing;
                  return (
                    <div
                      className="p-3.5 rounded-xl bg-white border shadow-sm space-y-3"
                      style={{ borderColor: `${meta.color}40` }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${meta.badgeClass}`}
                          >
                            {selectedStation.code} • {selectedStation.line} • {meta.label}
                          </span>
                          <h3 className="text-sm font-bold text-[#0f172a] mt-1">
                            {selectedStation.name}
                          </h3>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            selectedStation.status === 'RUNNING'
                              ? 'bg-emerald-100 text-emerald-800'
                              : selectedStation.status === 'STOP'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {selectedStation.status}
                        </span>
                      </div>

                      {/* Metrics grid with Machine Theme Color */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div
                          className="p-2 rounded-lg border bg-white"
                          style={{ borderColor: `${meta.color}30` }}
                        >
                          <div className="text-[10px] text-[#64748b]">Running Model</div>
                          <div className="font-bold text-[#0f172a] truncate">
                            {selectedStation.runningModel || 'MODEL 504-2224'}
                          </div>
                        </div>

                        <div
                          className="p-2 rounded-lg border bg-white"
                          style={{ borderColor: `${meta.color}30` }}
                        >
                          <div className="text-[10px] text-[#64748b]">Operator ID</div>
                          <div className="font-bold text-[#0f172a]">
                            {selectedStation.operatorId || 'OP-ALPHA-01'}
                          </div>
                        </div>

                        <div
                          className="p-2 rounded-lg border"
                          style={{
                            backgroundColor: `${meta.color}10`,
                            borderColor: `${meta.color}35`,
                          }}
                        >
                          <div className="text-[10px] text-[#64748b]">
                            {selectedStation.category === 'ocr' ? 'Scan Latency' : 'Cycle Time'}
                          </div>
                          <div className="font-bold" style={{ color: meta.color }}>
                            {selectedStation.category === 'ocr'
                              ? '32 ms'
                              : selectedStation.cycleTimeSec
                              ? `${selectedStation.cycleTimeSec}s`
                              : '0.0s'}
                          </div>
                        </div>

                        <div
                          className="p-2 rounded-lg border"
                          style={{
                            backgroundColor: `${meta.color}10`,
                            borderColor: `${meta.color}35`,
                          }}
                        >
                          <div className="text-[10px] text-[#64748b]">
                            {selectedStation.category === 'ocr'
                              ? 'OCR Yield'
                              : selectedStation.category === 'fvmi'
                              ? 'AI Accuracy'
                              : 'Station OEE'}
                          </div>
                          <div className="font-bold" style={{ color: meta.color }}>
                            {selectedStation.oeePercent ? `${selectedStation.oeePercent}%` : '99.2%'}
                          </div>
                        </div>
                      </div>

                      {/* Telemetry Sensor Badges */}
                      {selectedStation.sensorTelemetry && (
                        <div
                          className="space-y-1.5 pt-2 border-t"
                          style={{ borderColor: `${meta.color}25` }}
                        >
                          <div
                            className="text-[10.5px] font-bold uppercase font-mono"
                            style={{ color: meta.color }}
                          >
                            Real-time Machine Parameters
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                            {selectedStation.sensorTelemetry.temperatureC !== undefined && (
                              <div
                                className="p-1.5 rounded border"
                                style={{
                                  backgroundColor: `${meta.color}12`,
                                  borderColor: `${meta.color}30`,
                                  color: meta.color,
                                }}
                              >
                                <div className="text-[9px] text-[#64748b]">Temp</div>
                                <div className="font-bold">{selectedStation.sensorTelemetry.temperatureC}°C</div>
                              </div>
                            )}
                            {selectedStation.sensorTelemetry.pressureKpa !== undefined && (
                              <div
                                className="p-1.5 rounded border"
                                style={{
                                  backgroundColor: `${meta.color}12`,
                                  borderColor: `${meta.color}30`,
                                  color: meta.color,
                                }}
                              >
                                <div className="text-[9px] text-[#64748b]">Pressure</div>
                                <div className="font-bold">{selectedStation.sensorTelemetry.pressureKpa} kPa</div>
                              </div>
                            )}
                            {selectedStation.sensorTelemetry.vibrationMmS !== undefined && (
                              <div
                                className="p-1.5 rounded border"
                                style={{
                                  backgroundColor: `${meta.color}12`,
                                  borderColor: `${meta.color}30`,
                                  color: meta.color,
                                }}
                              >
                                <div className="text-[9px] text-[#64748b]">Vibration</div>
                                <div className="font-bold">{selectedStation.sensorTelemetry.vibrationMmS} mm/s</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 flex items-center space-x-2">
                        <button
                          onClick={() => onOpenDiagnostics(selectedStation)}
                          className="flex-1 py-2 rounded-lg text-white text-xs font-bold transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs hover:opacity-90"
                          style={{ backgroundColor: meta.color }}
                        >
                          <Gauge className="w-3.5 h-3.5" />
                          <span>Full Diagnostics ({selectedStation.code})</span>
                        </button>
                        <button
                          onClick={() => onSelectStation(null)}
                          className="px-3 py-2 rounded-lg bg-[#f1f5f9] hover:bg-slate-200 text-[#475569] text-xs font-bold transition-colors cursor-pointer"
                        >
                          Deselect
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0f172a]">No Equipment Selected</h4>
                  <p className="text-[11px] text-[#64748b] mt-1 max-w-xs mx-auto">
                    Click any highlighted machine, oven, or inspection station on the CAD Floor Map to view real-time diagnostics.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Quick Jump Bar */}
      <div className="p-2.5 border-t border-[#e2e8f0] bg-white flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#64748b] font-mono">
          Linked: <strong className="text-[#0f172a]">12 Machines • 4 Ovens</strong>
        </span>
        <button
          onClick={() => navigate('process-view')}
          className="text-[#0284c7] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <span>Expand Process</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import {
  Radio,
  Cpu,
  Eye,
  Layers,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  X,
  Sliders,
  ExternalLink,
  Filter,
  Info
} from 'lucide-react';
import { Station } from '../types';

interface MapLegendWidgetProps {
  stations: Station[];
  activeCategoryFilter: string | null;
  onSelectCategoryFilter: (catKey: string | null) => void;
  onNavigateToOcr: () => void;
  selectedLine?: string;
}

export const MapLegendWidget: React.FC<MapLegendWidgetProps> = ({
  stations,
  activeCategoryFilter,
  onSelectCategoryFilter,
  onNavigateToOcr,
  selectedLine = 'ALL',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showXrayInfoModal, setShowXrayInfoModal] = useState<boolean>(false);

  // Filter stations based on selected line if specified
  const filteredStations =
    selectedLine === 'ALL'
      ? stations
      : stations.filter((s) => s.line === selectedLine || !s.line);

  // Count by category
  const categoryCounts = {
    ocr: filteredStations.filter((s) => s.category === 'ocr' || (s.category as string) === 'xray').length,
    dispensing: filteredStations.filter((s) => s.category === 'dispensing').length,
    fvmi: filteredStations.filter((s) => s.category === 'fvmi').length,
    packout: filteredStations.filter((s) => s.category === 'packout' || (s.category as string) === 'aoi').length,
    'oven-vacuum': filteredStations.filter((s) => s.category === 'oven-vacuum').length,
    'oven-bake': filteredStations.filter((s) => s.category === 'oven-bake').length,
  };

  const categories = [
    {
      key: 'ocr',
      nameEn: 'X-ray Machine',
      color: '#ec4899',
      borderColor: 'border-pink-500',
      bgColor: 'bg-pink-500',
      badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
      activeRing: 'ring-2 ring-pink-500 bg-pink-50/90 text-pink-900 font-bold',
      count: categoryCounts.ocr,
      icon: Radio,
      hasDetails: true,
    },
    {
      key: 'dispensing',
      nameEn: 'Dispensing Machine',
      color: '#0284c7',
      borderColor: 'border-sky-500',
      bgColor: 'bg-sky-500',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      activeRing: 'ring-2 ring-sky-500 bg-sky-50/90 text-sky-900 font-bold',
      count: categoryCounts.dispensing,
      icon: Cpu,
      hasDetails: false,
    },
    {
      key: 'fvmi',
      nameEn: 'FVMI Inspection',
      color: '#ea580c',
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-500',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      activeRing: 'ring-2 ring-orange-500 bg-orange-50/90 text-orange-900 font-bold',
      count: categoryCounts.fvmi,
      icon: Eye,
      hasDetails: false,
    },
    {
      key: 'packout',
      nameEn: 'Pack Out & AOI',
      color: '#9333ea',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-500',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      activeRing: 'ring-2 ring-purple-500 bg-purple-50/90 text-purple-900 font-bold',
      count: categoryCounts.packout,
      icon: Layers,
      hasDetails: false,
    },
    {
      key: 'oven-vacuum',
      nameEn: 'Vacuum Oven',
      color: '#16a34a',
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/90 text-emerald-900 font-bold',
      count: categoryCounts['oven-vacuum'],
      icon: Zap,
      hasDetails: false,
    },
    {
      key: 'oven-bake',
      nameEn: 'Bake Oven (Pre-Cure)',
      color: '#ca8a04',
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50/90 text-amber-900 font-bold',
      count: categoryCounts['oven-bake'],
      icon: Activity,
      hasDetails: false,
    },
  ];

  // X-ray stations list for modal/popover
  const xrayStations = stations.filter((s) => s.category === 'ocr' || (s.category as string) === 'xray');

  return (
    <>
      {/* Floating Map Legend Card */}
      <div className="absolute top-3 right-3 z-30 flex flex-col items-end pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-[#cbd5e1] rounded-2xl shadow-xl overflow-hidden min-w-[280px] max-w-xs transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-3 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse" />
              <span className="font-mono text-xs font-black tracking-wider uppercase">
                MAP LEGEND
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowXrayInfoModal(true)}
                className="px-1.5 py-0.5 bg-pink-500/30 hover:bg-pink-500/50 text-pink-300 border border-pink-400/40 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="View X-ray Machine Info"
              >
                <Radio className="w-3 h-3 text-pink-300" />
                <span>X-ray Info</span>
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Body */}
          {isExpanded && (
            <div className="p-2.5 space-y-1.5 text-xs">
              {/* Category List */}
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isFiltered = activeCategoryFilter === cat.key;

                  return (
                    <div
                      key={cat.key}
                      onClick={() => {
                        if (activeCategoryFilter === cat.key) {
                          onSelectCategoryFilter(null);
                        } else {
                          onSelectCategoryFilter(cat.key);
                        }
                      }}
                      className={`group flex items-center justify-between p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isFiltered
                          ? cat.activeRing
                          : cat.key === 'ocr'
                          ? 'border-pink-200 bg-pink-50/40 hover:bg-pink-100/60 hover:border-pink-300'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        {/* Color swatch */}
                        <div
                          className="w-4 h-4 rounded-md shrink-0 flex items-center justify-center shadow-xs text-white"
                          style={{ backgroundColor: cat.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                        </div>

                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0f172a] text-[11px] truncate">
                              {cat.nameEn}
                            </span>
                            {cat.key === 'ocr' && (
                              <span className="px-1 py-0.2 bg-pink-100 text-pink-700 text-[8.5px] font-black rounded-xs border border-pink-300 uppercase tracking-tight animate-pulse">
                                90kV
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Count Badge & Quick Actions */}
                      <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${cat.badgeBg}`}>
                          {cat.count} {cat.count === 1 ? 'Unit' : 'Units'}
                        </span>

                        {cat.key === 'ocr' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowXrayInfoModal(true);
                            }}
                            className="p-1 hover:bg-pink-200 text-pink-700 rounded-md transition-colors cursor-pointer"
                            title="View X-ray Information"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-ray Quick Information Highlight Strip */}
              <div className="mt-2 pt-2 border-t border-slate-200/80 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 p-2 rounded-xl border border-pink-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-black text-pink-900 flex items-center gap-1 uppercase">
                    <Radio className="w-3 h-3 text-pink-600" />
                    X-ray Machine (Pink #ec4899)
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                    Yield 99.2%
                  </span>
                </div>
                <p className="text-[10px] text-pink-950/80 leading-relaxed font-sans">
                  90kV Micro-Focus X-ray non-destructive inspection (5μm Focal Spot) deployed on L1-L6.
                </p>

                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (activeCategoryFilter === 'ocr') {
                        onSelectCategoryFilter(null);
                      } else {
                        onSelectCategoryFilter('ocr');
                      }
                    }}
                    className={`flex-1 py-1 rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      activeCategoryFilter === 'ocr'
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'bg-white hover:bg-pink-100 text-pink-700 border border-pink-300'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    <span>{activeCategoryFilter === 'ocr' ? 'Clear Filter' : 'Filter X-ray'}</span>
                  </button>

                  <button
                    onClick={onNavigateToOcr}
                    className="flex-1 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View X-ray Stream</span>
                  </button>
                </div>
              </div>

              {/* Active Category Clear indicator if any */}
              {activeCategoryFilter && (
                <div className="pt-1 flex items-center justify-between text-[10.5px] text-sky-800 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
                  <span>Filtered: <strong>{activeCategoryFilter.toUpperCase()}</strong></span>
                  <button
                    onClick={() => onSelectCategoryFilter(null)}
                    className="font-bold underline cursor-pointer text-sky-700 hover:text-sky-900"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* X-ray Detailed Information Modal */}
      {showXrayInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-pink-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight">
                      X-ray Radiography Machine Specifications
                    </h3>
                    <span className="font-mono text-[10px] font-black bg-white/25 px-2 py-0.5 rounded-full uppercase border border-white/30">
                      PINK (#ec4899)
                    </span>
                  </div>
                  <p className="text-xs text-pink-100 font-medium mt-0.5">
                    90kV Micro-focus X-ray non-destructive inspection units deployed on production lines L1 - L6
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowXrayInfoModal(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Quick Specification KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-2xl">
                  <div className="text-[11px] font-mono text-pink-700 font-bold">Total X-ray Units</div>
                  <div className="text-xl font-black font-mono text-pink-900 mt-1">6 Units</div>
                  <div className="text-[10px] text-pink-600 font-mono mt-0.5">XRAY-01 to XRAY-06</div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <div className="text-[11px] font-mono text-emerald-700 font-bold">Radiography Yield</div>
                  <div className="text-xl font-black font-mono text-emerald-900 mt-1">99.2%</div>
                  <div className="text-[10px] text-emerald-600 font-mono mt-0.5">Pass 2,980 / NG 24</div>
                </div>

                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-2xl">
                  <div className="text-[11px] font-mono text-sky-700 font-bold">Tube Voltage</div>
                  <div className="text-xl font-black font-mono text-sky-900 mt-1">85.4 kV</div>
                  <div className="text-[10px] text-sky-600 font-mono mt-0.5">Max 90kV Micro-Focus</div>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl">
                  <div className="text-[11px] font-mono text-purple-700 font-bold">Line Deployment</div>
                  <div className="text-xl font-black font-mono text-purple-900 mt-1">L1 - L6</div>
                  <div className="text-[10px] text-purple-600 font-mono mt-0.5">Pre-Pack Out Station</div>
                </div>
              </div>

              {/* Detailed Technical Specifications Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-pink-600" />
                    Hardware & Sensor Specifications
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    IPC-A-610 Class 3 Standard
                  </span>
                </div>

                <div className="divide-y divide-slate-200 text-xs">
                  <div className="grid grid-cols-3 p-3 bg-white">
                    <span className="font-bold text-slate-600">X-ray Tube:</span>
                    <span className="col-span-2 font-mono text-slate-900 font-semibold">
                      90kV Closed Micro-Focus Tube (5μm Focal Spot Size)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                    <span className="font-bold text-slate-600">Digital Detector:</span>
                    <span className="col-span-2 text-slate-800">
                      High-Resolution CMOS Flat Panel Detector (14-bit Dynamic Range)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 p-3 bg-white">
                    <span className="font-bold text-slate-600">Scan Latency:</span>
                    <span className="col-span-2 font-mono text-slate-800">
                      120 ms per BGA zone
                    </span>
                  </div>

                  <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                    <span className="font-bold text-slate-600">Defect Detection:</span>
                    <span className="col-span-2 font-mono text-slate-800">
                      BGA Voiding Percentage, Solder Bridging, Wire Bond Deformation, Head-in-Pillow (HIP)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 p-3 bg-white">
                    <span className="font-bold text-slate-600">Safety Interlock:</span>
                    <span className="col-span-2 text-slate-800">
                      Lead Shielded Cabinet (&lt; 0.1 μSv/hr stray radiation, dual redundant interlocks)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                    <span className="font-bold text-slate-600">CAD Map Representation:</span>
                    <span className="col-span-2 flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#ec4899] shrink-0" />
                      <span className="font-mono font-bold text-pink-700">
                        Pink (Hex #ec4899 / Tailwind pink-500)
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Station Deployment Table across Lines */}
              <div className="border border-pink-200 rounded-2xl overflow-hidden bg-white">
                <div className="bg-pink-50 px-4 py-2 border-b border-pink-200 flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-pink-950 uppercase flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-pink-600" />
                    Deployed X-ray Machine Units
                  </span>
                  <span className="text-[10px] font-mono text-pink-700 font-bold">
                    6 Active Nodes
                  </span>
                </div>

                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {xrayStations.map((st) => (
                    <div
                      key={st.id}
                      className="p-2.5 rounded-xl border border-pink-100 bg-pink-50/30 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <div className="font-mono font-black text-slate-900">
                            {st.code} ({st.line})
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {st.name}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {st.oeePercent || 99.2}% OEE
                        </span>
                        <div className="text-[9.5px] text-slate-400 mt-0.5">
                          {st.cycleTimeSec || 1.2}s cycle
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Status: <strong className="text-emerald-600">Online & Connected</strong>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    onSelectCategoryFilter('ocr');
                    setShowXrayInfoModal(false);
                  }}
                  className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-pink-300"
                >
                  Filter X-ray on Map
                </button>

                <button
                  onClick={() => {
                    setShowXrayInfoModal(false);
                    onNavigateToOcr();
                  }}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open X-ray Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

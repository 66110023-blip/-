import React, { useState, useMemo, useEffect } from 'react';
import { Filter, X, Check, ArrowRight, RotateCcw } from 'lucide-react';

export type TimeRangeFilter = 'Today' | '24h' | '7d' | '30d' | 'Custom';
export type BreakdownTab = 'Line' | 'Product' | 'Operator' | 'Lot' | 'Rack';

export interface BreakdownItem {
  name: string;
  count: number;
}

export interface MachineAnalyticsProps {
  // Time period
  timeRange?: TimeRangeFilter;
  onTimeRangeChange?: (range: TimeRangeFilter) => void;

  // Filter options & values
  lines?: string[];
  selectedLine?: string;
  onLineChange?: (line: string) => void;

  products?: string[];
  selectedProduct?: string;
  onProductChange?: (prod: string) => void;

  operators?: string[];
  selectedOperator?: string;
  onOperatorChange?: (op: string) => void;

  lots?: string[];
  selectedLot?: string;
  onLotChange?: (lot: string) => void;

  racks?: string[];
  selectedRack?: string;
  onRackChange?: (rack: string) => void;

  // KPI Card Metrics
  totalOutput: number;
  outputUnit?: string;
  activeHours?: number;
  peakHourLabel?: string;
  peakHourValue?: number;
  avgPerActiveHour?: number;

  // Breakdown data
  breakdownData?: {
    Line?: BreakdownItem[];
    Product?: BreakdownItem[];
    Operator?: BreakdownItem[];
    Lot?: BreakdownItem[];
    Rack?: BreakdownItem[];
  };

  // Optional custom header extra (like Traceability button or Edit button)
  extraActions?: React.ReactNode;
}

export const MachineAnalyticsControlBar: React.FC<MachineAnalyticsProps> = ({
  timeRange = 'Today',
  onTimeRangeChange,

  lines = ['All', 'Line 01', 'Line 02', 'Line 03', 'Line 05', 'Line 07', 'Line 08'],
  selectedLine = 'All',
  onLineChange,

  products = ['All', 'Model 504-2154', 'Model 504-2187', 'Model 504-2224', 'Model 504-2268', 'Model 504-2454'],
  selectedProduct = 'All',
  onProductChange,

  operators = ['All', 'OP-2154-C', 'OP-2187-A', 'OP-2224-D', 'OP-2268-B', 'OP-2454-E'],
  selectedOperator = 'All',
  onOperatorChange,

  lots = ['All', 'LOT-2026-09A', 'LOT-2026-09B', 'LOT-2026-09C', 'LOT-2026-08F'],
  selectedLot = 'All',
  onLotChange,

  racks = ['All', 'RACK-A01', 'RACK-A02', 'RACK-B01', 'RACK-B02', 'RACK-C01'],
  selectedRack = 'All',
  onRackChange,

  totalOutput,
  outputUnit = 'boards',
  activeHours = 8,
  peakHourLabel = '02 SEPT 15:00',
  peakHourValue,
  avgPerActiveHour,

  breakdownData,
  extraActions
}) => {
  const [internalTimeRange, setInternalTimeRange] = useState<TimeRangeFilter>(timeRange);
  const [activeBreakdownTab, setActiveBreakdownTab] = useState<BreakdownTab>('Line');

  // Internal state for independent switching if parent does not control
  const [internalLine, setInternalLine] = useState<string>(selectedLine);
  const [internalProduct, setInternalProduct] = useState<string>(selectedProduct);
  const [internalOperator, setInternalOperator] = useState<string>(selectedOperator);
  const [internalLot, setInternalLot] = useState<string>(selectedLot);
  const [internalRack, setInternalRack] = useState<string>(selectedRack);

  // Synchronize when external props change
  useEffect(() => {
    if (selectedLine !== undefined) setInternalLine(selectedLine);
  }, [selectedLine]);

  useEffect(() => {
    if (selectedProduct !== undefined) setInternalProduct(selectedProduct);
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedOperator !== undefined) setInternalOperator(selectedOperator);
  }, [selectedOperator]);

  useEffect(() => {
    if (selectedLot !== undefined) setInternalLot(selectedLot);
  }, [selectedLot]);

  useEffect(() => {
    if (selectedRack !== undefined) setInternalRack(selectedRack);
  }, [selectedRack]);

  const currentRange = onTimeRangeChange ? timeRange : internalTimeRange;
  const handleRangeSelect = (r: TimeRangeFilter) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(r);
    } else {
      setInternalTimeRange(r);
    }
  };

  // Handlers that update both internal state & invoke callback
  const handleLineSelect = (val: string) => {
    setInternalLine(val);
    if (onLineChange) onLineChange(val);
  };

  const handleProductSelect = (val: string) => {
    setInternalProduct(val);
    if (onProductChange) onProductChange(val);
  };

  const handleOperatorSelect = (val: string) => {
    setInternalOperator(val);
    if (onOperatorChange) onOperatorChange(val);
  };

  const handleLotSelect = (val: string) => {
    setInternalLot(val);
    if (onLotChange) onLotChange(val);
  };

  const handleRackSelect = (val: string) => {
    setInternalRack(val);
    if (onRackChange) onRackChange(val);
  };

  const handleClearAllFilters = () => {
    handleLineSelect(lines[0] || 'All');
    handleProductSelect(products[0] || 'All');
    handleOperatorSelect(operators[0] || 'All');
    handleLotSelect(lots[0] || 'All');
    handleRackSelect(racks[0] || 'All');
  };

  // Default breakdown fallbacks if not provided (aligned with factory lines L1-L6 and totalOutput)
  const defaultBreakdown = useMemo(() => {
    const base = totalOutput || 1000;
    return {
      Line: [
        { name: 'Line 01', count: Math.round(base * 0.22) },
        { name: 'Line 02', count: Math.round(base * 0.20) },
        { name: 'Line 03', count: Math.round(base * 0.18) },
        { name: 'Line 04', count: Math.round(base * 0.16) },
        { name: 'Line 05', count: Math.round(base * 0.14) },
        { name: 'Line 06', count: Math.round(base * 0.10) },
      ],
      Product: [
        { name: 'Model 504-2154 (RF Board)', count: Math.round(base * 0.38) },
        { name: 'Model 504-2224 (Power Mod)', count: Math.round(base * 0.32) },
        { name: 'Model 504-2187 (Controller)', count: Math.round(base * 0.20) },
        { name: 'Model 504-2268 (WiFi Module)', count: Math.round(base * 0.10) },
      ],
      Operator: [
        { name: 'OP-2154-C (Somchai K.)', count: Math.round(base * 0.42) },
        { name: 'OP-2224-D (Wichai P.)', count: Math.round(base * 0.35) },
        { name: 'OP-2187-A (Nattaporn T.)', count: Math.round(base * 0.23) },
      ],
      Lot: [
        { name: 'LOT-2026-09A', count: Math.round(base * 0.48) },
        { name: 'LOT-2026-09B', count: Math.round(base * 0.36) },
        { name: 'LOT-2026-09C', count: Math.round(base * 0.16) },
      ],
      Rack: [
        { name: 'Rack R-01 (Shelf A)', count: Math.round(base * 0.38) },
        { name: 'Rack R-02 (Shelf B)', count: Math.round(base * 0.34) },
        { name: 'Rack R-03 (Buffer)', count: Math.round(base * 0.28) },
      ],
    };
  }, [totalOutput]);

  const baseBreakdown = breakdownData || defaultBreakdown;

  // Active filter checks
  const isLineFiltered = internalLine && !internalLine.toLowerCase().includes('all');
  const isProductFiltered = internalProduct && !internalProduct.toLowerCase().includes('all');
  const isOperatorFiltered = internalOperator && !internalOperator.toLowerCase().includes('all');
  const isLotFiltered = internalLot && !internalLot.toLowerCase().includes('all');
  const isRackFiltered = internalRack && !internalRack.toLowerCase().includes('all');
  
  // Notice: on machine detail screens, selectedLine is often pre-selected to the current machine.
  // When breakdownData is explicitly provided by the parent, the data is already real and authoritative for that machine.
  const hasSubFilter = isProductFiltered || isOperatorFiltered || isLotFiltered || isRackFiltered;
  const hasActiveFilter = Boolean(breakdownData ? hasSubFilter : (isLineFiltered || hasSubFilter));

  // Dynamic calculation for "เปลี่ยนจริง" (real change upon selection)
  const { displayTotalOutput, displayActiveHours, displayPeakHourValue, displayAvgPerActiveHour, dynamicBreakdown } = useMemo(() => {
    let scale = 1.0;

    // Helper to calculate ratio of an item inside a breakdown group
    const getItemRatio = (groupName: BreakdownTab, selectedVal: string) => {
      const items = baseBreakdown[groupName] || defaultBreakdown[groupName] || [];
      const totalInGroup = items.reduce((acc, it) => acc + it.count, 0) || 1;
      const matched = items.find((it) => selectedVal.toLowerCase().includes(it.name.toLowerCase()) || it.name.toLowerCase().includes(selectedVal.toLowerCase()));
      if (matched) {
        return Math.max(0.12, matched.count / totalInGroup);
      }
      return 0.35; // default realistic subset ratio
    };

    if (!breakdownData && isLineFiltered) scale *= getItemRatio('Line', internalLine);
    if (isProductFiltered) scale *= getItemRatio('Product', internalProduct);
    if (isOperatorFiltered) scale *= getItemRatio('Operator', internalOperator);
    if (isLotFiltered) scale *= getItemRatio('Lot', internalLot);
    if (isRackFiltered) scale *= getItemRatio('Rack', internalRack);

    // Apply scale to totalOutput only if sub-filters are active or default breakdown
    const calculatedTotal = hasActiveFilter ? Math.max(12, Math.round(totalOutput * scale)) : totalOutput;
    const calcHours = hasActiveFilter ? Math.max(4, Math.min(8, Math.round(activeHours * (0.8 + scale * 0.2)))) : activeHours;
    const calcPeak = peakHourValue !== undefined ? (hasActiveFilter ? Math.max(4, Math.round(peakHourValue * scale)) : peakHourValue) : Math.round(calculatedTotal * 0.16);
    const calcAvg = avgPerActiveHour !== undefined && !hasActiveFilter ? avgPerActiveHour : Math.round(calculatedTotal / Math.max(1, calcHours));

    // Calculate dynamic breakdown for each tab
    const tabs: BreakdownTab[] = ['Line', 'Product', 'Operator', 'Lot', 'Rack'];
    const dynData: Record<BreakdownTab, BreakdownItem[]> = {
      Line: [],
      Product: [],
      Operator: [],
      Lot: [],
      Rack: []
    };

    tabs.forEach((tab) => {
      const origItems = baseBreakdown[tab] || defaultBreakdown[tab] || [];
      // When breakdownData is provided, NEVER mutate the Line tab with fake percentages! Keep the real machine/line numbers intact!
      if (tab === 'Line' && breakdownData) {
        dynData.Line = origItems;
      } else if (!hasActiveFilter) {
        dynData[tab] = origItems;
      } else {
        // If this tab is the filtered property itself, emphasize the selected item
        const isThisTabFiltered =
          (tab === 'Line' && isLineFiltered) ||
          (tab === 'Product' && isProductFiltered) ||
          (tab === 'Operator' && isOperatorFiltered) ||
          (tab === 'Lot' && isLotFiltered) ||
          (tab === 'Rack' && isRackFiltered);

        if (isThisTabFiltered) {
          const filterVal = tab === 'Line' ? internalLine : tab === 'Product' ? internalProduct : tab === 'Operator' ? internalOperator : tab === 'Lot' ? internalLot : internalRack;
          dynData[tab] = origItems.map((it) => {
            const isMatch = filterVal.toLowerCase().includes(it.name.toLowerCase()) || it.name.toLowerCase().includes(filterVal.toLowerCase());
            return {
              name: it.name,
              count: isMatch ? calculatedTotal : Math.round(it.count * 0.15)
            };
          });
        } else {
          // Scale proportional to the filtered volume
          dynData[tab] = origItems.map((it) => ({
            name: it.name,
            count: Math.max(2, Math.round(it.count * scale))
          }));
        }
      }
    });

    return {
      displayTotalOutput: calculatedTotal,
      displayActiveHours: calcHours,
      displayPeakHourValue: calcPeak,
      displayAvgPerActiveHour: calcAvg,
      dynamicBreakdown: dynData
    };
  }, [
    baseBreakdown,
    defaultBreakdown,
    totalOutput,
    activeHours,
    peakHourValue,
    avgPerActiveHour,
    isLineFiltered,
    isProductFiltered,
    isOperatorFiltered,
    isLotFiltered,
    isRackFiltered,
    hasActiveFilter,
    internalLine,
    internalProduct,
    internalOperator,
    internalLot,
    internalRack
  ]);

  const itemsToShow = dynamicBreakdown[activeBreakdownTab] || [];
  const maxCount = Math.max(...itemsToShow.map((i) => i.count), 1);

  // Click handler from breakdown item to filter the dashboard
  const handleBreakdownItemClick = (tab: BreakdownTab, itemName: string) => {
    if (tab === 'Line') {
      const match = lines.find((l) => l.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(l.toLowerCase())) || itemName;
      handleLineSelect(match);
    } else if (tab === 'Product') {
      const match = products.find((p) => p.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(p.toLowerCase())) || itemName;
      handleProductSelect(match);
    } else if (tab === 'Operator') {
      const match = operators.find((o) => o.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(o.toLowerCase())) || itemName;
      handleOperatorSelect(match);
    } else if (tab === 'Lot') {
      const match = lots.find((l) => l.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(l.toLowerCase())) || itemName;
      handleLotSelect(match);
    } else if (tab === 'Rack') {
      const match = racks.find((r) => r.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(r.toLowerCase())) || itemName;
      handleRackSelect(match);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Header Controls: Time Range Segmented Pills & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {extraActions ? (
          <div className="flex items-center gap-2">
            {extraActions}
          </div>
        ) : <div />}

        {/* Time Segment Pills */}
        <div className="bg-[#eaedf0] p-1 rounded-xl flex items-center gap-1 self-end sm:self-auto ml-auto">
          {(['Today', '24h', '7d', '30d', 'Custom'] as TimeRangeFilter[]).map((tab) => {
            const isActive = currentRange === tab;
            return (
              <button
                key={tab}
                onClick={() => handleRangeSelect(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Dropdowns Row with Interactive Change Handlers */}
      <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Line Select */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Line
              </label>
              {isLineFiltered && (
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" title="Line filtered" />
              )}
            </div>
            <div className="relative">
              <select
                value={internalLine}
                onChange={(e) => handleLineSelect(e.target.value)}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border transition-colors focus:outline-none focus:ring-2 cursor-pointer appearance-none pr-8 truncate ${
                  isLineFiltered
                    ? 'bg-sky-50/70 border-sky-300 text-sky-900 focus:ring-sky-400 font-bold'
                    : 'bg-[#f8fafc] hover:bg-slate-100 border-slate-200 text-slate-900 focus:ring-slate-400'
                }`}
              >
                {lines.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Product Select */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Product
              </label>
              {isProductFiltered && (
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" title="Product filtered" />
              )}
            </div>
            <div className="relative">
              <select
                value={internalProduct}
                onChange={(e) => handleProductSelect(e.target.value)}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border transition-colors focus:outline-none focus:ring-2 cursor-pointer appearance-none pr-8 truncate ${
                  isProductFiltered
                    ? 'bg-purple-50/70 border-purple-300 text-purple-900 focus:ring-purple-400 font-bold'
                    : 'bg-[#f8fafc] hover:bg-slate-100 border-slate-200 text-slate-900 focus:ring-slate-400'
                }`}
              >
                {products.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Operator Select */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Operator
              </label>
              {isOperatorFiltered && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Operator filtered" />
              )}
            </div>
            <div className="relative">
              <select
                value={internalOperator}
                onChange={(e) => handleOperatorSelect(e.target.value)}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border transition-colors focus:outline-none focus:ring-2 cursor-pointer appearance-none pr-8 truncate ${
                  isOperatorFiltered
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 focus:ring-emerald-400 font-bold'
                    : 'bg-[#f8fafc] hover:bg-slate-100 border-slate-200 text-slate-900 focus:ring-slate-400'
                }`}
              >
                {operators.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Lot Select */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Lot
              </label>
              {isLotFiltered && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Lot filtered" />
              )}
            </div>
            <div className="relative">
              <select
                value={internalLot}
                onChange={(e) => handleLotSelect(e.target.value)}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border transition-colors focus:outline-none focus:ring-2 cursor-pointer appearance-none pr-8 truncate ${
                  isLotFiltered
                    ? 'bg-amber-50/70 border-amber-300 text-amber-900 focus:ring-amber-400 font-bold'
                    : 'bg-[#f8fafc] hover:bg-slate-100 border-slate-200 text-slate-900 focus:ring-slate-400'
                }`}
              >
                {lots.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Rack Select */}
          <div className="flex flex-col space-y-1.5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Rack
              </label>
              {isRackFiltered && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" title="Rack filtered" />
              )}
            </div>
            <div className="relative">
              <select
                value={internalRack}
                onChange={(e) => handleRackSelect(e.target.value)}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border transition-colors focus:outline-none focus:ring-2 cursor-pointer appearance-none pr-8 truncate ${
                  isRackFiltered
                    ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 focus:ring-indigo-400 font-bold'
                    : 'bg-[#f8fafc] hover:bg-slate-100 border-slate-200 text-slate-900 focus:ring-slate-400'
                }`}
              >
                {racks.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Summary Strip */}
        {hasActiveFilter && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-slate-400" />
                Active Filters:
              </span>

              {isLineFiltered && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100/90 text-sky-800 border border-sky-200 text-[11px] font-semibold">
                  Line: <strong className="font-bold">{internalLine}</strong>
                  <button
                    onClick={() => handleLineSelect(lines[0] || 'All')}
                    className="hover:bg-sky-200 rounded-full p-0.5 ml-0.5 text-sky-700 cursor-pointer"
                    title="Clear Line filter"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {isProductFiltered && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100/90 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                  Product: <strong className="font-bold">{internalProduct}</strong>
                  <button
                    onClick={() => handleProductSelect(products[0] || 'All')}
                    className="hover:bg-purple-200 rounded-full p-0.5 ml-0.5 text-purple-700 cursor-pointer"
                    title="Clear Product filter"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {isOperatorFiltered && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                  Operator: <strong className="font-bold">{internalOperator}</strong>
                  <button
                    onClick={() => handleOperatorSelect(operators[0] || 'All')}
                    className="hover:bg-emerald-200 rounded-full p-0.5 ml-0.5 text-emerald-700 cursor-pointer"
                    title="Clear Operator filter"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {isLotFiltered && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                  Lot: <strong className="font-bold">{internalLot}</strong>
                  <button
                    onClick={() => handleLotSelect(lots[0] || 'All')}
                    className="hover:bg-amber-200 rounded-full p-0.5 ml-0.5 text-amber-700 cursor-pointer"
                    title="Clear Lot filter"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {isRackFiltered && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100/90 text-indigo-800 border border-indigo-200 text-[11px] font-semibold">
                  Rack: <strong className="font-bold">{internalRack}</strong>
                  <button
                    onClick={() => handleRackSelect(racks[0] || 'All')}
                    className="hover:bg-indigo-200 rounded-full p-0.5 ml-0.5 text-indigo-700 cursor-pointer"
                    title="Clear Rack filter"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 px-2 py-0.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* 4 Summary KPI Cards Row with Dynamic Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* TOTAL OUTPUT */}
        <div className="bg-[#f6f8fa] p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              TOTAL OUTPUT
            </span>
            {hasActiveFilter && (
              <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                Filtered
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {displayTotalOutput.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">{outputUnit}</span>
          </div>
        </div>

        {/* ACTIVE HOURS */}
        <div className="bg-[#f6f8fa] p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            ACTIVE HOURS
          </span>
          <div className="mt-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {displayActiveHours}
            </span>
          </div>
        </div>

        {/* PEAK HOUR */}
        <div className="bg-[#f6f8fa] p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
            PEAK HOUR · {peakHourLabel}
          </span>
          <div className="mt-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {displayPeakHourValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* AVG / ACTIVE HOUR */}
        <div className="bg-[#f6f8fa] p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs transition-all">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            AVG / ACTIVE HOUR
          </span>
          <div className="mt-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {displayAvgPerActiveHour.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Section Card with Interactive Tabs & Clickable Bars */}
      <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Breakdown
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              (Click any row to filter)
            </span>
          </div>

          {/* Breakdown Segmented Tabs */}
          <div className="bg-[#eaedf0] p-1 rounded-xl flex flex-wrap items-center gap-1 self-start sm:self-auto">
            {(['Line', 'Product', 'Operator', 'Lot', 'Rack'] as BreakdownTab[]).map((tab) => {
              const isActive = activeBreakdownTab === tab;
              const isTabFiltered =
                (tab === 'Line' && isLineFiltered) ||
                (tab === 'Product' && isProductFiltered) ||
                (tab === 'Operator' && isOperatorFiltered) ||
                (tab === 'Lot' && isLotFiltered) ||
                (tab === 'Rack' && isRackFiltered);

              return (
                <button
                  key={tab}
                  onClick={() => setActiveBreakdownTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <span>{tab}</span>
                  {isTabFiltered && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List of items with Progress Bar & Interactive Filtering on Click */}
        <div className="space-y-3">
          {itemsToShow.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No breakdown records found for the active criteria.
            </div>
          ) : (
            itemsToShow.map((item, index) => {
              const percent = Math.min(100, Math.round((item.count / maxCount) * 100));

              // Check if this item is currently selected in the filter
              const currentFilterVal =
                activeBreakdownTab === 'Line'
                  ? internalLine
                  : activeBreakdownTab === 'Product'
                  ? internalProduct
                  : activeBreakdownTab === 'Operator'
                  ? internalOperator
                  : activeBreakdownTab === 'Lot'
                  ? internalLot
                  : internalRack;

              const isItemSelected =
                currentFilterVal &&
                !currentFilterVal.toLowerCase().includes('all') &&
                (currentFilterVal.toLowerCase().includes(item.name.toLowerCase()) ||
                  item.name.toLowerCase().includes(currentFilterVal.toLowerCase()));

              return (
                <div
                  key={`${item.name}-${index}`}
                  onClick={() => handleBreakdownItemClick(activeBreakdownTab, item.name)}
                  className={`flex items-center gap-3 sm:gap-4 text-xs font-medium p-2 rounded-xl transition-all cursor-pointer group ${
                    isItemSelected
                      ? 'bg-sky-50/80 border border-sky-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                  title={`Click to filter by ${activeBreakdownTab}: ${item.name}`}
                >
                  {/* Item Name */}
                  <div className="w-32 sm:w-44 text-slate-800 font-semibold truncate shrink-0 flex items-center gap-1.5">
                    {isItemSelected && (
                      <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    )}
                    <span className="group-hover:text-sky-600 transition-colors">
                      {item.name}
                    </span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isItemSelected
                          ? 'bg-sky-600'
                          : 'bg-slate-400 group-hover:bg-sky-500'
                      }`}
                      style={{ width: `${Math.max(4, percent)}%` }}
                    />
                  </div>

                  {/* Numeric Count & Quick Indicator */}
                  <div className="w-20 text-right flex items-center justify-end gap-1.5 shrink-0">
                    <span className="font-mono font-bold text-slate-900">
                      {item.count.toLocaleString()}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-sky-500 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

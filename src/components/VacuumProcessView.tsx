import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import { MachineAnalyticsControlBar } from './MachineAnalyticsControlBar';
import {
  Wind,
  Contact,
  Thermometer,
  Gauge,
  Activity,
  Clock,
  Layers,
  Sparkles,
  Barcode,
  Edit3,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { Header } from './Header';
import { OvenFleetCombinedChart } from './OvenFleetCombinedChart';
import { OvenUnit } from '../types';

export const VacuumProcessView: React.FC = () => {
  const { pstTime, ovenUnits, updateOvenModel, updateOvenStatus, updateOvenFull, openTraceabilityModal, selectedMachineId, setSelectedMachineId } = useFactory();
  const { t, language } = useLanguage();

  const vacuumUnits = ovenUnits.filter((u) => u.subType === 'Vacuum');

  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => {
    if (selectedMachineId && vacuumUnits.some((u) => u.id === selectedMachineId)) {
      return selectedMachineId;
    }
    return 'ALL';
  });

  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [selectedOperator, setSelectedOperator] = useState<string>('All');
  const [selectedLot, setSelectedLot] = useState<string>('All');
  const [selectedRack, setSelectedRack] = useState<string>('All');

  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<OvenUnit>>({});

  const displayUnits = selectedUnitId === 'ALL'
    ? vacuumUnits
    : vacuumUnits.filter((u) => u.id === selectedUnitId);

  const activeUnit = vacuumUnits.find((u) => u.id === selectedUnitId) || vacuumUnits[0];

  const totalPcs = displayUnits.reduce((acc, u) => acc + (u.pcsCount || 480), 0);

  const formatRemaining = (totalSecs: number) => {
    if (totalSecs <= 0) return '00m 00s';
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const handleOpenEdit = (unit: OvenUnit) => {
    setEditingUnitId(unit.id);
    setEditFormData({
      operatorId: unit.operatorId,
      magazinesCount: unit.magazinesCount,
      pcsCount: unit.pcsCount,
      tempCelsius: unit.tempCelsius,
      pressurePa: unit.pressurePa,
      program: unit.program,
      stepCurrent: unit.stepCurrent,
      stepTotal: unit.stepTotal,
      remainingSeconds: unit.remainingSeconds
    });
  };

  const handleSaveEdit = () => {
    if (editingUnitId) {
      updateOvenFull(editingUnitId, editFormData);
      setEditingUnitId(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#1b1b1d] pb-20 md:pb-8 font-sans">
      <Header
        title="Vacuum Oven Process"
        subtitle="Vacuum chamber telemetry, chamber pressures and thermal curves"
        badge={
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            VACUUM CHAMBERS ONLINE
          </span>
        }
      />

      <div className="pt-4 px-4 md:px-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Unified Standard Analytics Control Strip & Breakdown */}
        <MachineAnalyticsControlBar
          totalOutput={totalPcs}
          outputUnit="boards"
          activeHours={8}
          peakHourLabel="02 SEPT 15:00"
          peakHourValue={120}
          avgPerActiveHour={Math.round(totalPcs / 8)}
          lines={['All Vacuum Chambers', ...vacuumUnits.map((u, idx) => `Line 06 (Chamber ${idx === 0 ? 'A' : 'B'} - ${u.name})`)]}
          selectedLine={selectedUnitId === 'ALL' ? 'All Vacuum Chambers' : `Line 06 (Chamber ${vacuumUnits.findIndex((u) => u.id === activeUnit.id) === 0 ? 'A' : 'B'} - ${activeUnit.name})`}
          onLineChange={(l) => {
            if (l === 'All Vacuum Chambers' || l === 'All') {
              setSelectedUnitId('ALL');
            } else {
              const match = vacuumUnits.find((u) => l.includes(u.id) || l.includes(u.name));
              if (match) setSelectedUnitId(match.id);
            }
          }}
          selectedProduct={selectedProduct}
          onProductChange={(p) => {
            setSelectedProduct(p);
          }}
          selectedOperator={selectedOperator}
          onOperatorChange={(op) => {
            setSelectedOperator(op);
            const match = vacuumUnits.find((u) => op.includes(u.operatorId));
            if (match && selectedUnitId === 'ALL') {
              setSelectedUnitId(match.id);
            }
          }}
          selectedLot={selectedLot}
          onLotChange={setSelectedLot}
          selectedRack={selectedRack}
          onRackChange={setSelectedRack}
          breakdownData={{
            Line: vacuumUnits.map((u, idx) => ({
              name: `Line 06 (Chamber ${idx === 0 ? 'A' : 'B'} - ${u.name})`,
              count: u.pcsCount || 480
            })),
            Product: [
              { name: 'Model 504-2154 (RF Module)', count: Math.round(totalPcs * 0.40) },
              { name: 'Model 504-2224 (Power Board)', count: Math.round(totalPcs * 0.35) },
              { name: 'Model 504-2187 (Logic Core)', count: Math.round(totalPcs * 0.25) },
            ],
            Operator: vacuumUnits.map((u) => ({
              name: `${u.operatorId} (${u.name})`,
              count: u.pcsCount || 480
            })),
            Lot: [
              { name: 'LOT-2026-09A', count: Math.round(totalPcs * 0.50) },
              { name: 'LOT-2026-09B', count: Math.round(totalPcs * 0.30) },
              { name: 'LOT-2026-08F', count: Math.round(totalPcs * 0.20) },
            ],
            Rack: [
              { name: 'Magazine Mag-01 (Shelf A)', count: Math.round(totalPcs * 0.34) },
              { name: 'Magazine Mag-02 (Shelf B)', count: Math.round(totalPcs * 0.33) },
              { name: 'Magazine Mag-03 (Shelf C)', count: Math.round(totalPcs * 0.33) },
            ]
          }}
          extraActions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => openTraceabilityModal('WP-2026-90412')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Trace Workpiece</span>
              </button>
              <div className="text-right bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs font-mono">
                <span className="text-[10px] text-slate-500 uppercase mr-1">Clock:</span>
                <strong className="text-slate-900">{pstTime} PST</strong>
              </div>
            </div>
          }
        />

        {/* Machine Quick Switcher Tabs */}
        <div className="flex items-center justify-between gap-3 bg-emerald-50/50 p-2.5 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-900">Active View:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedUnitId('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedUnitId === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-emerald-100/60 border border-emerald-200'
                }`}
              >
                All Chambers
              </button>
              {vacuumUnits.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedUnitId === u.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-emerald-100/60 border border-emerald-200'
                  }`}
                >
                  <span>{u.id}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'RUNNING' ? 'bg-emerald-300' : 'bg-rose-400'}`} />
                </button>
              ))}
            </div>
          </div>
          {selectedUnitId !== 'ALL' && (
            <button
              onClick={() => setSelectedUnitId('ALL')}
              className="text-[11px] font-mono text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 cursor-pointer shrink-0"
            >
              ← Back to All Chambers
            </button>
          )}
        </div>

        {/* Consolidated Vacuum Fleet Combined Chart with Integrated Chamber Telemetry */}
        <OvenFleetCombinedChart
          processType="Vacuum"
          units={vacuumUnits}
          colorTheme="emerald"
          selectedUnitId={selectedUnitId}
          onSelectUnit={(id) => setSelectedUnitId(id)}
        >
          {/* Integrated CHAMBER TELEMETRY inside the same graph container */}
          <div className="space-y-4 pt-1">
            {/* Header: CHAMBER TELEMETRY */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      CHAMBER TELEMETRY
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>LIVE SENSORS</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {selectedUnitId === 'ALL'
                      ? 'Real-time telemetry and atmospheric conditions across active vacuum chambers'
                      : `${activeUnit.name} • ${activeUnit.chamberLabel} • Operator: ${activeUnit.operatorId}`}
                  </p>
                </div>
              </div>

              {selectedUnitId !== 'ALL' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(activeUnit)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-200 text-xs font-bold font-mono cursor-pointer transition-colors shadow-2xs"
                    title="Edit Chamber Parameters"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Parameters</span>
                  </button>

                  <button
                    onClick={() => updateOvenStatus(activeUnit.id, activeUnit.status === 'RUNNING' ? 'STOP' : 'RUNNING')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold tracking-tight flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs ${
                      activeUnit.status === 'RUNNING'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeUnit.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    <span>{activeUnit.status === 'RUNNING' ? 'RUNNING' : 'STOP'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Downtime Alert if any */}
            {selectedUnitId !== 'ALL' && activeUnit.downtimeReason && (
              <div
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border ${
                  activeUnit.status !== 'RUNNING'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>Reason: {activeUnit.downtimeReason}</span>
                <span className="font-mono text-[11px] font-semibold">
                  {activeUnit.downtimeDurationMins}m downtime
                </span>
              </div>
            )}

            {/* If Single Chamber Selected: Clean Telemetry Grid */}
            {selectedUnitId !== 'ALL' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {/* Temperature */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      TEMPERATURE
                    </span>
                    <div className="flex items-center space-x-1.5 text-emerald-700 font-mono font-bold text-base mt-1">
                      <Thermometer className="w-4 h-4 text-emerald-600" />
                      <span>{activeUnit.tempCelsius} °C</span>
                    </div>
                  </div>

                  {/* Pressure */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      PRESSURE
                    </span>
                    <div className="flex items-center space-x-1.5 text-emerald-700 font-mono font-bold text-base mt-1">
                      <Gauge className="w-4 h-4 text-emerald-600" />
                      <span>{activeUnit.pressurePa} Pa</span>
                    </div>
                  </div>

                  {/* Program / Recipe */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      PROGRAM / RECIPE
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900 block mt-1 truncate">
                      {activeUnit.program}
                    </span>
                  </div>

                  {/* Step Progress */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      STEP PROGRESS
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900 mt-1 block">
                      {activeUnit.stepCurrent} <span className="text-xs text-slate-400">/</span> {activeUnit.stepTotal}
                    </span>
                  </div>

                  {/* Time Remaining */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      TIME REMAINING
                    </span>
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-mono font-bold text-sm mt-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{formatRemaining(activeUnit.remainingSeconds)}</span>
                    </div>
                  </div>

                  {/* Loaded Magazines */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      LOADED MAG
                    </span>
                    <div className="flex items-center space-x-1 text-slate-900 font-mono font-bold text-sm mt-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-black text-emerald-700">{activeUnit.magazinesCount}</span>
                      <span className="text-[10px] text-slate-500">Mag</span>
                    </div>
                  </div>
                </div>

                {/* Model & Operator Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Contact className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Operator:</span>
                      <span className="font-mono font-bold text-slate-900">{activeUnit.operatorId}</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Batch Recipe:</span>
                      <select
                        value={activeUnit.runningModel}
                        onChange={(e) => updateOvenModel(activeUnit.id, e.target.value)}
                        className="bg-white border border-slate-300 rounded-md px-2 py-0.5 font-mono font-bold text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                      >
                        <option value="504-2187">504-2187 (4 Magazines)</option>
                        <option value="504-2268">504-2268 (2 Magazines)</option>
                        <option value="504-2154">504-2154 (5 Magazines)</option>
                        <option value="504-2224">504-2224 (3 Magazines)</option>
                        <option value="504-2454">504-2454 (6 Magazines)</option>
                        <option value="504-2090">504-2090 (4 Magazines)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* If All Selected: Side-by-side Chamber Telemetry Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vacuumUnits.map((unit) => {
                  const isRunning = unit.status === 'RUNNING';
                  return (
                    <div
                      key={unit.id}
                      onClick={() => setSelectedUnitId(unit.id)}
                      className="bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 p-3.5 transition-all cursor-pointer space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700">
                            <Wind className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block group-hover:text-emerald-700 transition-colors">
                              {unit.name}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">
                              {unit.chamberLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono flex items-center gap-1 ${
                            isRunning ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {isRunning ? 'RUNNING' : 'STOP'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div className="bg-white rounded-lg p-2 border border-slate-200/80">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">TEMP</span>
                          <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                            <Thermometer className="w-3 h-3" />
                            {unit.tempCelsius}°C
                          </span>
                        </div>

                        <div className="bg-white rounded-lg p-2 border border-slate-200/80">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">PRESSURE</span>
                          <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                            <Gauge className="w-3 h-3" />
                            {unit.pressurePa} Pa
                          </span>
                        </div>

                        <div className="bg-white rounded-lg p-2 border border-slate-200/80">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">REMAINING</span>
                          <span className="font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatRemaining(unit.remainingSeconds)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                        <span>Recipe: <strong>{unit.program}</strong></span>
                        <span>Step <strong>{unit.stepCurrent}/{unit.stepTotal}</strong> • {unit.magazinesCount} Mag</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </OvenFleetCombinedChart>
      </div>

      {/* Edit Chamber Parameters Modal */}
      {editingUnitId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                {`Edit Chamber Parameters for ${editingUnitId}`}
              </h3>
              <button onClick={() => setEditingUnitId(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Operator ID</label>
                <input
                  type="text"
                  value={editFormData.operatorId || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, operatorId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Program / Recipe</label>
                <input
                  type="text"
                  value={editFormData.program || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, program: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editFormData.tempCelsius || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, tempCelsius: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Pressure (Pa)</label>
                <input
                  type="number"
                  value={editFormData.pressurePa || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, pressurePa: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Loaded Magazines</label>
                <input
                  type="number"
                  value={editFormData.magazinesCount || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, magazinesCount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Remaining Time (Secs)</label>
                <input
                  type="number"
                  value={editFormData.remainingSeconds || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, remainingSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingUnitId(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

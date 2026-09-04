import React, { useState } from 'react';
import { Header } from './Header';
import { useFactory } from '../context/FactoryContext';
import { MachineAnalyticsControlBar } from './MachineAnalyticsControlBar';
import { Flame, Clock, Thermometer, User, CheckCircle2, AlertTriangle, Layers, Activity, Contact } from 'lucide-react';
import { OvenFleetCombinedChart } from './OvenFleetCombinedChart';

export const BakeProcessView: React.FC = () => {
  const { ovenUnits, navigate, updateOvenModel, updateOvenStatus, selectedMachineId, setSelectedMachineId } = useFactory();

  const bakeUnits = ovenUnits.filter((u) => u.subType === 'Bake');

  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => {
    if (selectedMachineId && bakeUnits.some((u) => u.id === selectedMachineId)) {
      return selectedMachineId;
    }
    return 'ALL';
  });

  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [selectedOperator, setSelectedOperator] = useState<string>('All');
  const [selectedLot, setSelectedLot] = useState<string>('All');
  const [selectedRack, setSelectedRack] = useState<string>('All');

  const displayUnits = selectedUnitId === 'ALL'
    ? bakeUnits
    : bakeUnits.filter((u) => u.id === selectedUnitId);

  const activeUnit = bakeUnits.find((u) => u.id === selectedUnitId) || bakeUnits[0];

  const totalPcs = displayUnits.reduce((acc, u) => acc + (u.pcsCount || 520), 0);

  const formatHoursMinutes = (secs: number) => {
    if (secs <= 0) return '0m';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
    return `${mins}m`;
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#1b1b1d] pb-20 md:pb-8 font-sans">
      <Header
        title={selectedUnitId === 'ALL' ? "Bake Oven Process" : `${activeUnit.name} Telemetry Window`}
        subtitle="5 Conveyorized & Thermal Baking Ovens • Multi-Zone Temperatures & Telemetry"
        badge={
          <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {selectedUnitId === 'ALL' ? 'BAKE OVENS ONLINE (5 UNITS)' : `OVEN ${activeUnit.id} ONLINE`}
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
          peakHourValue={135}
          avgPerActiveHour={Math.round(totalPcs / 8)}
          lines={['All Bake Ovens', ...bakeUnits.map((u, idx) => `Line 0${idx + 1} (${u.name})`)]}
          selectedLine={selectedUnitId === 'ALL' ? 'All Bake Ovens' : `Line 0${bakeUnits.findIndex((u) => u.id === activeUnit.id) + 1} (${activeUnit.name})`}
          onLineChange={(l) => {
            if (l === 'All Bake Ovens' || l === 'All') {
              setSelectedUnitId('ALL');
            } else {
              const match = bakeUnits.find((u) => l.includes(u.id) || l.includes(u.name));
              if (match) setSelectedUnitId(match.id);
            }
          }}
          selectedProduct={selectedProduct}
          onProductChange={setSelectedProduct}
          selectedOperator={selectedOperator}
          onOperatorChange={(op) => {
            setSelectedOperator(op);
            const match = bakeUnits.find((u) => op.includes(u.operatorId));
            if (match && selectedUnitId === 'ALL') {
              setSelectedUnitId(match.id);
            }
          }}
          selectedLot={selectedLot}
          onLotChange={setSelectedLot}
          selectedRack={selectedRack}
          onRackChange={setSelectedRack}
          breakdownData={{
            Line: bakeUnits.map((u, idx) => ({
              name: `Line 0${idx + 1} (${u.name})`,
              count: u.pcsCount || 520
            })),
            Product: [
              { name: 'Model 504-2154 (RF Curing)', count: Math.round(totalPcs * 0.38) },
              { name: 'Model 504-2224 (Power Board)', count: Math.round(totalPcs * 0.34) },
              { name: 'Model 504-2187 (Logic Core)', count: Math.round(totalPcs * 0.28) },
            ],
            Operator: bakeUnits.map((u) => ({
              name: `${u.operatorId} (${u.name})`,
              count: u.pcsCount || 520
            })),
            Lot: [
              { name: 'LOT-2026-09A', count: Math.round(totalPcs * 0.45) },
              { name: 'LOT-2026-09B', count: Math.round(totalPcs * 0.35) },
              { name: 'LOT-2026-08F', count: Math.round(totalPcs * 0.20) },
            ],
            Rack: [
              { name: 'Magazine Mag-01 (Infeed A)', count: Math.round(totalPcs * 0.35) },
              { name: 'Magazine Mag-02 (Infeed B)', count: Math.round(totalPcs * 0.35) },
              { name: 'Magazine Mag-03 (Cooling Buffer)', count: Math.round(totalPcs * 0.30) },
            ]
          }}
          extraActions={
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-amber-50 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 shadow-2xs">
                {selectedUnitId === 'ALL' ? '5 Total Units Active' : `Selected: ${activeUnit.name}`}
              </span>
            </div>
          }
        />

        {/* Machine Quick Switcher Tabs */}
        <div className="flex items-center justify-between gap-3 bg-amber-50/50 p-2.5 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-900">Active View:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setSelectedUnitId('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                  selectedUnitId === 'ALL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-amber-100/60 border border-amber-200'
                }`}
              >
                All Bake Ovens
              </button>
              {bakeUnits.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnitId(u.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    selectedUnitId === u.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-amber-100/60 border border-amber-200'
                  }`}
                >
                  <span>{u.id}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'RUNNING' ? 'bg-amber-300' : 'bg-rose-400'}`} />
                </button>
              ))}
            </div>
          </div>
          {selectedUnitId !== 'ALL' && (
            <button
              onClick={() => setSelectedUnitId('ALL')}
              className="text-[11px] font-mono text-amber-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-amber-200 hover:bg-amber-100 cursor-pointer shrink-0"
            >
              ← Back to All Ovens
            </button>
          )}
        </div>

        {/* Consolidated Bake Fleet Combined Chart with Integrated Oven Telemetry */}
        <OvenFleetCombinedChart
          processType="Bake"
          units={bakeUnits}
          colorTheme="amber"
          selectedUnitId={selectedUnitId}
          onSelectUnit={(id) => setSelectedUnitId(id)}
        >
          {/* Integrated OVEN TELEMETRY inside the same graph container */}
          <div className="space-y-4 pt-1">
            {/* Header: OVEN TELEMETRY */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      OVEN TELEMETRY
                    </h4>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>LIVE SENSORS</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {selectedUnitId === 'ALL'
                      ? 'Real-time thermal telemetry, program cycles, and recipe parameters across baking ovens'
                      : `Line 0${bakeUnits.findIndex((u) => u.id === activeUnit.id) + 1} (${activeUnit.name}) • Oven #${activeUnit.id} • Operator: ${activeUnit.operatorId}`}
                  </p>
                </div>
              </div>

              {selectedUnitId !== 'ALL' && (
                <div className="flex items-center gap-2">
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

            {/* If Single Oven Selected: Clean Telemetry Grid */}
            {selectedUnitId !== 'ALL' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {/* Temperature */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      TEMPERATURE
                    </span>
                    <div className="flex items-baseline space-x-1 text-amber-700 font-mono font-bold text-base mt-1">
                      <Thermometer className="w-4 h-4 text-amber-600 shrink-0 self-center" />
                      <span>{activeUnit.tempCelsius.toFixed(1)} °C</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                      Target [{activeUnit.targetTempMin?.toFixed(0)}-{activeUnit.targetTempMax?.toFixed(0)}°C]
                    </span>
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

                  {/* Time Left */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      TIME REMAINING
                    </span>
                    <div className="flex items-center space-x-1.5 text-amber-800 font-mono font-bold text-sm mt-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{formatHoursMinutes(activeUnit.remainingSeconds)}</span>
                    </div>
                  </div>

                  {/* Est. Finish */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      EST. FINISH
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900 mt-1 block">
                      {activeUnit.estFinishTime || '--'}
                    </span>
                  </div>

                  {/* Loaded Magazines */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      LOADED MAG
                    </span>
                    <div className="flex items-center space-x-1 text-slate-900 font-mono font-bold text-sm mt-1">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-black text-amber-700">{activeUnit.magazinesCount}</span>
                      <span className="text-[10px] text-slate-500">Mag</span>
                    </div>
                  </div>

                  {/* UPH Performance */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-2.5">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                      SPEED / UPH
                    </span>
                    <div className="font-mono font-bold text-sm text-slate-900 mt-1">
                      <span className="text-amber-700 font-black">{activeUnit.uph || 590}</span>
                      <span className="text-[10px] text-slate-400 font-normal"> / {activeUnit.targetUph || 600}</span>
                    </div>
                  </div>
                </div>

                {/* Model & Operator Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Contact className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Operator:</span>
                      <span className="font-mono font-bold text-slate-900">{activeUnit.operatorId}</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Batch Recipe:</span>
                      <select
                        value={activeUnit.runningModel}
                        onChange={(e) => updateOvenModel(activeUnit.id, e.target.value)}
                        className="bg-white border border-slate-300 rounded-md px-2 py-0.5 font-mono font-bold text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
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
              /* If All Selected: Side-by-side Oven Telemetry Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bakeUnits.map((unit, idx) => {
                  const isRunning = unit.status === 'RUNNING';
                  return (
                    <div
                      key={unit.id}
                      onClick={() => setSelectedUnitId(unit.id)}
                      className="bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 p-3.5 transition-all cursor-pointer space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-700">
                            <Flame className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block group-hover:text-amber-700 transition-colors">
                              {unit.name}
                            </span>
                            <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">
                              Line 0{idx + 1} • Oven #{unit.id}
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
                          <span className="font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                            <Thermometer className="w-3 h-3" />
                            {unit.tempCelsius.toFixed(1)}°C
                          </span>
                        </div>

                        <div className="bg-white rounded-lg p-2 border border-slate-200/80">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">REMAINING</span>
                          <span className="font-bold text-amber-800 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatHoursMinutes(unit.remainingSeconds)}
                          </span>
                        </div>

                        <div className="bg-white rounded-lg p-2 border border-slate-200/80">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">LOADED</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                            <Layers className="w-3 h-3 text-amber-600" />
                            {unit.magazinesCount} Mag
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                        <span>Recipe: <strong>{unit.program}</strong></span>
                        <span>Op: <strong>{unit.operatorId}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </OvenFleetCombinedChart>
      </div>
    </div>
  );
};

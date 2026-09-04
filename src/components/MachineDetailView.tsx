import React, { useState, useMemo } from 'react';
import { Header } from './Header';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import { MachineUphBarChart } from './MachineUphBarChart';
import { MachineAnalyticsControlBar } from './MachineAnalyticsControlBar';
import { DispensingAllFleetChart } from './DispensingAllFleetChart';
import {
  Gauge,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  Activity,
  Clock,
  Cpu,
  FileText,
  Sparkles,
  TrendingUp,
  LogIn,
  LogOut,
  Barcode,
  Edit3,
  Sliders,
  Check,
  X,
  BarChart3
} from 'lucide-react';
import { Machine } from '../types';

export const MachineDetailView: React.FC = () => {
  const {
    machines,
    selectedMachineId,
    updateMachineModel,
    updateMachineStatus,
    updateMachineFull,
    navigate,
    setShowAlertHistoryModal,
    openTraceabilityModal
  } = useFactory();

  const { t, language } = useLanguage();

  const isAllFleet = selectedMachineId === 'ALL';
  const machine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const isRunning = machine.status === 'RUNNING';

  const [isEditingModal, setIsEditingModal] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<Partial<Machine>>({});

  // Filter Bar state
  const [filterLine, setFilterLine] = useState<string>('All');
  const [filterProduct, setFilterProduct] = useState<string>('All');
  const [filterOperator, setFilterOperator] = useState<string>('All');
  const [filterLot, setFilterLot] = useState<string>('All');
  const [filterRack, setFilterRack] = useState<string>('All');

  const modelOptions = [
    'Model 504-2224 (11:00 - 14:00) - Output Active',
    'MODEL 504-2268 (10:00 - 13:00) - Scheduled',
    'MODEL 504-2154 (15:00 - 18:00) - Scheduled',
    'MODEL 504-2187 (13:30 - 16:30) - Scheduled',
    'MODEL 504-2454 (08:30 - 11:30) - Completed'
  ];

  const matchedOption =
    modelOptions.find((opt) =>
      opt.toLowerCase().includes(machine.runningModel.toLowerCase().split(' ')[1] || machine.runningModel.toLowerCase())
    ) || modelOptions[0];

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMachineModel(machine.id, e.target.value);
  };

  const handleOpenEdit = () => {
    setEditFormData({
      operatorId: machine.operatorId,
      oeePercent: machine.oeePercent,
      uph: machine.uph,
      inputCount: machine.inputCount,
      outputCount: machine.outputCount,
      activePanelId: machine.activePanelId || 'WP-2026-90412',
      downtimeReason: machine.downtimeReason || '',
      downtimeDurationMins: machine.downtimeDurationMins || 0,
      glueInfo: machine.glueInfo ? { ...machine.glueInfo } : undefined
    });
    setIsEditingModal(true);
  };

  const handleSaveEdit = () => {
    updateMachineFull(machine.id, editFormData);
    setIsEditingModal(false);
  };

  const totalFleetOutput = useMemo(() => {
    return machines.reduce((acc, m) => acc + (m.outputCount || 1102), 0);
  }, [machines]);

  // Helper to map dispensing machine to production line
  const getDispenserLineName = (machineId: string) => {
    switch (machineId) {
      case 'MC-01': return 'Line 01 (MC-01)';
      case 'MC-02': return 'Line 01 (MC-02)';
      case 'MC-03': return 'Line 02 (MC-03)';
      case 'MC-04': return 'Line 02 (MC-04)';
      case 'MC-05': return 'Line 03 (MC-05)';
      case 'MC-06': return 'Line 03 (MC-06)';
      case 'MC-07': return 'Line 04 (MC-07)';
      case 'MC-08': return 'Line 04 (MC-08)';
      case 'MC-09': return 'Line 05 (MC-09)';
      case 'MC-10': return 'Line 05 (MC-10)';
      case 'MC-11': return 'Line 06 (MC-11)';
      case 'MC-12': return 'Line 06 (MC-12)';
      case 'MC-13': return 'Line 06 (MC-13)';
      default: return `Line 01 (${machineId})`;
    }
  };

  // Breakdown distribution data for this machine or all linked to actual machine telemetry
  const machineBreakdown = useMemo(() => {
    const totalOut = isAllFleet ? totalFleetOutput : (machine.outputCount || 1102);
    
    // Calculate real breakdown across factory lines
    const lineBreakdown = isAllFleet
      ? [
          {
            name: 'Line 01 (MC-01, MC-02)',
            count: machines.filter((m) => ['MC-01', 'MC-02'].includes(m.id)).reduce((sum, m) => sum + (m.outputCount || 0), 0)
          },
          {
            name: 'Line 02 (MC-03, MC-04)',
            count: machines.filter((m) => ['MC-03', 'MC-04'].includes(m.id)).reduce((sum, m) => sum + (m.outputCount || 0), 0)
          },
          {
            name: 'Line 03 (MC-05, MC-06)',
            count: machines.filter((m) => ['MC-05', 'MC-06'].includes(m.id)).reduce((sum, m) => sum + (m.outputCount || 0), 0)
          },
          {
            name: 'Line 04 (MC-07, MC-08)',
            count: machines.filter((m) => ['MC-07', 'MC-08'].includes(m.id)).reduce((sum, m) => sum + (m.outputCount || 0), 0)
          },
          {
            name: 'Line 05 (MC-09, MC-10)',
            count: machines.filter((m) => ['MC-09', 'MC-10'].includes(m.id)).reduce((sum, m) => sum + (m.outputCount || 0), 0)
          },
          {
            name: 'Line 06 (MC-11 - MC-13)',
            count: machines.filter((m) => ['MC-11', 'MC-12', 'MC-13'].includes(m.id)).reduce((sum, m) => sum + (m.outputCount || 0), 0)
          },
        ]
      : machines.map((m) => ({
          name: getDispenserLineName(m.id),
          count: m.outputCount || 1080
        }));

    return {
      Line: lineBreakdown,
      Product: [
        { name: isAllFleet ? 'Model 504-2224 (Fleet Standard)' : (machine.runningModel || 'Model 504-2224'), count: Math.round(totalOut * 0.55) },
        { name: 'Model 504-2154 (RF Board)', count: Math.round(totalOut * 0.25) },
        { name: 'Model 504-2187 (Controller)', count: Math.round(totalOut * 0.20) },
      ],
      Operator: [
        { name: `${machine.operatorId} (Lead)`, count: Math.round(totalOut * 0.65) },
        { name: 'OP-2187-A (Shift 1)', count: Math.round(totalOut * 0.35) },
      ],
      Lot: [
        { name: 'LOT-2026-09A', count: Math.round(totalOut * 0.45) },
        { name: 'LOT-2026-09B', count: Math.round(totalOut * 0.35) },
        { name: 'LOT-2026-08F', count: Math.round(totalOut * 0.20) },
      ],
      Rack: [
        { name: 'Rack R-01 (Infeed A)', count: Math.round(totalOut * 0.38) },
        { name: 'Rack R-02 (Infeed B)', count: Math.round(totalOut * 0.34) },
        { name: 'Rack R-03 (Buffer Out)', count: Math.round(totalOut * 0.28) },
      ],
    };
  }, [isAllFleet, totalFleetOutput, machine.outputCount, machine.runningModel, machine.operatorId, machines]);

  return (
    <div className="w-full min-h-screen bg-white text-[#1b1b1d] pb-20 md:pb-8 font-sans">
      <Header
        title={isAllFleet ? "Dispensing Fleet Telemetry & Cumulative Graph" : `${machine.name} Station Details`}
        subtitle={isAllFleet ? "13 Automated Robots (MC-01 to MC-13) • Top Fill & Under Fill Fluid Deposition" : `${machine.processType} Fluid Dispenser • Active Model: ${machine.runningModel}`}
        badge={
          <span
            className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
              isAllFleet
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : isRunning
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {isAllFleet ? 'ALL 13 DISPENSING ROBOTS ONLINE' : machine.status}
          </span>
        }
      />

      <div className="pt-4 px-4 md:px-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Unified Standard Analytics Control Strip & Breakdown */}
        <MachineAnalyticsControlBar
          totalOutput={isAllFleet ? totalFleetOutput : machine.outputCount}
          outputUnit="boards"
          activeHours={8}
          peakHourLabel="02 SEPT 15:00"
          peakHourValue={isAllFleet ? 1800 : Math.max(machine.uph, 142)}
          avgPerActiveHour={Math.round((isAllFleet ? totalFleetOutput : machine.outputCount) / 8)}
          lines={['All Dispensing Fleet (13 Robots)', ...machines.map((m) => getDispenserLineName(m.id))]}
          selectedLine={isAllFleet ? 'All Dispensing Fleet (13 Robots)' : getDispenserLineName(machine.id)}
          onLineChange={(lineName) => {
            if (lineName.includes('All')) {
              navigate('machine-detail', 'ALL');
            } else {
              const found = machines.find((m) => lineName.includes(m.id));
              if (found) {
                setFilterLine(getDispenserLineName(found.id));
                navigate('machine-detail', found.id);
              }
            }
          }}
          selectedProduct={filterProduct}
          onProductChange={setFilterProduct}
          selectedOperator={filterOperator}
          onOperatorChange={setFilterOperator}
          selectedLot={filterLot}
          onLotChange={setFilterLot}
          selectedRack={filterRack}
          onRackChange={setFilterRack}
          breakdownData={machineBreakdown}
          extraActions={
            <div className="flex flex-wrap items-center gap-2">
              {!isAllFleet && (
                <>
                  <div
                    className={`px-2.5 py-1 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 border shadow-2xs ${
                      isRunning
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{machine.status}</span>
                  </div>

                  <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 p-0.5 rounded-xl shadow-2xs">
                    <button
                      onClick={() => updateMachineStatus(machine.id, 'RUNNING')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isRunning ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      RUN
                    </button>
                    <button
                      onClick={() => updateMachineStatus(machine.id, 'STOP', 'Manual Stop')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !isRunning ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      STOP
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={() => openTraceabilityModal(machine.activePanelId || 'WP-2026-90412')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Trace Workpiece</span>
              </button>
              {!isAllFleet && (
                <button
                  onClick={handleOpenEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Station</span>
                </button>
              )}
            </div>
          }
        />

        {/* Dispensing Machine Quick Switcher Bar */}
        <div className="flex items-center justify-between gap-3 bg-sky-50/50 p-2.5 rounded-2xl border border-sky-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-sky-900 shrink-0">Active View:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <button
                onClick={() => navigate('machine-detail', 'ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isAllFleet
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-sky-100/60 border border-sky-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>All Fleet Graph</span>
              </button>
              {machines.map((m) => (
                <button
                  key={m.id}
                  onClick={() => navigate('machine-detail', m.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    !isAllFleet && machine.id === m.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-sky-100/60 border border-sky-200'
                  }`}
                >
                  <span>{m.id}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'RUNNING' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </button>
              ))}
            </div>
          </div>
          {!isAllFleet && (
            <button
              onClick={() => navigate('machine-detail', 'ALL')}
              className="text-[11px] font-mono text-sky-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-sky-200 hover:bg-sky-100 cursor-pointer shrink-0"
            >
              ← View All Fleet Graph
            </button>
          )}
        </div>

        {/* Content Area: Either All Fleet Cumulative Graph OR Individual Machine Telemetry */}
        {isAllFleet ? (
          <DispensingAllFleetChart
            machines={machines}
            onSelectMachine={(id) => navigate('machine-detail', id)}
            openTraceabilityModal={openTraceabilityModal}
          />
        ) : (
          <>
            {/* Hourly UPH Bar Chart with Downtime Diagnostics */}
            <MachineUphBarChart
              machineId={machine.id}
              machineName={machine.name}
              currentUph={machine.uph}
              targetUph={1000}
              status={machine.status}
              downtimeReason={machine.downtimeReason}
              downtimeDurationMins={machine.downtimeDurationMins}
              downtimeHistory={machine.downtimeHistory}
              themeColor="sky"
              title={`${machine.name} - Hourly Output & Downtime Diagnostics`}
            />

        {/* 2 Metrics In/Out Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* INPUT Card */}
          <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-500 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase block">
              TOTAL INPUT BOARDS
            </span>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <span className="font-mono font-black text-3xl text-slate-900 block">
                  {machine.inputCount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">Scheduled Shift Ingestion</span>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl text-sky-600 border border-sky-200">
                <LogIn className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* OUTPUT Card */}
          <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-500 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase block">
                TOTAL DISPENSED YIELD
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {((machine.outputCount / Math.max(1, machine.inputCount)) * 100).toFixed(1)}% Yield
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <span className="font-mono font-black text-3xl text-slate-900 block">
                  {machine.outputCount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">Passed Dispensations</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200">
                <LogOut className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Model Selection & Glue / Downtime */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MODEL RUNNING SELECTION Card */}
          <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-500 p-5 sm:p-6 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-900 tracking-wider uppercase block border-b border-slate-100 pb-3">
              PRODUCTION MODEL & SCHEDULE
            </span>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5">
              <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-1.5">
                Active Production Recipe
              </label>
              <div className="relative">
                <select
                  value={matchedOption}
                  onChange={handleModelChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 pr-8 text-xs font-mono font-bold text-slate-900 appearance-none focus:ring-2 focus:ring-sky-500 focus:outline-hidden cursor-pointer"
                >
                  {modelOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Glue Information if present */}
            {machine.glueInfo && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-sky-600" />
                    <span>Fluid / Syringe Cartridge Info</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {machine.glueInfo.remainingMins} mins left
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Glue Spec
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900 mt-0.5 block">
                      {machine.glueInfo.glueType}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Pot-Life Expiry
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900 mt-0.5 block">
                      {machine.glueInfo.expiryTime}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (machine.glueInfo.remainingMins / 150) * 100)}%` }}
                      className="h-full bg-sky-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Downtime History Card */}
          <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-500 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 tracking-wider uppercase block">
                DOWNTIME LOGS & MAINTENANCE HISTORY
              </span>
              <button
                onClick={() => setShowAlertHistoryModal(true)}
                className="text-[10px] font-mono font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
              >
                View Full Alert Log
              </button>
            </div>

            <div className="space-y-2">
              {machine.downtimeHistory && machine.downtimeHistory.length > 0 ? (
                machine.downtimeHistory.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {d.timeRange}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            d.category === 'ME'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : d.category === 'OP'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {d.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{d.reason}</p>
                    </div>

                    <span className="font-mono font-bold text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                      {d.durationMins}m
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  No recent downtime logged for this machine.
                </div>
              )}
            </div>
          </div>
        </div>
        </>
      )}
      </div>

      {/* Edit Machine Parameters Modal */}
      {isEditingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600" />
                {`Edit Parameters for ${machine.name}`}
              </h3>
              <button onClick={() => setIsEditingModal(false)} className="text-slate-400 hover:text-slate-700">
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
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Active Workpiece Serial</label>
                <input
                  type="text"
                  value={editFormData.activePanelId || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, activePanelId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-sky-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">UPH Rate</label>
                <input
                  type="number"
                  value={editFormData.uph || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, uph: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">OEE %</label>
                <input
                  type="number"
                  step="0.1"
                  value={editFormData.oeePercent || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, oeePercent: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Total Input Boards</label>
                <input
                  type="number"
                  value={editFormData.inputCount || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, inputCount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Total Output Yield</label>
                <input
                  type="number"
                  value={editFormData.outputCount || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, outputCount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEditingModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
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

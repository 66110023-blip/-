import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Cpu,
  Layers,
  Edit3,
  Plus,
  Trash2,
  ExternalLink,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Camera,
  PackageCheck,
  Eye,
  Sliders,
  Check,
  Barcode,
  Filter,
  Info,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import { WorkpieceRecord, WorkpieceStep, StationCategory, ProcessRouteType } from '../types';
import { normalizeAoiMachineId, normalizeXrayMachineId } from '../utils/machineLinkUtils';

export const WorkpieceTraceabilityModal: React.FC = () => {
  const {
    showTraceabilityModal,
    closeTraceabilityModal,
    selectedTraceabilitySerial,
    workpieces,
    getWorkpieceBySerial,
    addWorkpiece,
    updateWorkpiece,
    updateWorkpieceStep,
    addWorkpieceStep,
    deleteWorkpiece,
    navigate,
    setSelectedMachineId
  } = useFactory();

  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSerial, setActiveSerial] = useState<string>('WP-2026-90412');
  const [routeFilter, setRouteFilter] = useState<'ALL' | 'UNDER_FILL' | 'TOP_FILL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [showWorkpieceListDrawer, setShowWorkpieceListDrawer] = useState<boolean>(false);
  
  const [isEditingMeta, setIsEditingMeta] = useState<boolean>(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [isCreatingNewWorkpiece, setIsCreatingNewWorkpiece] = useState<boolean>(false);

  // New workpiece state
  const [newSerialInput, setNewSerialInput] = useState<string>('');
  const [newModelInput, setNewModelInput] = useState<string>('504-2187');
  const [newLotInput, setNewLotInput] = useState<string>('LOT-20260819-A1');
  const [newRouteType, setNewRouteType] = useState<ProcessRouteType>('UNDER_FILL_VAC_BAKE');
  const [newDispenserId, setNewDispenserId] = useState<string>('MC-08');

  // Edit Meta Temp State
  const [editMetaModel, setEditMetaModel] = useState<string>('');
  const [editMetaLot, setEditMetaLot] = useState<string>('');
  const [editMetaStatus, setEditMetaStatus] = useState<'IN_PROGRESS' | 'COMPLETED_PASS' | 'COMPLETED_FAIL' | 'REWORK'>('COMPLETED_PASS');
  const [editMetaNotes, setEditMetaNotes] = useState<string>('');
  const [editMetaRoute, setEditMetaRoute] = useState<ProcessRouteType>('UNDER_FILL_VAC_BAKE');

  // Edit Step Temp State
  const [editStepData, setEditStepData] = useState<Partial<WorkpieceStep>>({});

  // Sync active serial with context trigger
  useEffect(() => {
    if (selectedTraceabilitySerial) {
      setActiveSerial(selectedTraceabilitySerial);
      setSearchQuery('');
    }
  }, [selectedTraceabilitySerial, showTraceabilityModal]);

  // Current active workpiece record
  const currentRecord = useMemo<WorkpieceRecord>(() => {
    if (!activeSerial) return workpieces[0] || getWorkpieceBySerial('WP-2026-90412');
    const match = workpieces.find((w) => w.serialId.toUpperCase() === activeSerial.trim().toUpperCase());
    return match || getWorkpieceBySerial(activeSerial);
  }, [activeSerial, workpieces, getWorkpieceBySerial]);

  // Detect process route type helper
  const getRecordRouteType = (record: WorkpieceRecord): ProcessRouteType => {
    if (record.processRouteType) return record.processRouteType;
    const hasVacuum = record.stationSteps.some((s) => s.stationCategory === 'oven-vacuum');
    const firstDispenser = record.stationSteps.find((s) => s.stationCategory === 'dispensing');
    if (firstDispenser) {
      const match = firstDispenser.stationId.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 1;
      if (num <= 6) return 'TOP_FILL_BAKE_DIRECT';
      return 'UNDER_FILL_VAC_BAKE';
    }
    return hasVacuum ? 'UNDER_FILL_VAC_BAKE' : 'TOP_FILL_BAKE_DIRECT';
  };

  const activeRouteType = getRecordRouteType(currentRecord);

  // Filtered workpieces list based on search and route category
  const filteredWorkpieces = useMemo(() => {
    return workpieces.filter((w) => {
      const rType = getRecordRouteType(w);
      // Route filter
      if (routeFilter === 'UNDER_FILL' && rType !== 'UNDER_FILL_VAC_BAKE') return false;
      if (routeFilter === 'TOP_FILL' && rType !== 'TOP_FILL_BAKE_DIRECT') return false;
      if (routeFilter === 'IN_PROGRESS' && w.overallStatus !== 'IN_PROGRESS') return false;
      if (routeFilter === 'COMPLETED' && w.overallStatus !== 'COMPLETED_PASS') return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        w.serialId.toLowerCase().includes(q) ||
        w.partModel.toLowerCase().includes(q) ||
        w.lotNumber.toLowerCase().includes(q) ||
        w.currentStationName.toLowerCase().includes(q) ||
        w.currentStationId.toLowerCase().includes(q) ||
        (w.notes && w.notes.toLowerCase().includes(q)) ||
        w.stationSteps.some(
          (s) =>
            s.stationId.toLowerCase().includes(q) ||
            s.stationName.toLowerCase().includes(q) ||
            s.operatorId.toLowerCase().includes(q)
        )
      );
    });
  }, [searchQuery, routeFilter, workpieces]);

  if (!showTraceabilityModal) return null;

  const handleStartEditMeta = () => {
    setEditMetaModel(currentRecord.partModel);
    setEditMetaLot(currentRecord.lotNumber);
    setEditMetaStatus(currentRecord.overallStatus);
    setEditMetaNotes(currentRecord.notes || '');
    setEditMetaRoute(activeRouteType);
    setIsEditingMeta(true);
  };

  const handleSaveMeta = () => {
    updateWorkpiece(currentRecord.serialId, {
      partModel: editMetaModel,
      lotNumber: editMetaLot,
      overallStatus: editMetaStatus,
      processRouteType: editMetaRoute,
      notes: editMetaNotes
    });
    setIsEditingMeta(false);
  };

  const handleStartEditStep = (step: WorkpieceStep) => {
    setEditingStepIndex(step.stepNumber);
    setEditStepData({ ...step, parameters: { ...step.parameters } });
  };

  const handleSaveStep = () => {
    if (editingStepIndex === null) return;
    updateWorkpieceStep(currentRecord.serialId, editingStepIndex, editStepData);
    setEditingStepIndex(null);
    setEditStepData({});
  };

  const handleCreateWorkpiece = () => {
    if (!newSerialInput.trim()) return;
    const cleanSerial = newSerialInput.trim().toUpperCase();
    const newRecord = getWorkpieceBySerial(cleanSerial);
    newRecord.partModel = newModelInput;
    newRecord.lotNumber = newLotInput;
    newRecord.processRouteType = newRouteType;
    addWorkpiece(newRecord);
    setActiveSerial(cleanSerial);
    setIsCreatingNewWorkpiece(false);
    setNewSerialInput('');
  };

  const handleAddNewStepToRecord = () => {
    const stepNum = currentRecord.stationSteps.length + 1;
    const newStep: WorkpieceStep = {
      stepNumber: stepNum,
      stationCategory: 'dispensing',
      stationId: 'MC-08',
      stationName: 'Dispenser MC-08',
      timeIn: new Date().toLocaleTimeString('en-US', { hour12: false }),
      operatorId: 'OP-MANUAL',
      status: 'PASS',
      parameters: {
        cycleTimeSec: 3.5
      },
      notes: 'Manually appended station step'
    };
    addWorkpieceStep(currentRecord.serialId, newStep);
  };

  const handleJumpToStation = (stationCategory: StationCategory, stationId: string) => {
    closeTraceabilityModal();
    if (stationCategory === 'dispensing') {
      setSelectedMachineId(stationId);
      navigate('machine-detail', stationId);
    } else if (stationCategory === 'oven-vacuum') {
      navigate('vacuum-process');
    } else if (stationCategory === 'oven-bake') {
      navigate('bake-process');
    } else if (stationCategory === 'fvmi') {
      setSelectedMachineId(stationId);
      navigate('fvmi-detail', stationId);
    } else if (stationCategory === 'aoi' || stationCategory === 'packout') {
      const aoiId = normalizeAoiMachineId(stationId);
      navigate('packout-aoi', aoiId);
    } else if (stationCategory === 'xray' || stationCategory === 'ocr') {
      const xrayId = normalizeXrayMachineId(stationId);
      navigate('packout-xray', xrayId);
    } else {
      navigate('main-floor');
    }
  };

  const getCategoryIcon = (category: StationCategory) => {
    switch (category) {
      case 'dispensing':
        return <Zap className="w-4 h-4 text-sky-500" />;
      case 'oven-vacuum':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'oven-bake':
        return <Flame className="w-4 h-4 text-rose-500" />;
      case 'fvmi':
        return <Camera className="w-4 h-4 text-emerald-500" />;
      case 'aoi':
      case 'packout':
        return <PackageCheck className="w-4 h-4 text-purple-500" />;
      case 'xray':
      case 'ocr':
        return <Barcode className="w-4 h-4 text-pink-500" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'COMPLETED_PASS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            PASS
          </span>
        );
      case 'IN_PROGRESS':
      case 'IN_PROCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            IN PROCESS
          </span>
        );
      case 'REWORK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            REWORK
          </span>
        );
      case 'FAIL':
      case 'COMPLETED_FAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            FAIL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-xs select-none overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-sky-200">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Workpiece Lineage & Station Traceability
                </h2>
                <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200 uppercase">
                  Genealogy Tracker
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Track full station history, parameters, operator IDs, and route rules (Under Fill ➔ Vac ➔ Bake vs Top Fill ➔ Bake Direct)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWorkpieceListDrawer(!showWorkpieceListDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showWorkpieceListDrawer
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Browse All Workpieces ({workpieces.length})</span>
            </button>

            <button
              onClick={closeTraceabilityModal}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Route Filter & Quick Search Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Quick Route Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Route:
            </span>
            <button
              onClick={() => setRouteFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                routeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Routes ({workpieces.length})
            </button>
            <button
              onClick={() => setRouteFilter('UNDER_FILL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                routeFilter === 'UNDER_FILL'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Under Fill (Vac ➔ Bake)
            </button>
            <button
              onClick={() => setRouteFilter('TOP_FILL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                routeFilter === 'TOP_FILL'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-white text-sky-800 border border-sky-200 hover:bg-sky-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
              Top Fill (Bake Direct)
            </button>
            <button
              onClick={() => setRouteFilter('IN_PROGRESS')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                routeFilter === 'IN_PROGRESS'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              In Process
            </button>
          </div>

          {/* Search Box & New Part Button */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search serial, lot, station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setActiveSerial(searchQuery.trim().toUpperCase());
                  }
                }}
                className="w-full pl-8 pr-16 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setActiveSerial(searchQuery.trim().toUpperCase())}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold rounded-md cursor-pointer"
                >
                  Go
                </button>
              )}
            </div>

            <button
              onClick={() => setIsCreatingNewWorkpiece(!isCreatingNewWorkpiece)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Part</span>
            </button>
          </div>
        </div>

        {/* Quick Workpiece Carousel / Selector Chips */}
        <div className="px-6 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Select Workpiece:
          </span>
          {filteredWorkpieces.map((w) => {
            const isSelected = activeSerial.toUpperCase() === w.serialId.toUpperCase();
            const rType = getRecordRouteType(w);
            const isUf = rType === 'UNDER_FILL_VAC_BAKE';
            return (
              <button
                key={w.serialId}
                onClick={() => {
                  setActiveSerial(w.serialId);
                }}
                className={`group flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? isUf
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-sky-600 text-white border-sky-700 shadow-xs'
                    : isUf
                    ? 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
                    : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-50'
                }`}
              >
                <span>{w.serialId}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-sans font-bold uppercase ${
                    isSelected
                      ? 'bg-black/20 text-white'
                      : isUf
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {isUf ? 'UF: Vac➔Bake' : 'TF: Bake Direct'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Full Workpiece Directory Drawer */}
        {showWorkpieceListDrawer && (
          <div className="bg-slate-50 border-b border-slate-300 p-4 max-h-56 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-600" />
                Workpiece Master Directory ({filteredWorkpieces.length} items)
              </span>
              <button
                onClick={() => setShowWorkpieceListDrawer(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Close Drawer
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredWorkpieces.map((w) => {
                const rType = getRecordRouteType(w);
                const isUf = rType === 'UNDER_FILL_VAC_BAKE';
                const isSelected = activeSerial.toUpperCase() === w.serialId.toUpperCase();
                return (
                  <div
                    key={w.serialId}
                    onClick={() => {
                      setActiveSerial(w.serialId);
                      setShowWorkpieceListDrawer(false);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300'
                        : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{w.serialId}</span>
                      {getStatusBadge(w.overallStatus)}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span className="font-mono">{w.partModel}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isUf ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {isUf ? 'UF: Vac ➔ Bake' : 'TF: Bake Direct'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate mt-1">
                      📍 {w.currentStationName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add New Workpiece Inline Form */}
        {isCreatingNewWorkpiece && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-emerald-900 uppercase">
              Register New Workpiece:
            </span>
            <input
              type="text"
              placeholder="Serial ID (e.g. WP-2026-99101)"
              value={newSerialInput}
              onChange={(e) => setNewSerialInput(e.target.value)}
              className="px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500"
            />
            <select
              value={newRouteType}
              onChange={(e) => setNewRouteType(e.target.value as ProcessRouteType)}
              className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-900"
            >
              <option value="UNDER_FILL_VAC_BAKE">Under Fill Flow (Dispense ➔ Vac ➔ Bake ➔ FVMI ➔ Pack)</option>
              <option value="TOP_FILL_BAKE_DIRECT">Top Fill Flow (Dispense ➔ Bake Direct ➔ FVMI ➔ Pack)</option>
            </select>
            <select
              value={newModelInput}
              onChange={(e) => setNewModelInput(e.target.value)}
              className="px-2 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-900"
            >
              <option value="504-2187">Model 504-2187</option>
              <option value="504-2224">Model 504-2224</option>
              <option value="504-2268">Model 504-2268</option>
              <option value="504-2154">Model 504-2154</option>
              <option value="504-2454">Model 504-2454</option>
            </select>
            <input
              type="text"
              placeholder="Lot Number"
              value={newLotInput}
              onChange={(e) => setNewLotInput(e.target.value)}
              className="px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-900"
            />
            <button
              onClick={handleCreateWorkpiece}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
            >
              Save Part
            </button>
            <button
              onClick={() => setIsCreatingNewWorkpiece(false)}
              className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* Workpiece Identity & Process Flow Banner */}
          <div
            className={`rounded-2xl p-5 border-l-4 shadow-xs flex flex-col gap-4 border ${
              activeRouteType === 'UNDER_FILL_VAC_BAKE'
                ? 'bg-amber-50/40 border-amber-200 border-l-amber-500'
                : 'bg-sky-50/40 border-sky-200 border-l-sky-500'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                    {currentRecord.serialId}
                  </span>
                  {getStatusBadge(currentRecord.overallStatus)}
                  <span className="text-xs font-mono font-bold bg-white text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    Model: {currentRecord.partModel}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                    LOT: {currentRecord.lotNumber}
                  </span>
                </div>

                {/* Route Rule Explanation */}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                      activeRouteType === 'UNDER_FILL_VAC_BAKE'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-sky-100 text-sky-900 border border-sky-300'
                    }`}
                  >
                    {activeRouteType === 'UNDER_FILL_VAC_BAKE' ? (
                      <>
                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                        UNDER FILL ROUTE: Dispensing ➔ Vacuum Degas ➔ Thermal Bake ➔ FVMI ➔ Pack Out
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-sky-600" />
                        TOP FILL ROUTE: Dispensing ➔ Thermal Bake Direct (No Vac) ➔ FVMI ➔ Pack Out
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  {currentRecord.notes || 'Station lineage tracking active.'}
                </p>
              </div>

              {/* Station Stats & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-right shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current Station
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                    📍 {currentRecord.currentStationName}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-right shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Stations
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {currentRecord.stationSteps.length} Steps
                  </span>
                </div>

                <button
                  onClick={handleStartEditMeta}
                  className="p-2 text-slate-600 hover:text-sky-600 hover:bg-white rounded-xl border border-slate-200 bg-white transition-colors cursor-pointer shadow-2xs"
                  title="Edit Metadata"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Process Route Pipeline Flowchart */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Manufacturing Process Progression Lineage:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {currentRecord.stationSteps.map((step, idx) => {
                  const isCurrent = step.stationId === currentRecord.currentStationId || idx === currentRecord.stationSteps.length - 1;
                  const isPass = step.status === 'PASS';
                  const isRework = step.status === 'REWORK';
                  const isInProcess = step.status === 'IN_PROCESS';

                  return (
                    <React.Fragment key={step.stepNumber}>
                      <div
                        onClick={() => handleJumpToStation(step.stationCategory, step.stationId)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono transition-all cursor-pointer ${
                          isPass
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                            : isInProcess
                            ? 'bg-sky-50 text-sky-900 border-sky-400 ring-2 ring-sky-300 animate-pulse'
                            : isRework
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-rose-50 text-rose-900 border-rose-300'
                        }`}
                        title={`Click to view live ${step.stationName}`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white border border-current text-[10px] font-black flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs leading-none">{step.stationId}</span>
                          <span className="text-[10px] opacity-75 truncate max-w-[120px]">
                            {step.stationCategory}
                          </span>
                        </div>
                        {isPass ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                        ) : isInProcess ? (
                          <Clock className="w-3.5 h-3.5 text-sky-600 ml-1" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 ml-1" />
                        )}
                      </div>

                      {idx < currentRecord.stationSteps.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}

                {/* If Top Fill, show skipped Vacuum Oven badge for clarity */}
                {activeRouteType === 'TOP_FILL_BAKE_DIRECT' && (
                  <div className="ml-auto text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg border border-dashed border-slate-300 flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400" />
                    <span>Vacuum Degas: Bypassed (Direct Bake Route)</span>
                  </div>
                )}

                {/* If Under Fill, show Vacuum Required badge */}
                {activeRouteType === 'UNDER_FILL_VAC_BAKE' && (
                  <div className="ml-auto text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>Vacuum Degas: Required before Bake</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Meta Form Modal Drawer */}
          {isEditingMeta && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-sky-600" />
                  Edit Workpiece Metadata & Routing
                </h4>
                <button
                  onClick={() => setIsEditingMeta(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Part Model
                  </label>
                  <input
                    type="text"
                    value={editMetaModel}
                    onChange={(e) => setEditMetaModel(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    value={editMetaLot}
                    onChange={(e) => setEditMetaLot(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Process Route
                  </label>
                  <select
                    value={editMetaRoute}
                    onChange={(e) => setEditMetaRoute(e.target.value as ProcessRouteType)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="UNDER_FILL_VAC_BAKE">Under Fill (Vac ➔ Bake)</option>
                    <option value="TOP_FILL_BAKE_DIRECT">Top Fill (Bake Direct)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Overall Status
                  </label>
                  <select
                    value={editMetaStatus}
                    onChange={(e) => setEditMetaStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="COMPLETED_PASS">COMPLETED_PASS</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="REWORK">REWORK</option>
                    <option value="COMPLETED_FAIL">COMPLETED_FAIL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Traceability Notes
                </label>
                <input
                  type="text"
                  value={editMetaNotes}
                  onChange={(e) => setEditMetaNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingMeta(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMeta}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Sequential Timeline of Stations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                Detailed Station History & Telemetry Logs
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {currentRecord.stationSteps.length} Stations Traversed
                </span>
              </h3>

              <button
                onClick={handleAddNewStepToRecord}
                className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Station Step</span>
              </button>
            </div>

            {/* Steps Timeline Flow */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {currentRecord.stationSteps.map((step, idx) => {
                const isEditingThis = editingStepIndex === step.stepNumber;
                return (
                  <div key={step.stepNumber} className="relative group">
                    {/* Node Circle */}
                    <div
                      className={`absolute -left-6 top-3 w-7 h-7 rounded-full border-2 flex items-center justify-center bg-white shadow-xs z-10 ${
                        step.status === 'PASS'
                          ? 'border-emerald-500 text-emerald-600'
                          : step.status === 'IN_PROCESS'
                          ? 'border-sky-500 text-sky-600 animate-pulse'
                          : step.status === 'REWORK'
                          ? 'border-amber-500 text-amber-600'
                          : 'border-rose-500 text-rose-600'
                      }`}
                    >
                      <span className="text-xs font-mono font-black">{step.stepNumber}</span>
                    </div>

                    {/* Step Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-sky-300 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            {getCategoryIcon(step.stationCategory)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                {step.stationName}
                              </span>
                              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                {step.stationId}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Time In: {step.timeIn} {step.timeOut ? `➔ Time Out: ${step.timeOut}` : ' (Running)'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(step.status)}

                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-700">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {step.operatorId}
                          </div>

                          <button
                            onClick={() => handleJumpToStation(step.stationCategory, step.stationId)}
                            className="flex items-center gap-1 px-2 py-1 text-sky-600 hover:bg-sky-50 rounded-lg border border-sky-200 text-xs font-bold transition-colors cursor-pointer"
                            title="Open Live Machine View"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Live Station</span>
                          </button>

                          <button
                            onClick={() => handleStartEditStep(step)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Step"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Inline Step Editor */}
                      {isEditingThis ? (
                        <div className="p-3 bg-sky-50 rounded-xl space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                Station ID & Name
                              </label>
                              <input
                                type="text"
                                value={editStepData.stationName || ''}
                                onChange={(e) => setEditStepData({ ...editStepData, stationName: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                Operator ID
                              </label>
                              <input
                                type="text"
                                value={editStepData.operatorId || ''}
                                onChange={(e) => setEditStepData({ ...editStepData, operatorId: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                Status
                              </label>
                              <select
                                value={editStepData.status || 'PASS'}
                                onChange={(e) => setEditStepData({ ...editStepData, status: e.target.value as any })}
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                              >
                                <option value="PASS">PASS</option>
                                <option value="IN_PROCESS">IN_PROCESS</option>
                                <option value="REWORK">REWORK</option>
                                <option value="FAIL">FAIL</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingStepIndex(null)}
                              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveStep}
                              className="px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded shadow-xs"
                            >
                              Save Step
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Parameters Grid */
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Process Telemetry & Parameters:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                            {Object.entries(step.parameters || {}).map(([key, val]) => (
                              <div key={key} className="bg-white border border-slate-200 rounded-lg p-2 shadow-2xs">
                                <span className="text-[10px] font-semibold text-slate-400 block capitalize truncate">
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </span>
                                <span className="font-mono font-bold text-slate-800 block truncate">
                                  {String(val)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {step.notes && (
                            <p className="text-xs text-slate-500 font-medium italic mt-2">
                              💬 {step.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Traceability Lineage connected to live factory telemetry.</span>
          </div>

          <button
            onClick={closeTraceabilityModal}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Close Traceability Inspector
          </button>
        </div>

      </div>
    </div>
  );
};

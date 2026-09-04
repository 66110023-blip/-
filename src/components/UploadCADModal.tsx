import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductionLine, ProductionLineLayout, MachineStatus } from '../types';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Check,
  Sliders,
  Trash2,
  Layers,
  Sparkles,
  Info,
  FolderOpen,
  Edit3,
  Copy,
  Plus,
  ArrowLeft,
  Save,
  AlertTriangle,
  Activity,
  Cpu,
  RefreshCw,
  ExternalLink,
  Flame,
  Droplets,
  Eye,
  User,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
} from 'lucide-react';

interface UploadCADModalProps {
  isOpen: boolean;
  onClose: () => void;
  customImageUrl?: string;
  imageOpacity?: number;
  onImageChange?: (url: string | undefined) => void;
  onOpacityChange?: (opacity: number) => void;
}

export const UploadCADModal: React.FC<UploadCADModalProps> = ({
  isOpen,
  onClose,
  customImageUrl: propCustomImageUrl,
  imageOpacity: propImageOpacity,
  onImageChange,
  onOpacityChange,
}) => {
  const {
    uploadedLayouts,
    activeLayoutId,
    activeLayoutUrl,
    activeLayoutOpacity,
    uploadProductionLineLayout,
    updateProductionLineLayout,
    duplicateProductionLineLayout,
    deleteProductionLineLayout,
    clearAllCustomLayouts,
    setActiveLayoutPreset,
    setCustomFloorImageUrl,
    setCustomFloorImageOpacity,
    resetLayoutToDefault,
    machines,
    ovenUnits,
    updateMachineModel,
    updateMachineStatus,
    updateMachineFull,
    updateOvenModel,
    updateOvenStatus,
    updateOvenFull,
    navigate,
    setSelectedMachineId,
  } = useFactory();

  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'edit'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [layoutTitle, setLayoutTitle] = useState('');
  const [layoutDescription, setLayoutDescription] = useState('');
  const [lineScope, setLineScope] = useState<ProductionLine>('ALL');
  const [fileDetails, setFileDetails] = useState<{
    fileName: string;
    fileSize: string;
    dimensions?: { width: number; height: number };
  } | null>(null);

  // Edit State
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLineScope, setEditLineScope] = useState<ProductionLine>('ALL');
  const [editDataUrl, setEditDataUrl] = useState<string | null>(null);
  const [editFileDetails, setEditFileDetails] = useState<{
    fileName: string;
    fileSize: string;
    dimensions?: { width: number; height: number };
  } | null>(null);

  // Batch Line Synchronizer State
  const [batchModelInput, setBatchModelInput] = useState<string>('MODEL 504-2224');
  const [batchModelToast, setBatchModelToast] = useState<string | null>(null);
  const [quickSearchTerm, setQuickSearchTerm] = useState<string>('');

  // Delete Confirmation State
  const [deletingLayout, setDeletingLayout] = useState<ProductionLineLayout | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const currentActiveUrl = propCustomImageUrl !== undefined ? propCustomImageUrl : activeLayoutUrl;
  const currentOpacity = propImageOpacity !== undefined ? propImageOpacity : activeLayoutOpacity;

  // Helper to retrieve machines and ovens that belong to a specific production line scope
  const getLineEquipment = (scope: ProductionLine) => {
    let filteredMachines = machines;
    let filteredOvens = ovenUnits;

    if (scope === 'L1') {
      filteredMachines = machines.filter((m) => m.id === 'MC-01' || m.id === 'MC-02');
      filteredOvens = ovenUnits.filter((o) => o.id === 'bake-1' || o.id === 'oven-1');
    } else if (scope === 'L2') {
      filteredMachines = machines.filter((m) => m.id === 'MC-03' || m.id === 'MC-04');
      filteredOvens = ovenUnits.filter((o) => o.id === 'bake-2' || o.id === 'oven-2');
    } else if (scope === 'L3') {
      filteredMachines = machines.filter((m) => m.id === 'MC-05' || m.id === 'MC-06');
      filteredOvens = ovenUnits.filter((o) => o.id === 'bake-3' || o.id === 'oven-3');
    } else if (scope === 'L4') {
      filteredMachines = machines.filter((m) => m.id === 'MC-07' || m.id === 'MC-08');
      filteredOvens = ovenUnits.filter((o) => o.id === 'bake-4' || o.id === 'oven-4');
    } else if (scope === 'L5') {
      filteredMachines = machines.filter((m) => m.id === 'MC-09');
      filteredOvens = ovenUnits.filter((o) => o.id === 'bake-5' || o.id === 'oven-5');
    } else if (scope === 'L6') {
      filteredMachines = [];
      filteredOvens = ovenUnits.filter((o) => o.id === 'oven-6');
    }

    const runningMachinesCount = filteredMachines.filter((m) => m.status === 'RUNNING').length;
    const runningOvensCount = filteredOvens.filter((o) => o.status === 'RUNNING').length;
    const totalUnits = filteredMachines.length + filteredOvens.length;
    const runningTotal = runningMachinesCount + runningOvensCount;
    const stoppedTotal = totalUnits - runningTotal;

    const totalUph = filteredMachines.reduce((sum, m) => sum + (m.uph || 0), 0);
    const avgOee = filteredMachines.length > 0
      ? filteredMachines.reduce((sum, m) => sum + (m.oeePercent || 95), 0) / filteredMachines.length
      : 96.5;

    const activeModels = Array.from(
      new Set([
        ...filteredMachines.map((m) => m.runningModel).filter(Boolean),
        ...filteredOvens.map((o) => o.runningModel).filter(Boolean),
      ])
    ) as string[];

    return {
      machines: filteredMachines,
      ovens: filteredOvens,
      totalUnits,
      runningTotal,
      stoppedTotal,
      totalUph,
      avgOee,
      activeModels,
    };
  };

  const handleApplyBatchModelToLine = (modelToApply: string) => {
    if (!modelToApply.trim()) return;
    const targetModel = modelToApply.trim();
    const eq = getLineEquipment(editLineScope);
    
    eq.machines.forEach((m) => {
      updateMachineModel(m.id, targetModel);
    });
    eq.ovens.forEach((o) => {
      updateOvenModel(o.id, targetModel);
    });

    setBatchModelToast(`Updated running model to "${targetModel}" across ${eq.totalUnits} units on ${editLineScope === 'ALL' ? 'all lines' : editLineScope}!`);
    setTimeout(() => setBatchModelToast(null), 3000);
  };

  useEffect(() => {
    if (isOpen) {
      setSaveSuccessMessage(null);
      setDeletingLayout(null);
      setShowDeleteAllConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFile = (file: File, forEdit: boolean = false) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WebP, etc.).');
      return;
    }

    const fileSizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result as string;
        const img = new Image();
        img.onload = () => {
          const details = {
            fileName: file.name,
            fileSize: fileSizeStr,
            dimensions: { width: img.width, height: img.height },
          };

          if (forEdit) {
            setEditDataUrl(dataUrl);
            setEditFileDetails(details);
          } else {
            setPreviewDataUrl(dataUrl);
            setFileDetails(details);
            if (!layoutTitle) {
              const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
              setLayoutTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
            }
          }
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyNewLayout = (setAsDefault: boolean = true) => {
    if (!previewDataUrl) return;

    const title = layoutTitle.trim() || `Production Layout (${new Date().toLocaleDateString()})`;
    uploadProductionLineLayout({
      name: title,
      dataUrl: previewDataUrl,
      description: layoutDescription.trim() || undefined,
      lineScope: lineScope,
      fileSize: fileDetails?.fileSize,
      dimensions: fileDetails?.dimensions,
      setAsActive: setAsDefault,
    });

    if (onImageChange) {
      onImageChange(previewDataUrl);
    }

    setSaveSuccessMessage(`New layout "${title}" uploaded and activated successfully!`);
    setTimeout(() => {
      setSaveSuccessMessage(null);
      setPreviewDataUrl(null);
      setLayoutTitle('');
      setLayoutDescription('');
      setFileDetails(null);
      setActiveTab('library');
    }, 1000);
  };

  // Start Editing Layout
  const startEditLayout = (layout: ProductionLineLayout) => {
    setEditingLayoutId(layout.id);
    setEditTitle(layout.name);
    setEditDescription(layout.description || '');
    setEditLineScope(layout.lineScope || 'ALL');
    setEditDataUrl(layout.dataUrl);
    setEditFileDetails(
      layout.dimensions
        ? {
            fileName: 'Current Blueprint Image',
            fileSize: layout.fileSize || 'Standard',
            dimensions: layout.dimensions,
          }
        : null
    );
    setActiveTab('edit');
  };

  // Save Edited Layout
  const handleSaveEditLayout = () => {
    if (!editingLayoutId) return;

    const updates: Partial<ProductionLineLayout> = {
      name: editTitle.trim() || 'Updated Layout',
      description: editDescription.trim() || undefined,
      lineScope: editLineScope,
    };

    if (editDataUrl) {
      updates.dataUrl = editDataUrl;
    }
    if (editFileDetails) {
      updates.fileSize = editFileDetails.fileSize;
      updates.dimensions = editFileDetails.dimensions;
    }

    updateProductionLineLayout(editingLayoutId, updates);

    // If currently active, refresh canvas image
    if (activeLayoutId === editingLayoutId && editDataUrl && onImageChange) {
      onImageChange(editDataUrl);
    }

    setSaveSuccessMessage(`Layout "${editTitle}" updated successfully!`);
    setTimeout(() => {
      setSaveSuccessMessage(null);
      setActiveTab('library');
      setEditingLayoutId(null);
    }, 900);
  };

  // Duplicate Layout
  const handleDuplicate = (layout: ProductionLineLayout) => {
    const newId = duplicateProductionLineLayout(layout.id);
    if (newId) {
      setSaveSuccessMessage(`Duplicated layout as "${layout.name} (Copy)"`);
      setTimeout(() => setSaveSuccessMessage(null), 1500);
    }
  };

  // Confirm Delete Layout
  const handleConfirmDelete = () => {
    if (!deletingLayout) return;
    const name = deletingLayout.name;
    const isCurrentActive = activeLayoutId === deletingLayout.id;
    deleteProductionLineLayout(deletingLayout.id);
    setDeletingLayout(null);
    if (editingLayoutId === deletingLayout.id) {
      setEditingLayoutId(null);
      setActiveTab('library');
    }
    if (isCurrentActive && onImageChange) {
      onImageChange(undefined);
    }
    setSaveSuccessMessage(`Layout "${name}" deleted successfully.`);
    setTimeout(() => setSaveSuccessMessage(null), 2000);
  };

  // Confirm Delete All Custom Layouts
  const handleConfirmDeleteAll = () => {
    clearAllCustomLayouts();
    setShowDeleteAllConfirm(false);
    setEditingLayoutId(null);
    if (onImageChange) {
      onImageChange(undefined);
    }
    setSaveSuccessMessage('All custom layouts deleted. Reverted to default blueprint.');
    setTimeout(() => setSaveSuccessMessage(null), 2000);
  };

  const handleSelectExisting = (layout: ProductionLineLayout) => {
    setActiveLayoutPreset(layout.id);
    if (onImageChange) {
      onImageChange(layout.dataUrl);
    }
    setSaveSuccessMessage(`Switched active layout to "${layout.name}"`);
    setTimeout(() => {
      setSaveSuccessMessage(null);
      onClose();
    }, 800);
  };

  const handleResetToBuiltin = () => {
    resetLayoutToDefault();
    if (onImageChange) {
      onImageChange(undefined);
    }
    setSaveSuccessMessage('Restored to default Vector CAD blueprint.');
    setTimeout(() => {
      setSaveSuccessMessage(null);
      onClose();
    }, 800);
  };

  const handleOpacityChange = (val: number) => {
    setCustomFloorImageOpacity(val);
    if (onOpacityChange) {
      onOpacityChange(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-sky-500/20 border border-sky-400/30 rounded-xl">
              <UploadCloud className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Production Line Layout Management
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-sky-950/80 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                  <Activity className="w-3 h-3 text-sky-400 animate-pulse" />
                  Live Factory Telemetry Linked
                </span>
              </div>
              <p className="text-xs text-sky-200 font-medium">
                Upload, edit, duplicate, and link factory equipment & telemetry data with your layouts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#e2e8f0] px-4 bg-[#f8fafc] overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('upload');
              setEditingLayoutId(null);
            }}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#0284c7] text-[#0284c7] bg-white'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Layout</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('library');
              setEditingLayoutId(null);
            }}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'border-[#0284c7] text-[#0284c7] bg-white'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Layout Library & Overview ({uploadedLayouts.length + 1})</span>
          </button>

          <button
            onClick={() => {
              if (!editingLayoutId) {
                // If no layout is actively selected for edit, start editing current active or first layout
                const target = uploadedLayouts.find((l) => l.id === activeLayoutId) || uploadedLayouts[0];
                if (target) {
                  startEditLayout(target);
                } else {
                  setEditingLayoutId('default');
                  setEditTitle('Default Factory CAD Blueprint');
                  setEditLineScope('ALL');
                  setEditDescription('Baseline vector production blueprint');
                  setActiveTab('edit');
                }
              } else {
                setActiveTab('edit');
              }
            }}
            className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-[#64748b] hover:text-amber-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>Customize Layout & Link Data</span>
          </button>
        </div>

        {/* Success Banner */}
        {saveSuccessMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {saveSuccessMessage}
            </span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: ADD NEW LAYOUT */}
          {activeTab === 'upload' && (
            <>
              {!previewDataUrl ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-[#0284c7] bg-sky-50/70 scale-[0.99]'
                      : 'border-[#cbd5e1] hover:border-sky-400 bg-[#f8fafc] hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-sky-100 text-[#0284c7] flex items-center justify-center shadow-xs">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#0f172a] block">
                        Click or drag & drop CAD layout image here
                      </span>
                      <span className="text-xs text-[#64748b] mt-0.5 block">
                        Supports PNG, JPG, JPEG, SVG, or WebP high-resolution blueprints
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#cbd5e1] rounded-full text-[11px] font-mono text-[#475569]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Recommended resolution: 1920×1080 (16:9 aspect ratio)</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Uploaded Preview & Metadata Inputs */
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-[#cbd5e1] bg-slate-900 group">
                    <img
                      src={previewDataUrl}
                      alt="Uploaded CAD Preview"
                      className="w-full h-44 object-contain"
                    />
                    <div className="absolute top-2 right-2 flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setPreviewDataUrl(null);
                          setFileDetails(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Change Image</span>
                      </button>
                    </div>
                    {fileDetails && (
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-2">
                        <span>{fileDetails.fileName}</span>
                        <span>•</span>
                        <span>{fileDetails.fileSize}</span>
                        {fileDetails.dimensions && (
                          <>
                            <span>•</span>
                            <span>
                              {fileDetails.dimensions.width}×{fileDetails.dimensions.height}px
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Form fields for layout metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#334155] uppercase tracking-wider block">
                        Layout Title
                      </label>
                      <input
                        type="text"
                        value={layoutTitle}
                        onChange={(e) => setLayoutTitle(e.target.value)}
                        placeholder="e.g. Plant Line 1-6 Master Layout"
                        className="w-full px-3 py-2 text-xs font-semibold bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:bg-white focus:border-[#0284c7] focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#334155] uppercase tracking-wider block">
                        Line Scope
                      </label>
                      <select
                        value={lineScope}
                        onChange={(e) => setLineScope(e.target.value as ProductionLine)}
                        className="w-full px-3 py-2 text-xs font-bold bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:bg-white focus:border-[#0284c7] focus:outline-hidden"
                      >
                        <option value="ALL">Entire Facility (Lines L1–L6)</option>
                        <option value="L6">Line 6 (SMT & Dispensing)</option>
                        <option value="L5">Line 5 (High Speed)</option>
                        <option value="L4">Line 4 (Precision Underfill)</option>
                        <option value="L3">Line 3 (Dual Oven)</option>
                        <option value="L2">Line 2 (Standard)</option>
                        <option value="L1">Line 1 (Prototype / NPI)</option>
                      </select>
                    </div>
                  </div>

                  {/* Linked Equipment Preview for this Scope */}
                  {(() => {
                    const scopeEq = getLineEquipment(lineScope);
                    return (
                      <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                          <span className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-[#0284c7]" />
                            <span>Factory Equipment Linked to this Scope:</span>
                          </span>
                          <span className="font-mono text-[11px] bg-white text-[#0284c7] px-2.5 py-0.5 rounded-md border border-sky-200 shadow-2xs font-bold">
                            {scopeEq.totalUnits} Units ({scopeEq.runningTotal} Running • {scopeEq.totalUph.toLocaleString()} UPH)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {scopeEq.machines.map((m) => (
                            <span
                              key={m.id}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 border ${
                                m.status === 'RUNNING'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-rose-50 text-rose-700 border-rose-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  m.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                                }`}
                              />
                              {m.id} ({m.runningModel || 'No Model'})
                            </span>
                          ))}
                          {scopeEq.ovens.map((o) => (
                            <span
                              key={o.id}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 border ${
                                o.status === 'RUNNING'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-rose-50 text-rose-700 border-rose-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  o.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                                }`}
                              />
                              {o.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#334155] uppercase tracking-wider block">
                      Description / Revision Notes
                    </label>
                    <input
                      type="text"
                      value={layoutDescription}
                      onChange={(e) => setLayoutDescription(e.target.value)}
                      placeholder="e.g. Layout calibrated with 2026 vacuum curing ovens added"
                      className="w-full px-3 py-2 text-xs font-medium bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:bg-white focus:border-[#0284c7] focus:outline-hidden"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        setPreviewDataUrl(null);
                        setFileDetails(null);
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#475569] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleApplyNewLayout(true)}
                      className="px-5 py-2.5 bg-[#0284c7] hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save & Activate Layout</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Opacity Control for Active Layout & Remove Active Layout */}
              {currentActiveUrl && (
                <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3.5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-[#0284c7]" />
                      <span className="text-xs font-bold text-[#0f172a]">
                        Floor Underlay Image Opacity
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0284c7]">
                      {Math.round(currentOpacity * 100)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={currentOpacity}
                    onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                    className="w-full accent-[#0284c7] cursor-pointer"
                  />

                  <div className="pt-1 flex items-center justify-between border-t border-[#e2e8f0]">
                    <span className="text-[11px] text-[#64748b]">
                      Active Blueprint: <strong className="text-[#0f172a]">{uploadedLayouts.find(l => l.id === activeLayoutId)?.name || 'Custom CAD Layout'}</strong>
                    </span>
                    <button
                      onClick={handleResetToBuiltin}
                      className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Revert to default vector blueprint"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revert to Default Blueprint</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: LIBRARY (VIEW, EDIT, DUPLICATE, DELETE) */}
          {activeTab === 'library' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Available Plant Layouts
                </span>
                <div className="flex items-center space-x-2">
                  {uploadedLayouts.length > 0 && (
                    <button
                      onClick={() => setShowDeleteAllConfirm(true)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Delete all custom layouts"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete All ({uploadedLayouts.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="text-xs text-[#0284c7] hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Upload New
                  </button>
                </div>
              </div>

              {/* Delete All Confirmation Dialog */}
              {showDeleteAllConfirm && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Confirm delete all custom layouts ({uploadedLayouts.length} items)?</span>
                  </div>
                  <p className="text-[11px] text-rose-600">
                    All uploaded floor plans will be permanently removed. The system will revert to the default vector blueprint.
                  </p>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => setShowDeleteAllConfirm(false)}
                      className="px-3 py-1 bg-white border border-[#cbd5e1] text-[#475569] rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDeleteAll}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Delete All</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Single Delete confirmation modal overlay inside card */}
              {deletingLayout && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Confirm delete layout: &quot;{deletingLayout.name}&quot;?</span>
                  </div>
                  <p className="text-[11px] text-rose-600">
                    This layout will be permanently deleted from the library. If active, the system will switch to the default blueprint.
                  </p>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => setDeletingLayout(null)}
                      className="px-3 py-1 bg-white border border-[#cbd5e1] text-[#475569] rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Delete</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Default Vector Blueprint Item */}
              {(() => {
                const defaultEq = getLineEquipment('ALL');
                return (
                  <div
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      activeLayoutId === 'default'
                        ? 'bg-sky-50/80 border-[#0284c7] ring-1 ring-[#0284c7]/40 shadow-xs'
                        : 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-xs font-bold text-[#0f172a] truncate">
                            Default Factory CAD Blueprint
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                            Vector 6-Line (ALL)
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                          Standard factory layout connected to all 6 production lines (L1–L6).
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono mt-1 flex-wrap">
                          <span className="text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded">
                            🟢 {defaultEq.runningTotal} Running
                          </span>
                          {defaultEq.stoppedTotal > 0 && (
                            <span className="text-rose-700 font-bold bg-rose-100/70 px-1.5 py-0.5 rounded">
                              🔴 {defaultEq.stoppedTotal} Stopped
                            </span>
                          )}
                          <span className="text-[#475569]">• {defaultEq.totalUph.toLocaleString()} UPH</span>
                          <span className="text-[#475569]">• OEE: {defaultEq.avgOee.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      {activeLayoutId === 'default' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[#0284c7] bg-white px-2.5 py-1.5 rounded-lg border border-sky-200 shadow-2xs">
                          <Check className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={handleResetToBuiltin}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-[#cbd5e1] rounded-xl text-xs font-bold text-[#334155] transition-colors cursor-pointer"
                        >
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingLayoutId('default');
                          setEditTitle('Default Factory CAD Blueprint');
                          setEditLineScope('ALL');
                          setEditDescription('Baseline vector production blueprint');
                          setActiveTab('edit');
                        }}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Customize layout & link equipment"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Customize & Link</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Custom Uploaded Layouts list */}
              {uploadedLayouts.map((layout) => {
                const isActive = activeLayoutId === layout.id;
                const layoutEq = getLineEquipment(layout.lineScope || 'ALL');
                return (
                  <div
                    key={layout.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-sky-50/80 border-[#0284c7] ring-1 ring-[#0284c7]/40 shadow-xs'
                        : 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-16 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                        <img
                          src={layout.dataUrl}
                          alt={layout.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-xs font-bold text-[#0f172a] truncate">
                            {layout.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-[#0284c7]">
                            {layout.lineScope}
                          </span>
                        </div>
                        {layout.description && (
                          <p className="text-[10px] text-[#475569] truncate mt-0.5">
                            {layout.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 text-[10px] text-[#64748b] font-medium mt-0.5">
                          <span>{layout.uploadedAt}</span>
                          {layout.fileSize && (
                            <>
                              <span>•</span>
                              <span>{layout.fileSize}</span>
                            </>
                          )}
                          {layout.dimensions && (
                            <>
                              <span>•</span>
                              <span>
                                {layout.dimensions.width}×{layout.dimensions.height}px
                              </span>
                            </>
                          )}
                        </div>

                        {/* Linked Equipment Live Telemetry Tag */}
                        <div className="flex items-center gap-2 text-[10px] font-mono mt-1 flex-wrap">
                          <span className="text-sky-800 font-bold bg-sky-100/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-[#0284c7]" />
                            {layoutEq.totalUnits} Units Linked
                          </span>
                          <span className="text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded">
                            🟢 {layoutEq.runningTotal} Running
                          </span>
                          {layoutEq.stoppedTotal > 0 && (
                            <span className="text-rose-700 font-bold bg-rose-100/70 px-1.5 py-0.5 rounded">
                              🔴 {layoutEq.stoppedTotal} Stopped
                            </span>
                          )}
                          <span className="text-[#475569]">• {layoutEq.totalUph.toLocaleString()} UPH</span>
                          {layoutEq.activeModels.length > 0 && (
                            <span className="text-[#475569] truncate">• Model: {layoutEq.activeModels[0]}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                      {isActive ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[#0284c7] bg-white px-2.5 py-1.5 rounded-lg border border-sky-200 shadow-2xs">
                          <Check className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectExisting(layout)}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-[#cbd5e1] rounded-xl text-xs font-bold text-[#334155] transition-colors cursor-pointer"
                          title="Activate this layout"
                        >
                          Activate
                        </button>
                      )}

                      {/* EDIT & LINK DATA Button */}
                      <button
                        onClick={() => startEditLayout(layout)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Customize layout & link equipment telemetry"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-600" />
                        <span>Customize & Link</span>
                      </button>

                      {/* DUPLICATE Button */}
                      <button
                        onClick={() => handleDuplicate(layout)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate layout"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* DELETE Button */}
                      <button
                        onClick={() => setDeletingLayout(layout)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
                        title="Delete layout"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {uploadedLayouts.length === 0 && (
                <div className="text-center p-6 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-2xl space-y-2">
                  <Layers className="w-8 h-8 text-[#94a3b8] mx-auto" />
                  <p className="text-xs font-bold text-[#475569]">No Custom Layouts Yet</p>
                  <p className="text-[11px] text-[#64748b]">
                    Upload a plant CAD drawing or high-resolution floor map to customize your facility view.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload First Layout</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EDIT EXISTING LAYOUT */}
          {activeTab === 'edit' && editingLayoutId && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
                <button
                  onClick={() => setActiveTab('library')}
                  className="flex items-center gap-1 text-xs font-bold text-[#64748b] hover:text-[#0f172a] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Library</span>
                </button>
                <span className="text-xs font-bold text-amber-700">
                  Editing Layout
                </span>
              </div>

              {/* Current Image & Replace Option */}
              {editDataUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-[#cbd5e1] bg-slate-900 group">
                  <img
                    src={editDataUrl}
                    alt="Edit CAD Preview"
                    className="w-full h-40 object-contain"
                  />
                  <div className="absolute top-2 right-2 flex items-center space-x-1.5">
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFile(e.target.files[0], true);
                        }
                      }}
                    />
                    <button
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Replace Image File</span>
                    </button>
                  </div>
                  {editFileDetails && (
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-2">
                      <span>{editFileDetails.fileName}</span>
                      {editFileDetails.dimensions && (
                        <>
                          <span>•</span>
                          <span>
                            {editFileDetails.dimensions.width}×{editFileDetails.dimensions.height}px
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Metadata Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#334155] uppercase tracking-wider block">
                    Layout Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:bg-white focus:border-[#0284c7] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#334155] uppercase tracking-wider block">
                    Line Scope
                  </label>
                  <select
                    value={editLineScope}
                    onChange={(e) => setEditLineScope(e.target.value as ProductionLine)}
                    className="w-full px-3 py-2 text-xs font-bold bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:bg-white focus:border-[#0284c7] focus:outline-hidden"
                  >
                    <option value="ALL">Entire Facility (Lines L1–L6)</option>
                    <option value="L6">Line 6 (SMT & Dispensing)</option>
                    <option value="L5">Line 5 (High Speed)</option>
                    <option value="L4">Line 4 (Precision Underfill)</option>
                    <option value="L3">Line 3 (Dual Oven)</option>
                    <option value="L2">Line 2 (Standard)</option>
                    <option value="L1">Line 1 (Prototype / NPI)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#334155] uppercase tracking-wider block">
                  Description / Revision Notes
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:bg-white focus:border-[#0284c7] focus:outline-hidden"
                />
              </div>

              {/* LINKED FACTORY DATA & TELEMETRY SECTION */}
              {(() => {
                const scopeEq = getLineEquipment(editLineScope);
                const filteredMachines = scopeEq.machines.filter((m) =>
                  !quickSearchTerm.trim() ||
                  m.id.toLowerCase().includes(quickSearchTerm.toLowerCase()) ||
                  m.name.toLowerCase().includes(quickSearchTerm.toLowerCase()) ||
                  (m.runningModel || '').toLowerCase().includes(quickSearchTerm.toLowerCase())
                );
                const filteredOvens = scopeEq.ovens.filter((o) =>
                  !quickSearchTerm.trim() ||
                  o.name.toLowerCase().includes(quickSearchTerm.toLowerCase()) ||
                  o.id.toLowerCase().includes(quickSearchTerm.toLowerCase()) ||
                  (o.runningModel || '').toLowerCase().includes(quickSearchTerm.toLowerCase())
                );

                return (
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-[#e2e8f0] space-y-4">
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-4 h-4 text-[#0284c7]" />
                          <h3 className="text-sm font-extrabold text-[#0f172a]">
                            Linked Factory Equipment & Live Telemetry
                          </h3>
                          <span className="text-[10px] font-mono font-bold bg-sky-100 text-[#0284c7] px-2 py-0.5 rounded-full border border-sky-200">
                            Scope: {editLineScope === 'ALL' ? 'Lines L1–L6' : `Line ${editLineScope}`}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          Directly control and calibrate machine operating status, production model, operator, and live telemetry for this layout.
                        </p>
                      </div>

                      {/* Toast Notification */}
                      {batchModelToast && (
                        <div className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{batchModelToast}</span>
                        </div>
                      )}
                    </div>

                    {/* KPI Quick Stats Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                          Connected Units
                        </span>
                        <div className="flex items-baseline space-x-1.5 mt-0.5">
                          <span className="text-lg font-black font-mono text-[#0f172a]">
                            {scopeEq.totalUnits}
                          </span>
                          <span className="text-[10px] text-[#64748b]">units</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Running / Stopped
                        </span>
                        <div className="flex items-center space-x-2 mt-0.5 font-mono text-xs font-bold">
                          <span className="text-emerald-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {scopeEq.runningTotal} Run
                          </span>
                          <span className="text-[#94a3b8]">|</span>
                          <span className="text-rose-700">
                            {scopeEq.stoppedTotal} Stop
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-sky-50/70 border border-sky-200 rounded-xl">
                        <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                          Combined Throughput
                        </span>
                        <div className="flex items-baseline space-x-1 mt-0.5">
                          <span className="text-lg font-black font-mono text-sky-950">
                            {scopeEq.totalUph.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-sky-700 font-bold">UPH</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl">
                        <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                          Average Line OEE
                        </span>
                        <div className="flex items-baseline space-x-1 mt-0.5">
                          <span className="text-lg font-black font-mono text-purple-950">
                            {scopeEq.avgOee.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-purple-700 font-bold">Efficiency</span>
                        </div>
                      </div>
                    </div>

                    {/* Line-Wide Model Batch Synchronizer */}
                    <div className="p-3 bg-gradient-to-r from-amber-50/80 via-sky-50/50 to-slate-50 border border-amber-200/80 rounded-2xl space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-bold text-[#0f172a]">
                            Line-Wide Model Synchronizer (อัปเดตรุ่นการผลิตทั้งไลน์)
                          </span>
                        </div>
                        <span className="text-[10px] text-[#64748b]">
                          Batch applies production model to all {scopeEq.totalUnits} units on this line
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={batchModelInput}
                          onChange={(e) => setBatchModelInput(e.target.value)}
                          placeholder="e.g. MODEL 504-2224"
                          className="flex-1 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:border-[#0284c7] focus:outline-hidden"
                        />
                        <div className="flex items-center gap-1 overflow-x-auto shrink-0">
                          {['MODEL 504-2224', 'MODEL 504-2268', 'MODEL 504-2154', 'MODEL 504-2454'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setBatchModelInput(preset);
                                handleApplyBatchModelToLine(preset);
                              }}
                              className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                                batchModelInput === preset
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-white hover:bg-amber-50 text-[#334155] border-[#cbd5e1]'
                              }`}
                            >
                              {preset.replace('MODEL ', '')}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyBatchModelToLine(batchModelInput)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Sync Model to All Units</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter search box */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                        Interactive Equipment Units ({filteredMachines.length + filteredOvens.length} total)
                      </span>
                      <input
                        type="text"
                        value={quickSearchTerm}
                        onChange={(e) => setQuickSearchTerm(e.target.value)}
                        placeholder="Search machine ID, model, or type..."
                        className="w-56 px-2.5 py-1 text-[11px] font-medium bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] focus:bg-white focus:border-[#0284c7] focus:outline-hidden"
                      />
                    </div>

                    {/* Equipment Cards List */}
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {/* Dispensing Machines */}
                      {filteredMachines.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 bg-white border border-[#cbd5e1] rounded-xl shadow-2xs hover:border-sky-300 transition-all space-y-2"
                        >
                          {/* Unit Title & Badges */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded-md">
                                {m.id}
                              </span>
                              <span className="text-xs font-bold text-[#0f172a]">
                                {m.name}
                              </span>
                              <span className="text-[10px] font-mono text-[#64748b] bg-slate-100 px-1.5 py-0.5 rounded">
                                Line {m.line || '1'} • {m.processType || 'Dispensing'}
                              </span>
                            </div>

                            {/* Jump to Machine Detail */}
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                setSelectedMachineId(m.id);
                                navigate('machine-detail', m.id);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0284c7] hover:text-sky-800 cursor-pointer"
                              title="View full machine analytics"
                            >
                              <span>Machine Detail</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Control Row: Status Toggle + Model + Operator */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                            {/* Live Status Control */}
                            <div>
                              <label className="text-[10px] font-bold text-[#64748b] uppercase block mb-1">
                                Operational Status
                              </label>
                              <div className="flex items-center rounded-lg border border-[#cbd5e1] p-0.5 bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => updateMachineStatus(m.id, 'RUNNING')}
                                  className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    m.status === 'RUNNING'
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'text-[#64748b] hover:text-emerald-700'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'RUNNING' ? 'bg-white' : 'bg-emerald-500'}`} />
                                  RUN
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateMachineStatus(m.id, 'STOP', 'Manual Stop from Layout Calibrator')}
                                  className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    m.status === 'STOP'
                                      ? 'bg-rose-600 text-white shadow-2xs'
                                      : 'text-[#64748b] hover:text-rose-700'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'STOP' ? 'bg-white' : 'bg-rose-500'}`} />
                                  STOP
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateMachineStatus(m.id, 'IDLE')}
                                  className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    m.status === 'IDLE'
                                      ? 'bg-slate-700 text-white shadow-2xs'
                                      : 'text-[#64748b] hover:text-slate-800'
                                  }`}
                                >
                                  IDLE
                                </button>
                              </div>
                            </div>

                            {/* Running Model Input */}
                            <div>
                              <label className="text-[10px] font-bold text-[#64748b] uppercase block mb-1">
                                Running Model
                              </label>
                              <input
                                type="text"
                                defaultValue={m.runningModel || 'MODEL 504-2224'}
                                key={`${m.id}-${m.runningModel}`}
                                onBlur={(e) => updateMachineModel(m.id, e.target.value.trim())}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateMachineModel(m.id, (e.target as HTMLInputElement).value.trim());
                                  }
                                }}
                                className="w-full px-2.5 py-1 text-xs font-mono font-bold bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] focus:bg-white focus:border-[#0284c7] focus:outline-hidden"
                              />
                            </div>

                            {/* Operator ID Input */}
                            <div>
                              <label className="text-[10px] font-bold text-[#64748b] uppercase block mb-1">
                                Operator ID
                              </label>
                              <input
                                type="text"
                                defaultValue={m.operatorId || 'OP-T1001'}
                                key={`${m.id}-${m.operatorId}`}
                                onBlur={(e) => updateMachineFull(m.id, { operatorId: e.target.value.trim() })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateMachineFull(m.id, { operatorId: (e.target as HTMLInputElement).value.trim() });
                                  }
                                }}
                                className="w-full px-2.5 py-1 text-xs font-mono font-bold bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] focus:bg-white focus:border-[#0284c7] focus:outline-hidden"
                              />
                            </div>
                          </div>

                          {/* Live Metrics Telemetry Line */}
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#475569] bg-[#f8fafc] p-1.5 rounded-lg flex-wrap gap-2">
                            <span className="flex items-center gap-1 font-bold text-[#0f172a]">
                              <Gauge className="w-3.5 h-3.5 text-[#0284c7]" />
                              <span>{m.uph?.toLocaleString() || 0} UPH</span>
                            </span>
                            <span>OEE: <strong className="text-purple-700">{m.oeePercent?.toFixed(1) || 95}%</strong></span>
                            <span>In/Out: <strong>{m.inputCount?.toLocaleString() || 0} / {m.outputCount?.toLocaleString() || 0} pcs</strong></span>
                            <span className="text-[10px] text-[#64748b] truncate">
                              Syringe A: {m.syringeA?.type || 'Underfill'} ({m.syringeA?.remainingTimeMins || 240}m)
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Oven Units */}
                      {filteredOvens.map((o) => (
                        <div
                          key={o.id}
                          className="p-3 bg-white border border-[#cbd5e1] rounded-xl shadow-2xs hover:border-sky-300 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-amber-800 text-white font-mono font-bold text-xs rounded-md flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber-300" />
                                {o.id.toUpperCase()}
                              </span>
                              <span className="text-xs font-bold text-[#0f172a]">
                                {o.name}
                              </span>
                              <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                {o.subType} Chamber • Line {o.lineId}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                if (o.subType === 'Vacuum') {
                                  navigate('vacuum-process');
                                } else {
                                  navigate('bake-process');
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                            >
                              <span>{o.subType} Dashboard</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                            {/* Status Control */}
                            <div>
                              <label className="text-[10px] font-bold text-[#64748b] uppercase block mb-1">
                                Oven Status
                              </label>
                              <div className="flex items-center rounded-lg border border-[#cbd5e1] p-0.5 bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => updateOvenStatus(o.id, 'RUNNING')}
                                  className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    o.status === 'RUNNING'
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'text-[#64748b] hover:text-emerald-700'
                                  }`}
                                >
                                  RUN
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateOvenStatus(o.id, 'STOP', 'Manual Stop')}
                                  className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    o.status === 'STOP'
                                      ? 'bg-rose-600 text-white shadow-2xs'
                                      : 'text-[#64748b] hover:text-rose-700'
                                  }`}
                                >
                                  STOP
                                </button>
                              </div>
                            </div>

                            {/* Model Control */}
                            <div>
                              <label className="text-[10px] font-bold text-[#64748b] uppercase block mb-1">
                                Running Model
                              </label>
                              <input
                                type="text"
                                defaultValue={o.runningModel || 'MODEL 504-2224'}
                                key={`${o.id}-${o.runningModel}`}
                                onBlur={(e) => updateOvenModel(o.id, e.target.value.trim())}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateOvenModel(o.id, (e.target as HTMLInputElement).value.trim());
                                  }
                                }}
                                className="w-full px-2.5 py-1 text-xs font-mono font-bold bg-[#f8fafc] border border-[#cbd5e1] rounded-lg text-[#0f172a] focus:bg-white focus:border-[#0284c7] focus:outline-hidden"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-[#475569] bg-amber-50/50 p-1.5 rounded-lg flex-wrap gap-2">
                            <span>Chamber Temp: <strong className="text-amber-900">{o.chamberTemp || 150}°C</strong></span>
                            {o.subType === 'Vacuum' && (
                              <span>Vacuum Pressure: <strong className="text-sky-900">{o.vacuumPressure || 0.08} kPa</strong></span>
                            )}
                            <span>Batch: <strong>{o.batchLot || 'LOT-2026-A'}</strong></span>
                          </div>
                        </div>
                      ))}

                      {filteredMachines.length === 0 && filteredOvens.length === 0 && (
                        <div className="p-4 bg-slate-50 border border-dashed border-[#cbd5e1] rounded-xl text-center text-xs text-[#64748b]">
                          No equipment units found matching search filter &quot;{quickSearchTerm}&quot;.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                {/* Delete layout button inside edit mode */}
                <button
                  onClick={() => {
                    const layoutToDelete = uploadedLayouts.find((l) => l.id === editingLayoutId);
                    if (layoutToDelete) {
                      setDeletingLayout(layoutToDelete);
                      setActiveTab('library');
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Delete This Layout</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setActiveTab('library');
                      setEditingLayoutId(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#475569] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditLayout}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#64748b]">
            <Info className="w-3.5 h-3.5" />
            <span>Layout calibrations and drawings are automatically saved to local storage</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#051125] hover:bg-[#1e293b] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

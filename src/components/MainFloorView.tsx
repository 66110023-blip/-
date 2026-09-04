import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FloorStation,
  CADRenderMode,
  ProductionLine,
  SnapGridSize,
  HistoryLogEntry,
} from '../types';
import { DEFAULT_CAD_STATIONS } from '../data/defaultCadLayout';
import { cadStorage } from '../utils/cadStorage';
import { normalizeAoiMachineId, normalizeXrayMachineId } from '../utils/machineLinkUtils';
import { CADCanvas } from './CADCanvas';
import { StationInspectorDrawer } from './StationInspectorDrawer';
import { StationDiagnosticsModal } from './StationDiagnosticsModal';
import { AddStationModal } from './AddStationModal';
import { JsonConfigModal } from './JsonConfigModal';
import { LayoutHistoryModal, CADLayoutRevision } from './LayoutHistoryModal';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Sliders,
  Plus,
  Undo2,
  Redo2,
  Save,
  FileCode,
  UploadCloud,
  Check,
  Grid,
  Ruler,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  Activity,
  Minimize,
  Square,
  Image as ImageIcon,
  Copy,
  Trash2,
  Edit3,
  History,
  CheckCircle2,
  Database,
  AlertTriangle,
  Bookmark,
} from 'lucide-react';


const STORAGE_KEY = 'factory_cad_stations_v1';
const STORAGE_CALIBRATED_BACKUP_KEY = 'factory_cad_stations_calibrated_v1';
const STORAGE_CONFIG_KEY = 'factory_cad_config_v1';
const STORAGE_REVISIONS_KEY = 'factory_cad_layout_revisions_v1';

interface SavedCadConfig {
  renderMode?: CADRenderMode;
  imageOpacity?: number;
  zoom?: number;
  panOffset?: { x: number; y: number };
  snapEnabled?: boolean;
  gridSnap?: SnapGridSize;
  showDimensions?: boolean;
  selectedLine?: ProductionLine;
  savedAt?: string;
}

const computeCategoryBreakdown = (stationsList: FloorStation[]) => {
  const bd = { dispensing: 0, oven: 0, fvmi: 0, ocr: 0, packout: 0, other: 0 };
  stationsList.forEach((s) => {
    if (s.category === 'dispensing') bd.dispensing++;
    else if (s.category.startsWith('oven')) bd.oven++;
    else if (s.category === 'fvmi') bd.fvmi++;
    else if (s.category === 'ocr' || (s.category as string) === 'xray') bd.ocr++;
    else if (s.category === 'packout' || (s.category as string) === 'aoi') bd.packout++;
    else bd.other++;
  });
  return bd;
};

export const MainFloorView: React.FC = () => {
  const {
    navigate,
    setSelectedMachineId,
    activeLayoutUrl,
    activeLayoutOpacity,
    activeLayoutId,
    uploadedLayouts,
    showUploadLayoutModal,
    setShowUploadLayoutModal,
    setCustomFloorImageUrl,
    setCustomFloorImageOpacity,
    resetLayoutToDefault,
  } = useFactory();

  const { t } = useLanguage();

  // Load saved configuration from localStorage if available
  const savedConfig: SavedCadConfig = (() => {
    try {
      const cfg = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (cfg) return JSON.parse(cfg);
    } catch (e) {
      console.warn('Failed to parse saved CAD config:', e);
    }
    return {};
  })();

  // Load layout from localStorage or fallback to defaults
  const [stations, setStations] = useState<FloorStation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_CALIBRATED_BACKUP_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved CAD layout:', e);
    }
    return DEFAULT_CAD_STATIONS;
  });

  // Load saved layout revisions history
  const [revisions, setRevisions] = useState<CADLayoutRevision[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_REVISIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load CAD revisions:', e);
    }
    return [];
  });

  // Undo / Redo History stack initialized with the loaded stations
  const [history, setHistory] = useState<FloorStation[][]>(() => [stations]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // CAD Canvas & Display State
  const [selectedLine, setSelectedLine] = useState<ProductionLine>(savedConfig.selectedLine || 'ALL');
  const [renderMode, setRenderMode] = useState<CADRenderMode>(savedConfig.renderMode || 'image');
  const [imageOpacity, setImageOpacity] = useState(
    savedConfig.imageOpacity !== undefined ? savedConfig.imageOpacity : (activeLayoutOpacity || 0.95)
  );
  const [customImageUrl, setCustomImageUrl] = useState<string | undefined>(activeLayoutUrl);

  useEffect(() => {
    if (activeLayoutUrl) {
      setCustomImageUrl(activeLayoutUrl);
    }
  }, [activeLayoutUrl]);

  useEffect(() => {
    if (activeLayoutOpacity !== undefined) {
      setImageOpacity(activeLayoutOpacity);
    }
  }, [activeLayoutOpacity]);

  // Category filtering & Tool Modes
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [liveTelemetry, setLiveTelemetry] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(
    savedConfig.snapEnabled !== undefined ? savedConfig.snapEnabled : true
  );
  const [gridSnap, setGridSnap] = useState<SnapGridSize>(savedConfig.gridSnap || 0.5);
  const [showDimensions, setShowDimensions] = useState<boolean>(
    savedConfig.showDimensions !== undefined ? savedConfig.showDimensions : true
  );

  // Pan & Zoom
  const [zoom, setZoom] = useState<number>(savedConfig.zoom || 1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>(savedConfig.panOffset || { x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Selected Station & Modals
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [diagnosticStation, setDiagnosticStation] = useState<FloorStation | null>(null);

  // Modal dialog states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [saveToast, setSaveToast] = useState<{ count: number; timestamp: string } | null>(null);
  const [restoreToast, setRestoreToast] = useState<string | null>(null);
  const [deleteToast, setDeleteToast] = useState<{ message: string; deletedStation: FloorStation } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const hasHydratedRef = useRef(false);

  // Robust Auto-Save & Hydration via IndexedDB and LocalStorage
  useEffect(() => {
    let isMounted = true;
    Promise.all([cadStorage.getStations(), cadStorage.getConfig()]).then(([idbStations, idbConfig]) => {
      if (!isMounted) return;
      if (idbStations && Array.isArray(idbStations) && idbStations.length > 0) {
        setStations(idbStations);
        setHistory([idbStations]);
      }
      if (idbConfig) {
        if (idbConfig.renderMode) setRenderMode(idbConfig.renderMode);
        if (idbConfig.zoom) setZoom(idbConfig.zoom);
        if (idbConfig.panOffset) setPanOffset(idbConfig.panOffset);
        if (idbConfig.imageOpacity !== undefined) setImageOpacity(idbConfig.imageOpacity);
        if (idbConfig.showDimensions !== undefined) setShowDimensions(idbConfig.showDimensions);
        if (idbConfig.selectedLine) setSelectedLine(idbConfig.selectedLine);
      }
      hasHydratedRef.current = true;
    }).catch(() => {
      if (isMounted) hasHydratedRef.current = true;
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Continuous auto-save to IndexedDB + LocalStorage to prevent loss on reload
  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }
    try {
      const configToSave: SavedCadConfig = {
        renderMode,
        imageOpacity,
        zoom,
        panOffset,
        snapEnabled,
        gridSnap,
        showDimensions,
        selectedLine,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(configToSave));
      cadStorage.saveConfig(configToSave);

      if (stations && stations.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stations));
        cadStorage.saveStations(stations);
      }
    } catch (e) {
      console.warn('Auto-save CAD state failed:', e);
    }
  }, [renderMode, imageOpacity, zoom, panOffset, snapEnabled, gridSnap, showDimensions, selectedLine, stations]);


  // History record helper
  const pushToHistory = useCallback(
    (newStations: FloorStation[]) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, newStations];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      const prevStations = history[nextIndex];
      setStations(prevStations);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prevStations));
      } catch (e) {}
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextStations = history[nextIndex];
      setStations(nextStations);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStations));
      } catch (e) {}
    }
  };

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Escape, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        setSelectedStationId(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && isEditMode && selectedStationId) {
        e.preventDefault();
        handleDeleteStation(selectedStationId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, isEditMode, selectedStationId]);

  // Station updates with automatic history logging & persistence
  const handleStationUpdate = (updated: FloorStation, addToHistory: boolean = false) => {
    const oldStation = stations.find((s) => s.id === updated.id);
    const updatedList = stations.map((s) => (s.id === updated.id ? updated : s));
    setStations(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      cadStorage.saveStations(updatedList);
    } catch (e) {}

    // Check if dimensions or positions changed and log to persistent history
    if (oldStation) {
      const dimChanged = oldStation.w !== updated.w || oldStation.h !== updated.h;
      const posChanged = oldStation.x !== updated.x || oldStation.y !== updated.y;
      if (dimChanged) {
        cadStorage.appendHistoryLog({
          type: 'dimension_update',
          title: `Updated Dimension: ${updated.code}`,
          description: `Set size to W: ${updated.w.toFixed(1)}%, H: ${updated.h.toFixed(1)}% (X: ${updated.x.toFixed(1)}%, Y: ${updated.y.toFixed(1)}%)`,
          stationCode: updated.code,
          details: { w: updated.w, h: updated.h, x: updated.x, y: updated.y },
        });
      } else if (posChanged && addToHistory) {
        cadStorage.appendHistoryLog({
          type: 'station_move',
          title: `Moved Station: ${updated.code}`,
          description: `Set position to X: ${updated.x.toFixed(1)}%, Y: ${updated.y.toFixed(1)}%`,
          stationCode: updated.code,
          details: { x: updated.x, y: updated.y },
        });
      }
    }

    if (addToHistory) {
      pushToHistory(updatedList);
    }
  };

  const handleStationSelect = (station: FloorStation | null) => {
    setSelectedStationId(station ? station.id : null);
  };

  const handleStationDirectNavigate = (station: FloorStation) => {
    if (station.category === 'dispensing') {
      const targetMachineId = station.linkedMachineId || station.code || 'MC-01';
      navigate('machine-detail', targetMachineId);
    } else if (station.category === 'oven-vacuum') {
      navigate('vacuum-process');
    } else if (station.category === 'oven-bake') {
      navigate('bake-process');
    } else if (station.category === 'fvmi') {
      const fvmiCode = station.code?.startsWith('FVMI') ? station.code : 'FVMI-01';
      setSelectedMachineId(fvmiCode);
      navigate('fvmi-detail', fvmiCode);
    } else if (station.category === 'xray' || station.category === 'ocr') {
      const xrayId = normalizeXrayMachineId(station.linkedOcrId || station.code || station.id);
      navigate('packout-xray', xrayId);
    } else if (station.category === 'aoi' || station.category === 'packout') {
      const aoiId = normalizeAoiMachineId(station.linkedPackoutId || station.code || station.id);
      navigate('packout-aoi', aoiId);
    } else {
      navigate('process-view');
    }
  };

  const handleCloneStation = (source: FloorStation) => {
    const cloned: FloorStation = {
      ...source,
      id: `st-clone-${Date.now()}`,
      code: `${source.code}-B`,
      name: `${source.name} (Copy)`,
      x: Number((source.x + 2).toFixed(1)),
      y: Number((source.y + 2).toFixed(1)),
    };
    const nextList = [...stations, cloned];
    setStations(nextList);
    pushToHistory(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      cadStorage.saveStations(nextList);
    } catch (e) {}
    setSelectedStationId(cloned.id);
  };

  const handleDeleteStation = (stationId: string) => {
    const target = stations.find((s) => s.id === stationId);
    if (!target) return;
    const nextList = stations.filter((s) => s.id !== stationId);
    setStations(nextList);
    pushToHistory(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      cadStorage.saveStations(nextList);
    } catch (e) {}
    setSelectedStationId(null);

    setDeleteToast({
      message: `Station ${target.code} (${target.name}) removed from layout`,
      deletedStation: target,
    });
    setTimeout(() => {
      setDeleteToast((prev) => (prev?.deletedStation.id === target.id ? null : prev));
    }, 4500);
  };

  const handleRestoreDeletedStation = (station: FloorStation) => {
    const nextList = [...stations, station];
    setStations(nextList);
    pushToHistory(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      cadStorage.saveStations(nextList);
    } catch (e) {}
    setSelectedStationId(station.id);
    setDeleteToast(null);
  };

  const handleResetSingleStation = (stationId: string) => {
    const original = DEFAULT_CAD_STATIONS.find((s) => s.id === stationId);
    if (original) {
      handleStationUpdate(original, true);
    }
  };

  const handleAddStation = (newStation: FloorStation) => {
    const nextList = [...stations, newStation];
    setStations(nextList);
    pushToHistory(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      cadStorage.saveStations(nextList);
    } catch (e) {}
    setSelectedStationId(newStation.id);
  };

  const handleSaveLayout = async () => {
    try {
      // 1. Save current stations array to primary storage & persistent calibrated backup
      const stationsJson = JSON.stringify(stations);
      localStorage.setItem(STORAGE_KEY, stationsJson);
      localStorage.setItem(STORAGE_CALIBRATED_BACKUP_KEY, stationsJson);
      await cadStorage.saveStations(stations);

      // 2. Save canvas display & calibration configurations
      const configToSave: SavedCadConfig = {
        renderMode,
        imageOpacity,
        zoom,
        panOffset,
        snapEnabled,
        gridSnap,
        showDimensions,
        selectedLine,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(configToSave));
      await cadStorage.saveConfig(configToSave);

      // 3. Ensure active layout opacity is locked into context
      setCustomFloorImageOpacity(imageOpacity);

      // 4. Record new layout revision snapshot and preset in IndexedDB
      const now = new Date();
      const presetId = await cadStorage.savePreset(
        `Calibrated Layout Preset (${stations.length} stations)`,
        stations,
        configToSave,
        customImageUrl
      );

      const newRevision: CADLayoutRevision = {
        id: presetId || `rev-${now.getTime()}`,
        savedAt: now.toISOString(),
        formattedTime: now.toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        title: `Calibrated Layout (${stations.length} stations)`,
        stationCount: stations.length,
        stations: JSON.parse(stationsJson),
        config: configToSave,
        imageUrl: customImageUrl,
        categoryBreakdown: computeCategoryBreakdown(stations),
      };

      const updatedRevisions = [newRevision, ...revisions.slice(0, 24)];
      setRevisions(updatedRevisions);
      try {
        localStorage.setItem(STORAGE_REVISIONS_KEY, JSON.stringify(updatedRevisions));
      } catch (e) {}

      // 5. Trigger high-visibility confirmation toast
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSaveToast({
        count: stations.length,
        timestamp: timeStr,
      });
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error('Failed to save CAD layout:', err);
    }
  };

  // Restore the latest user-saved calibrated layout (without reverting to factory defaults)
  const handleRestoreLastSavedLayout = async () => {
    try {
      const savedBackup = localStorage.getItem(STORAGE_CALIBRATED_BACKUP_KEY) || localStorage.getItem(STORAGE_KEY);
      if (savedBackup) {
        const parsed = JSON.parse(savedBackup);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStations(parsed);
          pushToHistory(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          await cadStorage.saveStations(parsed);
          
          // Restore saved canvas config if present
          const savedCfgStr = localStorage.getItem(STORAGE_CONFIG_KEY);
          if (savedCfgStr) {
            try {
              const cfg: SavedCadConfig = JSON.parse(savedCfgStr);
              if (cfg.renderMode) setRenderMode(cfg.renderMode);
              if (cfg.zoom) setZoom(cfg.zoom);
              if (cfg.panOffset) setPanOffset(cfg.panOffset);
              if (cfg.imageOpacity !== undefined) setImageOpacity(cfg.imageOpacity);
              if (cfg.showDimensions !== undefined) setShowDimensions(cfg.showDimensions);
              if (cfg.selectedLine) setSelectedLine(cfg.selectedLine);
            } catch (e) {}
          }

          setRestoreToast(`Restored last saved layout (${parsed.length} stations)`);
          setTimeout(() => setRestoreToast(null), 3500);
          return;
        }
      }
      setRestoreToast('No prior saved backup found (using current active layout)');
      setTimeout(() => setRestoreToast(null), 2500);
    } catch (e) {
      console.error('Failed to restore saved layout:', e);
    }
  };

  // Restore a specific historical revision
  const handleRestoreRevision = async (rev: CADLayoutRevision) => {
    if (rev.stations && Array.isArray(rev.stations) && rev.stations.length > 0) {
      setStations(rev.stations);
      pushToHistory(rev.stations);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rev.stations));
        localStorage.setItem(STORAGE_CALIBRATED_BACKUP_KEY, JSON.stringify(rev.stations));
        await cadStorage.saveStations(rev.stations);
      } catch (e) {}

      if (rev.config) {
        if (rev.config.renderMode) setRenderMode(rev.config.renderMode);
        if (rev.config.zoom) setZoom(rev.config.zoom);
        if (rev.config.panOffset) setPanOffset(rev.config.panOffset);
        if (rev.config.imageOpacity !== undefined) setImageOpacity(rev.config.imageOpacity);
        if (rev.config.showDimensions !== undefined) setShowDimensions(rev.config.showDimensions);
        if (rev.config.selectedLine) setSelectedLine(rev.config.selectedLine);
        try {
          localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(rev.config));
          await cadStorage.saveConfig(rev.config);
        } catch (e) {}
      }

      setShowHistoryModal(false);
      setRestoreToast(`Restored revision snapshot from ${rev.formattedTime} (${rev.stationCount} stations)`);
      setTimeout(() => setRestoreToast(null), 3500);
    }
  };

  const handleDeleteRevision = (revId: string) => {
    const next = revisions.filter((r) => r.id !== revId);
    setRevisions(next);
    try {
      localStorage.setItem(STORAGE_REVISIONS_KEY, JSON.stringify(next));
    } catch (e) {}
  };

  const handleClearAllRevisions = () => {
    setRevisions([]);
    try {
      localStorage.removeItem(STORAGE_REVISIONS_KEY);
    } catch (e) {}
  };

  const handleUpdateRevisionNote = (revId: string, note: string) => {
    const next = revisions.map((r) => (r.id === revId ? { ...r, note } : r));
    setRevisions(next);
    try {
      localStorage.setItem(STORAGE_REVISIONS_KEY, JSON.stringify(next));
    } catch (e) {}
  };

  // Reset 1: Reset Coordinates and Dimensions only (keeps background image)
  const handleResetPositionsOnly = async () => {
    setStations(DEFAULT_CAD_STATIONS);
    pushToHistory(DEFAULT_CAD_STATIONS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CAD_STATIONS));
      localStorage.setItem(STORAGE_CALIBRATED_BACKUP_KEY, JSON.stringify(DEFAULT_CAD_STATIONS));
      await cadStorage.saveStations(DEFAULT_CAD_STATIONS);
      await cadStorage.appendHistoryLog({
        type: 'layout_reset',
        title: 'Reset Station Positions & Dimensions',
        description: 'Restored all equipment dimensions and coordinates to standard CAD baseline.',
      });
    } catch (e) {}
    setSelectedStationId(null);
    setShowResetConfirmModal(false);
    setRestoreToast(`Reset equipment dimensions & positions to standard (${DEFAULT_CAD_STATIONS.length} stations)`);
    setTimeout(() => setRestoreToast(null), 3500);
  };

  // Reset 2: Reset Blueprint background to vector
  const handleResetImageOnly = () => {
    resetLayoutToDefault();
    setCustomImageUrl(undefined);
    setRenderMode('vector');
    setShowResetConfirmModal(false);
    setRestoreToast('Reset background blueprint to standard vector CAD');
    setTimeout(() => setRestoreToast(null), 3500);
  };

  // Reset 3: Full Factory Reset
  const handleFullSystemReset = async () => {
    setStations(DEFAULT_CAD_STATIONS);
    pushToHistory(DEFAULT_CAD_STATIONS);
    resetLayoutToDefault();
    setCustomImageUrl(undefined);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CAD_STATIONS));
      localStorage.setItem(STORAGE_CALIBRATED_BACKUP_KEY, JSON.stringify(DEFAULT_CAD_STATIONS));
      localStorage.removeItem(STORAGE_CONFIG_KEY);
      await cadStorage.saveStations(DEFAULT_CAD_STATIONS);
      await cadStorage.appendHistoryLog({
        type: 'layout_reset',
        title: 'Full Layout & Blueprint Reset',
        description: 'Returned all settings, blueprints, and dimensions to factory defaults.',
      });
    } catch (e) {}
    setSelectedStationId(null);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedLine('ALL');
    setRenderMode('image');
    setShowResetConfirmModal(false);
    setRestoreToast(`Full factory reset completed (${DEFAULT_CAD_STATIONS.length} stations)`);
    setTimeout(() => setRestoreToast(null), 3500);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(4.0, Number((prev + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.35, Number((prev - 0.15).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };
  const handleZoomChange = (newZoom: number, newPanOffset?: { x: number; y: number }) => {
    setZoom(newZoom);
    if (newPanOffset) {
      setPanOffset(newPanOffset);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const selectedStation = stations.find((s) => s.id === selectedStationId) || null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-85px)] flex flex-col bg-[#090d16] select-none overflow-hidden"
    >
      {/* Top Floating Control Bar */}
      <div className="z-20 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] px-4 py-2 flex items-center justify-between flex-wrap gap-2 shadow-xs">
        {/* Render Mode Switcher */}
        <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-[#cbd5e1]">
          {(['image', 'vector', 'hybrid'] as CADRenderMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setRenderMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                renderMode === mode
                  ? 'bg-white text-[#0284c7] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              {mode === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
              {mode === 'vector' && <Layers className="w-3.5 h-3.5" />}
              {mode === 'hybrid' && <Sliders className="w-3.5 h-3.5" />}
              <span>{mode === 'image' ? t('cad.mode.image', 'Floor Image') : mode === 'vector' ? t('cad.mode.vector', 'Vector CAD') : t('cad.mode.hybrid', 'Hybrid')}</span>
            </button>
          ))}

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowUploadLayoutModal(true)}
              className={`ml-1 px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                activeLayoutId !== 'default'
                  ? 'bg-sky-100 text-[#0284c7] hover:bg-sky-200'
                  : 'text-[#475569] hover:text-[#0284c7] hover:bg-white/80'
              }`}
              title="Upload and Manage Production Line Layouts"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">
                {activeLayoutId !== 'default' ? t('nav.custom_layout', 'Custom Layout') : t('nav.upload_layout', 'Upload Layout')}
              </span>
            </button>

            {activeLayoutId !== 'default' && (
              <button
                onClick={() => {
                  resetLayoutToDefault();
                  setCustomImageUrl(undefined);
                }}
                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                title="Revert to Default Vector Blueprint"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Calibration Mode Toggle & Top Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Reset Button */}
          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Open Layout Reset Menu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Edit Mode Toggle Button */}
          <button
            onClick={() => {
              setIsEditMode(!isEditMode);
              if (!isEditMode) setSelectedStationId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isEditMode
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white ring-2 ring-amber-400/40'
                : 'bg-white hover:bg-slate-100 text-[#334155] border border-[#cbd5e1]'
            }`}
          >
            {isEditMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-[#64748b]" />}
            <span>{isEditMode ? t('cad.exit_calibration', 'Exit Calibration') : t('cad.edit_mode', 'Edit Layout Mode')}</span>
          </button>
        </div>
      </div>

      {/* Secondary Edit Mode Action Toolbar (Shown only when in Edit Mode) */}
      {isEditMode && (
        <div className="z-20 bg-[#f8fafc] border-b border-[#cbd5e1] px-4 py-1.5 flex items-center justify-between flex-wrap gap-2 text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center space-x-2 flex-wrap">
            {/* Add Section Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('cad.add_equipment', 'Add Equipment')}</span>
            </button>

            {/* Selected Station Quick Actions (Clone / Delete / Inspect) */}
            {selectedStation && (
              <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg animate-in fade-in">
                <span className="text-[11px] font-mono font-bold text-amber-900 truncate max-w-[130px]">
                  {selectedStation.code}: {selectedStation.name}
                </span>

                <button
                  onClick={() => handleCloneStation(selectedStation)}
                  className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 rounded text-[10px] font-bold text-amber-900 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Duplicate station"
                >
                  <Copy className="w-3 h-3 text-blue-600" />
                  <span>{t('cad.duplicate', 'Duplicate')}</span>
                </button>

                <button
                  onClick={() => handleDeleteStation(selectedStation.id)}
                  className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="Delete station (Del/Backspace)"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('cad.delete', 'Delete')}</span>
                </button>
              </div>
            )}

            {/* Snap Grid Toggle */}
            <div className="flex items-center space-x-1 bg-white border border-[#cbd5e1] rounded-lg p-0.5">
              <button
                onClick={() => setSnapEnabled(!snapEnabled)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  snapEnabled ? 'bg-blue-50 text-blue-700 font-bold' : 'text-[#64748b]'
                }`}
              >
                <Grid className="w-3 h-3" />
                <span>{t('cad.snap', 'Snap')}: {snapEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {snapEnabled && (
                <select
                  value={gridSnap}
                  onChange={(e) => setGridSnap(parseFloat(e.target.value) as SnapGridSize)}
                  className="text-[10px] font-mono font-bold bg-transparent px-1 text-[#0f172a]"
                >
                  <option value="0.25">0.25%</option>
                  <option value="0.5">0.5%</option>
                  <option value="1.0">1.0%</option>
                  <option value="2.5">2.5%</option>
                </select>
              )}
            </div>

            {/* Dimension Lines Toggle */}
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                showDimensions
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                  : 'bg-white border-[#cbd5e1] text-[#64748b]'
              }`}
            >
              <Ruler className="w-3 h-3" />
              <span>{t('cad.dimensions', 'Dimensions')}</span>
            </button>
          </div>

          {/* Edit Toolbar Actions: Undo, Redo, JSON, Restore, History, Reset, Save */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg text-[#334155] disabled:opacity-40 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg text-[#334155] disabled:opacity-40 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowJsonModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg text-[#334155] font-bold transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-purple-600" />
              <span>{t('cad.json_layout', 'JSON Layout')}</span>
            </button>

            <button
              onClick={handleRestoreLastSavedLayout}
              className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg text-sky-700 font-bold transition-colors cursor-pointer"
              title="Restore the most recently saved calibrated layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('cad.restore_last_saved', 'Restore Last Saved')}</span>
            </button>

            <button
              onClick={() => setShowResetConfirmModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-700 font-bold transition-colors cursor-pointer"
              title="Reset all equipment back to factory standard coordinates"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('cad.reset_defaults', 'Reset to Defaults')}</span>
            </button>

            <button
              onClick={handleSaveLayout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-lg font-bold shadow-sm transition-all cursor-pointer ring-2 ring-emerald-500/30"
              title="Save current layout coordinates and save a snapshot to revision history"
            >
              <Save className="w-4 h-4" />
              <span>{t('cad.save_layout', 'Save Calibrated Layout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Split Body: Interactive CAD Canvas + Side-by-Side Process View Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left / Center Area: CAD Floor Map Canvas */}
        <div className="flex-1 relative overflow-hidden bg-[#090d16]">
          <CADCanvas
            stations={stations}
            selectedStationId={selectedStationId}
            selectedLine={selectedLine}
            renderMode={renderMode}
            imageOpacity={imageOpacity}
            customImageUrl={customImageUrl}
            isEditMode={isEditMode}
            liveTelemetry={liveTelemetry}
            snapEnabled={snapEnabled}
            gridSnap={gridSnap}
            showDimensions={showDimensions}
            activeCategoryFilter={activeCategoryFilter}
            zoom={zoom}
            panOffset={panOffset}
            onStationSelect={handleStationSelect}
            onStationUpdate={handleStationUpdate}
            onStationDelete={handleDeleteStation}
            onStationDiagnosticsOpen={(st) => setDiagnosticStation(st)}
            onStationDirectNavigate={handleStationDirectNavigate}
            onPanChange={(offset) => setPanOffset(offset)}
            onZoomChange={handleZoomChange}
          />

          {/* Floating Canvas Navigation & Zoom Controls (Bottom Left) */}
          <div className="absolute bottom-10 left-4 z-30 flex items-center space-x-1.5 bg-[#0f172a]/90 backdrop-blur-md border border-[#334155] p-1.5 rounded-2xl shadow-2xl text-white">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs font-bold px-2 text-slate-300 min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              onClick={handleResetZoom}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Reset to 100%"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>

          {/* Edit Mode Floating Inspector Drawer */}
          {isEditMode && selectedStation && (
            <StationInspectorDrawer
              station={selectedStation}
              onClose={() => setSelectedStationId(null)}
              onUpdate={handleStationUpdate}
              onClone={handleCloneStation}
              onDelete={handleDeleteStation}
              onResetStation={handleResetSingleStation}
            />
          )}
        </div>
      </div>

      {/* Bottom Telemetry Status Ticker */}
      <footer className="h-7 bg-[#0b1120] border-t border-[#1e293b] px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-30">
        <div className="flex items-center space-x-3 truncate">
          <span>Mode: <strong className="text-sky-400">{isEditMode ? 'CALIBRATION' : 'LIVE TELEMETRY'}</strong></span>
          <span>•</span>
          <span>Layer: <strong className="text-slate-200 uppercase">{renderMode}</strong></span>
          <span>•</span>
          <span>Active Line: <strong className="text-sky-400">{selectedLine}</strong></span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">LIVE LINK (10Hz)</span>
          </div>
          <span>•</span>
          <span className="text-slate-300 font-bold">{stations.length} STATIONS</span>
        </div>
      </footer>

      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed bottom-16 right-6 z-50 bg-[#0f172a] text-white border border-emerald-500/80 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-in slide-in-from-bottom-4">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-emerald-400 text-sm">Layout Calibrated & Saved</div>
            <div className="text-slate-300 text-[11px]">
              Persisted {saveToast.count} station coordinates & background drawing at {saveToast.timestamp}
            </div>
          </div>
        </div>
      )}

      {/* Restore Toast */}
      {restoreToast && (
        <div className="fixed bottom-16 right-6 z-50 bg-[#0f172a] text-white border border-sky-500/80 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-in slide-in-from-bottom-4">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sky-400 text-sm">Layout Restored</div>
            <div className="text-slate-300 text-[11px]">{restoreToast}</div>
          </div>
        </div>
      )}

      {/* Delete Station Toast with Instant Undo */}
      {deleteToast && (
        <div className="fixed bottom-16 left-6 z-50 bg-[#0f172a] text-white border border-rose-500/50 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-in slide-in-from-bottom-4">
          <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </div>
          <span className="font-medium text-slate-200">{deleteToast.message}</span>
          <button
            onClick={() => handleRestoreDeletedStation(deleteToast.deletedStation)}
            className="ml-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            Undo
          </button>
        </div>
      )}

      {/* Reset Layout Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reset Layout & Machine Options
                </h3>
                <p className="text-xs text-slate-500">
                  Choose the specific component of the production floor layout you wish to reset.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Reset Coordinates & Dimensions only */}
              <button
                onClick={handleResetPositionsOnly}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-amber-900">
                    1. Reset Machine Positions & Dimensions Only
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-md">
                    Keeps Blueprint
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Restores all 9 machines and stations to standard factory dimensions & coordinates while keeping your uploaded CAD background intact.
                </p>
              </button>

              {/* Option 2: Reset Blueprint only */}
              <button
                onClick={handleResetImageOnly}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-sky-900">
                    2. Reset Floor Blueprint (Vector CAD Mode)
                  </span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-md">
                    Keeps Placements
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Reverts the floor background to standard interactive vector CAD blueprint mode without deleting your customized equipment positions.
                </p>
              </button>

              {/* Option 3: Full Factory Reset */}
              <button
                onClick={handleFullSystemReset}
                className="w-full text-left p-3 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-100/60 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-900">
                    3. Full Factory Reset
                  </span>
                  <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-md">
                    Complete Baseline
                  </span>
                </div>
                <p className="text-[11px] text-rose-700/80 mt-1">
                  Resets everything back to factory standard defaults (a recovery snapshot will be logged in revision history).
                </p>
              </button>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Station Diagnostics Modal */}
      {diagnosticStation && (
        <StationDiagnosticsModal
          station={diagnosticStation}
          onClose={() => setDiagnosticStation(null)}
          onUpdateStation={(updated) => {
            handleStationUpdate(updated, true);
            setDiagnosticStation(updated);
          }}
        />
      )}

      {/* Add Station Modal */}
      <AddStationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddStation={handleAddStation}
        existingCount={stations.length}
      />

      {/* JSON Config Viewer & Importer Modal */}
      <JsonConfigModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        stations={stations}
        onImportLayout={(newStations) => {
          setStations(newStations);
          pushToHistory(newStations);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newStations));
        }}
        onResetFactoryDefaults={handleFullSystemReset}
      />

      {/* Layout Revision History Modal */}
      <LayoutHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        revisions={revisions}
        currentStations={stations}
        onRestoreRevision={handleRestoreRevision}
        onDeleteRevision={handleDeleteRevision}
        onClearAllRevisions={handleClearAllRevisions}
        onUpdateRevisionNote={handleUpdateRevisionNote}
      />
    </div>
  );
};


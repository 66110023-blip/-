import React, { useState, useEffect } from 'react';
import { FloorStation, CADRenderMode, ProductionLine, SnapGridSize, HistoryLogEntry } from '../types';
import { cadStorage } from '../utils/cadStorage';
import {
  History,
  Clock,
  RotateCcw,
  Check,
  Trash2,
  Download,
  Copy,
  FileText,
  Tag,
  ChevronRight,
  X,
  AlertCircle,
  Layers,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  Sliders,
  Move,
  UploadCloud,
  CheckCircle2,
  Database,
} from 'lucide-react';

export interface SavedCadConfig {
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

export interface CADLayoutRevision {
  id: string;
  savedAt: string; // ISO string
  formattedTime: string;
  title: string;
  note?: string;
  stationCount: number;
  stations: FloorStation[];
  config: SavedCadConfig;
  imageUrl?: string;
  categoryBreakdown: {
    dispensing: number;
    oven: number;
    fvmi: number;
    ocr: number;
    packout: number;
    other: number;
  };
}

interface LayoutHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: CADLayoutRevision[];
  currentStations: FloorStation[];
  onRestoreRevision: (revision: CADLayoutRevision) => void;
  onDeleteRevision: (revisionId: string) => void;
  onClearAllRevisions: () => void;
  onUpdateRevisionNote: (revisionId: string, note: string) => void;
}

export const LayoutHistoryModal: React.FC<LayoutHistoryModalProps> = ({
  isOpen,
  onClose,
  revisions,
  currentStations,
  onRestoreRevision,
  onDeleteRevision,
  onClearAllRevisions,
  onUpdateRevisionNote,
}) => {
  const [activeTab, setActiveTab] = useState<'revisions' | 'activity_logs'>('revisions');
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(
    revisions.length > 0 ? revisions[0].id : null
  );
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [copyToast, setCopyToast] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<HistoryLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingLogs(true);
      cadStorage.getHistoryLog().then((logs) => {
        setHistoryLogs(logs);
        setLoadingLogs(false);
      });
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const selectedRevision =
    revisions.find((r) => r.id === selectedRevisionId) || (revisions.length > 0 ? revisions[0] : null);

  const handleCopyJson = (rev: CADLayoutRevision) => {
    navigator.clipboard.writeText(JSON.stringify(rev.stations, null, 2));
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  const handleDownloadJson = (rev: CADLayoutRevision) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rev, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `factory_cad_layout_${rev.savedAt.replace(/[:.]/g, '-')}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearActivityLogs = async () => {
    await cadStorage.clearHistoryLog();
    setHistoryLogs([]);
  };

  // Compare selected revision stations with current stations
  const getDiffStats = (rev: CADLayoutRevision) => {
    const currentMap = new Map<string, FloorStation>(currentStations.map((s) => [s.id, s]));
    const revMap = new Map<string, FloorStation>(rev.stations.map((s) => [s.id, s]));

    let modified = 0;
    let added = 0;
    let removed = 0;

    for (const [id, revStation] of revMap.entries()) {
      const cur = currentMap.get(id);
      if (!cur) {
        added++; // exists in revision but not in current
      } else if (
        cur.x !== revStation.x ||
        cur.y !== revStation.y ||
        cur.w !== revStation.w ||
        cur.h !== revStation.h ||
        cur.calibrationOffset?.rotationDeg !== revStation.calibrationOffset?.rotationDeg
      ) {
        modified++;
      }
    }

    for (const id of Array.from(currentMap.keys())) {
      if (!revMap.has(id)) {
        removed++;
      }
    }

    return { modified, added, removed, totalDiff: modified + added + removed };
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const getLogTypeBadge = (type: string) => {
    switch (type) {
      case 'upload':
        return {
          icon: <UploadCloud className="w-3.5 h-3.5" />,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Upload',
        };
      case 'save_preset':
        return {
          icon: <Database className="w-3.5 h-3.5" />,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Preset Saved',
        };
      case 'dimension_update':
        return {
          icon: <Sliders className="w-3.5 h-3.5" />,
          color: 'bg-sky-50 text-sky-700 border-sky-200',
          label: 'Dimensions',
        };
      case 'station_move':
        return {
          icon: <Move className="w-3.5 h-3.5" />,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Relocation',
        };
      case 'layout_reset':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5" />,
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Reset',
        };
      default:
        return {
          icon: <Tag className="w-3.5 h-3.5" />,
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          label: type,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">Layout & Dimension History</h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  IndexedDB Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Audit log and preserved snapshots of factory layout, uploaded blueprints, and machine dimensions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('revisions')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'revisions'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Saved Layout Snapshots ({revisions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity_logs')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'activity_logs'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Parameter & Activity Log ({historyLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: Layout Revisions */}
        {activeTab === 'revisions' && (
          <div className="flex-1 flex overflow-hidden min-h-[380px]">
            {/* Left Column: Revision Timeline List */}
            <div className="w-1/3 border-r border-slate-200 overflow-y-auto bg-slate-50/50 p-3 space-y-2">
              {revisions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <Clock className="w-10 h-10 stroke-[1.5] text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No Saved Snapshots</p>
                  <p className="text-[11px] text-slate-400">
                    Click &quot;Save Preset / Save State&quot; on the toolbar to create snapshots that can be restored at any time.
                  </p>
                </div>
              ) : (
                revisions.map((rev, index) => {
                  const isSelected = selectedRevision?.id === rev.id;
                  const isLatest = index === 0;
                  const relativeTime = formatRelativeTime(rev.savedAt);

                  return (
                    <div
                      key={rev.id}
                      onClick={() => setSelectedRevisionId(rev.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? 'bg-white border-sky-500 shadow-md ring-1 ring-sky-500'
                          : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {rev.title || `Snapshot #${revisions.length - index}`}
                          </span>
                          {isLatest && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md shrink-0">
                              Latest
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">
                          {relativeTime}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-2">
                        <span>{rev.stationCount} Stations</span>
                        <span>•</span>
                        <span className="font-mono">{rev.formattedTime}</span>
                      </div>

                      {rev.note && (
                        <p className="text-[11px] text-slate-600 mt-1.5 italic bg-slate-50 px-2 py-0.5 rounded border border-slate-100 line-clamp-2">
                          &ldquo;{rev.note}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Details & Actions */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between bg-white">
              {selectedRevision ? (
                <div className="space-y-5">
                  {/* Header Information */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-bold text-slate-900">
                          {selectedRevision.title || 'Saved Calibration Snapshot'}
                        </h4>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-md">
                          {selectedRevision.formattedTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Saved on: {new Date(selectedRevision.savedAt).toLocaleString()}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => onRestoreRevision(selectedRevision)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95 ring-2 ring-emerald-500/20"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restore This Layout</span>
                    </button>
                  </div>

                  {/* Note Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-500" />
                        <span>Revision Note / Description</span>
                      </span>
                      {editingNoteId !== selectedRevision.id && (
                        <button
                          onClick={() => {
                            setEditingNoteId(selectedRevision.id);
                            setTempNote(selectedRevision.note || '');
                          }}
                          className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                        >
                          {selectedRevision.note ? 'Edit Note' : '+ Add Note'}
                        </button>
                      )}
                    </div>

                    {editingNoteId === selectedRevision.id ? (
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="e.g. Line 3 alignment, Shift handover backup..."
                          className="flex-1 text-xs px-3 py-1.5 bg-white border border-sky-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            onUpdateRevisionNote(selectedRevision.id, tempNote);
                            setEditingNoteId(null);
                          }}
                          className="px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-700 transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">
                        {selectedRevision.note || (
                          <span className="text-slate-400 italic">No notes attached to this revision.</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Diff Comparison vs Current Canvas */}
                  {(() => {
                    const diff = getDiffStats(selectedRevision);
                    return (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Differences vs Live Canvas</span>
                          <span className="text-xs font-mono font-semibold text-slate-600">
                            {diff.totalDiff === 0 ? 'Identical to live setup' : `${diff.totalDiff} stations differ`}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                            <span className="block text-xs font-bold text-amber-600">{diff.modified}</span>
                            <span className="text-[10px] text-slate-500">Position / Dimension Adjusted</span>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                            <span className="block text-xs font-bold text-emerald-600">{diff.added}</span>
                            <span className="text-[10px] text-slate-500">Will Be Added</span>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                            <span className="block text-xs font-bold text-rose-600">{diff.removed}</span>
                            <span className="text-[10px] text-slate-500">Will Be Removed</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Select a layout snapshot on the left to view details and options.
                </div>
              )}

              {/* Bottom Actions */}
              {selectedRevision && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    onClick={() => onDeleteRevision(selectedRevision.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Snapshot</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyJson(selectedRevision)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {copyToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copyToast ? 'Copied JSON!' : 'Copy JSON'}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadJson(selectedRevision)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Persistent Activity & Parameter History Log */}
        {activeTab === 'activity_logs' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-[380px] p-6 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Chronological Activity & Parameter Audit Log</h4>
                <p className="text-xs text-slate-500">
                  Tracks all image uploads, parameter changes, machine dimension edits, presets, and resets in real-time.
                </p>
              </div>
              {historyLogs.length > 0 && (
                <button
                  onClick={handleClearActivityLogs}
                  className="px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 p-3 space-y-2">
              {loadingLogs ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading activity records from IndexedDB...</div>
              ) : historyLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No activity log entries yet. Any edits, uploads, or saved presets will be recorded here automatically.
                </div>
              ) : (
                historyLogs.map((log) => {
                  const badge = getLogTypeBadge(log.type);
                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-1.5 rounded-md border shrink-0 mt-0.5 ${badge.color}`}>
                          {badge.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900">{log.title}</span>
                            <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{log.description}</p>
                          {log.details && (
                            <div className="text-[10px] font-mono text-slate-500 mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                              {JSON.stringify(log.details)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-[11px] font-mono text-slate-500">{log.formattedTime}</span>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Clear Confirmation Dialog */}
        {confirmClear && (
          <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-5 max-w-sm w-full space-y-3 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900">Clear Revision History?</h4>
              </div>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete all saved revision history snapshots? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearAllRevisions();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Confirm Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

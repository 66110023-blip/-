import React, { useState } from 'react';
import { FloorStation } from '../types';
import { X, Code, Copy, Download, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface JsonConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: FloorStation[];
  onImportLayout: (importedStations: FloorStation[]) => void;
  onResetFactoryDefaults: () => void;
}

export const JsonConfigModal: React.FC<JsonConfigModalProps> = ({
  isOpen,
  onClose,
  stations,
  onImportLayout,
  onResetFactoryDefaults,
}) => {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(stations, null, 2));
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facility_floor_cad_layout_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      setErrorMessage(null);
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON root must be an array of FloorStation objects.');
      }
      onImportLayout(parsed);
      setSuccessMessage('Layout successfully loaded and applied!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid JSON syntax. Please verify the format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#cbd5e1] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-[#0f172a]">
              CAD Layout JSON Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#64748b]">
          Export, backup, or import custom calibrated equipment coordinates and dimensions across all 6 lines.
        </p>

        {/* JSON Editor */}
        <div className="flex-1 min-h-[260px] relative">
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full h-full font-mono text-[11px] p-3 bg-[#0f172a] text-emerald-400 rounded-xl border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
            spellCheck={false}
          />
        </div>

        {errorMessage && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset all stations to factory default CAD coordinates?')) {
                onResetFactoryDefaults();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-[#cbd5e1] rounded-xl text-xs font-bold text-rose-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl text-xs font-bold text-[#0f172a] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl text-xs font-bold text-[#0f172a] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Apply / Import</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

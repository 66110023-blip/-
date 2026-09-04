import React from 'react';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { X, Sliders, Play, Pause, RefreshCw, UploadCloud, Layers, Globe } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    showSettingsModal,
    setShowSettingsModal,
    setShowUploadLayoutModal,
    uploadedLayouts,
    activeLayoutId,
    isSimulating,
    setIsSimulating,
    pstTime
  } = useFactory();

  const { t } = useLanguage();

  if (!showSettingsModal) return null;

  const activeLayout = uploadedLayouts.find((l) => l.id === activeLayoutId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#cbd5e1] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#051125]" />
            <h2 className="text-lg font-extrabold text-[#051125]">{t('settings.title', 'Dashboard Configuration')}</h2>
          </div>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="p-1 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#051125] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection Setting */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1e293b] uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>{t('lang.language', 'Language')}</span>
          </label>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2.5 rounded-xl flex items-center justify-between">
            <span className="text-xs text-[#475569] font-medium">
              {t('lang.switch', 'Select system interface language')}
            </span>
            <LanguageSwitcher variant="full" />
          </div>
        </div>

        {/* Live Clock info */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
              {t('settings.clock', 'PST System Clock')}
            </span>
            <span className="font-mono-data font-black text-xl text-[#051125]">
              {pstTime} PST
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
        </div>

        {/* Production Line Layout Upload & Management */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1e293b] uppercase tracking-wider block">
            {t('settings.cad_layout', 'Production Line CAD Layout')}
          </label>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#0284c7]" />
                <div>
                  <span className="text-xs font-bold text-[#0f172a] block">
                    {activeLayout ? activeLayout.name : 'Vector CAD Blueprint (Default)'}
                  </span>
                  <span className="text-[10px] text-[#64748b]">
                    {activeLayout ? `Uploaded ${activeLayout.uploadedAt}` : '6 Production lines (L1–L6)'}
                  </span>
                </div>
              </div>

              {activeLayout && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Active
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setShowSettingsModal(false);
                setShowUploadLayoutModal(true);
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284c7] font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{t('settings.upload_change', 'Upload or Change Layout')}</span>
            </button>
          </div>
        </div>

        {/* Simulation Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1e293b] uppercase tracking-wider block">
            {t('settings.realtime_engine', 'Real-Time Engine')}
          </label>
          <div className="flex items-center justify-between bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl">
            <div className="flex items-center space-x-2">
              <RefreshCw className={`w-4 h-4 text-[#051125] ${isSimulating ? 'animate-spin' : ''}`} />
              <span className="text-xs font-bold text-[#051125]">
                {isSimulating ? t('settings.sim_active', 'Live Simulation Active') : t('settings.sim_paused', 'Simulation Paused')}
              </span>
            </div>

            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`p-2 rounded-lg text-white font-bold transition-colors cursor-pointer ${
                isSimulating ? 'bg-[#ef4444] hover:bg-[#dc2626]' : 'bg-[#10b981] hover:bg-[#059669]'
              }`}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Plant / Line Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1e293b] uppercase tracking-wider block">
            Active Production Line
          </label>
          <select className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl p-2.5 text-xs font-bold text-[#051125]">
            <option>All Lines (L1 - L6)</option>
            <option>Line 6 - Vacuum & Dispensing</option>
            <option>Line 5 - High Speed SMT</option>
            <option>Line 4 - Precision Underfill</option>
            <option>Line 3 - Dual Oven</option>
            <option>Line 2 - Standard Assembly</option>
            <option>Line 1 - NPI Prototype</option>
          </select>
        </div>

        <div className="pt-2 border-t border-[#f1f5f9]">
          <button
            onClick={() => setShowSettingsModal(false)}
            className="w-full bg-[#051125] hover:bg-[#1e293b] text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {t('settings.close', 'Apply & Close')}
          </button>
        </div>
      </div>
    </div>
  );
};


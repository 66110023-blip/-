import React from 'react';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Map,
  Activity,
  BarChart3,
  AlertTriangle,
  HelpCircle,
  FileText,
  User,
  UploadCloud,
} from 'lucide-react';
import { CATEGORY_METADATA } from '../data/defaultCadLayout';

export const FacilitySidebar: React.FC = () => {
  const {
    currentScreen,
    navigate,
    setShowAlertHistoryModal,
    setShowSettingsModal,
    setShowUploadLayoutModal,
    activeLayoutId,
  } = useFactory();

  const { t } = useLanguage();

  const isProcessActive =
    currentScreen === 'process-view' ||
    currentScreen === 'oven-selection' ||
    currentScreen === 'vacuum-process' ||
    currentScreen === 'bake-process' ||
    currentScreen === 'machine-info' ||
    currentScreen === 'machine-detail' ||
    currentScreen === 'fvmi' ||
    currentScreen === 'fvmi-detail' ||
    currentScreen === 'packout-selection' ||
    currentScreen === 'packout-count' ||
    currentScreen === 'packout-aoi' ||
    currentScreen === 'packout-ocr' ||
    currentScreen === 'packout-xray';

  const navItems = [
    {
      id: 'main-floor',
      label: t('nav.main_floor', 'Main Floor (CAD)'),
      icon: Map,
      onClick: () => navigate('main-floor'),
      isActive: currentScreen === 'main-floor',
    },
    {
      id: 'process-overview',
      label: t('nav.process_view', 'Process View'),
      icon: Activity,
      onClick: () => navigate('process-view'),
      isActive: isProcessActive,
    },
    {
      id: 'analytics',
      label: t('nav.analytics', 'Analytics & KPIs'),
      icon: BarChart3,
      onClick: () => navigate('analytics'),
      isActive: currentScreen === 'analytics',
    },
    {
      id: 'alerts',
      label: t('nav.alerts', 'Alerts & Issues'),
      icon: AlertTriangle,
      onClick: () => setShowAlertHistoryModal(true),
      badge: '1',
      isActive: false,
    },
  ];

  return (
    <aside className="w-60 shrink-0 bg-white border-l border-[#e2e8f0] flex flex-col justify-between select-none h-[calc(100vh-85px)] sticky top-[85px] overflow-y-auto">
      {/* Top Section: User Profile Card & Nav Links */}
      <div className="p-3 space-y-4">
        {/* User profile card */}
        <div className="flex items-center space-x-3 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
          <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
            <User className="w-5 h-5 text-slate-600" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#0f172a] truncate">Shift Alpha</h4>
            <p className="text-[11px] text-[#64748b] font-medium truncate">Floor Manager</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  item.isActive
                    ? 'bg-[#e0f2fe] text-[#0284c7] font-extrabold shadow-2xs'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      item.isActive ? 'text-[#0284c7]' : 'text-[#64748b]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* MAP LEGEND */}
        <div className="pt-2 border-t border-[#e2e8f0]">
          <div className="flex items-center justify-between mb-2 px-1">
            <h5 className="text-[10px] font-black text-[#64748b] uppercase tracking-wider">
              MAP LEGEND
            </h5>
            <span className="text-[9px] font-mono text-pink-600 font-bold bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">
              6 Types
            </span>
          </div>

          <div className="space-y-2.5 px-1 text-[11px] font-medium text-[#334155]">
            <div className="space-y-1">
              <div
                onClick={() => navigate('packout-xray')}
                className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-pink-50 cursor-pointer transition-colors"
              >
                <div
                  className="w-3.5 h-3.5 rounded-xs shrink-0 shadow-2xs"
                  style={{ backgroundColor: '#ec4899' }}
                />
                <span className="font-bold text-pink-900">X-ray Machine (5 Units)</span>
              </div>
              <div className="pl-6 flex flex-wrap gap-1">
                {[1, 2, 3, 4, 5].map((num) => {
                  const mKey = `X-RAY 0${num}`;
                  return (
                    <button
                      key={num}
                      onClick={() => navigate('packout-xray', mKey)}
                      className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-pink-50 hover:bg-pink-600 hover:text-white text-pink-800 rounded border border-pink-200 transition-colors cursor-pointer"
                      title={`Direct jump to ${mKey}`}
                    >
                      X-0{num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              onClick={() => navigate('machine-detail', 'MC-01')}
              className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-sky-50 cursor-pointer transition-colors"
            >
              <div
                className="w-3.5 h-3.5 rounded-xs shrink-0 shadow-2xs"
                style={{ backgroundColor: CATEGORY_METADATA.dispensing.color }}
              />
              <span>Dispensing Machine</span>
            </div>

            <div
              onClick={() => navigate('fvmi')}
              className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
            >
              <div
                className="w-3.5 h-3.5 rounded-xs shrink-0 shadow-2xs"
                style={{ backgroundColor: CATEGORY_METADATA.fvmi.color }}
              />
              <span>FVMI Inspection</span>
            </div>

            <div className="space-y-1">
              <div
                onClick={() => navigate('packout-aoi')}
                className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
              >
                <div
                  className="w-3.5 h-3.5 rounded-xs shrink-0 shadow-2xs"
                  style={{ backgroundColor: CATEGORY_METADATA.packout.color }}
                />
                <span className="font-bold text-purple-900">AOI Inspection (2 Units)</span>
              </div>
              <div className="pl-6 flex flex-wrap gap-1">
                {['AOI-01', 'AOI-02'].map((id) => (
                  <button
                    key={id}
                    onClick={() => navigate('packout-aoi', id)}
                    className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-800 rounded border border-purple-200 transition-colors cursor-pointer"
                    title={`Direct jump to ${id}`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

            <div
              onClick={() => navigate('packout-selection')}
              className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
            >
              <div
                className="w-3.5 h-3.5 rounded-xs shrink-0 shadow-2xs"
                style={{ backgroundColor: '#a855f7' }}
              />
              <span>Pack Out & X-ray</span>
            </div>

            <div
              onClick={() => navigate('vacuum-process')}
              className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
            >
              <div
                className="w-3.5 h-3.5 rounded-xs shrink-0 shadow-2xs"
                style={{ backgroundColor: CATEGORY_METADATA['oven-vacuum'].color }}
              />
              <span>Oven (Vacuum)</span>
            </div>

            <div
              onClick={() => navigate('bake-process')}
              className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
            >
              <div
                className="w-3.5 h-3.5 rounded-xs shrink-0 shadow-2xs"
                style={{ backgroundColor: CATEGORY_METADATA['oven-bake'].color }}
              />
              <span>Oven (Bake)</span>
            </div>
          </div>
        </div>

        {/* Layout Upload Shortcut Box */}
        <div className="p-2.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">
              Plant Floor Layout
            </span>
            {activeLayoutId !== 'default' && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                Custom
              </span>
            )}
          </div>
          <button
            onClick={() => setShowUploadLayoutModal(true)}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 bg-white hover:bg-sky-100 border border-sky-300 text-[#0284c7] font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Line Layout</span>
          </button>
        </div>
      </div>

      {/* Bottom Auxiliary Links */}
      <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc] space-y-1">
        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </button>

        <button
          onClick={() => setShowAlertHistoryModal(true)}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Logs</span>
        </button>
      </div>
    </aside>
  );
};

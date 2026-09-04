import React from 'react';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Bell,
  Settings,
  User,
  UploadCloud,
  Barcode,
  Layers,
  Activity,
  PackageCheck
} from 'lucide-react';

interface FacilityHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const FacilityHeader: React.FC<FacilityHeaderProps> = ({
  activeTab = 'map',
  onTabChange,
}) => {
  const {
    setShowSettingsModal,
    setShowAlertHistoryModal,
    setShowUploadLayoutModal,
    openTraceabilityModal,
    activeLayoutId,
    navigate,
    currentScreen
  } = useFactory();

  const { t, language } = useLanguage();

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    if (tab === 'map') {
      navigate('main-floor');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#e2e8f0] select-none">
      {/* Top Primary Navigation Bar */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
        {/* Brand & Tabs */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Brand */}
          <div
            onClick={() => navigate('main-floor')}
            className="cursor-pointer flex items-center space-x-2"
          >
            <span className="font-mono font-black text-base sm:text-xl tracking-tight text-[#0284c7]">
              FACILITY COMMAND
            </span>
          </div>
        </div>

        {/* Top Right Utility Icons & Language Switcher */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Direct Traceability Inspector Button */}
          <button
            onClick={() => openTraceabilityModal()}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Open Traceability Inspector"
          >
            <Barcode className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline font-bold">
              Traceability
            </span>
          </button>

          {/* Language Switcher (EN / TH) */}
          <LanguageSwitcher variant="pill" />

          {/* Upload Production Line Layout Quick Button */}
          <button
            onClick={() => setShowUploadLayoutModal(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284c7] hover:text-sky-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title={t('nav.upload_layout', 'Upload and Manage Production Line Layouts')}
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden xl:inline">{t('nav.upload_layout', 'Upload Layout')}</span>
            {activeLayoutId !== 'default' && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Custom CAD Active" />
            )}
          </button>

          {/* Notification Bell with Badge */}
          <button
            onClick={() => setShowAlertHistoryModal(true)}
            className="relative p-2 text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl transition-colors cursor-pointer"
            aria-label="Alerts"
            title={t('nav.alerts', 'Alerts & Issues')}
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              1
            </span>
          </button>

          {/* Settings Gear */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] rounded-xl transition-colors cursor-pointer"
            aria-label="Settings"
            title={t('nav.settings', 'Settings')}
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          {/* User Profile Avatar */}
          <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </header>
  );
};



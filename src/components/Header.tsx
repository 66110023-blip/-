import React from 'react';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  BarChart3,
  Settings,
  ArrowLeft,
  Map,
  ChevronRight,
  Bell,
  Clock
} from 'lucide-react';
import { DateCalendarPicker } from './DateCalendarPicker';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSettings?: boolean;
  showDatePicker?: boolean;
  badge?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  showSettings = true,
  showDatePicker = true,
  badge
}) => {
  const {
    currentScreen,
    navigate,
    goBack,
    canGoBack,
    breadcrumbs,
    pstTime,
    setShowSettingsModal,
    setShowUploadLayoutModal,
    setShowAlertHistoryModal
  } = useFactory();

  const { t } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  const isBackVisible = showBack !== undefined ? showBack : canGoBack && currentScreen !== 'main-floor';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] px-3 sm:px-5 py-2.5 flex flex-col gap-1.5 select-none shadow-2xs">
      {/* Top Row: Breadcrumbs & Quick Links */}
      {breadcrumbs.length > 1 && (
        <div className="flex items-center space-x-1.5 text-[11px] text-[#64748b] overflow-x-auto py-0.5 scrollbar-none">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`${crumb.screen}-${idx}`}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-[#94a3b8] shrink-0" />}
                {isLast ? (
                  <span className="font-bold text-[#0f172a] truncate max-w-[140px] sm:max-w-[200px]">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.screen, crumb.machineId)}
                    className="hover:text-[#0284c7] hover:underline transition-colors cursor-pointer shrink-0 truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Main Bar */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        {/* Left Side: Back button + Title */}
        <div className="flex items-center space-x-2.5 min-w-0">
          {isBackVisible && (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg text-[#334155] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors cursor-pointer shrink-0 active:scale-95 duration-150 border border-[#e2e8f0] shadow-2xs"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          <div className="flex items-center space-x-2 min-w-0">
            <BarChart3 className="w-5 h-5 text-[#0284c7] shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-black text-[#0f172a] tracking-tight truncate">
                  {title || (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Process View')}
                </h1>
                {badge}
              </div>
              {subtitle && (
                <p className="text-[11px] text-[#64748b] font-medium truncate hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Tools */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Quick PST Time Badge */}
          <div className="hidden lg:flex items-center space-x-1 px-2 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[11px] font-mono font-bold text-[#334155]">
            <Clock className="w-3.5 h-3.5 text-[#64748b]" />
            <span>{pstTime}</span>
            <span className="text-[9px] text-[#94a3b8]">PST</span>
          </div>

          {/* Language Switcher (EN / TH) */}
          <LanguageSwitcher variant="pill" />

          {/* Switch to CAD Floor Plan View */}
          {currentScreen !== 'main-floor' && (
            <button
              onClick={() => navigate('main-floor')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#cbd5e1] text-[#334155] hover:text-[#0284c7] hover:border-[#0284c7] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title={t('nav.cad_map', 'Switch to CAD Floor Plan View')}
            >
              <Map className="w-3.5 h-3.5 text-[#0284c7]" />
              <span className="hidden md:inline">{t('nav.cad_map', 'CAD Map')}</span>
            </button>
          )}

          {/* Alert History Button */}
          <button
            onClick={() => setShowAlertHistoryModal(true)}
            className="p-1.5 rounded-lg text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors cursor-pointer relative"
            title="Alerts & Maintenance Logs"
            aria-label="Alerts"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444]" />
          </button>

          {/* Date Picker */}
          {showDatePicker && <DateCalendarPicker compact />}

          {/* Settings Modal Button */}
          {showSettings && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 rounded-lg text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors cursor-pointer"
              title="Settings & Simulation Controls"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 stroke-[2]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


import React from 'react';
import { useFactory } from '../context/FactoryContext';
import { useLanguage } from '../context/LanguageContext';
import { LayoutGrid, BarChart3, Map, AlertTriangle } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigate, setShowAlertHistoryModal } = useFactory();
  const { t } = useLanguage();

  const isMainFloorActive = currentScreen === 'main-floor';

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

  const isAnalyticsActive = currentScreen === 'analytics';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] px-3 py-2">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5 sm:gap-2">
        <button
          onClick={() => navigate('main-floor')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
            isMainFloorActive
              ? 'bg-[#0284c7] text-white shadow-sm font-semibold'
              : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
          }`}
        >
          <Map className="w-5 h-5 mb-1 stroke-[2.2]" />
          <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
            {t('nav.main_floor', 'Main Floor')}
          </span>
        </button>

        <button
          onClick={() => navigate('process-view')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
            isProcessActive
              ? 'bg-[#0284c7] text-white shadow-sm font-semibold'
              : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-1 stroke-[2.2]" />
          <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
            {t('nav.process', 'Process')}
          </span>
        </button>

        <button
          onClick={() => navigate('analytics')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
            isAnalyticsActive
              ? 'bg-[#0284c7] text-white shadow-sm font-semibold'
              : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-1 stroke-[2.2]" />
          <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
            {t('nav.analytics', 'Analytics')}
          </span>
        </button>

        <button
          onClick={() => setShowAlertHistoryModal(true)}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] cursor-pointer"
        >
          <AlertTriangle className="w-5 h-5 mb-1 stroke-[2.2]" />
          <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
            {t('nav.alerts', 'Alerts')}
          </span>
        </button>
      </div>
    </nav>
  );
};



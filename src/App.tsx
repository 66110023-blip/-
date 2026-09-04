/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FactoryProvider, useFactory } from './context/FactoryContext';
import { LanguageProvider } from './context/LanguageContext';
import { MainFloorView } from './components/MainFloorView';
import { FacilityHeader } from './components/FacilityHeader';
import { FacilitySidebar } from './components/FacilitySidebar';
import { ProcessView } from './components/ProcessView';
import { OvenSelectionView } from './components/OvenSelectionView';
import { VacuumProcessView } from './components/VacuumProcessView';
import { BakeProcessView } from './components/BakeProcessView';
import { MachineInfoView } from './components/MachineInfoView';
import { MachineDetailView } from './components/MachineDetailView';
import { AnalyticsView } from './components/AnalyticsView';
import { FVMIFleetMonitor } from './components/FVMIFleetMonitor';
import { FVMIDetailView } from './components/FVMIDetailView';
import { PackOutSelectionView } from './components/PackOutSelectionView';
import { PackOutCountView } from './components/PackOutCountView';
import { PackOutOcrView } from './components/PackOutOcrView';
import { BottomNav } from './components/BottomNav';
import { AlertHistoryModal } from './components/AlertHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { UploadCADModal } from './components/UploadCADModal';
import { WorkpieceTraceabilityModal } from './components/WorkpieceTraceabilityModal';

const MainContent: React.FC = () => {
  const { currentScreen, showUploadLayoutModal, setShowUploadLayoutModal } = useFactory();

  const isCadMainFloor = currentScreen === 'main-floor';

  const activeTab =
    currentScreen === 'main-floor'
      ? 'map'
      : currentScreen === 'analytics'
      ? 'analytics'
      : 'performance';

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main-floor':
        return <MainFloorView />;
      case 'process-view':
        return <ProcessView />;
      case 'oven-selection':
        return <OvenSelectionView />;
      case 'vacuum-process':
        return <VacuumProcessView />;
      case 'bake-process':
        return <BakeProcessView />;
      case 'machine-info':
      case 'machine-detail':
        return <MachineDetailView />;
      case 'fvmi':
        return <FVMIFleetMonitor />;
      case 'fvmi-detail':
        return <FVMIDetailView />;
      case 'packout-selection':
        return <PackOutSelectionView />;
      case 'packout-aoi':
      case 'packout-count':
        return <PackOutCountView />;
      case 'packout-xray':
      case 'packout-ocr':
        return <PackOutOcrView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <ProcessView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#0f172a] font-sans antialiased selection:bg-sky-500 selection:text-white">
      <FacilityHeader activeTab={activeTab} />
      <div className="flex-1 flex overflow-hidden">
        <main className={`flex-1 min-w-0 ${isCadMainFloor ? 'overflow-hidden' : 'overflow-y-auto pb-20 lg:pb-8'}`}>
          {renderScreen()}
        </main>
        <div className="hidden lg:block shrink-0">
          <FacilitySidebar />
        </div>
      </div>
      <BottomNav />
      <AlertHistoryModal />
      <SettingsModal />
      <WorkpieceTraceabilityModal />
      <UploadCADModal
        isOpen={showUploadLayoutModal}
        onClose={() => setShowUploadLayoutModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <FactoryProvider>
        <MainContent />
      </FactoryProvider>
    </LanguageProvider>
  );
}


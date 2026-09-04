import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ScreenType,
  Machine,
  OvenUnit,
  ProcessNodeSummary,
  ProcessChartsData,
  MachineStatus,
  ProductionLineLayout,
  ProductionLine,
  NavigationEntry,
  BreadcrumbItem,
  WorkpieceRecord,
  WorkpieceStep
} from '../types';
import { cadStorage } from '../utils/cadStorage';
import { INITIAL_WORKPIECES, generateSyntheticTraceabilityRecord } from '../data/traceabilityData';
import { normalizeAoiMachineId, normalizeXrayMachineId } from '../utils/machineLinkUtils';

const STORAGE_LAYOUTS_KEY = 'factory_production_line_layouts_v1';
const STORAGE_ACTIVE_LAYOUT_ID_KEY = 'factory_active_layout_id_v1';
const STORAGE_LAYOUT_OPACITY_KEY = 'factory_layout_opacity_v1';
const STORAGE_MACHINES_KEY = 'factory_machines_v1';
const STORAGE_OVEN_UNITS_KEY = 'factory_oven_units_v1';
const STORAGE_SIMULATING_KEY = 'factory_is_simulating_v1';
const STORAGE_SELECTED_MACHINE_ID_KEY = 'factory_selected_machine_id_v1';
const STORAGE_WORKPIECES_KEY = 'factory_workpieces_v1';
const STORAGE_PROCESS_CHARTS_KEY = 'factory_process_charts_v3';

interface FactoryContextType {
  currentScreen: ScreenType;
  selectedMachineId: string;
  pstTime: string;
  selectedDate: string; // YYYY-MM-DD
  isToday: boolean;
  isSimulating: boolean;
  machines: Machine[];
  ovenUnits: OvenUnit[];
  processNodes: ProcessNodeSummary[];
  chartsData: ProcessChartsData;
  navigationHistory: NavigationEntry[];
  canGoBack: boolean;
  breadcrumbs: BreadcrumbItem[];
  goBack: () => void;
  showAlertHistoryModal: boolean;
  showSettingsModal: boolean;
  showUploadLayoutModal: boolean;
  showTraceabilityModal: boolean;
  selectedTraceabilitySerial: string | null;
  workpieces: WorkpieceRecord[];
  uploadedLayouts: ProductionLineLayout[];
  activeLayoutId: string;
  activeLayoutUrl: string | undefined;
  activeLayoutOpacity: number;
  setSelectedDate: (dateStr: string) => void;
  navigate: (screen: ScreenType, machineId?: string, replace?: boolean) => void;
  setSelectedMachineId: (id: string) => void;
  updateMachineModel: (machineId: string, newModel: string) => void;
  updateMachineStatus: (machineId: string, newStatus: MachineStatus, reason?: string) => void;
  updateMachineFull: (machineId: string, updates: Partial<Machine>) => void;
  updateOvenModel: (unitId: string, newModel: string) => void;
  updateOvenStatus: (unitId: string, newStatus: MachineStatus, reason?: string) => void;
  updateOvenFull: (unitId: string, updates: Partial<OvenUnit>) => void;
  updateProcessChartPoint: (category: keyof ProcessChartsData, field: string, index: number, value: number) => void;
  openTraceabilityModal: (serial?: string) => void;
  closeTraceabilityModal: () => void;
  getWorkpieceBySerial: (serial: string) => WorkpieceRecord;
  addWorkpiece: (record: WorkpieceRecord) => void;
  updateWorkpiece: (serial: string, updates: Partial<WorkpieceRecord>) => void;
  updateWorkpieceStep: (serial: string, stepNumber: number, stepUpdates: Partial<WorkpieceStep>) => void;
  addWorkpieceStep: (serial: string, step: WorkpieceStep) => void;
  deleteWorkpiece: (serial: string) => void;
  setShowAlertHistoryModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowUploadLayoutModal: (show: boolean) => void;
  setShowTraceabilityModal: (show: boolean) => void;
  setIsSimulating: (simulating: boolean) => void;
  uploadProductionLineLayout: (layout: {
    name: string;
    dataUrl: string;
    lineScope?: ProductionLine;
    description?: string;
    setAsActive?: boolean;
    fileSize?: string;
    dimensions?: { width: number; height: number };
  }) => string;
  updateProductionLineLayout: (id: string, updates: Partial<ProductionLineLayout>) => void;
  duplicateProductionLineLayout: (id: string) => string | null;
  deleteProductionLineLayout: (id: string) => void;
  clearAllCustomLayouts: () => void;
  setActiveLayoutPreset: (id: string) => void;
  setCustomFloorImageUrl: (url: string | undefined) => void;
  setCustomFloorImageOpacity: (opacity: number) => void;
  resetLayoutToDefault: () => void;
}

const initialMachines: Machine[] = [
  {
    id: 'MC-01',
    name: 'MC-01',
    processType: 'Top Fill',
    status: 'RUNNING',
    oeePercent: 96.4,
    operatorId: 'OP-T1001',
    runningModel: 'MODEL 504-2224',
    shiftTime: '08:00 - 11:00',
    uph: 950,
    uphTrendPercent: +1.1,
    inputCount: 1080,
    outputCount: 1075,
    downtimeReason: 'Nozzle Cleaned',
    downtimeDurationMins: 10,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '21:45',
      remainingMins: 112,
    },
    downtimeHistory: [
      {
        id: 'dt-mc01-1',
        timeRange: '09:15 - 09:25',
        durationMins: 10,
        category: 'OP',
        reason: 'Nozzle Cleaned'
      }
    ]
  },
  {
    id: 'MC-02',
    name: 'MC-02',
    processType: 'Top Fill',
    status: 'RUNNING',
    oeePercent: 98.1,
    operatorId: 'OP-T1002',
    runningModel: 'MODEL 504-2224',
    shiftTime: '11:00 - 14:00',
    uph: 970,
    uphTrendPercent: +1.8,
    inputCount: 1150,
    outputCount: 1148,
    downtimeReason: 'Feeder Adjust',
    downtimeDurationMins: 8,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '22:00',
      remainingMins: 120,
    },
    downtimeHistory: [
      {
        id: 'dt-mc02-1',
        timeRange: '10:00 - 10:08',
        durationMins: 8,
        category: 'ME',
        reason: 'Feeder Adjust'
      }
    ]
  },
  {
    id: 'MC-03',
    name: 'MC-03',
    processType: 'Top Fill',
    status: 'STOP',
    operatorId: 'OP-T1003',
    runningModel: 'MODEL 504-2268',
    shiftTime: '08:00 - 11:00',
    uph: 0,
    uphTrendPercent: -100,
    inputCount: 600,
    outputCount: 580,
    downtimeReason: 'Sensor Calibration',
    downtimeDurationMins: 12,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '20:30',
      remainingMins: 30,
    },
    downtimeHistory: [
      {
        id: 'dt-mc03-1',
        timeRange: '13:30 - 13:42',
        durationMins: 12,
        category: 'ME',
        reason: 'Sensor Calibration'
      }
    ]
  },
  {
    id: 'MC-04',
    name: 'MC-04',
    processType: 'Top Fill',
    status: 'RUNNING',
    oeePercent: 95.8,
    operatorId: 'OP-T1004',
    runningModel: 'MODEL 504-2154',
    shiftTime: '13:00 - 16:00',
    uph: 940,
    uphTrendPercent: +0.5,
    inputCount: 1100,
    outputCount: 1095,
    downtimeReason: 'Purge Routine',
    downtimeDurationMins: 6,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '22:30',
      remainingMins: 150,
    },
    downtimeHistory: [
      {
        id: 'dt-mc04-1',
        timeRange: '14:00 - 14:06',
        durationMins: 6,
        category: 'OP',
        reason: 'Purge Routine'
      }
    ]
  },
  {
    id: 'MC-05',
    name: 'MC-05',
    processType: 'Under Fill',
    status: 'RUNNING',
    oeePercent: 94.2,
    operatorId: 'E-7721',
    runningModel: 'Model 504-2224 (11:00 - 14:00)',
    shiftTime: '11:00 - 14:00',
    uph: 942,
    uphTrendPercent: -2.1,
    inputCount: 1105,
    outputCount: 1102,
    downtimeReason: 'Pump Cleaning',
    downtimeDurationMins: 15,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '21:45',
      remainingMins: 112,
    },
    downtimeHistory: [
      {
        id: 'dt-1',
        timeRange: '13:10 - 13:15',
        durationMins: 5,
        category: 'OP',
        reason: 'Nozzle Cleaning'
      },
      {
        id: 'dt-2',
        timeRange: '11:45 - 12:05',
        durationMins: 20,
        category: 'ME',
        reason: 'Vision Error'
      }
    ]
  },
  {
    id: 'MC-06',
    name: 'MC-06',
    processType: 'Under Fill',
    status: 'STOP',
    operatorId: 'OP-E3302',
    runningModel: 'MODEL 504-2187',
    shiftTime: '13:00 - 16:00',
    uph: 0,
    uphTrendPercent: -100,
    inputCount: 520,
    outputCount: 510,
    downtimeReason: 'Nozzle Clean Required',
    downtimeDurationMins: 8,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '20:15',
      remainingMins: 15,
    },
    downtimeHistory: [
      {
        id: 'dt-mc06-1',
        timeRange: '12:10 - 12:18',
        durationMins: 8,
        category: 'OP',
        reason: 'Nozzle Clean Required'
      }
    ]
  },
  {
    id: 'MC-07',
    name: 'MC-07',
    processType: 'Under Fill',
    status: 'RUNNING',
    oeePercent: 96.8,
    operatorId: 'OP-E5501',
    runningModel: 'MODEL 504-2187',
    shiftTime: '09:00 - 12:00',
    uph: 960,
    uphTrendPercent: +0.9,
    inputCount: 1140,
    outputCount: 1135,
    downtimeReason: 'Tray Align',
    downtimeDurationMins: 5,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '23:15',
      remainingMins: 200,
    },
    downtimeHistory: [
      {
        id: 'dt-mc07-1',
        timeRange: '13:00 - 13:05',
        durationMins: 5,
        category: 'ME',
        reason: 'Tray Align'
      }
    ]
  },
  {
    id: 'MC-08',
    name: 'MC-08',
    processType: 'Under Fill',
    status: 'RUNNING',
    oeePercent: 95.4,
    operatorId: 'OP-E1122',
    runningModel: 'MODEL 504-2268',
    shiftTime: '10:00 - 13:00',
    uph: 950,
    uphTrendPercent: +0.4,
    inputCount: 1180,
    outputCount: 1175,
    downtimeReason: 'Syringe Check',
    downtimeDurationMins: 4,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '22:15',
      remainingMins: 140,
    },
    downtimeHistory: [
      {
        id: 'dt-mc08-1',
        timeRange: '11:10 - 11:14',
        durationMins: 4,
        category: 'OP',
        reason: 'Syringe Check'
      }
    ]
  },
  {
    id: 'MC-09',
    name: 'MC-09',
    processType: 'Under Fill',
    status: 'RUNNING',
    oeePercent: 94.7,
    operatorId: 'OP-E6677',
    runningModel: 'MODEL 504-2268',
    shiftTime: '10:00 - 13:00',
    uph: 955,
    uphTrendPercent: +0.8,
    inputCount: 1200,
    outputCount: 1195,
    downtimeReason: 'Syringe Swap',
    downtimeDurationMins: 6,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '22:10',
      remainingMins: 135,
    },
    downtimeHistory: [
      {
        id: 'dt-mc09-1',
        timeRange: '09:30 - 09:36',
        durationMins: 6,
        category: 'OP',
        reason: 'Syringe Swap'
      }
    ]
  },
  {
    id: 'MC-10',
    name: 'MC-10',
    processType: 'Under Fill',
    status: 'STOP',
    operatorId: 'OP-E8811',
    runningModel: 'MODEL 504-2187',
    shiftTime: '10:00 - 13:00',
    uph: 0,
    uphTrendPercent: -100,
    inputCount: 450,
    outputCount: 410,
    downtimeReason: 'JAM CLEAR',
    downtimeDurationMins: 5,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '20:30',
      remainingMins: 35,
    },
    downtimeHistory: [
      {
        id: 'dt-10-1',
        timeRange: '14:20 - 14:25',
        durationMins: 5,
        category: 'OP',
        reason: 'JAM CLEAR'
      }
    ]
  },
  {
    id: 'MC-11',
    name: 'MC-11',
    processType: 'Under Fill',
    status: 'RUNNING',
    oeePercent: 99.2,
    operatorId: 'OP-E2299',
    runningModel: 'MODEL 504-2154',
    shiftTime: '15:00 - 18:00',
    uph: 980,
    uphTrendPercent: +1.5,
    inputCount: 1310,
    outputCount: 1308,
    downtimeReason: 'Vision Inspection Test',
    downtimeDurationMins: 7,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '23:00',
      remainingMins: 185,
    },
    downtimeHistory: [
      {
        id: 'dt-mc11-1',
        timeRange: '08:45 - 08:52',
        durationMins: 7,
        category: 'ME',
        reason: 'Vision Inspection Test'
      }
    ]
  },
  {
    id: 'MC-12',
    name: 'MC-12',
    processType: 'Under Fill',
    status: 'RUNNING',
    oeePercent: 93.6,
    operatorId: 'OP-E5588',
    runningModel: 'MODEL 504-2224',
    shiftTime: '11:00 - 14:00',
    uph: 928,
    uphTrendPercent: -0.4,
    inputCount: 1050,
    outputCount: 1042,
    downtimeReason: 'Weight Calibration',
    downtimeDurationMins: 9,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '21:15',
      remainingMins: 82,
    },
    downtimeHistory: [
      {
        id: 'dt-mc12-1',
        timeRange: '10:15 - 10:24',
        durationMins: 9,
        category: 'OP',
        reason: 'Weight Calibration'
      }
    ]
  },
  {
    id: 'MC-13',
    name: 'MC-13',
    processType: 'Under Fill',
    status: 'RUNNING',
    oeePercent: 97.9,
    operatorId: 'OP-E1100',
    runningModel: 'MODEL 504-2454',
    shiftTime: '08:30 - 11:30',
    uph: 962,
    uphTrendPercent: +0.5,
    inputCount: 1180,
    outputCount: 1176,
    downtimeReason: 'Heater Temp Adjust',
    downtimeDurationMins: 11,
    glueInfo: {
      glueType: 'U8410-405',
      expiryTime: '21:50',
      remainingMins: 117,
    },
    downtimeHistory: [
      {
        id: 'dt-mc13-1',
        timeRange: '11:00 - 11:11',
        durationMins: 11,
        category: 'ME',
        reason: 'Heater Temp Adjust'
      }
    ]
  }
];

const initialOvenUnits: OvenUnit[] = [
  {
    id: 'oven-1',
    name: 'Oven #1',
    subType: 'Vacuum',
    status: 'RUNNING',
    chamberLabel: 'OVEN CHAMBER A • ME READY',
    operatorId: 'Staff ID: 08452',
    magazinesCount: 4,
    pcsCount: 1200,
    runningModel: '504-2187',
    program: 'A01-2',
    stepCurrent: 3,
    stepTotal: 7,
    tempCelsius: 180,
    pressurePa: 0.5,
    remainingSeconds: 763,
    downtimeReason: 'Chamber Purge',
    downtimeDurationMins: 10
  },
  {
    id: 'oven-2',
    name: 'Oven #2',
    subType: 'Vacuum',
    status: 'STOP',
    chamberLabel: 'OVEN CHAMBER B • ME CHECK',
    operatorId: 'Staff ID: 08453',
    magazinesCount: 3,
    pcsCount: 900,
    runningModel: '504-2268',
    program: 'A01-1',
    stepCurrent: 0,
    stepTotal: 7,
    tempCelsius: 25,
    pressurePa: 0.0,
    remainingSeconds: 0,
    downtimeReason: 'Pressure Valve Fault',
    downtimeDurationMins: 20
  },
  {
    id: 'bake-1',
    name: 'Bake #1',
    subType: 'Bake',
    status: 'RUNNING',
    chamberLabel: 'BAKE MODULE B1',
    operatorId: '0P-8921',
    magazinesCount: 4,
    pcsCount: 1200,
    runningModel: '504-2187',
    program: 'PRG-B-150',
    tempCelsius: 168.4,
    targetTempMin: 165.0,
    targetTempMax: 170.0,
    remainingSeconds: 3900,
    estFinishTime: '14:50',
    downtimeReason: 'Heater Coil Check',
    downtimeDurationMins: 8
  },
  {
    id: 'bake-2',
    name: 'Bake #2',
    subType: 'Bake',
    status: 'STOP',
    chamberLabel: 'BAKE MODULE B2',
    operatorId: 'OP-1102',
    magazinesCount: 2,
    pcsCount: 600,
    runningModel: '504-2268',
    program: 'PRG-B-120',
    tempCelsius: 25.0,
    targetTempMin: 165.0,
    targetTempMax: 170.0,
    remainingSeconds: 0,
    estFinishTime: '--',
    downtimeReason: 'Temp Sensor Calibration',
    downtimeDurationMins: 18
  },
  {
    id: 'bake-3',
    name: 'Bake #3',
    subType: 'Bake',
    status: 'RUNNING',
    chamberLabel: 'BAKE MODULE B3',
    operatorId: 'OP-3321',
    magazinesCount: 5,
    pcsCount: 1500,
    runningModel: '504-2154',
    program: 'PRG-B-150',
    tempCelsius: 169.1,
    targetTempMin: 165.0,
    targetTempMax: 170.0,
    remainingSeconds: 2520,
    estFinishTime: '15:15',
    downtimeReason: 'Filter Cleaning',
    downtimeDurationMins: 12
  },
  {
    id: 'bake-4',
    name: 'Bake #4',
    subType: 'Bake',
    status: 'RUNNING',
    chamberLabel: 'BAKE MODULE B4',
    operatorId: 'OP-4412',
    magazinesCount: 3,
    pcsCount: 900,
    runningModel: '504-2224',
    program: 'PRG-B-160',
    tempCelsius: 167.8,
    targetTempMin: 165.0,
    targetTempMax: 170.0,
    remainingSeconds: 1680,
    estFinishTime: '15:00',
    downtimeReason: 'Door Latch Inspection',
    downtimeDurationMins: 5
  },
  {
    id: 'bake-5',
    name: 'Bake #5',
    subType: 'Bake',
    status: 'RUNNING',
    chamberLabel: 'BAKE MODULE B5',
    operatorId: 'OP-5599',
    magazinesCount: 4,
    pcsCount: 1200,
    runningModel: '504-2454',
    program: 'PRG-B-150',
    tempCelsius: 168.0,
    targetTempMin: 165.0,
    targetTempMax: 170.0,
    remainingSeconds: 3000,
    estFinishTime: '15:22',
    downtimeReason: 'Exhaust Fan Check',
    downtimeDurationMins: 7
  }
];

const initialProcessNodes: ProcessNodeSummary[] = [
  {
    id: 'node-vacuum',
    nodeNumber: 1,
    title: 'Vacuum Oven',
    subtitle: 'Degassing & Bubble Elimination',
    assignedMachinesCount: 2,
    assignedMachinesLabel: '2 units assigned'
  },
  {
    id: 'node-bake',
    nodeNumber: 2,
    title: 'Bake Oven',
    subtitle: 'Thermal Curing & Polymerization',
    assignedMachinesCount: 5,
    assignedMachinesLabel: '5 units assigned'
  },
  {
    id: 'node-dispensing',
    nodeNumber: 3,
    title: 'Dispensing',
    subtitle: 'Top Fill / Under Fill',
    assignedMachinesCount: 12,
    assignedMachinesLabel: '12 machines assigned'
  },
  {
    id: 'node-fvmi',
    nodeNumber: 4,
    title: 'FVMI',
    subtitle: 'Final Visual Inspection',
    assignedMachinesCount: 9,
    assignedMachinesLabel: '9 stations assigned'
  },
  {
    id: 'node-aoi',
    nodeNumber: 5,
    title: 'AOI',
    subtitle: 'Automated Optical Inspection',
    assignedMachinesCount: 2,
    assignedMachinesLabel: '2 machines assigned'
  },
  {
    id: 'node-xray',
    nodeNumber: 6,
    title: 'X-ray',
    subtitle: '90kV Micro-Focus Radiography',
    assignedMachinesCount: 5,
    assignedMachinesLabel: '5 units assigned'
  }
];

const initialChartsData: ProcessChartsData = {
  oven: {
    hours: ['08:00', '09:00', '10:00', '11:00', '12:00'],
    vacuum: [4, 6, 7, 5, 8],
    bake: [5, 6, 6, 4, 7]
  },
  dispensing: {
    hours: ['08:00', '09:00', '10:00', '11:00', '12:00'],
    topFill: [720, 840, 810, 690, 860],
    underFill: [680, 800, 830, 750, 820]
  },
  fvmi: {
    hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'],
    total: [980, 1120, 1150, 1050, 1220, 1110]
  },
  aoi: {
    hours: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    unit1: [940, 1110, 1170, 1030, 1150, 1090, 1130, 1070, 1180, 1110, 1140],
    unit2: [960, 1130, 1190, 1050, 1170, 1110, 1150, 1090, 1200, 1130, 1160],
    uph: [950, 1120, 1180, 1040, 1160, 1100, 1140, 1080, 1190, 1120, 1150]
  },
  xray: {
    hours: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    uph: [960, 1100, 1150, 1060, 1180, 1120, 1090, 1140, 1170, 1110, 1130]
  },
  packout: {
    hours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'],
    count: [950, 1120, 1180, 1040, 1160, 1100],
    ocr: [96, 100, 98, 100, 94, 100]
  }
};

export const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

export const FactoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('main-floor');
  const [selectedMachineId, setSelectedMachineIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SELECTED_MACHINE_ID_KEY);
      if (saved) return saved;
    } catch (e) {}
    return 'MC-04';
  });

  const setSelectedMachineId = (id: string) => {
    setSelectedMachineIdState(id);
    try {
      localStorage.setItem(STORAGE_SELECTED_MACHINE_ID_KEY, id);
    } catch (e) {}
  };

  const [navigationHistory, setNavigationHistory] = useState<NavigationEntry[]>([]);
  const [isSimulating, setIsSimulatingState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SIMULATING_KEY);
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true;
  });

  const setIsSimulating = (val: boolean) => {
    setIsSimulatingState(val);
    try {
      localStorage.setItem(STORAGE_SIMULATING_KEY, val ? 'true' : 'false');
    } catch (e) {}
  };

  const [machines, setMachines] = useState<Machine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MACHINES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialMachines;
  });

  const [ovenUnits, setOvenUnits] = useState<OvenUnit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_OVEN_UNITS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialOvenUnits;
  });

  const [processNodes] = useState<ProcessNodeSummary[]>(initialProcessNodes);
  const [chartsData, setChartsData] = useState<ProcessChartsData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROCESS_CHARTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialChartsData;
  });

  const [workpieces, setWorkpieces] = useState<WorkpieceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WORKPIECES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with INITIAL_WORKPIECES ensuring updated initial records are present
          const existingMap = new Map(parsed.map((w: WorkpieceRecord) => [w.serialId.toUpperCase(), w]));
          const combined = [...INITIAL_WORKPIECES.map(init => existingMap.get(init.serialId.toUpperCase()) || init)];
          // Append any custom registered items
          parsed.forEach((w: WorkpieceRecord) => {
            if (!combined.some(c => c.serialId.toUpperCase() === w.serialId.toUpperCase())) {
              combined.push(w);
            }
          });
          return combined;
        }
      }
    } catch (e) {}
    return INITIAL_WORKPIECES;
  });

  const [showAlertHistoryModal, setShowAlertHistoryModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showUploadLayoutModal, setShowUploadLayoutModal] = useState<boolean>(false);
  const [showTraceabilityModal, setShowTraceabilityModal] = useState<boolean>(false);
  const [selectedTraceabilitySerial, setSelectedTraceabilitySerial] = useState<string | null>(null);

  // Helper for real system date (YYYY-MM-DD)
  const getTodayString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getTodayString();
  });

  const [uploadedLayouts, setUploadedLayouts] = useState<ProductionLineLayout[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LAYOUTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load uploaded layouts from local storage:', e);
    }
    return [];
  });

  // Asynchronous IndexedDB Hydration on mount for high-resolution images
  useEffect(() => {
    let isMounted = true;
    cadStorage.getLayouts().then((idbLayouts) => {
      if (isMounted && idbLayouts && idbLayouts.length > 0) {
        setUploadedLayouts(idbLayouts);
      }
    }).catch((err) => {
      console.warn('IndexedDB layout hydration warning:', err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const [activeLayoutId, setActiveLayoutId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_LAYOUT_ID_KEY);
      if (saved) return saved;
    } catch (e) {}
    return 'default';
  });

  const [activeLayoutOpacity, setActiveLayoutOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LAYOUT_OPACITY_KEY);
      if (saved) return parseFloat(saved);
    } catch (e) {}
    return 0.95;
  });

  const activeLayout = uploadedLayouts.find((l) => l.id === activeLayoutId);
  const activeLayoutUrl = activeLayout ? activeLayout.dataUrl : undefined;

  const uploadProductionLineLayout = (layout: {
    name: string;
    dataUrl: string;
    lineScope?: ProductionLine;
    description?: string;
    setAsActive?: boolean;
    fileSize?: string;
    dimensions?: { width: number; height: number };
  }) => {
    const newId = `layout-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newLayout: ProductionLineLayout = {
      id: newId,
      name: layout.name.trim() || `Production Layout ${uploadedLayouts.length + 1}`,
      description: layout.description,
      dataUrl: layout.dataUrl,
      uploadedAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      lineScope: layout.lineScope || 'ALL',
      fileSize: layout.fileSize,
      dimensions: layout.dimensions,
    };

    setUploadedLayouts((prev) => {
      const updated = [newLayout, ...prev.filter((l) => l.id !== newId)];
      // Persist to IndexedDB and LocalStorage seamlessly
      cadStorage.saveLayouts(updated);
      return updated;
    });

    // Record in History Log (Append-only)
    cadStorage.appendHistoryLog({
      type: 'upload',
      title: `Uploaded Layout: "${newLayout.name}"`,
      description: `Production layout blueprint uploaded (${newLayout.fileSize || 'Image data'}, Scope: ${newLayout.lineScope}).`,
      details: { layoutId: newId, dimensions: newLayout.dimensions },
    });

    if (layout.setAsActive !== false) {
      setActiveLayoutId(newId);
      try {
        localStorage.setItem(STORAGE_ACTIVE_LAYOUT_ID_KEY, newId);
      } catch (e) {}
    }

    return newId;
  };

  const updateProductionLineLayout = (id: string, updates: Partial<ProductionLineLayout>) => {
    setUploadedLayouts((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, ...updates } : l));
      cadStorage.saveLayouts(updated);
      return updated;
    });
  };

  const duplicateProductionLineLayout = (id: string): string | null => {
    const source = uploadedLayouts.find((l) => l.id === id);
    if (!source) return null;
    return uploadProductionLineLayout({
      name: `${source.name} (Copy)`,
      description: source.description ? `${source.description} (Duplicate)` : undefined,
      dataUrl: source.dataUrl,
      lineScope: source.lineScope,
      fileSize: source.fileSize,
      dimensions: source.dimensions,
      setAsActive: true,
    });
  };

  const deleteProductionLineLayout = (id: string) => {
    setUploadedLayouts((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      cadStorage.saveLayouts(updated);
      return updated;
    });

    setActiveLayoutId((prev) => {
      if (prev === id) {
        try {
          localStorage.setItem(STORAGE_ACTIVE_LAYOUT_ID_KEY, 'default');
        } catch (e) {}
        return 'default';
      }
      return prev;
    });
  };

  const clearAllCustomLayouts = () => {
    setUploadedLayouts([]);
    setActiveLayoutId('default');
    cadStorage.saveLayouts([]);
    try {
      localStorage.setItem(STORAGE_ACTIVE_LAYOUT_ID_KEY, 'default');
    } catch (e) {}
  };


  const setActiveLayoutPreset = (id: string) => {
    setActiveLayoutId(id);
    try {
      localStorage.setItem(STORAGE_ACTIVE_LAYOUT_ID_KEY, id);
    } catch (e) {}
  };

  const setCustomFloorImageUrl = (url: string | undefined) => {
    if (!url) {
      setActiveLayoutId('default');
      try {
        localStorage.setItem(STORAGE_ACTIVE_LAYOUT_ID_KEY, 'default');
      } catch (e) {}
    } else {
      const adHocId = uploadProductionLineLayout({
        name: `Uploaded CAD Layout (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        dataUrl: url,
        lineScope: 'ALL',
        setAsActive: true,
      });
      setActiveLayoutId(adHocId);
    }
  };

  const setCustomFloorImageOpacity = (op: number) => {
    setActiveLayoutOpacity(op);
    try {
      localStorage.setItem(STORAGE_LAYOUT_OPACITY_KEY, op.toString());
    } catch (e) {}
  };

  const resetLayoutToDefault = () => {
    setActiveLayoutId('default');
    try {
      localStorage.setItem(STORAGE_ACTIVE_LAYOUT_ID_KEY, 'default');
    } catch (e) {}
  };

  const isToday = selectedDate === getTodayString();

  // Time state: starting from real current time
  const [timeSeconds, setTimeSeconds] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  });

  // When selectedDate changes, adjust machine metrics, oven units & chart data for realistic historical viewing
  useEffect(() => {
    if (!isToday) {
      // Deterministic pseudo-random seed based on selected date string
      const dateSum = selectedDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const modFactor = (dateSum % 15) - 7; // -7 to +7% variation
      const multiplier = 0.85 + ((dateSum % 30) / 100); // 0.85 to 1.15 multiplier

      // 1. Update Dispensing Machines (MC-01 to MC-13)
      setMachines(
        initialMachines.map((m, idx) => {
          const seed = dateSum * (idx + 3);
          const uphOffset = (seed % 60) - 30;
          const countFactor = 0.82 + ((seed + idx * 7) % 35) / 100;
          const histInput = Math.round(m.inputCount * countFactor);
          const ngCount = Math.max(1, Math.round(histInput * (0.003 + (seed % 10) * 0.001)));
          const histOutput = Math.max(0, histInput - ngCount);
          const histUph = Math.max(720, Math.round((m.uph || 930) + uphOffset));
          const histOee = Math.min(99.4, Math.max(86.5, (m.oeePercent || 94.5) + modFactor * 0.45));

          // In historical mode, set shift time to closed shift
          const shiftHour = 8 + (idx % 3) * 3;
          const shiftEnd = shiftHour + 3;

          return {
            ...m,
            inputCount: histInput,
            outputCount: histOutput,
            uph: m.status === 'STOP' ? 0 : histUph,
            oeePercent: Number(histOee.toFixed(1)),
            shiftTime: `${shiftHour.toString().padStart(2, '0')}:00 - ${shiftEnd.toString().padStart(2, '0')}:00`,
            glueInfo: m.glueInfo ? {
              ...m.glueInfo,
              remainingMins: 30 + ((seed % 150)),
              expiryTime: `${(shiftEnd + 2).toString().padStart(2, '0')}:30`
            } : undefined,
            downtimeHistory: m.downtimeHistory.map((dt, dIdx) => ({
              ...dt,
              timeRange: `${(shiftHour + dIdx).toString().padStart(2, '0')}:15 - ${(shiftHour + dIdx).toString().padStart(2, '0')}:${15 + dt.durationMins}`
            }))
          };
        })
      );

      // 2. Update Oven Units (Vacuum & Bake)
      setOvenUnits(
        initialOvenUnits.map((unit, idx) => {
          const uSeed = dateSum + idx * 13;
          const countFactor = 0.85 + (uSeed % 28) / 100;
          const histPcs = Math.round(unit.pcsCount * countFactor);
          const histMags = Math.max(2, Math.min(6, Math.round(histPcs / 300)));
          const tempVar = ((uSeed % 20) - 10) * 0.2; // +/- 2 deg C

          return {
            ...unit,
            pcsCount: histPcs,
            magazinesCount: histMags,
            tempCelsius: unit.subType === 'Vacuum' 
              ? (unit.status === 'STOP' ? 25 : Number((180 + tempVar).toFixed(1)))
              : (unit.status === 'STOP' ? 25 : Number((168.0 + tempVar).toFixed(1))),
            pressurePa: unit.subType === 'Vacuum'
              ? (unit.status === 'STOP' ? 0.0 : Number((0.45 + (uSeed % 10) * 0.03).toFixed(2)))
              : undefined,
            remainingSeconds: unit.status === 'STOP' ? 0 : (uSeed % 1800) + 600
          };
        })
      );

      // 3. Update Hourly Charts Data
      setChartsData({
        oven: {
          hours: initialChartsData.oven.hours,
          vacuum: initialChartsData.oven.vacuum.map((v, i) => Math.max(1, Math.min(8, Math.round(v * multiplier + ((dateSum + i * 11) % 3) - 1)))),
          bake: initialChartsData.oven.bake.map((v, i) => Math.max(1, Math.min(8, Math.round(v * multiplier + ((dateSum + i * 17) % 3) - 1))))
        },
        dispensing: {
          hours: initialChartsData.dispensing.hours,
          topFill: initialChartsData.dispensing.topFill.map((v, i) => Math.max(400, Math.min(1000, Math.round(v * multiplier + ((dateSum + i * 23) % 90) - 45)))),
          underFill: initialChartsData.dispensing.underFill.map((v, i) => Math.max(400, Math.min(1000, Math.round(v * multiplier + ((dateSum + i * 29) % 90) - 45))))
        },
        fvmi: {
          hours: initialChartsData.fvmi.hours,
          total: initialChartsData.fvmi.total.map((v, i) => Math.max(600, Math.min(1400, Math.round(v * multiplier + ((dateSum + i * 31) % 100) - 50))))
        },
        packout: {
          hours: initialChartsData.packout.hours,
          count: initialChartsData.packout.count.map((v, i) => Math.max(600, Math.min(1400, Math.round(v * multiplier + ((dateSum + i * 37) % 100) - 50)))),
          ocr: initialChartsData.packout.ocr.map((v, i) => Math.max(85, Math.min(100, Math.round(v * multiplier + ((dateSum + i * 41) % 5) - 2))))
        }
      });
    } else {
      // Restore from saved machines/ovens if present, else initial baseline
      try {
        const savedM = localStorage.getItem(STORAGE_MACHINES_KEY);
        setMachines(savedM ? JSON.parse(savedM) : initialMachines);
        const savedO = localStorage.getItem(STORAGE_OVEN_UNITS_KEY);
        setOvenUnits(savedO ? JSON.parse(savedO) : initialOvenUnits);
      } catch (e) {
        setMachines(initialMachines);
        setOvenUnits(initialOvenUnits);
      }
      setChartsData(initialChartsData);
    }
  }, [selectedDate, isToday]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Clock timer for real-time shift time display
      setTimeSeconds((prev) => (prev + 1) % 86400);

      if (isSimulating) {
        // Ticking down oven remaining times if running
        setOvenUnits((prevUnits) =>
          prevUnits.map((u) => {
            if (u.status === 'RUNNING' && u.remainingSeconds > 0) {
              return { ...u, remainingSeconds: u.remainingSeconds - 1 };
            }
            return u;
          })
        );

        // Production counts are calculated on an hour-by-hour basis (ชั่วโมงต่อชั่วโมง)
        // rather than ticking randomly second-by-second.
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isSimulating]);

  const formatPstTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const navigate = (screen: ScreenType, machineId?: string, replace?: boolean) => {
    let resolvedMachineId = machineId;
    if (screen === 'packout-aoi' || screen === 'packout-count') {
      resolvedMachineId = normalizeAoiMachineId(machineId || selectedMachineId);
    } else if (screen === 'packout-xray' || screen === 'packout-ocr') {
      resolvedMachineId = normalizeXrayMachineId(machineId || selectedMachineId);
    }

    if (resolvedMachineId) {
      setSelectedMachineId(resolvedMachineId);
    }
    if (!replace && screen !== currentScreen) {
      setNavigationHistory((prev) => {
        const next = [...prev, { screen: currentScreen, machineId: selectedMachineId }];
        return next.slice(-25);
      });
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((h) => h.slice(0, -1));
      if (prev.machineId) {
        setSelectedMachineId(prev.machineId);
      }
      setCurrentScreen(prev.screen);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Hierarchical fallback if no history recorded yet
    switch (currentScreen) {
      case 'machine-detail':
        navigate('machine-info', undefined, true);
        break;
      case 'machine-info':
        navigate('process-view', undefined, true);
        break;
      case 'vacuum-process':
      case 'bake-process':
        navigate('oven-selection', undefined, true);
        break;
      case 'oven-selection':
        navigate('process-view', undefined, true);
        break;
      case 'fvmi-detail':
        navigate('fvmi', undefined, true);
        break;
      case 'fvmi':
        navigate('process-view', undefined, true);
        break;
      case 'packout-count':
      case 'packout-ocr':
        navigate('packout-selection', undefined, true);
        break;
      case 'packout-selection':
        navigate('process-view', undefined, true);
        break;
      case 'analytics':
        navigate('process-view', undefined, true);
        break;
      case 'process-view':
        navigate('main-floor', undefined, true);
        break;
      default:
        navigate('main-floor', undefined, true);
        break;
    }
  };

  const canGoBack = navigationHistory.length > 0 || currentScreen !== 'main-floor';

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    switch (currentScreen) {
      case 'main-floor':
        return [{ label: 'Facility Map', screen: 'main-floor' }];
      case 'process-view':
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process Overview', screen: 'process-view' }
        ];
      case 'oven-selection':
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process', screen: 'process-view' },
          { label: 'Oven Modules', screen: 'oven-selection' }
        ];
      case 'vacuum-process':
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process', screen: 'process-view' },
          { label: 'Oven', screen: 'oven-selection' },
          { label: 'Vacuum Chambers', screen: 'vacuum-process' }
        ];
      case 'bake-process':
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process', screen: 'process-view' },
          { label: 'Oven', screen: 'oven-selection' },
          { label: 'Bake Chambers', screen: 'bake-process' }
        ];
      case 'machine-info':
      case 'machine-detail':
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process', screen: 'process-view' },
          { label: `${selectedMachineId || 'MC-01'} Dispensing Station`, screen: 'machine-detail', machineId: selectedMachineId || 'MC-01' }
        ];
      case 'fvmi':
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process', screen: 'process-view' },
          { label: 'FVMI Fleet', screen: 'fvmi' }
        ];
      case 'fvmi-detail':
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process', screen: 'process-view' },
          { label: 'FVMI Fleet', screen: 'fvmi' },
          { label: 'Inspection Detail', screen: 'fvmi-detail' }
        ];
      case 'packout-selection':
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process', screen: 'process-view' },
          { label: 'Inspection Selection', screen: 'packout-selection' }
        ];
      case 'packout-count':
      case 'packout-aoi': {
        const aoiId = normalizeAoiMachineId(selectedMachineId);
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process', screen: 'process-view' },
          { label: `${aoiId} Inspection`, screen: 'packout-aoi', machineId: aoiId }
        ];
      }
      case 'packout-ocr':
      case 'packout-xray': {
        const xrayId = normalizeXrayMachineId(selectedMachineId);
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process', screen: 'process-view' },
          { label: `${xrayId} Radiography`, screen: 'packout-xray', machineId: xrayId }
        ];
      }
      case 'analytics':
        return [
          { label: 'Facility Map', screen: 'main-floor' },
          { label: 'Process', screen: 'process-view' },
          { label: 'Analytics & KPIs', screen: 'analytics' }
        ];
      default:
        return [{ label: 'Facility Map', screen: 'main-floor' }];
    }
  }, [currentScreen, selectedMachineId]);

  const updateMachineModel = (machineId: string, newModel: string) => {
    setMachines((prev) => {
      const next = prev.map((m) => {
        if (m.id === machineId) {
          const currentModelKey = m.runningModel;
          const updatedStats = {
            ...(m.modelStats || {}),
            [currentModelKey]: {
              inputCount: m.inputCount,
              outputCount: m.outputCount,
              uph: m.uph,
              shiftTime: m.shiftTime || '11:00 - 14:00',
              oeePercent: m.oeePercent
            }
          };

          let nextPreset = updatedStats[newModel];

          if (!nextPreset) {
            if (newModel.includes('2268')) {
              nextPreset = { inputCount: 2450, outputCount: 2442, uph: 955, shiftTime: '10:00 - 13:00', oeePercent: 96.1, activePanelId: 'PNL-2268-084', operatorId: 'OP-2268-B' };
            } else if (newModel.includes('2154')) {
              nextPreset = { inputCount: 1890, outputCount: 1885, uph: 980, shiftTime: '15:00 - 18:00', oeePercent: 98.4, activePanelId: 'PNL-2154-051', operatorId: 'OP-2154-C' };
            } else if (newModel.includes('2187')) {
              nextPreset = { inputCount: 850, outputCount: 840, uph: 910, shiftTime: '13:30 - 16:30', oeePercent: 91.5, activePanelId: 'PNL-2187-019', operatorId: 'OP-2187-A' };
            } else if (newModel.includes('2454')) {
              nextPreset = { inputCount: 3210, outputCount: 3205, uph: 1020, shiftTime: '08:30 - 11:30', oeePercent: 99.0, activePanelId: 'PNL-2454-122', operatorId: 'OP-2454-E' };
            } else {
              nextPreset = { inputCount: 1105, outputCount: 1102, uph: 942, shiftTime: '11:00 - 14:00', oeePercent: 94.2, activePanelId: 'PNL-2224-032', operatorId: 'OP-2224-D' };
            }
            updatedStats[newModel] = nextPreset;
          }

          const updated = {
            ...m,
            runningModel: newModel,
            operatorId: nextPreset.operatorId || m.operatorId,
            activePanelId: nextPreset.activePanelId || `PNL-${newModel.replace(/\D/g, '').slice(-4)}-01`,
            inputCount: nextPreset.inputCount,
            outputCount: nextPreset.outputCount,
            uph: nextPreset.uph,
            shiftTime: nextPreset.shiftTime,
            oeePercent: nextPreset.oeePercent ?? m.oeePercent,
            modelStats: updatedStats
          };
          return updated;
        }
        return m;
      });
      try {
        localStorage.setItem(STORAGE_MACHINES_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const updateMachineStatus = (machineId: string, newStatus: MachineStatus, reason?: string) => {
    setMachines((prev) => {
      const next = prev.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            status: newStatus,
            downtimeReason: reason || (newStatus === 'STOP' ? 'Manual Pause' : undefined)
          };
        }
        return m;
      });
      try {
        localStorage.setItem(STORAGE_MACHINES_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const updateOvenModel = (unitId: string, newModel: string) => {
    setOvenUnits((prev) => {
      const next = prev.map((u) => {
        if (u.id === unitId) {
          let mags = 4;
          let pcs = 1200;
          let prg = 'PRG-B-150';

          if (newModel.includes('2187')) {
            mags = 4;
            pcs = 1200;
            prg = u.subType === 'Vacuum' ? 'A01-2' : 'PRG-B-150';
          } else if (newModel.includes('2268')) {
            mags = 2;
            pcs = 600;
            prg = u.subType === 'Vacuum' ? 'A01-1' : 'PRG-B-120';
          } else if (newModel.includes('2154')) {
            mags = 5;
            pcs = 1500;
            prg = u.subType === 'Vacuum' ? 'A02-4' : 'PRG-B-170';
          } else if (newModel.includes('2224')) {
            mags = 3;
            pcs = 900;
            prg = u.subType === 'Vacuum' ? 'A01-3' : 'PRG-B-160';
          } else if (newModel.includes('2454')) {
            mags = 6;
            pcs = 1800;
            prg = u.subType === 'Vacuum' ? 'A03-1' : 'PRG-B-180';
          } else if (newModel.includes('2090')) {
            mags = 4;
            pcs = 1000;
            prg = u.subType === 'Vacuum' ? 'A02-1' : 'PRG-B-140';
          }

          return {
            ...u,
            runningModel: newModel,
            magazinesCount: mags,
            pcsCount: pcs,
            program: prg,
            remainingSeconds: u.status === 'RUNNING' ? mags * 600 : 0
          };
        }
        return u;
      });
      try {
        localStorage.setItem(STORAGE_OVEN_UNITS_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const updateOvenStatus = (unitId: string, newStatus: MachineStatus, reason?: string) => {
    setOvenUnits((prev) => {
      const next = prev.map((u) => {
        if (u.id === unitId) {
          return {
            ...u,
            status: newStatus,
            downtimeReason: reason || (newStatus === 'STOP' ? 'Operator Manual Pause' : undefined),
            downtimeDurationMins: newStatus === 'STOP' ? 1 : u.downtimeDurationMins,
            remainingSeconds: newStatus === 'STOP' ? 0 : u.magazinesCount * 600
          };
        }
        return u;
      });
      try {
        localStorage.setItem(STORAGE_OVEN_UNITS_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const updateMachineFull = (machineId: string, updates: Partial<Machine>) => {
    setMachines((prev) => {
      const next = prev.map((m) => (m.id === machineId ? { ...m, ...updates } : m));
      try {
        localStorage.setItem(STORAGE_MACHINES_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const updateOvenFull = (unitId: string, updates: Partial<OvenUnit>) => {
    setOvenUnits((prev) => {
      const next = prev.map((u) => (u.id === unitId ? { ...u, ...updates } : u));
      try {
        localStorage.setItem(STORAGE_OVEN_UNITS_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const updateProcessChartPoint = (category: keyof ProcessChartsData, field: string, index: number, value: number) => {
    setChartsData((prev) => {
      const catObj = { ...(prev[category] as any) };
      if (Array.isArray(catObj[field])) {
        const arr = [...catObj[field]];
        arr[index] = value;
        catObj[field] = arr;
      }
      const next = { ...prev, [category]: catObj };
      try {
        localStorage.setItem(STORAGE_PROCESS_CHARTS_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const openTraceabilityModal = (serial?: string) => {
    if (serial) {
      setSelectedTraceabilitySerial(serial);
    }
    setShowTraceabilityModal(true);
  };

  const closeTraceabilityModal = () => {
    setShowTraceabilityModal(false);
  };

  const getWorkpieceBySerial = (serial: string): WorkpieceRecord => {
    const clean = serial.trim().toUpperCase();
    const found = workpieces.find((w) => w.serialId.toUpperCase() === clean);
    if (found) return found;
    // Dynamically generate and auto-save
    const generated = generateSyntheticTraceabilityRecord(clean);
    addWorkpiece(generated);
    return generated;
  };

  const addWorkpiece = (record: WorkpieceRecord) => {
    setWorkpieces((prev) => {
      const existingIdx = prev.findIndex((w) => w.serialId.toUpperCase() === record.serialId.toUpperCase());
      let next: WorkpieceRecord[];
      if (existingIdx >= 0) {
        next = [...prev];
        next[existingIdx] = record;
      } else {
        next = [record, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_WORKPIECES_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const updateWorkpiece = (serial: string, updates: Partial<WorkpieceRecord>) => {
    setWorkpieces((prev) => {
      const next = prev.map((w) => {
        if (w.serialId.toUpperCase() === serial.trim().toUpperCase()) {
          return {
            ...w,
            ...updates,
            lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false })
          };
        }
        return w;
      });
      try {
        localStorage.setItem(STORAGE_WORKPIECES_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const updateWorkpieceStep = (serial: string, stepNumber: number, stepUpdates: Partial<WorkpieceStep>) => {
    setWorkpieces((prev) => {
      const next = prev.map((w) => {
        if (w.serialId.toUpperCase() === serial.trim().toUpperCase()) {
          const updatedSteps = w.stationSteps.map((step) =>
            step.stepNumber === stepNumber ? { ...step, ...stepUpdates } : step
          );
          return {
            ...w,
            stationSteps: updatedSteps,
            lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false })
          };
        }
        return w;
      });
      try {
        localStorage.setItem(STORAGE_WORKPIECES_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const addWorkpieceStep = (serial: string, step: WorkpieceStep) => {
    setWorkpieces((prev) => {
      const next = prev.map((w) => {
        if (w.serialId.toUpperCase() === serial.trim().toUpperCase()) {
          const newStepNumber = w.stationSteps.length + 1;
          const updatedSteps = [...w.stationSteps, { ...step, stepNumber: newStepNumber }];
          return {
            ...w,
            currentStationId: step.stationId,
            currentStationName: step.stationName,
            stationSteps: updatedSteps,
            lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false })
          };
        }
        return w;
      });
      try {
        localStorage.setItem(STORAGE_WORKPIECES_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const deleteWorkpiece = (serial: string) => {
    setWorkpieces((prev) => {
      const next = prev.filter((w) => w.serialId.toUpperCase() !== serial.trim().toUpperCase());
      try {
        localStorage.setItem(STORAGE_WORKPIECES_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <FactoryContext.Provider
      value={{
        currentScreen,
        selectedMachineId,
        pstTime: formatPstTime(timeSeconds),
        selectedDate,
        isToday,
        isSimulating,
        machines,
        ovenUnits,
        processNodes,
        chartsData,
        navigationHistory,
        canGoBack,
        breadcrumbs,
        goBack,
        showAlertHistoryModal,
        showSettingsModal,
        showUploadLayoutModal,
        showTraceabilityModal,
        selectedTraceabilitySerial,
        workpieces,
        uploadedLayouts,
        activeLayoutId,
        activeLayoutUrl,
        activeLayoutOpacity,
        setSelectedDate,
        navigate,
        setSelectedMachineId,
        updateMachineModel,
        updateMachineStatus,
        updateMachineFull,
        updateOvenModel,
        updateOvenStatus,
        updateOvenFull,
        updateProcessChartPoint,
        openTraceabilityModal,
        closeTraceabilityModal,
        getWorkpieceBySerial,
        addWorkpiece,
        updateWorkpiece,
        updateWorkpieceStep,
        addWorkpieceStep,
        deleteWorkpiece,
        setShowAlertHistoryModal,
        setShowSettingsModal,
        setShowUploadLayoutModal,
        setShowTraceabilityModal,
        setIsSimulating,
        uploadProductionLineLayout,
        updateProductionLineLayout,
        duplicateProductionLineLayout,
        deleteProductionLineLayout,
        clearAllCustomLayouts,
        setActiveLayoutPreset,
        setCustomFloorImageUrl,
        setCustomFloorImageOpacity,
        resetLayoutToDefault
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
};

export const useFactory = () => {
  const context = useContext(FactoryContext);
  if (!context) {
    throw new Error('useFactory must be used within a FactoryProvider');
  }
  return context;
};

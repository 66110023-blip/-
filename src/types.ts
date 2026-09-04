export type ScreenType = 
  | 'main-floor'
  | 'process-view'
  | 'oven-selection'
  | 'vacuum-process'
  | 'bake-process'
  | 'machine-info'
  | 'machine-detail'
  | 'analytics'
  | 'fvmi'
  | 'fvmi-detail'
  | 'packout-selection'
  | 'packout-count'
  | 'packout-ocr'
  | 'packout-aoi'
  | 'packout-xray';

export type StationCategory = 
  | 'dispensing'
  | 'fvmi'
  | 'packout'
  | 'ocr'
  | 'xray'
  | 'aoi'
  | 'oven-vacuum'
  | 'oven-bake';

export type ProductionLine = 'ALL' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';

export interface FloorStation {
  id: string;
  code: string;
  name: string;
  category: StationCategory;
  line: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  w: number; // percentage width
  h: number; // percentage height
  linkedMachineId?: string; // e.g. 'MC-01'
  linkedOvenId?: string;    // e.g. 'oven-1', 'bake-1'
  linkedFvmiId?: string;
  linkedPackoutId?: string;
  linkedOcrId?: string;
  operatorId?: string;
  runningModel?: string;
  cycleTimeSec?: number;
  oeePercent?: number;
  uph?: number;
  targetUph?: number;
  inputCount?: number;
  outputCount?: number;
  downtimeReason?: string;
  downtimeDurationMins?: number;
  downtimeHistory?: DowntimeHistoryItem[];
  status?: MachineStatus;
  calibrationOffset?: {
    xMm: number;
    yMm: number;
    rotationDeg: number;
    lastCalibrated: string;
  };
  sensorTelemetry?: {
    temperatureC?: number;
    pressureKpa?: number;
    vibrationMmS?: number;
    flowRateMlMin?: number;
    currentAmps?: number;
  };
  notes?: string;
}

export type Station = FloorStation;

export type CADRenderMode = 'image' | 'vector' | 'hybrid';

export type SnapGridSize = 0.1 | 0.5 | 1.0 | 2.5;

export interface ProductionLineLayout {
  id: string;
  name: string;
  description?: string;
  dataUrl: string;
  uploadedAt: string;
  lineScope: ProductionLine;
  fileSize?: string;
  dimensions?: { width: number; height: number };
  isDefault?: boolean;
}

export interface CADFloorPlanConfig {
  imageUrl?: string;
  imageOpacity: number; // 0 to 1
  renderMode: CADRenderMode;
  showGrid: boolean;
  gridSnap: SnapGridSize;
  snapEnabled: boolean;
  showDimensions: boolean;
  showLabels: boolean;
  selectedLine: ProductionLine;
  isEditMode: boolean;
  liveTelemetry: boolean;
}

export type MachineStatus = 'RUNNING' | 'STOP' | 'IDLE' | 'JAM_CLEAR';

export interface DowntimeHistoryItem {
  id: string;
  timeRange: string;
  durationMins: number;
  category: 'OP' | 'ME' | 'QUALITY';
  reason: string;
}

export interface Machine {
  id: string; // e.g. 'MC-04', 'MC-09'
  name: string;
  processType: 'Top Fill' | 'Under Fill' | 'Oven' | 'FVMI' | 'Packout';
  status: MachineStatus;
  oeePercent?: number;
  operatorId: string;
  runningModel: string;
  activePanelId?: string;
  shiftTime?: string;
  uph: number;
  uphTrendPercent: number; // e.g. -2.1
  inputCount: number;
  outputCount: number;
  downtimeReason?: string;
  downtimeDurationMins?: number;
  glueInfo?: {
    glueType: string;
    expiryTime: string; // e.g. '21:45'
    remainingMins: number;
  };
  modelStats?: Record<
    string,
    {
      inputCount: number;
      outputCount: number;
      uph: number;
      shiftTime: string;
      oeePercent?: number;
      activePanelId?: string;
      operatorId?: string;
    }
  >;
  downtimeHistory: DowntimeHistoryItem[];
}

export interface OvenUnit {
  id: string;
  name: string;
  subType: 'Vacuum' | 'Bake';
  status: MachineStatus;
  chamberLabel: string;
  operatorId: string;
  magazinesCount: number;
  pcsCount?: number;
  runningModel: string;
  program: string;
  stepCurrent?: number;
  stepTotal?: number;
  tempCelsius: number;
  targetTempMin?: number;
  targetTempMax?: number;
  pressurePa?: number;
  remainingSeconds: number;
  estFinishTime?: string;
  uph?: number;
  targetUph?: number;
  uphTrendPercent?: number;
  inputCount?: number;
  outputCount?: number;
  oeePercent?: number;
  downtimeReason?: string;
  downtimeDurationMins?: number;
  downtimeHistory?: DowntimeHistoryItem[];
  activeWorkpieceId?: string;
}

export type WorkpieceStatus = 'IN_PROGRESS' | 'COMPLETED_PASS' | 'COMPLETED_FAIL' | 'REWORK';
export type ProcessRouteType = 'UNDER_FILL_VAC_BAKE' | 'TOP_FILL_BAKE_DIRECT';

export interface WorkpieceStep {
  stepNumber: number;
  stationCategory: StationCategory;
  stationId: string;
  stationName: string;
  timeIn: string;
  timeOut?: string;
  operatorId: string;
  status: 'PASS' | 'FAIL' | 'REWORK' | 'IN_PROCESS' | 'SKIPPED';
  cycleTimeSec?: number;
  parameters: Record<string, string | number | boolean>;
  notes?: string;
}

export interface WorkpieceRecord {
  serialId: string;
  partModel: string;
  lotNumber: string;
  processRouteType?: ProcessRouteType;
  currentStationId: string;
  currentStationName: string;
  overallStatus: WorkpieceStatus;
  startTime: string;
  lastUpdated: string;
  yieldScore?: number;
  defectCount?: number;
  stationSteps: WorkpieceStep[];
  notes?: string;
}

export interface ProcessNodeSummary {
  id: string;
  nodeNumber: number;
  title: string;
  subtitle?: string;
  assignedMachinesCount: number;
  assignedMachinesLabel: string;
}

export interface ChartHourPoint {
  hour: string; // '08:00', '09:00', etc.
  val1: number; // e.g. Vacuum / Top Fill / Count
  val2?: number; // e.g. Bake / Under Fill / OCR
}

export interface NavigationEntry {
  screen: ScreenType;
  machineId?: string;
}

export interface BreadcrumbItem {
  label: string;
  screen: ScreenType;
  machineId?: string;
}

export interface ProcessChartsData {
  oven: {
    hours: string[];
    vacuum: number[];
    bake: number[];
  };
  dispensing: {
    hours: string[];
    topFill: number[];
    underFill: number[];
  };
  fvmi: {
    hours: string[];
    total: number[];
  };
  aoi?: {
    hours: string[];
    unit1?: number[];
    unit2?: number[];
    uph: number[];
  };
  xray?: {
    hours: string[];
    uph: number[];
  };
  packout: {
    hours: string[];
    count: number[];
    ocr: number[];
  };
}

export type HistoryActionType = 
  | 'upload'
  | 'dimension_update'
  | 'save_preset'
  | 'calibration'
  | 'station_move'
  | 'parameter_change'
  | 'model_update'
  | 'layout_reset'
  | 'station_add'
  | 'station_delete';

export interface HistoryLogEntry {
  id: string;
  timestamp: string;
  formattedTime: string;
  type: HistoryActionType;
  title: string;
  description: string;
  stationCount?: number;
  stationCode?: string;
  details?: Record<string, any>;
  snapshotId?: string;
}


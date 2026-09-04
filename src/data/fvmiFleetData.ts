export interface FVMIDefectLog {
  id: string;
  time: string;
  code: string;
  description: string;
  category: 'X-OUT' | 'REWORK' | 'DISCARD' | 'PASS';
}

export interface FvmiHourlySlot {
  hour: string; // '07:00 - 08:00'
  hourShort: string; // '07:00'
  runningModel: string; // '504-2224'
  targetUph: number;
  actualIn: number;
  passCount: number;
  failCount: number;
  xoutCount: number;
  reworkCount: number;
  discardCount: number;
  yieldPercent: number;
}

export const FVMI_HOURLY_SLOTS_DEF = [
  { hour: '07:00 - 08:00', hourShort: '07:00' },
  { hour: '08:00 - 09:00', hourShort: '08:00' },
  { hour: '09:00 - 10:00', hourShort: '09:00' },
  { hour: '10:00 - 11:00', hourShort: '10:00' },
  { hour: '11:00 - 12:00', hourShort: '11:00' },
  { hour: '12:00 - 13:00', hourShort: '12:00' },
  { hour: '13:00 - 14:00', hourShort: '13:00' },
  { hour: '14:00 - 15:00', hourShort: '14:00' },
  { hour: '15:00 - 16:00', hourShort: '15:00' },
  { hour: '16:00 - 17:00', hourShort: '16:00' },
  { hour: '17:00 - 18:00', hourShort: '17:00' },
  { hour: '18:00 - 19:00', hourShort: '18:00' },
];

export interface FVMIPanelRecord {
  id: string;
  panelId: string;
  time: string;
  status: 'PASS' | 'FAIL' | 'REWORK';
  defects: number;
}

export interface FVMIModelData {
  modelId: string;
  modelName: string;
  operatorId: string;
  operatorName: string;
  activePanelId: string;
  baseInputPerHour: number;
  uph: number;
  passRatio: number;
  xoutRatio: number;
  reworkRatio: number;
  discardRatio: number;
  hourlyData: FvmiHourlySlot[];
  recentPanels: FVMIPanelRecord[];
  recentDefects: FVMIDefectLog[];
}

export interface FVMIMachineFullData {
  id: string; // 'FVMI-01' to 'FVMI-09'
  name: string;
  stationNumber: number;
  type: string;
  status: 'RUNNING' | 'STOP' | 'IDLE';
  activeModelId: string;
  shiftTime: string;
  cameraStatus: {
    topCam: 'OK' | 'WARN' | 'ERROR';
    sideCam: 'OK' | 'WARN' | 'ERROR';
    coaxialLight: number; // %
    exposureUs: number; // μs
  };
  downtimeReason?: string;
  downtimeDurationMins?: number;
  models: Record<string, FVMIModelData>;
}

export const FVMI_SUPPORTED_MODELS = [
  '504-2187',
  '504-2268',
  '504-2154',
  '504-2224',
  '504-2454',
  '504-2090',
];

// Helper to generate distinct, realistic machine + model datasets
function generateMachineModelData(stationNum: number, modelId: string): FVMIModelData {
  const stationStr = stationNum.toString().padStart(2, '0');
  const modNum = modelId.replace('504-', '');
  const seed = stationNum * 137 + parseInt(modNum, 10);

  // Operator ID & Name
  const OP_NAMES = [
    'Somchai Prasert',
    'Apinya Suksom',
    'Tanawat Kittichai',
    'Kittisak Manotham',
    'Natthaporn Ruangdet',
    'Prasert Thongdee',
    'Wichai Damrong',
    'Siriporn Jaturon',
    'Anan Charoensuk',
    'Chatchai Rattana',
    'Pornchai Srisuk',
    'Supannee Wongsuwan',
  ];
  const opIdx = (stationNum + parseInt(modNum, 10)) % OP_NAMES.length;
  const operatorName = OP_NAMES[opIdx];
  const operatorId = `OP-V${(stationNum * 100 + (parseInt(modNum, 10) % 80)).toString().padStart(4, '0')}`;

  // Unique Active Panel
  const batchCode = String.fromCharCode(65 + ((stationNum + parseInt(modNum, 10)) % 26));
  const activePanelId = `PNL-${modNum}-S${stationStr}-${batchCode}${((seed % 900) + 100)}`;

  // Base parameters vary by model complexity and station calibration
  let baseInput = 1250;
  let uph = 1280;
  let passRatio = 0.982;
  let xoutRatio = 0.005;
  let reworkRatio = 0.009;
  let discardRatio = 0.004;

  if (modelId === '504-2187') {
    baseInput = 1350 + (stationNum * 12) % 60;
    uph = 1380 + (stationNum * 15) % 70;
    passRatio = 0.985 + ((stationNum % 5) * 0.002);
    xoutRatio = 0.004;
    reworkRatio = 0.007;
    discardRatio = 0.002;
  } else if (modelId === '504-2268') {
    baseInput = 1100 + (stationNum * 18) % 80;
    uph = 1120 + (stationNum * 14) % 60;
    passRatio = 0.945 + ((stationNum % 4) * 0.005);
    xoutRatio = 0.016;
    reworkRatio = 0.024;
    discardRatio = 0.011;
  } else if (modelId === '504-2154') {
    baseInput = 980 + (stationNum * 25) % 90;
    uph = 1000 + (stationNum * 20) % 70;
    passRatio = 0.915 + ((stationNum % 6) * 0.004);
    xoutRatio = 0.032;
    reworkRatio = 0.036;
    discardRatio = 0.014;
  } else if (modelId === '504-2224') {
    baseInput = 1280 + (stationNum * 10) % 50;
    uph = 1300 + (stationNum * 12) % 60;
    passRatio = 0.980 + ((stationNum % 5) * 0.002);
    xoutRatio = 0.006;
    reworkRatio = 0.009;
    discardRatio = 0.003;
  } else if (modelId === '504-2454') {
    baseInput = 1480 + (stationNum * 15) % 80;
    uph = 1520 + (stationNum * 18) % 90;
    passRatio = 0.990 + ((stationNum % 3) * 0.002);
    xoutRatio = 0.003;
    reworkRatio = 0.005;
    discardRatio = 0.001;
  } else if (modelId === '504-2090') {
    baseInput = 1200 + (stationNum * 14) % 60;
    uph = 1220 + (stationNum * 16) % 70;
    passRatio = 0.965 + ((stationNum % 4) * 0.003);
    xoutRatio = 0.011;
    reworkRatio = 0.015;
    discardRatio = 0.006;
  }

  // Normalise ratios
  const totalR = passRatio + xoutRatio + reworkRatio + discardRatio;
  passRatio = Number((passRatio / totalR).toFixed(4));
  xoutRatio = Number((xoutRatio / totalR).toFixed(4));
  reworkRatio = Number((reworkRatio / totalR).toFixed(4));
  discardRatio = Number((1 - passRatio - xoutRatio - reworkRatio).toFixed(4));

  // Generate 5 realistic recent inspected panels
  const recentPanels: FVMIPanelRecord[] = [
    {
      id: `${stationNum}-p1`,
      panelId: `PNL-${modNum}-S${stationStr}-${batchCode}${((seed % 900) + 109)}`,
      time: '14:28:15',
      status: 'PASS',
      defects: 0,
    },
    {
      id: `${stationNum}-p2`,
      panelId: `PNL-${modNum}-S${stationStr}-${batchCode}${((seed % 900) + 108)}`,
      time: '14:26:40',
      status: 'PASS',
      defects: 0,
    },
    {
      id: `${stationNum}-p3`,
      panelId: `PNL-${modNum}-S${stationStr}-${batchCode}${((seed % 900) + 107)}`,
      time: '14:24:50',
      status: reworkRatio > 0.01 ? 'REWORK' : 'PASS',
      defects: reworkRatio > 0.01 ? 1 : 0,
    },
    {
      id: `${stationNum}-p4`,
      panelId: `PNL-${modNum}-S${stationStr}-${batchCode}${((seed % 900) + 106)}`,
      time: '14:22:15',
      status: 'PASS',
      defects: 0,
    },
    {
      id: `${stationNum}-p5`,
      panelId: `PNL-${modNum}-S${stationStr}-${batchCode}${((seed % 900) + 105)}`,
      time: '14:19:30',
      status: discardRatio > 0.005 ? 'FAIL' : 'PASS',
      defects: discardRatio > 0.005 ? 2 : 0,
    },
  ];

  // Generate unique defect logs for this machine + model
  const DEFECT_POOL: FVMIDefectLog[] = [
    { id: `df-${seed}-1`, time: '14:20:10', code: 'E-GL-04', description: `Glue fillet overflow pin ${10 + (seed % 8)}`, category: 'REWORK' },
    { id: `df-${seed}-2`, time: '13:55:30', code: 'E-XO-01', description: `Substrate pre-die corner chip (X-Out)`, category: 'X-OUT' },
    { id: `df-${seed}-3`, time: '13:18:45', code: 'E-CR-09', description: `Ceramic package hairline fracture`, category: 'DISCARD' },
    { id: `df-${seed}-4`, time: '12:44:00', code: 'E-VD-02', description: `Thermal pad void area > 5.8%`, category: 'REWORK' },
    { id: `df-${seed}-5`, time: '11:30:15', code: 'E-WB-02', description: `Wire bond loop height skew`, category: 'REWORK' },
    { id: `df-${seed}-6`, time: '10:15:22', code: 'E-SB-05', description: `Solder ball splash near pad C4`, category: 'DISCARD' },
  ];

  const recentDefects = [
    DEFECT_POOL[seed % DEFECT_POOL.length],
    DEFECT_POOL[(seed + 1) % DEFECT_POOL.length],
    DEFECT_POOL[(seed + 2) % DEFECT_POOL.length],
  ];

  // Shift hourly multipliers to reflect genuine production shift rhythm
  // (07:00 start ramp-up, morning peaks, lunch break dip, afternoon peaks, calibration, handover wrap-up)
  // This creates a realistic, natural mix of high (dark orange) and lower (light orange) hours
  const SHIFT_PROFILE = [
    0.72, // 07:00 - 08:00 (Warmup / Infeed preparation) -> Light (light)
    0.98, // 08:00 - 09:00 (Normal ramp) -> Dark (dark)
    1.12, // 09:00 - 10:00 (Morning peak batch) -> Dark (dark)
    1.04, // 10:00 - 11:00 (Steady production) -> Dark (dark)
    0.96, // 11:00 - 12:00 (Pre-lunch buffer) -> Dark (dark)
    0.62, // 12:00 - 13:00 (Lunch meal rotation dip) -> Light (light)
    0.94, // 13:00 - 14:00 (Post-lunch resumption) -> Dark (dark)
    1.15, // 14:00 - 15:00 (Afternoon peak throughput) -> Dark (dark)
    0.76, // 15:00 - 16:00 (Lens wipe, sensor purge & defect check) -> Light (light)
    1.06, // 16:00 - 17:00 (Late afternoon batch) -> Dark (dark)
    0.82, // 17:00 - 18:00 (Lot reconciliation & sorting) -> Light (light)
    0.70, // 18:00 - 19:00 (Shift handover & machine washdown) -> Light (light)
  ];

  // Generate 12 hourly shift slots (07:00 - 18:00)
  const hourlyData: FvmiHourlySlot[] = FVMI_HOURLY_SLOTS_DEF.map((slotDef, idx) => {
    const stationShiftVariation = ((stationNum % 3) - 1) * 0.03;
    const slotMultiplier = Math.max(0.3, SHIFT_PROFILE[idx % SHIFT_PROFILE.length] + stationShiftVariation);
    const hourActual = Math.max(200, Math.round(baseInput * slotMultiplier));
    const slotPassCount = Math.round(hourActual * passRatio);
    const slotXoutCount = Math.round(hourActual * xoutRatio);
    const slotReworkCount = Math.round(hourActual * reworkRatio);
    const slotDiscardCount = Math.max(0, hourActual - slotPassCount - slotXoutCount - slotReworkCount);
    const slotFailCount = slotXoutCount + slotReworkCount + slotDiscardCount;
    const slotYield = Number(((slotPassCount / hourActual) * 100).toFixed(2));

    return {
      hour: slotDef.hour,
      hourShort: slotDef.hourShort,
      runningModel: `MODEL ${modelId}`,
      targetUph: uph,
      actualIn: hourActual,
      passCount: slotPassCount,
      failCount: slotFailCount,
      xoutCount: slotXoutCount,
      reworkCount: slotReworkCount,
      discardCount: slotDiscardCount,
      yieldPercent: slotYield,
    };
  });

  return {
    modelId,
    modelName: `MODEL ${modelId}`,
    operatorId,
    operatorName,
    activePanelId,
    baseInputPerHour: baseInput,
    uph,
    passRatio,
    xoutRatio,
    reworkRatio,
    discardRatio,
    hourlyData,
    recentPanels,
    recentDefects,
  };
}

// Full 9 Stations Fleet Initial Data
export const INITIAL_FULL_9_FVMI_FLEET: FVMIMachineFullData[] = [
  {
    id: 'FVMI-01',
    name: 'FVMI Station #1',
    stationNumber: 1,
    type: 'Dual-Lens AOI & Laser Profiler',
    status: 'RUNNING',
    activeModelId: '504-2224',
    shiftTime: '08:00 - 16:00',
    cameraStatus: { topCam: 'OK', sideCam: 'OK', coaxialLight: 92, exposureUs: 110 },
    models: {
      '504-2187': generateMachineModelData(1, '504-2187'),
      '504-2268': generateMachineModelData(1, '504-2268'),
      '504-2154': generateMachineModelData(1, '504-2154'),
      '504-2224': generateMachineModelData(1, '504-2224'),
      '504-2454': generateMachineModelData(1, '504-2454'),
      '504-2090': generateMachineModelData(1, '504-2090'),
    },
  },
  {
    id: 'FVMI-02',
    name: 'FVMI Station #2',
    stationNumber: 2,
    type: '3D Telecentric Optical Inspector',
    status: 'RUNNING',
    activeModelId: '504-2187',
    shiftTime: '08:00 - 16:00',
    cameraStatus: { topCam: 'OK', sideCam: 'OK', coaxialLight: 88, exposureUs: 125 },
    models: {
      '504-2187': generateMachineModelData(2, '504-2187'),
      '504-2268': generateMachineModelData(2, '504-2268'),
      '504-2154': generateMachineModelData(2, '504-2154'),
      '504-2224': generateMachineModelData(2, '504-2224'),
      '504-2454': generateMachineModelData(2, '504-2454'),
      '504-2090': generateMachineModelData(2, '504-2090'),
    },
  },
  {
    id: 'FVMI-03',
    name: 'FVMI Station #3',
    stationNumber: 3,
    type: 'High-Res Matrix Vision System',
    status: 'STOP',
    activeModelId: '504-2268',
    shiftTime: '08:00 - 16:00',
    cameraStatus: { topCam: 'WARN', sideCam: 'OK', coaxialLight: 70, exposureUs: 140 },
    downtimeReason: 'Vision Optical Threshold Calibration Required',
    downtimeDurationMins: 14,
    models: {
      '504-2187': generateMachineModelData(3, '504-2187'),
      '504-2268': generateMachineModelData(3, '504-2268'),
      '504-2154': generateMachineModelData(3, '504-2154'),
      '504-2224': generateMachineModelData(3, '504-2224'),
      '504-2454': generateMachineModelData(3, '504-2454'),
      '504-2090': generateMachineModelData(3, '504-2090'),
    },
  },
  {
    id: 'FVMI-04',
    name: 'FVMI Station #4',
    stationNumber: 4,
    type: 'Multi-Spectrum Optical Scanner',
    status: 'RUNNING',
    activeModelId: '504-2154',
    shiftTime: '08:00 - 16:00',
    cameraStatus: { topCam: 'OK', sideCam: 'OK', coaxialLight: 95, exposureUs: 105 },
    models: {
      '504-2187': generateMachineModelData(4, '504-2187'),
      '504-2268': generateMachineModelData(4, '504-2268'),
      '504-2154': generateMachineModelData(4, '504-2154'),
      '504-2224': generateMachineModelData(4, '504-2224'),
      '504-2454': generateMachineModelData(4, '504-2454'),
      '504-2090': generateMachineModelData(4, '504-2090'),
    },
  },
  {
    id: 'FVMI-05',
    name: 'FVMI Station #5',
    stationNumber: 5,
    type: 'Multi-Angle Telecentric AOI',
    status: 'RUNNING',
    activeModelId: '504-2454',
    shiftTime: '08:00 - 16:00',
    cameraStatus: { topCam: 'OK', sideCam: 'OK', coaxialLight: 90, exposureUs: 115 },
    models: {
      '504-2187': generateMachineModelData(5, '504-2187'),
      '504-2268': generateMachineModelData(5, '504-2268'),
      '504-2154': generateMachineModelData(5, '504-2154'),
      '504-2224': generateMachineModelData(5, '504-2224'),
      '504-2454': generateMachineModelData(5, '504-2454'),
      '504-2090': generateMachineModelData(5, '504-2090'),
    },
  },
  {
    id: 'FVMI-06',
    name: 'FVMI Station #6',
    stationNumber: 6,
    type: 'Laser Micro-Profiler & AOI',
    status: 'RUNNING',
    activeModelId: '504-2224',
    shiftTime: '08:00 - 16:00',
    cameraStatus: { topCam: 'OK', sideCam: 'OK', coaxialLight: 91, exposureUs: 112 },
    models: {
      '504-2187': generateMachineModelData(6, '504-2187'),
      '504-2268': generateMachineModelData(6, '504-2268'),
      '504-2154': generateMachineModelData(6, '504-2154'),
      '504-2224': generateMachineModelData(6, '504-2224'),
      '504-2454': generateMachineModelData(6, '504-2454'),
      '504-2090': generateMachineModelData(6, '504-2090'),
    },
  },
  {
    id: 'FVMI-07',
    name: 'FVMI Station #7',
    stationNumber: 7,
    type: 'High-Speed Dual Matrix Inspector',
    status: 'RUNNING',
    activeModelId: '504-2090',
    shiftTime: '08:00 - 16:00',
    cameraStatus: { topCam: 'OK', sideCam: 'OK', coaxialLight: 86, exposureUs: 130 },
    models: {
      '504-2187': generateMachineModelData(7, '504-2187'),
      '504-2268': generateMachineModelData(7, '504-2268'),
      '504-2154': generateMachineModelData(7, '504-2154'),
      '504-2224': generateMachineModelData(7, '504-2224'),
      '504-2454': generateMachineModelData(7, '504-2454'),
      '504-2090': generateMachineModelData(7, '504-2090'),
    },
  },
  {
    id: 'FVMI-08',
    name: 'FVMI Station #8',
    stationNumber: 8,
    type: '3D Optical Defect Analyzer',
    status: 'RUNNING',
    activeModelId: '504-2187',
    shiftTime: '08:00 - 16:00',
    cameraStatus: { topCam: 'OK', sideCam: 'OK', coaxialLight: 94, exposureUs: 108 },
    models: {
      '504-2187': generateMachineModelData(8, '504-2187'),
      '504-2268': generateMachineModelData(8, '504-2268'),
      '504-2154': generateMachineModelData(8, '504-2154'),
      '504-2224': generateMachineModelData(8, '504-2224'),
      '504-2454': generateMachineModelData(8, '504-2454'),
      '504-2090': generateMachineModelData(8, '504-2090'),
    },
  },
  {
    id: 'FVMI-09',
    name: 'FVMI Station #9',
    stationNumber: 9,
    type: 'High-Precision Telecentric AOI',
    status: 'RUNNING',
    activeModelId: '504-2454',
    shiftTime: '08:00 - 16:00',
    cameraStatus: { topCam: 'OK', sideCam: 'OK', coaxialLight: 96, exposureUs: 102 },
    models: {
      '504-2187': generateMachineModelData(9, '504-2187'),
      '504-2268': generateMachineModelData(9, '504-2268'),
      '504-2154': generateMachineModelData(9, '504-2154'),
      '504-2224': generateMachineModelData(9, '504-2224'),
      '504-2454': generateMachineModelData(9, '504-2454'),
      '504-2090': generateMachineModelData(9, '504-2090'),
    },
  },
];

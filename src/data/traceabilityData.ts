import { WorkpieceRecord, WorkpieceStep, ProcessRouteType } from '../types';

export const INITIAL_WORKPIECES: WorkpieceRecord[] = [
  // ==========================================
  // 1. UNDER FILL (UF) ROUTE: Dispense -> Vac -> Bake -> FVMI -> Pack Out
  // ==========================================
  {
    serialId: 'WP-2026-90412',
    partModel: '504-2187',
    lotNumber: 'LOT-20260819-A1',
    processRouteType: 'UNDER_FILL_VAC_BAKE',
    currentStationId: 'PK-CNT-01',
    currentStationName: 'Pack Out Unit Counter #1',
    overallStatus: 'COMPLETED_PASS',
    startTime: '08:15:30',
    lastUpdated: '10:14:22',
    yieldScore: 99.8,
    defectCount: 0,
    notes: 'Under Fill Route: Completed Vacuum degassing (42 Pa) before Thermal Bake curing. Zero voids detected at FVMI.',
    stationSteps: [
      {
        stepNumber: 1,
        stationCategory: 'dispensing',
        stationId: 'MC-08',
        stationName: 'Dispenser MC-08 (Under Fill)',
        timeIn: '08:15:30',
        timeOut: '08:18:45',
        operatorId: 'OP-T1008',
        status: 'PASS',
        cycleTimeSec: 3.2,
        parameters: {
          glueType: 'UF-9200 (Capillary Underfill)',
          dispenseWeightMg: 98.4,
          dispensePressureKpa: 220,
          substratePreheatTempC: 80.0,
          nozzleTempC: 38.5,
          flowRateMlMin: 0.72,
          visionAlignmentOffsetUm: 2.8
        },
        notes: 'Under Fill capillary flow nominal, fillet height 85%.'
      },
      {
        stepNumber: 2,
        stationCategory: 'oven-vacuum',
        stationId: 'oven-2',
        stationName: 'Vacuum Oven Chamber #2',
        timeIn: '08:25:00',
        timeOut: '08:55:00',
        operatorId: 'OP-V202',
        status: 'PASS',
        cycleTimeSec: 1800,
        parameters: {
          chamberTempC: 85.2,
          vacuumPressurePa: 42,
          vacuumDwellMins: 30,
          magazineSlot: 3,
          nitrogenPurgeLevelPpm: 12
        },
        notes: 'Vacuum degassing step completed before thermal bake to eliminate trapped air voids under die.'
      },
      {
        stepNumber: 3,
        stationCategory: 'oven-bake',
        stationId: 'bake-1',
        stationName: 'Thermal Cure Bake Tunnel #1',
        timeIn: '09:05:00',
        timeOut: '09:45:00',
        operatorId: 'OP-B301',
        status: 'PASS',
        cycleTimeSec: 2400,
        parameters: {
          zone1TempC: 120,
          zone2TempC: 150,
          zone3TempC: 152,
          conveyorSpeedMmSec: 15.0,
          cureHardnessShoreD: 88
        },
        notes: 'Thermal curing profile completed following vacuum degas.'
      },
      {
        stepNumber: 4,
        stationCategory: 'fvmi',
        stationId: 'FVMI-03',
        stationName: 'FVMI Optical AOI Station #03',
        timeIn: '09:52:10',
        timeOut: '09:54:30',
        operatorId: 'OP-FV03',
        status: 'PASS',
        cycleTimeSec: 4.1,
        parameters: {
          aiConfidencePercent: 99.7,
          solderBridgeDefect: 0,
          voidRatioPercent: 0.4,
          glueBleedOutUm: 18,
          lightingPreset: 'Darkfield Red LED'
        },
        notes: 'Zero cosmetic defect, pin clearance and fillet geometry verified.'
      },
      {
        stepNumber: 5,
        stationCategory: 'packout',
        stationId: 'PK-CNT-01',
        stationName: 'Pack Out Unit Counter #1',
        timeIn: '10:14:00',
        timeOut: '10:14:22',
        operatorId: 'E9102',
        status: 'PASS',
        cycleTimeSec: 2.8,
        parameters: {
          packBoxId: 'BOX-2187-048',
          traySlotNumber: 14,
          unitCountInPanel: 6,
          barcode2dGrade: 'A',
          finalPackingStatus: 'ACCEPTED'
        },
        notes: 'Packed into export carton tray.'
      }
    ]
  },

  // ==========================================
  // 2. TOP FILL (TF) ROUTE: Dispense -> Bake Direct (NO VAC) -> FVMI -> Pack Out
  // ==========================================
  {
    serialId: 'WP-2026-90413',
    partModel: '504-2224',
    lotNumber: 'LOT-20260819-B2',
    processRouteType: 'TOP_FILL_BAKE_DIRECT',
    currentStationId: 'PK-CNT-02',
    currentStationName: 'Pack Out Unit Counter #2',
    overallStatus: 'COMPLETED_PASS',
    startTime: '08:40:00',
    lastUpdated: '10:22:15',
    yieldScore: 100.0,
    defectCount: 0,
    notes: 'Top Fill Route: Direct thermal cure in Bake Oven (Vacuum Oven bypassed as standard for Top Fill encapsulation).',
    stationSteps: [
      {
        stepNumber: 1,
        stationCategory: 'dispensing',
        stationId: 'MC-02',
        stationName: 'Dispenser MC-02 (Top Fill)',
        timeIn: '08:40:00',
        timeOut: '08:43:20',
        operatorId: 'OP-T1002',
        status: 'PASS',
        cycleTimeSec: 3.1,
        parameters: {
          glueType: 'U8410-405 (Top Encapsulant)',
          dispenseWeightMg: 143.5,
          dispensePressureKpa: 242,
          nozzleTempC: 32.5,
          flowRateMlMin: 0.88,
          visionAlignmentOffsetUm: 3.1
        },
        notes: 'Top fill dome shape uniform, no bubble formation.'
      },
      {
        stepNumber: 2,
        stationCategory: 'oven-bake',
        stationId: 'bake-2',
        stationName: 'Thermal Cure Bake Tunnel #2',
        timeIn: '08:50:00',
        timeOut: '09:30:00',
        operatorId: 'OP-B302',
        status: 'PASS',
        cycleTimeSec: 2400,
        parameters: {
          zone1TempC: 120,
          zone2TempC: 151,
          zone3TempC: 153,
          conveyorSpeedMmSec: 15.0,
          routeRule: 'DIRECT_BAKE (VAC_BYPASSED)'
        },
        notes: 'Top Fill direct curing tunnel without vacuum degas requirement.'
      },
      {
        stepNumber: 3,
        stationCategory: 'fvmi',
        stationId: 'FVMI-02',
        stationName: 'FVMI Optical AOI Station #02',
        timeIn: '09:40:10',
        timeOut: '09:42:30',
        operatorId: 'OP-FV02',
        status: 'PASS',
        cycleTimeSec: 3.9,
        parameters: {
          aiConfidencePercent: 99.8,
          surfaceScratchDefect: 0,
          encapsulationHeightMm: 1.45,
          bubbleEntrapmentCount: 0
        },
        notes: 'Encapsulation profile 100% compliant with IPC standards.'
      },
      {
        stepNumber: 4,
        stationCategory: 'packout',
        stationId: 'PK-CNT-02',
        stationName: 'Pack Out Unit Counter #2',
        timeIn: '10:21:40',
        timeOut: '10:22:15',
        operatorId: 'E8841',
        status: 'PASS',
        cycleTimeSec: 2.7,
        parameters: {
          packBoxId: 'BOX-2224-019',
          traySlotNumber: 8,
          unitCountInPanel: 6,
          barcode2dGrade: 'A'
        },
        notes: 'Full panel units confirmed OK.'
      }
    ]
  },

  // ==========================================
  // 3. TOP FILL (TF) ROUTE: Live In-Progress at Bake Oven
  // ==========================================
  {
    serialId: 'WP-2026-90414',
    partModel: '504-2187',
    lotNumber: 'LOT-20260819-A1',
    processRouteType: 'TOP_FILL_BAKE_DIRECT',
    currentStationId: 'bake-1',
    currentStationName: 'Bake Oven Tunnel #1 (Thermal Cure)',
    overallStatus: 'IN_PROGRESS',
    startTime: '09:45:00',
    lastUpdated: '10:28:00',
    yieldScore: 100.0,
    defectCount: 0,
    notes: 'Top Fill Route: Transferred directly from Dispenser MC-04 to Bake Oven #1. Currently at Zone 2 (150°C).',
    stationSteps: [
      {
        stepNumber: 1,
        stationCategory: 'dispensing',
        stationId: 'MC-04',
        stationName: 'Dispenser MC-04 (Top Fill)',
        timeIn: '09:45:00',
        timeOut: '09:48:15',
        operatorId: 'OP-T1004',
        status: 'PASS',
        cycleTimeSec: 3.2,
        parameters: {
          glueType: 'U8410-405',
          dispenseWeightMg: 142.2,
          dispensePressureKpa: 240,
          nozzleTempC: 32.2
        },
        notes: 'Top fill completed on schedule.'
      },
      {
        stepNumber: 2,
        stationCategory: 'oven-bake',
        stationId: 'bake-1',
        stationName: 'Thermal Cure Bake Tunnel #1',
        timeIn: '09:55:00',
        operatorId: 'OP-B301',
        status: 'IN_PROCESS',
        parameters: {
          zone1TempC: 120.0,
          zone2TempC: 150.2,
          currentChamberDwellMins: 33,
          targetTotalDwellMins: 40
        },
        notes: 'Thermal curing in progress at Zone 2. 7 mins remaining before exit to FVMI.'
      }
    ]
  },

  // ==========================================
  // 4. UNDER FILL (UF) ROUTE: Live In-Progress in Vacuum Degas Oven
  // ==========================================
  {
    serialId: 'WP-2026-90415',
    partModel: '504-2268',
    lotNumber: 'LOT-20260819-C3',
    processRouteType: 'UNDER_FILL_VAC_BAKE',
    currentStationId: 'oven-4',
    currentStationName: 'Vacuum Oven Chamber #4 (Degassing)',
    overallStatus: 'IN_PROGRESS',
    startTime: '10:05:00',
    lastUpdated: '10:28:45',
    yieldScore: 100.0,
    defectCount: 0,
    notes: 'Under Fill Route: Currently in Vacuum Chamber #4 (38 Pa) to extract micro-voids before advancing to Bake Oven #3.',
    stationSteps: [
      {
        stepNumber: 1,
        stationCategory: 'dispensing',
        stationId: 'MC-10',
        stationName: 'Dispenser MC-10 (Under Fill)',
        timeIn: '10:05:00',
        timeOut: '10:08:40',
        operatorId: 'OP-T1010',
        status: 'PASS',
        cycleTimeSec: 3.3,
        parameters: {
          glueType: 'UF-9200',
          dispenseWeightMg: 97.8,
          dispensePressureKpa: 218,
          substratePreheatTempC: 80.5
        },
        notes: 'Under fill resin dispensed in L-pattern.'
      },
      {
        stepNumber: 2,
        stationCategory: 'oven-vacuum',
        stationId: 'oven-4',
        stationName: 'Vacuum Oven Chamber #4',
        timeIn: '10:14:00',
        operatorId: 'OP-V204',
        status: 'IN_PROCESS',
        parameters: {
          chamberTempC: 84.8,
          vacuumPressurePa: 38,
          currentVacuumDwellMins: 14,
          targetDwellMins: 30
        },
        notes: 'Chamber vacuum pump running at 38 Pa. Degassing in progress.'
      }
    ]
  },

  // ==========================================
  // 5. UNDER FILL (UF) ROUTE: Live at FVMI AOI Station
  // ==========================================
  {
    serialId: 'WP-2026-90416',
    partModel: '504-2154',
    lotNumber: 'LOT-20260819-D4',
    processRouteType: 'UNDER_FILL_VAC_BAKE',
    currentStationId: 'FVMI-05',
    currentStationName: 'FVMI Optical AOI Station #05',
    overallStatus: 'IN_PROGRESS',
    startTime: '08:50:00',
    lastUpdated: '10:29:10',
    yieldScore: 99.2,
    defectCount: 0,
    notes: 'Under Fill Route: Completed MC-12 -> Vac Oven #3 -> Bake Oven #4 -> Now undergoing high-speed AOI.',
    stationSteps: [
      {
        stepNumber: 1,
        stationCategory: 'dispensing',
        stationId: 'MC-12',
        stationName: 'Dispenser MC-12 (Under Fill)',
        timeIn: '08:50:00',
        timeOut: '08:53:30',
        operatorId: 'OP-T1012',
        status: 'PASS',
        parameters: { glueType: 'UF-9200', dispenseWeightMg: 98.1 }
      },
      {
        stepNumber: 2,
        stationCategory: 'oven-vacuum',
        stationId: 'oven-3',
        stationName: 'Vacuum Oven Chamber #3',
        timeIn: '09:00:00',
        timeOut: '09:30:00',
        operatorId: 'OP-V203',
        status: 'PASS',
        parameters: { chamberTempC: 85.0, vacuumPressurePa: 40, vacuumDwellMins: 30 }
      },
      {
        stepNumber: 3,
        stationCategory: 'oven-bake',
        stationId: 'bake-4',
        stationName: 'Thermal Cure Bake Tunnel #4',
        timeIn: '09:35:00',
        timeOut: '10:15:00',
        operatorId: 'OP-B304',
        status: 'PASS',
        parameters: { zone2TempC: 152.0, cureHardnessShoreD: 87 }
      },
      {
        stepNumber: 4,
        stationCategory: 'fvmi',
        stationId: 'FVMI-05',
        stationName: 'FVMI Optical AOI Station #05',
        timeIn: '10:25:00',
        operatorId: 'OP-FV05',
        status: 'IN_PROCESS',
        parameters: {
          aiConfidencePercent: 99.4,
          opticalExposureMs: 1.6,
          scanningProgressPercent: 78
        },
        notes: 'Automated 2D/3D defect scanning in progress.'
      }
    ]
  },

  // ==========================================
  // 6. TOP FILL (TF) ROUTE: Live at Dispenser MC-01
  // ==========================================
  {
    serialId: 'WP-2026-90417',
    partModel: '504-2454',
    lotNumber: 'LOT-20260819-E5',
    processRouteType: 'TOP_FILL_BAKE_DIRECT',
    currentStationId: 'MC-01',
    currentStationName: 'Dispenser MC-01 (Top Fill)',
    overallStatus: 'IN_PROGRESS',
    startTime: '10:25:00',
    lastUpdated: '10:29:30',
    yieldScore: 100.0,
    defectCount: 0,
    notes: 'Top Fill Route: Currently at initial dispensing stage. Will route directly to Bake Oven upon completion.',
    stationSteps: [
      {
        stepNumber: 1,
        stationCategory: 'dispensing',
        stationId: 'MC-01',
        stationName: 'Dispenser MC-01 (Top Fill)',
        timeIn: '10:25:00',
        operatorId: 'OP-T1001',
        status: 'IN_PROCESS',
        parameters: {
          glueType: 'U8410-405',
          dispenseWeightMg: 141.5,
          dispensePressureKpa: 238,
          nozzleTempC: 32.0
        },
        notes: 'Top Fill needle dispensing in progress on Line 1.'
      }
    ]
  },

  // ==========================================
  // 7. UNDER FILL (UF) ROUTE: Completed with OCR 2D Verification
  // ==========================================
  {
    serialId: 'NBTC-2026-99412',
    partModel: '504-2187',
    lotNumber: '20260411-001-NBTC',
    processRouteType: 'UNDER_FILL_VAC_BAKE',
    currentStationId: 'PK-OCR-01',
    currentStationName: 'Pack Out OCR Scanner #1',
    overallStatus: 'COMPLETED_PASS',
    startTime: '09:30:00',
    lastUpdated: '11:42:08',
    yieldScore: 99.8,
    defectCount: 0,
    notes: 'Under Fill Route: MC-09 -> Vac Oven #2 -> Bake Tunnel #1 -> FVMI-03 -> OCR Scanner #1 Grade A.',
    stationSteps: [
      {
        stepNumber: 1,
        stationCategory: 'dispensing',
        stationId: 'MC-09',
        stationName: 'Dispenser MC-09 (Under Fill)',
        timeIn: '09:30:00',
        timeOut: '09:34:00',
        operatorId: 'OP-T1009',
        status: 'PASS',
        parameters: { glueType: 'UF-9200', dispenseWeightMg: 98.2 }
      },
      {
        stepNumber: 2,
        stationCategory: 'oven-vacuum',
        stationId: 'oven-2',
        stationName: 'Vacuum Oven Chamber #2',
        timeIn: '09:40:00',
        timeOut: '10:10:00',
        operatorId: 'OP-V202',
        status: 'PASS',
        parameters: { chamberTempC: 85.0, vacuumPressurePa: 42, vacuumDwellMins: 30 }
      },
      {
        stepNumber: 3,
        stationCategory: 'oven-bake',
        stationId: 'bake-1',
        stationName: 'Bake Oven Tunnel #1',
        timeIn: '10:15:00',
        timeOut: '10:55:00',
        operatorId: 'OP-B301',
        status: 'PASS',
        parameters: { zone2TempC: 151.2 }
      },
      {
        stepNumber: 4,
        stationCategory: 'fvmi',
        stationId: 'FVMI-03',
        stationName: 'FVMI AOI Station #03',
        timeIn: '11:00:00',
        timeOut: '11:03:00',
        operatorId: 'OP-FV03',
        status: 'PASS',
        parameters: { aiConfidencePercent: 99.7 }
      },
      {
        stepNumber: 5,
        stationCategory: 'ocr',
        stationId: 'PK-OCR-01',
        stationName: 'OCR 2D Matrix Scanner #1',
        timeIn: '11:42:00',
        timeOut: '11:42:08',
        operatorId: 'E8291',
        status: 'PASS',
        parameters: {
          ocrGrade: 'A',
          decodeLatencyMs: 38,
          confidencePercent: 99.8,
          barcodePattern: 'NBTC-2026-99412',
          opticalExposureMs: 1.8
        }
      }
    ]
  },

  // ==========================================
  // 8. TOP FILL (TF) ROUTE: Completed with OCR 2D Verification
  // ==========================================
  {
    serialId: 'NBTC-2026-88102',
    partModel: '504-2224',
    lotNumber: '20260226-001-NBTC',
    processRouteType: 'TOP_FILL_BAKE_DIRECT',
    currentStationId: 'PK-OCR-02',
    currentStationName: 'Pack Out OCR Scanner #2',
    overallStatus: 'COMPLETED_PASS',
    startTime: '10:00:00',
    lastUpdated: '11:45:00',
    yieldScore: 100.0,
    defectCount: 0,
    notes: 'Top Fill Route: MC-03 -> Bake Tunnel #2 (Direct Bake) -> FVMI-01 -> OCR Scanner #2.',
    stationSteps: [
      {
        stepNumber: 1,
        stationCategory: 'dispensing',
        stationId: 'MC-03',
        stationName: 'Dispenser MC-03 (Top Fill)',
        timeIn: '10:00:00',
        timeOut: '10:03:15',
        operatorId: 'OP-T1003',
        status: 'PASS',
        parameters: { glueType: 'U8410-405', dispenseWeightMg: 142.6 }
      },
      {
        stepNumber: 2,
        stationCategory: 'oven-bake',
        stationId: 'bake-2',
        stationName: 'Bake Oven Tunnel #2',
        timeIn: '10:10:00',
        timeOut: '10:50:00',
        operatorId: 'OP-B302',
        status: 'PASS',
        parameters: { zone2TempC: 151.0, directBake: true }
      },
      {
        stepNumber: 3,
        stationCategory: 'fvmi',
        stationId: 'FVMI-01',
        stationName: 'FVMI AOI Station #01',
        timeIn: '11:00:00',
        timeOut: '11:03:00',
        operatorId: 'OP-FV01',
        status: 'PASS',
        parameters: { aiConfidencePercent: 99.9 }
      },
      {
        stepNumber: 4,
        stationCategory: 'ocr',
        stationId: 'PK-OCR-02',
        stationName: 'OCR 2D Matrix Scanner #2',
        timeIn: '11:44:40',
        timeOut: '11:45:00',
        operatorId: 'E9012',
        status: 'PASS',
        parameters: {
          ocrGrade: 'A',
          decodeLatencyMs: 42,
          confidencePercent: 99.9,
          barcodePattern: 'NBTC-2026-88102'
        }
      }
    ]
  },

  // ==========================================
  // 9. UNDER FILL (UF) ROUTE: Panel with Rework at FVMI
  // ==========================================
  {
    serialId: 'PNL-2187-0921',
    partModel: '504-2187',
    lotNumber: 'LOT-20260819-A1',
    processRouteType: 'UNDER_FILL_VAC_BAKE',
    currentStationId: 'PK-CNT-01',
    currentStationName: 'Pack Out Unit Counter #1',
    overallStatus: 'REWORK',
    startTime: '08:30:00',
    lastUpdated: '10:14:22',
    yieldScore: 83.3,
    defectCount: 1,
    notes: 'Under Fill Route: 5 OK units, 1 NG unit (solder bridge reworked during FVMI inspection stage).',
    stationSteps: [
      {
        stepNumber: 1,
        stationCategory: 'dispensing',
        stationId: 'MC-07',
        stationName: 'Dispenser MC-07 (Under Fill)',
        timeIn: '08:30:00',
        timeOut: '08:34:00',
        operatorId: 'OP-T1007',
        status: 'PASS',
        parameters: { glueType: 'UF-9200', dispenseWeightMg: 98.6 }
      },
      {
        stepNumber: 2,
        stationCategory: 'oven-vacuum',
        stationId: 'oven-1',
        stationName: 'Vacuum Oven Chamber #1',
        timeIn: '08:40:00',
        timeOut: '09:10:00',
        operatorId: 'OP-V201',
        status: 'PASS',
        parameters: { chamberTempC: 85.0, vacuumPressurePa: 41 }
      },
      {
        stepNumber: 3,
        stationCategory: 'oven-bake',
        stationId: 'bake-1',
        stationName: 'Bake Oven Tunnel #1',
        timeIn: '09:15:00',
        timeOut: '09:55:00',
        operatorId: 'OP-B301',
        status: 'PASS',
        parameters: { zone2TempC: 150.5 }
      },
      {
        stepNumber: 4,
        stationCategory: 'fvmi',
        stationId: 'FVMI-01',
        stationName: 'FVMI Station #01',
        timeIn: '10:00:00',
        timeOut: '10:05:00',
        operatorId: 'OP-FV01',
        status: 'REWORK',
        parameters: { aiConfidencePercent: 97.8, unit1to5: 'PASS', unit6: 'REWORKED_PIN_CLEARANCE' },
        notes: 'Unit 6 pin clearance touch-up performed before clearance.'
      },
      {
        stepNumber: 5,
        stationCategory: 'packout',
        stationId: 'PK-CNT-01',
        stationName: 'Pack Out Unit Counter #1',
        timeIn: '10:14:00',
        timeOut: '10:14:22',
        operatorId: 'E9102',
        status: 'PASS',
        parameters: { totalUnits: 6, okUnits: 5, ngUnits: 1, yieldRate: 83.3 }
      }
    ]
  },

  // ==========================================
  // 10. TOP FILL (TF) ROUTE: Panel 100% OK rate
  // ==========================================
  {
    serialId: 'PNL-2268-0441',
    partModel: '504-2268',
    lotNumber: 'LOT-20260819-C3',
    processRouteType: 'TOP_FILL_BAKE_DIRECT',
    currentStationId: 'PK-CNT-02',
    currentStationName: 'Pack Out Unit Counter #2',
    overallStatus: 'COMPLETED_PASS',
    startTime: '08:45:00',
    lastUpdated: '10:15:02',
    yieldScore: 100.0,
    defectCount: 0,
    notes: 'Top Fill Route: Dispenser MC-05 -> Bake Oven #3 (Direct Bake) -> FVMI-04 -> Pack Out #2. Full panel 100% OK rate.',
    stationSteps: [
      {
        stepNumber: 1,
        stationCategory: 'dispensing',
        stationId: 'MC-05',
        stationName: 'Dispenser MC-05 (Top Fill)',
        timeIn: '08:45:00',
        timeOut: '08:49:00',
        operatorId: 'OP-T1005',
        status: 'PASS',
        parameters: { glueType: 'U8410-405', dispenseWeightMg: 143.0 }
      },
      {
        stepNumber: 2,
        stationCategory: 'oven-bake',
        stationId: 'bake-3',
        stationName: 'Bake Oven Tunnel #3',
        timeIn: '09:00:00',
        timeOut: '09:40:00',
        operatorId: 'OP-B303',
        status: 'PASS',
        parameters: { zone2TempC: 152.0, route: 'DIRECT_BAKE' }
      },
      {
        stepNumber: 3,
        stationCategory: 'fvmi',
        stationId: 'FVMI-04',
        stationName: 'FVMI Station #04',
        timeIn: '09:50:00',
        timeOut: '09:53:00',
        operatorId: 'OP-FV04',
        status: 'PASS',
        parameters: { aiConfidencePercent: 99.8, defectFree: true }
      },
      {
        stepNumber: 4,
        stationCategory: 'packout',
        stationId: 'PK-CNT-02',
        stationName: 'Pack Out Unit Counter #2',
        timeIn: '10:14:30',
        timeOut: '10:15:02',
        operatorId: 'E8841',
        status: 'PASS',
        parameters: { totalUnits: 6, okUnits: 6, ngUnits: 0, yieldRate: 100.0 }
      }
    ]
  }
];

/**
 * Dynamically resolves synthetic production lineage for any workpiece serial.
 * Intelligently applies:
 * - Top Fill route (MC-01 to MC-06): Dispenser -> Bake Direct -> FVMI -> Pack Out
 * - Under Fill route (MC-07 to MC-13): Dispenser -> Vac Degas -> Bake Cure -> FVMI -> Pack Out
 */
export function generateSyntheticTraceabilityRecord(serial: string): WorkpieceRecord {
  const cleanSerial = serial.trim().toUpperCase();
  const hash = cleanSerial.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  
  const models = ['504-2187', '504-2224', '504-2268', '504-2154', '504-2454'];
  const partModel = models[hash % models.length];
  
  // Machines 1 to 6 are Top Fill, Machines 7 to 13 are Under Fill
  const mcNum = (hash % 13) + 1;
  const mcId = `MC-${mcNum.toString().padStart(2, '0')}`;
  const isTopFill = mcNum <= 6;
  const routeType: ProcessRouteType = isTopFill ? 'TOP_FILL_BAKE_DIRECT' : 'UNDER_FILL_VAC_BAKE';
  
  const vNum = (hash % 6) + 1;
  const vId = `oven-${vNum}`;
  
  const bNum = (hash % 5) + 1;
  const bId = `bake-${bNum}`;
  
  const fvmiNum = (hash % 9) + 1;
  const fvmiId = `FVMI-${fvmiNum.toString().padStart(2, '0')}`;
  
  const pkNum = (hash % 2) + 1;
  const isOcr = hash % 3 === 0;
  const pkId = isOcr ? `PK-OCR-0${pkNum}` : `PK-CNT-0${pkNum}`;
  const pkName = isOcr ? `Pack Out OCR Scanner #${pkNum}` : `Pack Out Unit Counter #${pkNum}`;
  
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes();
  
  const time5 = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:22`;
  const time4 = `${Math.max(0, hours - 1).toString().padStart(2, '0')}:${((mins + 15) % 60).toString().padStart(2, '0')}:10`;
  const time3 = `${Math.max(0, hours - 2).toString().padStart(2, '0')}:${((mins + 30) % 60).toString().padStart(2, '0')}:00`;
  const time2 = `${Math.max(0, hours - 2).toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  const time1 = `${Math.max(0, hours - 3).toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;

  const steps: WorkpieceStep[] = [];

  if (isTopFill) {
    // TOP FILL: Step 1 Dispense -> Step 2 Bake Direct (No Vac) -> Step 3 FVMI -> Step 4 Pack Out
    steps.push({
      stepNumber: 1,
      stationCategory: 'dispensing',
      stationId: mcId,
      stationName: `Dispenser ${mcId} (Top Fill)`,
      timeIn: time1,
      timeOut: `${time1.slice(0, 5)}:45`,
      operatorId: `OP-T${1000 + mcNum}`,
      status: 'PASS',
      cycleTimeSec: 3.2,
      parameters: {
        glueType: 'U8410-405 (Top Encapsulant)',
        dispenseWeightMg: 142.4,
        dispensePressureKpa: 240,
        nozzleTempC: 32.5,
        flowRateMlMin: 0.86
      },
      notes: 'Top Fill encapsulation nominal. Proceeds directly to Bake Oven.'
    });

    steps.push({
      stepNumber: 2,
      stationCategory: 'oven-bake',
      stationId: bId,
      stationName: `Thermal Cure Bake Tunnel #${bNum}`,
      timeIn: time3,
      timeOut: `${time3.slice(0, 5)}:40`,
      operatorId: `OP-B${300 + bNum}`,
      status: 'PASS',
      cycleTimeSec: 2400,
      parameters: {
        zone1TempC: 120,
        zone2TempC: 151.0,
        zone3TempC: 153.0,
        processRule: 'DIRECT_BAKE (NO_VACUUM_REQUIRED)'
      },
      notes: 'Top fill resin cured directly in thermal tunnel (Vacuum Oven skipped).'
    });

    steps.push({
      stepNumber: 3,
      stationCategory: 'fvmi',
      stationId: fvmiId,
      stationName: `FVMI Optical AOI Station #${fvmiNum.toString().padStart(2, '0')}`,
      timeIn: time4,
      timeOut: `${time4.slice(0, 5)}:03`,
      operatorId: `OP-FV${fvmiNum.toString().padStart(2, '0')}`,
      status: 'PASS',
      cycleTimeSec: 4.0,
      parameters: {
        aiConfidencePercent: 99.6,
        solderBridgeDefect: 0,
        encapsulationHeightMm: 1.46
      },
      notes: 'Top fill surface geometry and optical clarity validated PASS.'
    });

    steps.push({
      stepNumber: 4,
      stationCategory: isOcr ? 'ocr' : 'packout',
      stationId: pkId,
      stationName: pkName,
      timeIn: time5,
      timeOut: time5,
      operatorId: `E${(hash % 5000) + 5000}`,
      status: 'PASS',
      cycleTimeSec: 2.7,
      parameters: isOcr
        ? { ocrGrade: 'A', decodeLatencyMs: 39, confidencePercent: 99.8, barcodePattern: cleanSerial }
        : { totalUnits: 6, okUnits: 6, ngUnits: 0, yieldRate: 100.0, barcode2dGrade: 'A' },
      notes: 'Final pack out inspection accepted.'
    });
  } else {
    // UNDER FILL: Step 1 Dispense -> Step 2 Vac Degas -> Step 3 Bake Cure -> Step 4 FVMI -> Step 5 Pack Out
    steps.push({
      stepNumber: 1,
      stationCategory: 'dispensing',
      stationId: mcId,
      stationName: `Dispenser ${mcId} (Under Fill)`,
      timeIn: time1,
      timeOut: `${time1.slice(0, 5)}:45`,
      operatorId: `OP-T${1000 + mcNum}`,
      status: 'PASS',
      cycleTimeSec: 3.2,
      parameters: {
        glueType: 'UF-9200 (Capillary Underfill)',
        dispenseWeightMg: 98.2,
        dispensePressureKpa: 220,
        substratePreheatTempC: 80.0,
        nozzleTempC: 38.5
      },
      notes: 'Under fill dispensed. Must undergo vacuum degassing before thermal cure.'
    });

    steps.push({
      stepNumber: 2,
      stationCategory: 'oven-vacuum',
      stationId: vId,
      stationName: `Vacuum Oven Chamber #${vNum}`,
      timeIn: time2,
      timeOut: `${time2.slice(0, 5)}:30`,
      operatorId: `OP-V${200 + vNum}`,
      status: 'PASS',
      cycleTimeSec: 1800,
      parameters: {
        chamberTempC: 85.0,
        vacuumPressurePa: 42,
        vacuumDwellMins: 30,
        nitrogenPurgePpm: 15
      },
      notes: 'Vacuum degassing completed to remove trapped micro-air under die.'
    });

    steps.push({
      stepNumber: 3,
      stationCategory: 'oven-bake',
      stationId: bId,
      stationName: `Thermal Cure Bake Tunnel #${bNum}`,
      timeIn: time3,
      timeOut: `${time3.slice(0, 5)}:40`,
      operatorId: `OP-B${300 + bNum}`,
      status: 'PASS',
      cycleTimeSec: 2400,
      parameters: {
        zone1TempC: 120,
        zone2TempC: 151.0,
        zone3TempC: 153.0,
        cureHardnessShoreD: 88
      },
      notes: 'Thermal curing validated following vacuum chamber dwell.'
    });

    steps.push({
      stepNumber: 4,
      stationCategory: 'fvmi',
      stationId: fvmiId,
      stationName: `FVMI Optical AOI Station #${fvmiNum.toString().padStart(2, '0')}`,
      timeIn: time4,
      timeOut: `${time4.slice(0, 5)}:03`,
      operatorId: `OP-FV${fvmiNum.toString().padStart(2, '0')}`,
      status: 'PASS',
      cycleTimeSec: 4.0,
      parameters: {
        aiConfidencePercent: 99.4,
        solderBridgeDefect: 0,
        voidRatioPercent: 0.3
      },
      notes: 'AOI inspection PASS. Zero underfill voids.'
    });

    steps.push({
      stepNumber: 5,
      stationCategory: isOcr ? 'ocr' : 'packout',
      stationId: pkId,
      stationName: pkName,
      timeIn: time5,
      timeOut: time5,
      operatorId: `E${(hash % 5000) + 5000}`,
      status: 'PASS',
      cycleTimeSec: 2.7,
      parameters: isOcr
        ? { ocrGrade: 'A', decodeLatencyMs: 39, confidencePercent: 99.8, barcodePattern: cleanSerial }
        : { totalUnits: 6, okUnits: 6, ngUnits: 0, yieldRate: 100.0, barcode2dGrade: 'A' },
      notes: 'Final pack out verification complete.'
    });
  }

  return {
    serialId: cleanSerial,
    partModel,
    lotNumber: `LOT-AUTO-${(hash % 900) + 100}`,
    processRouteType: routeType,
    currentStationId: pkId,
    currentStationName: pkName,
    overallStatus: 'COMPLETED_PASS',
    startTime: time1,
    lastUpdated: time5,
    yieldScore: 99.5,
    defectCount: 0,
    notes: isTopFill
      ? `Top Fill Route: ${cleanSerial} cured directly in Bake Oven ${bId} (bypassed vacuum oven).`
      : `Under Fill Route: ${cleanSerial} degassed in Vacuum Oven ${vId} prior to curing in Bake Oven ${bId}.`,
    stationSteps: steps
  };
}

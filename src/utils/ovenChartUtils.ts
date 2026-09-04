import { OvenUnit, DowntimeHistoryItem } from '../types';

// Standard 10-hour shift schedule for thermal processes
export const OVEN_SHIFT_HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

export const MODEL_MAGAZINE_SPECS: Record<
  string,
  { unitsPerMag: number; standardBatchMags: number; cycleMins: number }
> = {
  '504-2187': { unitsPerMag: 60, standardBatchMags: 4, cycleMins: 25 },
  '504-2268': { unitsPerMag: 50, standardBatchMags: 2, cycleMins: 20 },
  '504-2154': { unitsPerMag: 80, standardBatchMags: 5, cycleMins: 30 },
  '504-2224': { unitsPerMag: 65, standardBatchMags: 3, cycleMins: 22 },
  '504-2454': { unitsPerMag: 100, standardBatchMags: 6, cycleMins: 35 },
  '504-2090': { unitsPerMag: 70, standardBatchMags: 4, cycleMins: 26 },
};

export interface OvenHourlySlot {
  hour: string;
  timeRange: string;
  magazinesPerHour: number;
  targetMagazinesPerHour: number;
  unitsPerMagazine: number;
  totalUph: number;
  targetUph: number;
  efficiencyPercent: number;
  isCurrent: boolean;
  isHigh: boolean; // Normal / High volume (High / Normal) -> Dark color
  isLow: boolean;  // Low volume (Low / Below target) -> Light color
  isZero: boolean;
  downtimeMins: number;
  downtimeReason: string;
}

export function computeOvenHourlyData(unit: OvenUnit): OvenHourlySlot[] {
  const modelSpec = MODEL_MAGAZINE_SPECS[unit.runningModel] || MODEL_MAGAZINE_SPECS['504-2187'];
  const unitsPerMag = modelSpec.unitsPerMag;
  const targetMagPerHour = 6;
  const targetTotalUph = targetMagPerHour * unitsPerMag;

  const seed = unit.id.split('').reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 1), 0);

  const DOWNTIME_PRESETS = [
    {
      reason: unit.downtimeReason || (unit.subType === 'Vacuum' ? 'Chamber Seal Vacuum Soak' : 'Pre-heat Thermal Ramp Soak'),
      mins: unit.downtimeDurationMins && unit.downtimeDurationMins > 0 ? unit.downtimeDurationMins : 15,
    },
    {
      reason: 'Magazine Buffer Infeed Jam',
      mins: 18,
    },
    {
      reason: 'Purge Line Pressure Fluctuation',
      mins: 12,
    },
    {
      reason: 'Carrier Swap & Tray Inspection',
      mins: 20,
    },
  ];

  return OVEN_SHIFT_HOURS.map((hour, index) => {
    const nextHour = (parseInt(hour.split(':')[0], 10) + 1).toString().padStart(2, '0') + ':00';
    const timeRange = `${hour} - ${nextHour}`;
    const isCurrent = index === 9;

    const nominalMag = targetMagPerHour;
    const variation = Math.sin(seed + index * 1.5) * 1.8;
    let magCount = Math.max(1, Math.round(nominalMag + variation));

    const isMachineStoppedNow = unit.status === 'STOP' && isCurrent;
    const isDowntimeHour = index === (seed % 4) + 2 || index === 4;

    let dtMins = 0;
    let dtReason = 'Continuous Normal Thermal Run';

    if (isMachineStoppedNow) {
      magCount = 0;
      dtMins = unit.downtimeDurationMins && unit.downtimeDurationMins > 0 ? unit.downtimeDurationMins : 40;
      dtReason = unit.downtimeReason || 'Emergency Line Halt';
    } else if (isDowntimeHour) {
      const preset = DOWNTIME_PRESETS[(seed + index) % DOWNTIME_PRESETS.length];
      dtMins = preset.mins;
      dtReason = preset.reason;
      const runRatio = Math.max(0.2, (60 - dtMins) / 60);
      magCount = Math.max(1, Math.round(nominalMag * runRatio));
    }

    if (unit.downtimeHistory && unit.downtimeHistory.length > 0) {
      const matched = unit.downtimeHistory.find((dh) => dh.timeRange.includes(hour.slice(0, 2)));
      if (matched) {
        dtReason = matched.reason;
        dtMins = matched.durationMins;
        magCount = Math.max(0, Math.round(nominalMag * ((60 - dtMins) / 60)));
      }
    }

    if (isCurrent && unit.status === 'STOP') {
      magCount = 0;
    }

    const totalUph = magCount * unitsPerMag;
    const efficiencyPercent = Number(((magCount / Math.max(1, targetMagPerHour)) * 100).toFixed(1));
    const isZero = magCount === 0;
    const isHigh = magCount >= targetMagPerHour;
    const isLow = magCount < targetMagPerHour && !isZero;

    return {
      hour,
      timeRange,
      magazinesPerHour: magCount,
      targetMagazinesPerHour: targetMagPerHour,
      unitsPerMagazine: unitsPerMag,
      totalUph,
      targetUph: targetTotalUph,
      efficiencyPercent,
      isCurrent,
      isHigh,
      isLow,
      isZero,
      downtimeMins: dtMins,
      downtimeReason: dtReason,
    };
  });
}

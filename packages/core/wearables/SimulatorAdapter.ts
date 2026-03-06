import type { DailyWearableData, WearableAdapter } from './WearableAdapter';

function deterministicSeed(dayKey: string): number {
  return dayKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function seededFloat(seed: number, min: number, max: number): number {
  const pseudo = ((seed * 9301 + 49297) % 233280) / 233280;
  return Math.round((min + pseudo * (max - min)) * 10) / 10;
}

function seededInt(seed: number, min: number, max: number): number {
  return Math.round(seededFloat(seed, min, max));
}

export class SimulatorAdapter implements WearableAdapter {
  readonly source = 'simulator';

  async fetchDay(userId: string, dayKey: string): Promise<DailyWearableData> {
    const seed = deterministicSeed(dayKey + userId);
    return {
      user_id: userId,
      day_key: dayKey,
      hrv_rmssd: seededFloat(seed, 25, 75),
      resting_hr: seededInt(seed + 1, 48, 72),
      sleep_score: seededInt(seed + 2, 55, 95),
      readiness_score: seededInt(seed + 3, 55, 95),
      activity_score: seededInt(seed + 4, 40, 90),
      sleep_duration_hours: seededFloat(seed + 5, 5.5, 9.0),
      raw_snapshot: { simulated: true, seed },
      source: this.source,
    };
  }
}

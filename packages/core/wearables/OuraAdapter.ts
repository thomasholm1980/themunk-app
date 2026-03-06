// packages/core/wearables/OuraAdapter.ts
// Layer 7 — Real Oura API adapter
// v1.0.0

import type { DailyWearableData, WearableAdapter } from './WearableAdapter';

interface OuraTokenStore {
  getAccessToken(userId: string): Promise<string | null>;
}

export class OuraAdapter implements WearableAdapter {
  readonly source = 'oura';

  constructor(private tokenStore: OuraTokenStore) {}

  async fetchDay(userId: string, dayKey: string): Promise<DailyWearableData | null> {
    const accessToken = await this.tokenStore.getAccessToken(userId);
    if (!accessToken) return null;

    const headers = { Authorization: `Bearer ${accessToken}` };
    const startDate = dayKey;
    const endDate = dayKey;

    const [readiness, sleep, activity, hrv] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${startDate}&end_date=${endDate}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDate}&end_date=${endDate}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${startDate}&end_date=${endDate}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_cardiovascular_age?start_date=${startDate}&end_date=${endDate}`, { headers }).then(r => r.json()),
    ]);

    const r = readiness?.data?.[0];
    const s = sleep?.data?.[0];
    const a = activity?.data?.[0];

    if (!r && !s && !a) return null;

    return {
      user_id: userId,
      day_key: dayKey,
      hrv_rmssd: s?.contributors?.total_sleep ?? null,
      resting_hr: s?.contributors?.resting_heart_rate ?? null,
      sleep_score: s?.score ?? null,
      readiness_score: r?.score ?? null,
      activity_score: a?.score ?? null,
      sleep_duration_hours: s?.contributors?.total_sleep
        ? Math.round((s.contributors.total_sleep / 3600) * 10) / 10
        : null,
      raw_snapshot: { readiness: r, sleep: s, activity: a },
      source: this.source,
    };
  }
}

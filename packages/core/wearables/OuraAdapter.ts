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

    const [readinessRes, dailySleepRes, sleepRes, activityRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${dayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${dayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/sleep?start_date=${dayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${dayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
    ]);

    const readiness = readinessRes?.data?.[0];
    const dailySleep = dailySleepRes?.data?.[0];
    const sleepSessions = sleepRes?.data ?? [];
    const activity = activityRes?.data?.[0];

    if (!readiness && !dailySleep) return null;

    const totalSleepSeconds = sleepSessions
      .filter((s: { type?: string }) => s.type !== 'rest')
      .reduce((sum: number, s: { total_sleep_duration?: number }) => sum + (s.total_sleep_duration ?? 0), 0);
    const sleep_duration_minutes = totalSleepSeconds > 0
      ? Math.round(totalSleepSeconds / 60)
      : null;

    const sleep_duration_hours = sleep_duration_minutes
      ? Math.round((sleep_duration_minutes / 60) * 10) / 10
      : null;

    const hrValues = sleepSessions
      .map((s: { average_heart_rate?: number }) => s.average_heart_rate)
      .filter((v: unknown): v is number => typeof v === 'number' && v > 0);
    const resting_hr = hrValues.length > 0
      ? Math.round(hrValues.reduce((a: number, b: number) => a + b, 0) / hrValues.length)
      : null;

    const hrvValues = sleepSessions
      .map((s: { average_hrv?: number }) => s.average_hrv)
      .filter((v: unknown): v is number => typeof v === 'number' && v > 0);
    const hrv_rmssd = hrvValues.length > 0
      ? Math.round(hrvValues.reduce((a: number, b: number) => a + b, 0) / hrvValues.length)
      : null;

    return {
      user_id: userId,
      day_key: dayKey,
      hrv_rmssd,
      resting_hr,
      sleep_score: dailySleep?.score ?? null,
      readiness_score: readiness?.score ?? null,
      activity_score: activity?.score ?? null,
      sleep_duration_hours,
      raw_snapshot: {
        readiness,
        sleep: dailySleep,
        sleep_sessions: sleepSessions,
        activity,
      },
      source: this.source,
    };
  }
}

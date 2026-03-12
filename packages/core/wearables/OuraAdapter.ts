import type { DailyWearableData, WearableAdapter } from './WearableAdapter';

interface OuraTokenStore {
  getAccessToken(userId: string): Promise<string | null>;
}

function getPrevDayKey(dayKey: string): string {
  const d = new Date(dayKey + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export class OuraAdapter implements WearableAdapter {
  readonly source = 'oura';

  constructor(private tokenStore: OuraTokenStore) {}

  async fetchDay(userId: string, dayKey: string): Promise<DailyWearableData | null> {
    const accessToken = await this.tokenStore.getAccessToken(userId);
    if (!accessToken) return null;

    const headers = { Authorization: `Bearer ${accessToken}` };
    const prevDayKey = getPrevDayKey(dayKey);

    const [readinessRes, dailySleepRes, sleepRes, activityRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${dayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${dayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/sleep?start_date=${prevDayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${dayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
    ]);

    const readiness = readinessRes?.data?.[0];
    const dailySleep = dailySleepRes?.data?.[0];
    const activity = activityRes?.data?.[0];

    const allSessions: Array<{
      type?: string;
      bedtime_end?: string;
      total_sleep_duration?: number;
      lowest_heart_rate?: number;
      average_hrv?: number;
    }> = sleepRes?.data ?? [];

    // Canonical session: longest primary overnight session ending on dayKey
    const canonicalSession = allSessions
      .filter(s =>
        s.type !== 'rest' &&
        typeof s.bedtime_end === 'string' &&
        s.bedtime_end.startsWith(dayKey)
      )
      .sort((a, b) => (b.total_sleep_duration ?? 0) - (a.total_sleep_duration ?? 0))[0] ?? null;

    if (!readiness && !dailySleep && !canonicalSession) return null;

    const sleep_duration_hours = canonicalSession?.total_sleep_duration
      ? Math.round((canonicalSession.total_sleep_duration / 3600) * 10) / 10
      : null;

    const resting_hr = typeof canonicalSession?.lowest_heart_rate === 'number' && canonicalSession.lowest_heart_rate > 0
      ? canonicalSession.lowest_heart_rate
      : null;

    const hrv_rmssd = typeof canonicalSession?.average_hrv === 'number' && canonicalSession.average_hrv > 0
      ? Math.round(canonicalSession.average_hrv)
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
        sleep_sessions: allSessions,
        canonical_session: canonicalSession,
        activity,
      },
      source: this.source,
    };
  }
}

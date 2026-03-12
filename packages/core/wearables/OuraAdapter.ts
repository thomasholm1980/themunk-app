import type { DailyWearableData, WearableAdapter } from './WearableAdapter';

interface OuraTokenStore {
  getAccessToken(userId: string): Promise<string | null>;
}

function getPrevDayKey(dayKey: string): string {
  const d = new Date(dayKey + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

type SleepSession = {
  type?: string;
  bedtime_start?: string;
  bedtime_end?: string;
  total_sleep_duration?: number;
  lowest_heart_rate?: number;
  average_hrv?: number;
};

function selectCanonicalSession(sessions: SleepSession[]): SleepSession | null {
  if (sessions.length === 0) return null;

  // Prefer long_sleep type first, then sort by duration descending, tie-break by latest bedtime_end
  const candidates = [...sessions].sort((a, b) => {
    const aIsLong = a.type === 'long_sleep' ? 1 : 0;
    const bIsLong = b.type === 'long_sleep' ? 1 : 0;
    if (bIsLong !== aIsLong) return bIsLong - aIsLong;

    const durDiff = (b.total_sleep_duration ?? 0) - (a.total_sleep_duration ?? 0);
    if (durDiff !== 0) return durDiff;

    return (b.bedtime_end ?? '').localeCompare(a.bedtime_end ?? '');
  });

  return candidates[0] ?? null;
}

export class OuraAdapter implements WearableAdapter {
  readonly source = 'oura';

  constructor(private tokenStore: OuraTokenStore) {}

  async fetchDay(userId: string, dayKey: string): Promise<DailyWearableData | null> {
    const accessToken = await this.tokenStore.getAccessToken(userId);
    if (!accessToken) {
      console.log('[OuraAdapter] no access token for user:', userId);
      return null;
    }

    const headers = { Authorization: `Bearer ${accessToken}` };
    const prevDayKey = getPrevDayKey(dayKey);

    console.log('[OuraAdapter] Oura Sleep Sync Debug');
    console.log('[OuraAdapter] requested_range:', { start_date: prevDayKey, end_date: dayKey });

    const sleepUrl = `https://api.ouraring.com/v2/usercollection/sleep?start_date=${prevDayKey}&end_date=${dayKey}`;
    const sleepRawRes = await fetch(sleepUrl, { headers });

    console.log('[OuraAdapter] http_status:', sleepRawRes.status);

    const sleepRes = await sleepRawRes.json();
    const allSessions: SleepSession[] = sleepRes?.data ?? [];

    console.log('[OuraAdapter] sessions_returned:', allSessions.length);
    allSessions.forEach((s, i) => {
      console.log(`[OuraAdapter] session ${i}:`, {
        type: s.type ?? 'unknown',
        start_time: s.bedtime_start ?? 'unknown',
        end_time: s.bedtime_end ?? 'unknown',
        duration_s: s.total_sleep_duration ?? null,
      });
    });

    const [readinessRes, dailySleepRes, activityRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${dayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${dayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${dayKey}&end_date=${dayKey}`, { headers }).then(r => r.json()),
    ]);

    const readiness = readinessRes?.data?.[0];
    const dailySleep = dailySleepRes?.data?.[0];
    const activity = activityRes?.data?.[0];

    const canonicalSession = selectCanonicalSession(allSessions);

    console.log('[OuraAdapter] canonical_session:', canonicalSession ? {
      type: canonicalSession.type,
      start_time: canonicalSession.bedtime_start,
      end_time: canonicalSession.bedtime_end,
      duration_s: canonicalSession.total_sleep_duration,
      has_hrv: canonicalSession.average_hrv != null,
      has_rhr: canonicalSession.lowest_heart_rate != null,
    } : 'none');

    if (!readiness && !dailySleep && !canonicalSession) {
      console.log('[OuraAdapter] no_data — all sources empty for dayKey:', dayKey);
      return null;
    }

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

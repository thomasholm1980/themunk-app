export interface DailyWearableData {
  user_id: string;
  day_key: string;
  hrv_rmssd: number | null;
  resting_hr: number | null;
  sleep_score: number | null;
  readiness_score: number | null;
  activity_score: number | null;
  sleep_duration_hours: number | null;
  raw_snapshot: Record<string, unknown>;
  source: string;
}

export interface WearableAdapter {
  fetchDay(userId: string, dayKey: string): Promise<DailyWearableData | null>;
  readonly source: string;
}

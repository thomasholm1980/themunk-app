// packages/core/types.ts
// Shared domain types. No LLM. No medical logic.

export type GYRState   = "GREEN" | "YELLOW" | "RED";
export type Direction  = "improving" | "stable" | "declining";
export type Completeness = "complete" | "partial" | "minimal" | "empty";
export type HRVMethod  = "rmssd_ms" | "balance_score_0_100" | "sdnn" | "ln_rmssd";

// ---------- Data Quality ----------

export interface DataQuality {
  completeness: Completeness;
  confidence: "high" | "medium" | "low" | "none";
  missing_fields: string[];
  wear_time_minutes: number | null;
  notes: string | null;
}

// ---------- Normalized Records ----------

export interface NormalizedRecord {
  schema_version: "1.0";
  record_type: string;
  day_key: string;       // YYYY-MM-DD user local date
  source: string;
  start_ts: string;      // ISO 8601 UTC
  end_ts: string;
  data_quality: DataQuality;
  raw_source_ref: string | null;
}

export interface RecoveryDay extends NormalizedRecord {
  record_type: "recovery_day";
  hrv_rmssd_ms: number | null;
  hrv_balance_score_0_100: number | null;
  hrv_method: HRVMethod | null;
  resting_heart_rate_bpm: number | null;
  readiness_score: number | null;
  body_temperature_delta_c: number | null;
  respiratory_rate_bpm: number | null;
}

export interface SleepSession extends NormalizedRecord {
  record_type: "sleep_session";
  duration_minutes: number | null;
  total_sleep_minutes: number | null;
  sleep_efficiency_pct: number | null;
  sleep_stages: {
    deep_minutes: number | null;
    rem_minutes: number | null;
    light_minutes: number | null;
    awake_minutes: number | null;
  } | null;
  sleep_score: number | null;
  latency_minutes: number | null;
  awakenings_count: number | null;
}

export interface ActivityDay extends NormalizedRecord {
  record_type: "activity_day";
  steps: number | null;
  active_minutes: number | null;
  sedentary_minutes: number | null;
  calories_active_kcal: number | null;
  calories_total_kcal: number | null;
  activity_score: number | null;
  high_intensity_minutes: number | null;
  met_avg: number | null;
}

export type DayRecord = RecoveryDay | SleepSession | ActivityDay;

// ---------- Trend ----------

export interface WindowStats {
  coverage_days: number;
  coverage_pct: number;
  sufficient: boolean;
  mean: number | null;
  min: number | null;
  max: number | null;
  latest: number | null;
  slope_per_day: number | null;
  direction: Direction | null;
}

export interface TrendReport {
  trend_version: "1.0";
  anchor_date: string;
  signals: Record<string, Record<string, WindowStats>>;
}

// ---------- State ----------

export interface StateResult {
  classifier_version: "1.0";
  anchor_date: string;
  state: GYRState;
  confidence: number;
  composite_score: number | null;
  gate_triggered: boolean;
  gate_reason: string | null;
  latest_modifier_applied: boolean;
  signal_states: Record<string, GYRState | null>;
  signal_averages_7d: Record<string, number | null>;
  effective_weights: Record<string, number>;
  missing_signals: string[];
  coverage_days_7d: Record<string, number>;
  volatility_flags: Record<string, boolean>;
  insufficient_data?: boolean;
}

// ---------- Manual Log ----------

export interface ManualLog {
  user_id: string;
  day_key: string;
  energy_1_5: number;        // 1–5 scale
  mood_1_5: number;
  stress_1_5: number;
  notes: string | null;
  created_at?: string;
}

// ---------- Monk Brief ----------

export interface MonkBrief {
  brief_version: "1.0";
  day_key: string;
  generated_at: string;
  state: GYRState;
  state_confidence: number;
  signals_summary: {
    sleep_score: number | null;
    readiness_score: number | null;
    activity_score: number | null;
    hrv_balance_score_0_100: number | null;
  };
  trend: {
    sleep_7d_avg: number | null;
    readiness_7d_avg: number | null;
    direction: Direction | null;
  };
  one_action: {
    category: "sleep" | "recovery" | "activity" | "rest";
    instruction: string;
    rationale: string;
  };
  data_quality_summary: "complete" | "partial" | "insufficient";
}

// ---------- Feedback ----------

export interface BriefFeedback {
  user_id: string;
  day_key: string;
  agreed: boolean;
  felt_state: GYRState | null;
  comment: string | null;
  created_at?: string;
}

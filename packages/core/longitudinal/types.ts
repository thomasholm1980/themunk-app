export type LongitudinalStatus =
  | 'insufficient_data'
  | 'volatile'
  | 'accumulating_strain'
  | 'improving_recovery'
  | 'stable';

export type TrajectoryDirection = 'improving' | 'declining' | 'neutral' | 'unknown';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type DriverCode =
  | 'LOW_DATA_COVERAGE'
  | 'HIGH_STATE_VARIANCE'
  | 'REPEATED_RED_DAYS'
  | 'HRV_DECLINING'
  | 'HRV_RECOVERING'
  | 'SLEEP_DECLINING'
  | 'SLEEP_RECOVERING'
  | 'READINESS_LOW'
  | 'READINESS_HIGH'
  | 'RESTING_HR_ELEVATED'
  | 'GREEN_STREAK'
  | 'MIXED_SIGNALS'
  | 'PROTOCOL_LOW_ADHERENCE'
  | 'STATE_IMPROVING'
  | 'STATE_DECLINING';

export type MunkState = 'GREEN' | 'YELLOW' | 'RED';

export interface DailyStateRow {
  day_key: string;
  state: MunkState;
  confidence: string;
}

export interface WearableLogRow {
  day_key: string;
  hrv_rmssd: number | null;
  resting_hr: number | null;
  sleep_score: number | null;
  readiness_score: number | null;
}

export interface NervousSystemDriftRow {
  computed_at: string;
  window_days: number;
  hrv_trend: string | null;
  drift_score: number | null;
}

export interface ProtocolAdherenceRow {
  day_key: string;
  adherence_score: number | null;
}

export interface DriftSummaryInput {
  userId: string;
  computedAt: string;
  dailyStates: DailyStateRow[];
  wearableLogs: WearableLogRow[];
  nervousSystemDrift: NervousSystemDriftRow[];
  protocolAdherence: ProtocolAdherenceRow[];
}

export interface StateDistribution {
  green: number;
  yellow: number;
  red: number;
  total: number;
  green_pct: number;
  yellow_pct: number;
  red_pct: number;
}

export interface WindowMetrics {
  days_available: number;
  state_distribution: StateDistribution;
  avg_hrv_rmssd: number | null;
  avg_resting_hr: number | null;
  avg_sleep_score: number | null;
  avg_readiness_score: number | null;
  avg_adherence_score: number | null;
}

export interface WindowResult {
  window_days: 7 | 14;
  status: LongitudinalStatus;
  confidence: ConfidenceLevel;
  driver_codes: DriverCode[];
  metrics: WindowMetrics;
}

export interface DriftSummaryResult {
  userId: string;
  computedAt: string;
  window_7d: WindowResult;
  window_14d: WindowResult;
  trajectory: TrajectoryDirection;
  summary_code: LongitudinalStatus;
  flags: DriverCode[];
  version: string;
}

export interface LongitudinalSummaryRecord {
  user_id: string;
  computed_at: string;
  day_key: string;
  window_7d_status: LongitudinalStatus;
  window_14d_status: LongitudinalStatus;
  trajectory: TrajectoryDirection;
  summary_code: LongitudinalStatus;
  flags: DriverCode[];
  state_distribution_7d: StateDistribution;
  state_distribution_14d: StateDistribution;
  avg_hrv_rmssd_7d: number | null;
  avg_resting_hr_7d: number | null;
  avg_sleep_score_7d: number | null;
  avg_readiness_score_7d: number | null;
  avg_adherence_score_7d: number | null;
  avg_hrv_rmssd_14d: number | null;
  avg_resting_hr_14d: number | null;
  avg_sleep_score_14d: number | null;
  avg_readiness_score_14d: number | null;
  avg_adherence_score_14d: number | null;
  version: string;
}

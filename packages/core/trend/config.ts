// packages/core/trend/config.ts
export const WINDOWS = [7, 28, 90] as const;
export const MIN_COVERAGE = 0.60;
export const TREND_SIGNALS = [
  "sleep_score",
  "readiness_score",
  "hrv_rmssd_ms",
  "hrv_balance_score_0_100",
  "activity_score",
  "resting_heart_rate_bpm",
  "body_temperature_delta_c",
] as const;
export const SLOPE_IMPROVING = +0.3;
export const SLOPE_DECLINING = -0.3;

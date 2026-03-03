// packages/core/state/config.ts
export const SIGNAL_WEIGHTS: Record<string, number> = {
  sleep_score:             0.35,
  readiness_score:         0.30,
  hrv_balance_score_0_100: 0.20,
  activity_score:          0.15,
};

export const SIGNAL_THRESHOLDS: Record<string, { green: number; yellow: number }> = {
  sleep_score:             { green: 80, yellow: 65 },
  readiness_score:         { green: 75, yellow: 60 },
  hrv_balance_score_0_100: { green: 70, yellow: 50 },
  activity_score:          { green: 70, yellow: 50 },
};

export const COMPOSITE_GREEN  = 0.75;
export const COMPOSITE_YELLOW = 0.45;

export const PENALTY_MISSING_SIGNAL  = 0.10;
export const PENALTY_LOW_COVERAGE    = 0.10;
export const PENALTY_HIGH_VOLATILITY = 0.10;
export const VOLATILITY_STD_THRESHOLD = 12.0;
export const MAX_MISSING_BEFORE_YELLOW = 2;
export const MIN_COVERAGE_DAYS = 5;

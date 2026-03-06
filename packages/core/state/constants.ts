export const STATE_THRESHOLDS = {
  GREEN: 75,
  YELLOW_MIN: 45,
} as const

export const MANUAL_BANDS = {
  STRONG: 75,
  MODERATE: 50,
} as const

export const FUSION_WEIGHTS = {
  MANUAL: 0.55,
  WEARABLE: 0.45,
} as const

export const WEARABLE_WEIGHTS: Record<string, number> = {
  sleep_score: 0.25,
  readiness_score: 0.25,
  hrv: 0.20,
  resting_hr: 0.15,
  sleep_duration_minutes: 0.10,
  activity_score: 0.05,
}

export const DISAGREEMENT_THRESHOLD = 25

export const CRITICAL_LIMITS = {
  SLEEP_DURATION_VERY_LOW: 300,
  SLEEP_SCORE_CRITICAL: 50,
  READINESS_CRITICAL: 50,
  HRV_CRITICAL: 20,
  RHR_HIGH: 72,
  MANUAL_ENERGY_LOW: 2,
  MANUAL_MOOD_LOW: 2,
  MANUAL_STRESS_HIGH: 4,
} as const

export const SLEEP_SCORE_MAP = [
  { min: 85, score: 90 },
  { min: 70, score: 70 },
  { min: 55, score: 45 },
  { min: 0,  score: 20 },
] as const

export const READINESS_SCORE_MAP = [
  { min: 85, score: 90 },
  { min: 70, score: 70 },
  { min: 55, score: 45 },
  { min: 0,  score: 20 },
] as const

export const HRV_SCORE_MAP = [
  { min: 55, score: 90 },
  { min: 35, score: 65 },
  { min: 20, score: 40 },
  { min: 0,  score: 15 },
] as const

export const RHR_SCORE_MAP = [
  { max: 58, score: 85 },
  { max: 65, score: 65 },
  { max: 72, score: 40 },
  { max: Infinity, score: 20 },
] as const

export const SLEEP_DURATION_SCORE_MAP = [
  { min: 450, score: 85 },
  { min: 390, score: 65 },
  { min: 330, score: 40 },
  { min: 0,   score: 20 },
] as const

export const ACTIVITY_SCORE_MAP = [
  { min: 80, score: 75 },
  { min: 60, score: 65 },
  { min: 40, score: 50 },
  { min: 0,  score: 35 },
] as const

export const CONFIDENCE_MIN_WEARABLE_SIGNALS = 4

export const ESCALATION = {
  FLAGS_BLOCK_GREEN: 2,
  FLAGS_FORCE_RED_CANDIDATE: 3,
} as const

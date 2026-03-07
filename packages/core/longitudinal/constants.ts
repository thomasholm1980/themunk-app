import type { TrajectoryDirection } from './types';

export const DRIFT_ENGINE_VERSION = '1.0.0';

export const MIN_DAYS_7D = 5;
export const MIN_DAYS_14D = 10;

export const VOLATILE_RED_PCT_THRESHOLD = 0.43;
export const CONSECUTIVE_RED_TRIGGER = 3;
export const VOLATILE_MIXED_GREEN_PCT = 0.30;

export const STRAIN_RED_PCT_THRESHOLD = 0.28;
export const HRV_DECLINE_THRESHOLD = 0.05;
export const RESTING_HR_ELEVATED_BPM = 68;
export const READINESS_LOW_THRESHOLD = 55;

export const RECOVERY_GREEN_PCT_THRESHOLD = 0.57;
export const HRV_IMPROVE_THRESHOLD = 0.05;
export const READINESS_HIGH_THRESHOLD = 70;
export const SLEEP_RECOVER_THRESHOLD = 75;
export const SLEEP_DECLINE_THRESHOLD = 60;
export const CONSECUTIVE_GREEN_TRIGGER = 3;

export const STABLE_NON_RED_PCT_THRESHOLD = 0.72;

export const ADHERENCE_LOW_THRESHOLD = 0.60;

export const CONFIDENCE_HIGH_DAYS_7D = 7;
export const CONFIDENCE_HIGH_DAYS_14D = 13;
export const CONFIDENCE_MEDIUM_DAYS_7D = 5;
export const CONFIDENCE_MEDIUM_DAYS_14D = 10;

export const TRAJECTORY_MAP: Record<string, TrajectoryDirection> = {
  'accumulating_strain|improving_recovery': 'improving',
  'accumulating_strain|stable':             'improving',
  'volatile|improving_recovery':            'improving',
  'volatile|stable':                        'improving',
  'improving_recovery|accumulating_strain': 'declining',
  'improving_recovery|volatile':            'declining',
  'stable|accumulating_strain':             'declining',
  'stable|volatile':                        'declining',
  'stable|stable':                          'neutral',
  'improving_recovery|improving_recovery':  'neutral',
  'accumulating_strain|accumulating_strain':'neutral',
  'volatile|volatile':                      'neutral',
  'insufficient_data|insufficient_data':    'unknown',
};

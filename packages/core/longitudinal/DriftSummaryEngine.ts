import {
  DriftSummaryInput, DriftSummaryResult, WindowResult, WindowMetrics,
  StateDistribution, LongitudinalStatus, ConfidenceLevel, DriverCode,
  TrajectoryDirection, DailyStateRow, WearableLogRow, ProtocolAdherenceRow,
} from './types';
import {
  DRIFT_ENGINE_VERSION, MIN_DAYS_7D, MIN_DAYS_14D,
  VOLATILE_RED_PCT_THRESHOLD, VOLATILE_MIXED_GREEN_PCT, CONSECUTIVE_RED_TRIGGER,
  CONSECUTIVE_GREEN_TRIGGER, STRAIN_RED_PCT_THRESHOLD, HRV_DECLINE_THRESHOLD,
  HRV_IMPROVE_THRESHOLD, RESTING_HR_ELEVATED_BPM, READINESS_LOW_THRESHOLD,
  READINESS_HIGH_THRESHOLD, SLEEP_RECOVER_THRESHOLD, SLEEP_DECLINE_THRESHOLD,
  RECOVERY_GREEN_PCT_THRESHOLD, STABLE_NON_RED_PCT_THRESHOLD, ADHERENCE_LOW_THRESHOLD,
  CONFIDENCE_HIGH_DAYS_7D, CONFIDENCE_HIGH_DAYS_14D,
  CONFIDENCE_MEDIUM_DAYS_7D, CONFIDENCE_MEDIUM_DAYS_14D, TRAJECTORY_MAP,
} from './constants';

function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && !isNaN(v));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function sortByDayKey<T extends { day_key: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.day_key.localeCompare(b.day_key));
}

export function computeStateDistribution(states: DailyStateRow[]): StateDistribution {
  const total = states.length;
  if (total === 0) return { green: 0, yellow: 0, red: 0, total: 0, green_pct: 0, yellow_pct: 0, red_pct: 0 };
  const green  = states.filter(s => s.state === 'GREEN').length;
  const yellow = states.filter(s => s.state === 'YELLOW').length;
  const red    = states.filter(s => s.state === 'RED').length;
  return { green, yellow, red, total, green_pct: green/total, yellow_pct: yellow/total, red_pct: red/total };
}

export function computeWindowAverages(
  wearableLogs: WearableLogRow[],
  adherence: ProtocolAdherenceRow[]
): Pick<WindowMetrics, 'avg_hrv_rmssd'|'avg_resting_hr'|'avg_sleep_score'|'avg_readiness_score'|'avg_adherence_score'> {
  return {
    avg_hrv_rmssd:       avg(wearableLogs.map(r => r.hrv_rmssd)),
    avg_resting_hr:      avg(wearableLogs.map(r => r.resting_hr)),
    avg_sleep_score:     avg(wearableLogs.map(r => r.sleep_score)),
    avg_readiness_score: avg(wearableLogs.map(r => r.readiness_score)),
    avg_adherence_score: adherence.length > 0 ? avg(adherence.map(r => r.adherence_score)) : null,
  };
}

function detectConsecutiveRun(states: DailyStateRow[], target: 'RED'|'GREEN', threshold: number): boolean {
  const sorted = sortByDayKey(states);
  let run = 0;
  for (const row of sorted) {
    if (row.state === target) { run++; if (run >= threshold) return true; }
    else run = 0;
  }
  return false;
}

function detectHRVTrend(wearableLogs: WearableLogRow[]): 'declining'|'improving'|'neutral' {
  const sorted = sortByDayKey(wearableLogs);
  const mid = Math.floor(sorted.length / 2);
  const avgFirst  = avg(sorted.slice(0, mid).map(r => r.hrv_rmssd));
  const avgSecond = avg(sorted.slice(mid).map(r => r.hrv_rmssd));
  if (avgFirst === null || avgSecond === null || avgFirst === 0) return 'neutral';
  const delta = (avgSecond - avgFirst) / avgFirst;
  if (delta <= -HRV_DECLINE_THRESHOLD) return 'declining';
  if (delta >=  HRV_IMPROVE_THRESHOLD) return 'improving';
  return 'neutral';
}

function isStateDirectionDeclining(states: DailyStateRow[]): boolean {
  const sorted = sortByDayKey(states);
  if (sorted.length < 4) return false;
  const mid = Math.floor(sorted.length / 2);
  return (computeStateDistribution(sorted.slice(0, mid)).green_pct - computeStateDistribution(sorted.slice(mid)).green_pct) >= 0.25;
}

function isStateDirectionImproving(states: DailyStateRow[]): boolean {
  const sorted = sortByDayKey(states);
  if (sorted.length < 4) return false;
  const mid = Math.floor(sorted.length / 2);
  return (computeStateDistribution(sorted.slice(mid)).green_pct - computeStateDistribution(sorted.slice(0, mid)).green_pct) >= 0.25;
}

function collectDriverCodes(
  dist: StateDistribution,
  averages: ReturnType<typeof computeWindowAverages>,
  states: DailyStateRow[],
  wearableLogs: WearableLogRow[],
  status: LongitudinalStatus
): DriverCode[] {
  const codes: DriverCode[] = [];
  if (status === 'insufficient_data') { codes.push('LOW_DATA_COVERAGE'); return codes; }
  if (dist.red_pct > VOLATILE_RED_PCT_THRESHOLD) codes.push('HIGH_STATE_VARIANCE');
  if (detectConsecutiveRun(states, 'RED',   CONSECUTIVE_RED_TRIGGER))   codes.push('REPEATED_RED_DAYS');
  if (detectConsecutiveRun(states, 'GREEN', CONSECUTIVE_GREEN_TRIGGER)) codes.push('GREEN_STREAK');
  if (isStateDirectionDeclining(states)) codes.push('STATE_DECLINING');
  if (isStateDirectionImproving(states)) codes.push('STATE_IMPROVING');
  if (wearableLogs.length >= 4) {
    const trend = detectHRVTrend(wearableLogs);
    if (trend === 'declining') codes.push('HRV_DECLINING');
    if (trend === 'improving') codes.push('HRV_RECOVERING');
  }
  if (averages.avg_resting_hr !== null && averages.avg_resting_hr > RESTING_HR_ELEVATED_BPM) codes.push('RESTING_HR_ELEVATED');
  if (averages.avg_readiness_score !== null) {
    if (averages.avg_readiness_score < READINESS_LOW_THRESHOLD)  codes.push('READINESS_LOW');
    if (averages.avg_readiness_score > READINESS_HIGH_THRESHOLD) codes.push('READINESS_HIGH');
  }
  if (averages.avg_sleep_score !== null) {
    if (averages.avg_sleep_score < SLEEP_DECLINE_THRESHOLD)  codes.push('SLEEP_DECLINING');
    if (averages.avg_sleep_score > SLEEP_RECOVER_THRESHOLD)  codes.push('SLEEP_RECOVERING');
  }
  if (codes.includes('HRV_RECOVERING') && dist.red_pct > STRAIN_RED_PCT_THRESHOLD) codes.push('MIXED_SIGNALS');
  if (averages.avg_adherence_score !== null && averages.avg_adherence_score < ADHERENCE_LOW_THRESHOLD) codes.push('PROTOCOL_LOW_ADHERENCE');
  return codes;
}

function classifyWindow(states: DailyStateRow[], minDays: number): LongitudinalStatus {
  if (states.length < minDays) return 'insufficient_data';
  const dist = computeStateDistribution(states);
  const hasConsecutiveRed = detectConsecutiveRun(states, 'RED', CONSECUTIVE_RED_TRIGGER);
  if (dist.red_pct > VOLATILE_RED_PCT_THRESHOLD || (dist.red_pct > STRAIN_RED_PCT_THRESHOLD && dist.green_pct > VOLATILE_MIXED_GREEN_PCT) || hasConsecutiveRed) return 'volatile';
  if (dist.red_pct > STRAIN_RED_PCT_THRESHOLD) return 'accumulating_strain';
  if (dist.green_pct > RECOVERY_GREEN_PCT_THRESHOLD) return 'improving_recovery';
  const nonRedPct = dist.green_pct + dist.yellow_pct;
  if (nonRedPct >= STABLE_NON_RED_PCT_THRESHOLD) return 'stable';
  return 'stable';
}

function computeConfidence(daysAvailable: number, windowDays: 7|14, status: LongitudinalStatus): ConfidenceLevel {
  if (status === 'insufficient_data') return 'low';
  const hi  = windowDays === 7 ? CONFIDENCE_HIGH_DAYS_7D   : CONFIDENCE_HIGH_DAYS_14D;
  const med = windowDays === 7 ? CONFIDENCE_MEDIUM_DAYS_7D : CONFIDENCE_MEDIUM_DAYS_14D;
  if (daysAvailable >= hi)  return 'high';
  if (daysAvailable >= med) return 'medium';
  return 'low';
}

function buildWindowResult(
  windowDays: 7|14, states: DailyStateRow[], wearableLogs: WearableLogRow[],
  adherence: ProtocolAdherenceRow[], minDays: number
): WindowResult {
  const status     = classifyWindow(states, minDays);
  const dist       = computeStateDistribution(states);
  const averages   = computeWindowAverages(wearableLogs, adherence);
  const confidence = computeConfidence(states.length, windowDays, status);
  const driverCodes = collectDriverCodes(dist, averages, states, wearableLogs, status);
  return { window_days: windowDays, status, confidence, driver_codes: driverCodes, metrics: { days_available: states.length, state_distribution: dist, ...averages } };
}

export function classifyTrajectory(status7d: LongitudinalStatus, status14d: LongitudinalStatus): TrajectoryDirection {
  return TRAJECTORY_MAP[`${status14d}|${status7d}`] ?? 'neutral';
}

export function buildLongitudinalSummary(input: DriftSummaryInput): DriftSummaryResult {
  const { userId, computedAt, dailyStates, wearableLogs, protocolAdherence } = input;
  const sorted   = sortByDayKey(dailyStates);
  const states7d  = sorted.slice(-7);
  const states14d = sorted.slice(-14);
  const sortedW   = sortByDayKey(wearableLogs);
  const wear7d    = sortedW.slice(-7);
  const wear14d   = sortedW.slice(-14);
  const sortedA   = sortByDayKey(protocolAdherence);
  const adh7d     = sortedA.slice(-7);
  const adh14d    = sortedA.slice(-14);
  const window7d  = buildWindowResult(7,  states7d,  wear7d,  adh7d,  MIN_DAYS_7D);
  const window14d = buildWindowResult(14, states14d, wear14d, adh14d, MIN_DAYS_14D);
  const trajectory  = classifyTrajectory(window7d.status, window14d.status);
  const summaryCode = window7d.status;
  const flags: DriverCode[] = [...new Set([...window7d.driver_codes, ...window14d.driver_codes])];
  return { userId, computedAt, window_7d: window7d, window_14d: window14d, trajectory, summary_code: summaryCode, flags, version: DRIFT_ENGINE_VERSION };
}

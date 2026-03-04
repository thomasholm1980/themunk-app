// packages/core/state/pipeline.ts
// Deterministic state pipeline — no LLM, no medical logic

export type GYRState = "GREEN" | "YELLOW" | "RED";

export interface LogRow {
  day_key: string;
  energy: number;
  mood: number;
  stress: number;
}

// Thresholds — single source of truth
const THRESHOLDS = {
  GREEN_ENERGY_MIN: 3.8,
  GREEN_STRESS_MAX: 2.5,
  RED_ENERGY_MAX: 2.5,
  RED_STRESS_MIN: 4.0,
  CONFIDENCE_HIGH: 5,   // days needed for confidence 1.0
  CONFIDENCE_MED: 3,    // days needed for confidence 0.6
} as const;

export interface StateTrace {
  inputs: {
    days_of_data: number;
    avg_energy_7d: number;
    avg_stress_7d: number;
    avg_mood_7d: number;
  };
  rules: {
    thresholds: typeof THRESHOLDS;
    triggered_rule: string;
    reasons: string[];
  };
  decision: {
    state: GYRState;
    confidence: number;
  };
}

export interface StateResult {
  state: GYRState;
  confidence: number;
  reasons: string[];
  avg_energy_7d: number;
  avg_stress_7d: number;
  avg_mood_7d: number;
  days_with_data: number;
  trace: StateTrace;
}

export function computeState(logs: LogRow[]): StateResult {
  const days = logs.length;

  if (days === 0) {
    const trace: StateTrace = {
      inputs: { days_of_data: 0, avg_energy_7d: 0, avg_stress_7d: 0, avg_mood_7d: 0 },
      rules: { thresholds: THRESHOLDS, triggered_rule: "NO_DATA_DEFAULT", reasons: ["No data available"] },
      decision: { state: "YELLOW", confidence: 0.0 },
    };
    return {
      state: "YELLOW",
      confidence: 0.0,
      reasons: ["No data available"],
      avg_energy_7d: 0,
      avg_stress_7d: 0,
      avg_mood_7d: 0,
      days_with_data: 0,
      trace,
    };
  }

  const avg_energy_7d = Math.round((logs.reduce((s, l) => s + l.energy, 0) / days) * 100) / 100;
  const avg_stress_7d = Math.round((logs.reduce((s, l) => s + l.stress, 0) / days) * 100) / 100;
  const avg_mood_7d   = Math.round((logs.reduce((s, l) => s + l.mood, 0) / days) * 100) / 100;

  let confidence: number;
  if (days >= THRESHOLDS.CONFIDENCE_HIGH) confidence = 1.0;
  else if (days >= THRESHOLDS.CONFIDENCE_MED) confidence = 0.6;
  else confidence = 0.3;

  const reasons: string[] = [];
  let state: GYRState;
  let triggered_rule: string;

  if (avg_energy_7d >= THRESHOLDS.GREEN_ENERGY_MIN && avg_stress_7d <= THRESHOLDS.GREEN_STRESS_MAX) {
    state = "GREEN";
    triggered_rule = "GREEN_RULE";
    reasons.push("Energy sustained above baseline");
    reasons.push("Stress well within range");
  } else if (avg_energy_7d <= THRESHOLDS.RED_ENERGY_MAX || avg_stress_7d >= THRESHOLDS.RED_STRESS_MIN) {
    state = "RED";
    triggered_rule = "RED_RULE";
    if (avg_energy_7d <= THRESHOLDS.RED_ENERGY_MAX) reasons.push("Energy critically low");
    if (avg_stress_7d >= THRESHOLDS.RED_STRESS_MIN) reasons.push("Stress critically elevated");
  } else {
    state = "YELLOW";
    triggered_rule = "YELLOW_DEFAULT";
    if (avg_energy_7d < THRESHOLDS.GREEN_ENERGY_MIN) reasons.push("Energy moderate");
    if (avg_stress_7d > THRESHOLDS.GREEN_STRESS_MAX) reasons.push("Stress trend elevated");
  }

  const trace: StateTrace = {
    inputs: { days_of_data: days, avg_energy_7d, avg_stress_7d, avg_mood_7d },
    rules: { thresholds: THRESHOLDS, triggered_rule, reasons: [...reasons] },
    decision: { state, confidence },
  };

  return {
    state,
    confidence,
    reasons,
    avg_energy_7d,
    avg_stress_7d,
    avg_mood_7d,
    days_with_data: days,
    trace,
  };
}

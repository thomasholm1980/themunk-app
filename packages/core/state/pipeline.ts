// Deterministic state pipeline — no LLM, no medical logic

export type GYRState = "GREEN" | "YELLOW" | "RED";

export interface LogRow {
  day_key: string;
  energy: number;
  mood: number;
  stress: number;
}

export interface StateResult {
  state: GYRState;
  confidence: number;
  reasons: string[];
  avg_energy_7d: number;
  avg_stress_7d: number;
  days_with_data: number;
}

export function computeState(logs: LogRow[]): StateResult {
  const days = logs.length;

  if (days === 0) {
    return {
      state: "YELLOW",
      confidence: 0.0,
      reasons: ["No data available"],
      avg_energy_7d: 0,
      avg_stress_7d: 0,
      days_with_data: 0,
    };
  }

  const avg_energy_7d = logs.reduce((sum, l) => sum + l.energy, 0) / days;
  const avg_stress_7d = logs.reduce((sum, l) => sum + l.stress, 0) / days;

  let confidence: number;
  if (days >= 5) confidence = 1.0;
  else if (days >= 3) confidence = 0.6;
  else confidence = 0.3;

  const reasons: string[] = [];
  let state: GYRState;

  if (avg_energy_7d >= 3.8 && avg_stress_7d <= 2.5) {
    state = "GREEN";
    reasons.push("Energy sustained above baseline");
    reasons.push("Stress well within range");
  } else if (avg_energy_7d <= 2.5 || avg_stress_7d >= 4.0) {
    state = "RED";
    if (avg_energy_7d <= 2.5) reasons.push("Energy critically low");
    if (avg_stress_7d >= 4.0) reasons.push("Stress critically elevated");
  } else {
    state = "YELLOW";
    if (avg_energy_7d < 3.8) reasons.push("Energy moderate");
    if (avg_stress_7d > 2.5) reasons.push("Stress trend elevated");
  }

  return {
    state,
    confidence,
    reasons,
    avg_energy_7d: Math.round(avg_energy_7d * 100) / 100,
    avg_stress_7d: Math.round(avg_stress_7d * 100) / 100,
    days_with_data: days,
  };
}

export type ManualLogInput = {
  day_key: string;
  energy: number; // 1-5
  mood: number;   // 1-5
  stress: number; // 1-5
};

export type StateColor = "GREEN" | "YELLOW" | "RED";

export type ComputeStateResult = {
  state: StateColor;
  confidence: number; // 0..1
  reasons: string[];
  trace: Record<string, unknown>;
};

const THRESHOLDS = {
  // These are intentionally simple v1 cutoffs.
  // You can tune later, but keep deterministic.
  red: {
    energyMax: 2,
    stressMin: 4,
  },
  yellow: {
    energyMax: 3,
    stressMin: 3,
  },
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Deterministic state computation (v1).
 * Input is a list to support future trend windows, but v1 uses latest only.
 */
export function computeState(inputs: ManualLogInput[]): ComputeStateResult {
  const safeInputs = Array.isArray(inputs) ? inputs : [];
  if (safeInputs.length === 0) {
    return {
      state: "YELLOW",
      confidence: 0.2,
      reasons: ["No inputs provided"],
      trace: {
        inputs_count: 0,
        decision: "YELLOW",
        gating: { reason: "no_inputs" },
      },
    };
  }

  // Use latest (first) as "today" signal. Caller already passes latest.
  const latest = safeInputs[0];

  const energy = clamp(Number(latest.energy), 1, 5);
  const mood = clamp(Number(latest.mood), 1, 5);
  const stress = clamp(Number(latest.stress), 1, 5);

  const avg_stress_7d = avg(safeInputs.slice(0, 7).map((x) => clamp(Number(x.stress), 1, 5)));
  const days_of_data = Math.min(safeInputs.length, 7);

  const reasons: string[] = [];
  let state: StateColor = "GREEN";

  // RED rules
  if (energy <= THRESHOLDS.red.energyMax) reasons.push("Energy critically low");
  if (stress >= THRESHOLDS.red.stressMin) reasons.push("Stress critically elevated");

  if (energy <= THRESHOLDS.red.energyMax && stress >= THRESHOLDS.red.stressMin) {
    state = "RED";
  } else {
    // YELLOW rules
    const yReasons: string[] = [];
    if (energy <= THRESHOLDS.yellow.energyMax) yReasons.push("Energy trending low");
    if (stress >= THRESHOLDS.yellow.stressMin) yReasons.push("Stress trending high");

    if (yReasons.length > 0) {
      state = "YELLOW";
      reasons.push(...yReasons);
    } else {
      state = "GREEN";
      // add a light reason to help UI; optional
      reasons.push("Baseline stable");
    }
  }

  // Confidence heuristic (deterministic)
  // More days of data -> slightly higher confidence
  const confidence = clamp(0.55 + (days_of_data - 1) * 0.05, 0.55, 0.85);

  const trace = {
    inputs: {
      day_key: latest.day_key,
      energy,
      mood,
      stress,
      days_of_data,
      avg_stress_7d: Number(avg_stress_7d.toFixed(2)),
    },
    rules: {
      thresholds: THRESHOLDS,
      evaluated: {
        red: {
          energy_leq: energy <= THRESHOLDS.red.energyMax,
          stress_geq: stress >= THRESHOLDS.red.stressMin,
        },
        yellow: {
          energy_leq: energy <= THRESHOLDS.yellow.energyMax,
          stress_geq: stress >= THRESHOLDS.yellow.stressMin,
        },
      },
    },
    decision: {
      state,
      confidence,
      reasons,
    },
    gating: {
      type: "none",
      note: "computation is deterministic; persistence gating handled in API route",
    },
  };

  return { state, confidence, reasons, trace };
}

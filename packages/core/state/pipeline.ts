// packages/core/state/pipeline.ts

export type ManualLogInput = {
  day_key: string;
  energy: number;
  mood: number;
  stress: number;
};

export type StateColor = "GREEN" | "YELLOW" | "RED";

export type ComputeStateResult = {
  state: StateColor;
  confidence: number;
  reasons: string[];
  trace: Record<string, unknown>;
};

const THRESHOLDS = {
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

export function computeState(
  inputs: ManualLogInput[]
): ComputeStateResult {
  if (!inputs || inputs.length === 0) {
    return {
      state: "YELLOW",
      confidence: 0.2,
      reasons: ["No inputs provided"],
      trace: {
        inputs_count: 0,
        decision: "YELLOW",
      },
    };
  }

  const latest = inputs[0];

  const energy = clamp(Number(latest.energy), 1, 5);
  const mood = clamp(Number(latest.mood), 1, 5);
  const stress = clamp(Number(latest.stress), 1, 5);

  const avg_stress_7d = avg(
    inputs.slice(0, 7).map((x) => clamp(Number(x.stress), 1, 5))
  );

  const days_of_data = Math.min(inputs.length, 7);

  let state: StateColor = "GREEN";
  const reasons: string[] = [];

  // RED logic
  if (
    energy <= THRESHOLDS.red.energyMax &&
    stress >= THRESHOLDS.red.stressMin
  ) {
    state = "RED";
    reasons.push("Energy critically low");
    reasons.push("Stress critically elevated");
  } else {
    // YELLOW logic
    if (
      energy <= THRESHOLDS.yellow.energyMax ||
      stress >= THRESHOLDS.yellow.stressMin
    ) {
      state = "YELLOW";
      if (energy <= THRESHOLDS.yellow.energyMax) {
        reasons.push("Energy trending low");
      }
      if (stress >= THRESHOLDS.yellow.stressMin) {
        reasons.push("Stress trending high");
      }
    } else {
      state = "GREEN";
      reasons.push("Baseline stable");
    }
  }

  const confidence = Math.min(
    0.55 + (days_of_data - 1) * 0.05,
    0.85
  );

  const trace = {
    inputs: {
      day_key: latest.day_key,
      energy,
      mood,
      stress,
      avg_stress_7d: Number(avg_stress_7d.toFixed(2)),
      days_of_data,
    },
    thresholds: THRESHOLDS,
    decision: {
      state,
      confidence,
      reasons,
    },
  };

  return {
    state,
    confidence,
    reasons,
    trace,
  };
}

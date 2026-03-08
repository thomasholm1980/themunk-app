// packages/core/state/trajectory.ts
// Trajectory Layer v1 — deterministic, read-only, no influence on state engine

export type TrajectoryLabel =
  | "STABLE"
  | "RISING_STRAIN"
  | "RECOVERING"
  | "VOLATILE"
  | "INSUFFICIENT_DATA";

export interface TrajectoryResult {
  label: TrajectoryLabel;
  days_observed: number;
  state_path: string[];
}

const STATE_SCORE: Record<string, number> = {
  GREEN:  0,
  YELLOW: 1,
  RED:    2,
};

function countDirectionChanges(scores: number[]): number {
  let changes = 0;
  for (let i = 2; i < scores.length; i++) {
    const prev = scores[i - 1] - scores[i - 2];
    const curr = scores[i] - scores[i - 1];
    if (prev !== 0 && curr !== 0 && Math.sign(prev) !== Math.sign(curr)) {
      changes++;
    }
  }
  return changes;
}

export function computeTrajectory(
  records: { day_key: string; state: string }[]
): TrajectoryResult {
  // Sort ascending by day_key
  const sorted = [...records].sort((a, b) =>
    a.day_key.localeCompare(b.day_key)
  );

  const state_path = sorted.map(r => r.state);
  const days_observed = sorted.length;

  if (days_observed < 4) {
    return { label: "INSUFFICIENT_DATA", days_observed, state_path };
  }

  const scores = sorted.map(r => STATE_SCORE[r.state] ?? 1);

  // VOLATILE: 2+ direction changes in the sequence
  const changes = countDirectionChanges(scores);
  if (changes >= 2) {
    return { label: "VOLATILE", days_observed, state_path };
  }

  // Compare first half avg vs second half avg for trend direction
  const mid = Math.floor(scores.length / 2);
  const firstHalf  = scores.slice(0, mid);
  const secondHalf = scores.slice(mid);

  const avgFirst  = firstHalf.reduce((a, b) => a + b, 0)  / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  if (avgSecond > avgFirst + 0.3) {
    return { label: "RISING_STRAIN", days_observed, state_path };
  }

  if (avgSecond < avgFirst - 0.3) {
    return { label: "RECOVERING", days_observed, state_path };
  }

  return { label: "STABLE", days_observed, state_path };
}

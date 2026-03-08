// packages/core/state/reflection.ts
// Reflection Layer v1 — types and validation

export type ReflectionScore = 1 | 2 | 3;

export interface ReflectionPayload {
  score: ReflectionScore;
  day_key: string;
}

export interface ReflectionRecord {
  id: string;
  user_id: string;
  day_key: string;
  score: ReflectionScore;
  created_at: string;
}

export function validateReflectionPayload(body: unknown): {
  valid: boolean;
  error?: string;
  payload?: ReflectionPayload;
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid body" };
  }

  const b = body as Record<string, unknown>;

  if (!b.day_key || typeof b.day_key !== "string") {
    return { valid: false, error: "Missing or invalid day_key" };
  }

  const score = Number(b.score);
  if (!Number.isInteger(score) || score < 1 || score > 3) {
    return { valid: false, error: "score must be 1, 2, or 3" };
  }

  return {
    valid: true,
    payload: { score: score as ReflectionScore, day_key: b.day_key },
  };
}

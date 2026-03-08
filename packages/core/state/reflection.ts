// packages/core/state/reflection.ts
// Reflection Layer v1.1 — three-dimensional validation

export interface ReflectionPayload {
  energy: number;
  stress: number;
  focus: number;
  day_key: string;
}

export interface ReflectionRecord {
  id: string;
  user_id: string;
  day_key: string;
  energy: number;
  stress: number;
  focus: number;
  created_at: string;
}

function validateDimension(value: unknown, name: string): string | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 3) {
    return `${name} must be 1, 2, or 3`;
  }
  return null;
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

  for (const dim of ["energy", "stress", "focus"]) {
    const err = validateDimension(b[dim], dim);
    if (err) return { valid: false, error: err };
  }

  return {
    valid: true,
    payload: {
      energy: Number(b.energy),
      stress: Number(b.stress),
      focus: Number(b.focus),
      day_key: b.day_key,
    },
  };
}

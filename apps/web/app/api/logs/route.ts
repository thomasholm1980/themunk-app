// apps/web/app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, isAuthError } from "@/lib/auth";
import { ManualLog } from "@themunk/core";

export async function POST(req: NextRequest) {
  const auth = getAuthContext(req);
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate
  const parsed = parseManualLog(body, auth.userId);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 422 });
  }

  // TODO Phase 2: persist to Supabase
  // const { error } = await supabase.from("manual_logs").insert(parsed);

  return NextResponse.json(
    { ok: true, data: parsed, message: "Log received (stub — not persisted yet)" },
    { status: 201 }
  );
}

function parseManualLog(
  body: unknown,
  userId: string,
): ManualLog | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Body must be an object" };
  const b = body as Record<string, unknown>;

  const day_key = b["day_key"];
  if (typeof day_key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day_key)) {
    return { error: "day_key must be YYYY-MM-DD" };
  }

  for (const field of ["energy_1_5", "mood_1_5", "stress_1_5"]) {
    const v = b[field];
    if (typeof v !== "number" || v < 1 || v > 5) {
      return { error: `${field} must be a number 1–5` };
    }
  }

  return {
    user_id: userId,
    day_key,
    energy_1_5: b["energy_1_5"] as number,
    mood_1_5:   b["mood_1_5"]   as number,
    stress_1_5: b["stress_1_5"] as number,
    notes:      typeof b["notes"] === "string" ? b["notes"] : null,
    created_at: new Date().toISOString(),
  };
}

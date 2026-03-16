import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, isAuthError } from "../../../lib/auth";
import { BriefFeedback, GYRState } from "../../../../../packages/core";

const VALID_STATES: GYRState[] = ["GREEN", "YELLOW", "RED"];

export async function POST(req: NextRequest) {
  const auth = getAuthContext(req);
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseFeedback(body, auth.userId);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 422 });
  }

  return NextResponse.json(
    { ok: true, data: parsed, message: "Feedback received (stub)" },
    { status: 201 }
  );
}

function parseFeedback(body: unknown, userId: string): BriefFeedback | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Body must be an object" };
  const b = body as Record<string, unknown>;
  const day_key = b["day_key"];
  if (typeof day_key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day_key))
    return { error: "day_key must be YYYY-MM-DD" };
  if (typeof b["agreed"] !== "boolean") return { error: "agreed must be boolean" };
  const felt_state = b["felt_state"] ?? null;
  if (felt_state !== null && !VALID_STATES.includes(felt_state as GYRState))
    return { error: "felt_state must be GREEN, YELLOW, RED, or null" };
  return {
    user_id: userId, day_key,
    agreed: b["agreed"] as boolean,
    felt_state: felt_state as GYRState | null,
    comment: typeof b["comment"] === "string" ? b["comment"] : null,
    created_at: new Date().toISOString(),
  };
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

function getUserId(req: NextRequest): string {
  return req.headers.get("x-user-id") ?? "anonymous";
}

interface LogInput {
  day_key: string;
  energy: number;
  mood: number;
  stress: number;
  notes?: string;
}

function validate(body: unknown): LogInput | { error: string } {
  if (typeof body !== "object" || body === null)
    return { error: "Body must be an object" };
  const b = body as Record<string, unknown>;
  if (typeof b.day_key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.day_key))
    return { error: "day_key must be YYYY-MM-DD" };
  for (const field of ["energy", "mood", "stress"]) {
    const v = b[field];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 5)
      return { error: `${field} must be an integer 1-5` };
  }
  return {
    day_key: b.day_key as string,
    energy: b.energy as number,
    mood: b.mood as number,
    stress: b.stress as number,
    notes: typeof b.notes === "string" ? b.notes : undefined,
  };
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const input = validate(body);
  if ("error" in input)
    return NextResponse.json({ error: input.error }, { status: 422 });

  const { error } = await supabase.from("manual_logs").insert({
    user_id: getUserId(req),
    day_key: input.day_key,
    energy: input.energy,
    mood: input.mood,
    stress: input.stress,
    notes: input.notes ?? null,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

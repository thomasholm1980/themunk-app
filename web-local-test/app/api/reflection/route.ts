// apps/web/app/api/reflection/route.ts
// Reflection Layer v1.1 + Memory Layer v1
// After saving reflection → fetch today's state → write daily_memory

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateReflectionPayload } from "@themunk/core/state/reflection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const USER_ID = "00000000-0000-0000-0000-000000000001";
const USER_ID_TEXT = "thomas";

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await req.json();
    const validation = validateReflectionPayload(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { payload } = validation;

    // 1. Save reflection
    const { data: reflection, error: reflectionError } = await supabase
      .from("reflection_logs")
      .upsert(
        {
          user_id: USER_ID,
          day_key: payload!.day_key,
          energy:  payload!.energy,
          stress:  payload!.stress,
          focus:   payload!.focus,
        },
        { onConflict: "user_id,day_key" }
      )
      .select()
      .single();

    if (reflectionError) {
      console.error("[reflection/POST] Supabase error:", reflectionError.message);
      return NextResponse.json(
        { error: "Failed to save reflection" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    // 2. Fetch today's state — write-only, does not affect state engine
    try {
      const stateRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.themunk.ai"}/api/state/today`,
        { headers: { "x-user-id": USER_ID_TEXT, "Cache-Control": "no-store" } }
      );

      if (stateRes.ok) {
        const stateJson = await stateRes.json();
        const state = stateJson?.state;

        if (state && ["GREEN", "YELLOW", "RED"].includes(state)) {
          const { error: memoryError } = await supabase
            .from("daily_memory")
            .upsert(
              {
                user_id: USER_ID_TEXT,
                day_key: payload!.day_key,
                state,
                energy:  payload!.energy,
                stress:  payload!.stress,
                focus:   payload!.focus,
              },
              { onConflict: "user_id,day_key" }
            );

          if (memoryError) {
            // Non-fatal — memory write failure does not block reflection response
            console.error("[reflection/POST] Memory write error:", memoryError.message);
          } else {
            console.log("[reflection/POST] Memory written:", { day_key: payload!.day_key, state });
          }
        }
      }
    } catch (memErr) {
      // Non-fatal — log and continue
      console.error("[reflection/POST] Memory fetch error:", memErr);
    }

    return NextResponse.json(
      { ok: true, reflection },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[reflection/POST] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

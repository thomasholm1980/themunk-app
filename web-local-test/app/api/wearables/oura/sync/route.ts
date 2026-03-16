// apps/web/app/api/wearables/oura/sync/route.ts
// Layer 7 — Wearable sync endpoint
// v2.0.0

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SimulatorAdapter } from '@themunk/core';
import { OuraAdapter } from '@themunk/core';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WEARABLES_ENABLED = process.env.WEARABLES_ENABLED === 'true';
const USER_ID = 'thomas';

function todayOslo(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
  }).format(new Date());
}

export async function POST() {
  if (!WEARABLES_ENABLED) {
    return NextResponse.json(
      { status: 'disabled', message: 'Wearables feature flag is off' },
      { status: 200 }
    );
  }

  const start = Date.now();
  const dayKey = todayOslo();

  const adapter = new OuraAdapter({
    getAccessToken: async (userId: string) => {
      const { data } = await supabase
        .from('oura_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .single();
      return data?.access_token ?? null;
    },
  });

  try {
    const data = await adapter.fetchDay(USER_ID, dayKey);

    if (!data) {
      return NextResponse.json({ status: 'no_data', day_key: dayKey }, { status: 200 });
    }

    const { error } = await supabase
      .from('wearable_logs')
      .upsert(
        {
          user_id: data.user_id,
          day_key: data.day_key,
          hrv_rmssd: data.hrv_rmssd,
          resting_hr: data.resting_hr,
          sleep_score: data.sleep_score,
          readiness_score: data.readiness_score,
          activity_score: data.activity_score,
          sleep_duration_hours: data.sleep_duration_hours,
          raw_snapshot: data.raw_snapshot,
          source: data.source,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,day_key,source' }
      );

    const latency = Date.now() - start;

    await supabase.from('wearable_sync_events').insert({
      user_id: USER_ID,
      day_key: dayKey,
      source: adapter.source,
      success: !error,
      records_upserted: error ? 0 : 1,
      latency_ms: latency,
      error_code: error?.code ?? null,
    });

    if (error) {
      return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 'ok',
      day_key: dayKey,
      source: adapter.source,
      latency_ms: latency,
    });

  } catch (err: unknown) {
    const latency = Date.now() - start;
    const message = err instanceof Error ? err.message : 'unknown';

    await supabase.from('wearable_sync_events').insert({
      user_id: USER_ID,
      day_key: dayKey,
      source: adapter.source,
      success: false,
      records_upserted: 0,
      latency_ms: latency,
      error_code: 'EXCEPTION',
    });

    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}

// apps/web/app/api/reflection/route.ts
// Reflection Signal v1 — POST endpoint
// Stores one signal per user per day. Latest overwrites.
// v1.0.0

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { resolveUserId, getOsloDateKey } from '../../../lib/request-utils';
import { isValidAccuracy, isValidDayKey } from '@themunk/core';
import { buildReflectionSignal, buildReflectionSnapshotRecord } from '@themunk/core';

export async function POST(request: NextRequest) {
  const userId = resolveUserId(request);

  let body: { day_key?: unknown; accuracy?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { day_key, accuracy } = body;

  if (!isValidDayKey(day_key)) {
    return NextResponse.json({ error: 'Invalid day_key' }, { status: 400 });
  }

  if (!isValidAccuracy(accuracy)) {
    return NextResponse.json({ error: 'Invalid accuracy value' }, { status: 400 });
  }

  const signal = buildReflectionSignal({ day_key, accuracy });

  const { error } = await supabase
    .from('reflection_signals')
    .upsert({
      user_id:    userId,
      day_key:    signal.day_key,
      version:    signal.version,
      accuracy:   signal.accuracy,
      created_at: signal.created_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,day_key' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Memory Engine v1 — non-blocking reflection snapshot
  try {
    await supabase.from('memory_snapshots').upsert(
      buildReflectionSnapshotRecord({
        user_id: userId,
        day_key: signal.day_key,
        reflection_accuracy: signal.accuracy,
      }),
      { onConflict: 'user_id,day_key' }
    );
  } catch {
    // non-blocking
  }

  return NextResponse.json(
    { status: 'ok', stored: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

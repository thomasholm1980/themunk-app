// apps/web/app/api/adherence/log/route.ts
// AdherenceTracker v1 — POST endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { computeAdherence } from '@themunk/core';

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') ?? 'thomas';

  let body: {
    day_key: string
    deep_work_completed_minutes: number
    training_completed: boolean
    recovery_completed: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { day_key, deep_work_completed_minutes, training_completed, recovery_completed } = body

  if (!day_key) {
    return NextResponse.json({ error: 'day_key required' }, { status: 400 })
  }

  // Fetch protocol target for this day
  const { data: protocol } = await supabase
    .from('daily_protocol')
    .select('deep_work_minutes')
    .eq('user_id', userId)
    .eq('day_key', day_key)
    .single()

  const protocol_deep_work_minutes = protocol?.deep_work_minutes ?? 0

  const result = computeAdherence({
    deep_work_completed_minutes: deep_work_completed_minutes ?? 0,
    training_completed: training_completed ?? false,
    recovery_completed: recovery_completed ?? false,
    protocol_deep_work_minutes,
  })

  const { error } = await supabase
    .from('protocol_adherence')
    .upsert({
      user_id: userId,
      day_key,
      deep_work_completed_minutes: deep_work_completed_minutes ?? 0,
      training_completed: result.training_completed,
      recovery_completed: result.recovery_completed,
      adherence_score: result.adherence_score,
      protocol_deep_work_minutes: result.protocol_deep_work_minutes,
      logged_at: new Date().toISOString(),
    }, { onConflict: 'user_id,day_key' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { status: 'ok', ...result },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { computeState } from '@packages/core/state/pipeline';
import { computeIntervention } from '@packages/core/state/intervention';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const OSLO_TZ = 'Europe/Oslo';

function getOsloDateKey(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: OSLO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') ?? 'demo-user';
  const dayKey = getOsloDateKey();

  const { data: logs } = await supabase
    .from('manual_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .order('created_at', { ascending: false })
    .limit(1);

  const latest = logs?.[0];

  if (!latest) {
    return NextResponse.json(
      { state: null, message: 'No log for today' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // Always compute — never gate on persistence
  const { state, confidence, reasons, trace } = computeState({
    energy: latest.energy,
    mood: latest.mood,
    stress: latest.stress,
  });

  const intervention = computeIntervention(state);

  // Persistence gating — DB only, never affects return value
  const { data: existing } = await supabase
    .from('daily_state')
    .select('created_at')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .single();

  const shouldWrite = !existing ||
    (Date.now() - new Date(existing.created_at).getTime()) > 6 * 60 * 60 * 1000;

  if (shouldWrite) {
    await supabase.from('daily_state').upsert({
      user_id: userId,
      day_key: dayKey,
      state,
      confidence,
      reasons,
      state_trace: trace,
    });

    await supabase.from('daily_intervention').upsert({
      user_id: userId,
      day_key: dayKey,
      intervention,
    });
  }

  // Always return — intervention is a pure function of state
  return NextResponse.json(
    { state, confidence, reasons, intervention },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

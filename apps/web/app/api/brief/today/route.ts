import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import {
  computeState,
  computePolicy,
  assembleBrief,
  gatekeep,
  buildFallbackBrief,
} from '@themunk/core';

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
  const flags: string[] = latest ? [] : ['data_missing'];

  const stateResult = latest
    ? computeState([{
        day_key: dayKey,
        energy: latest.energy,
        mood: latest.mood,
        stress: latest.stress,
      }])
    : computeState([]);

  const policy = computePolicy({
    readiness_band: stateResult.state,
    flags,
  });

  let brief = assembleBrief(
    stateResult.state,
    policy,
    userId,
    dayKey,
    flags,
  );

  const decision = gatekeep(brief, policy);

  if (!decision.allow) {
    brief = buildFallbackBrief(
      policy,
      userId,
      dayKey,
      decision.blocked_reasons,
    );
  }

  return NextResponse.json(
    { brief, decision },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

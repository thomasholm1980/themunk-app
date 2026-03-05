import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import {
  computeState,
  computePolicy,
  assembleBrief,
  gatekeep,
  buildFallbackBrief,
  fillWhatItMightMean,
  FallbackAdapter,
} from '@themunk/core';
import { AnthropicAdapter } from '../../../../lib/anthropic_adapter';
import { logBriefRunEvent } from '../../../../lib/telemetry';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const OSLO_TZ = 'Europe/Oslo';
const BUILD_VERSION = process.env.VERCEL_GIT_COMMIT_SHA ?? 'local';

function getOsloDateKey(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: OSLO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export async function GET(request: Request) {
  const startTime = Date.now();
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

  const llmEnabled = process.env.LLM_ENABLED === 'true';
  const adapter = llmEnabled ? new AnthropicAdapter() : new FallbackAdapter();
  const modelName = llmEnabled
    ? (process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001')
    : 'fallback';

  const slotResult = await fillWhatItMightMean(
    {
      readiness_band: stateResult.state,
      reasons: stateResult.reasons,
      uncertainty_required: policy.must_include.uncertainty_language,
    },
    adapter,
  );

  brief = {
    ...brief,
    what_it_might_mean: slotResult.what_it_might_mean,
  };

  const decision = gatekeep(brief, policy);

  if (!decision.allow) {
    brief = buildFallbackBrief(
      policy,
      userId,
      dayKey,
      decision.blocked_reasons,
    );
  }

  const latency_ms = Date.now() - startTime;

  // Fire-and-forget telemetry — never blocks response
  logBriefRunEvent({
    user_id: userId,
    day_key: dayKey,
    readiness_band: stateResult.state,
    template_id: brief.template_id,
    guidance_intensity: policy.guidance_intensity,
    slot_source: slotResult.source,
    model: modelName,
    latency_ms,
    gatekeeper_allow: decision.allow,
    blocked_reasons: decision.blocked_reasons,
    fallback_used: brief.fallback_used,
    build_version: BUILD_VERSION,
  });

  return NextResponse.json(
    { brief, decision, slot_source: slotResult.source, latency_ms },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

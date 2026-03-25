// apps/web/lib/telemetry.ts
// BriefRunEvent telemetry. Fire-and-forget. Never blocks response.

import { supabase } from './supabase';

export interface BriefRunEvent {
  user_id: string;
  day_key: string;
  readiness_band: string | null;
  template_id: string;
  guidance_intensity: string;
  slot_source: string;
  model: string;
  latency_ms: number;
  gatekeeper_allow: boolean;
  blocked_reasons: string[];
  fallback_used: boolean;
  build_version: string;
}

export async function logBriefRunEvent(event: BriefRunEvent): Promise<void> {
  try {
    await supabase.from('brief_run_events').insert({
      ...event,
      blocked_reasons: event.blocked_reasons,
    });
  } catch {
    console.error('telemetry_write_failed', event.template_id);
  }
}

// Morning Loop observability — fire-and-forget, never throws
export type MorningEvent =
  | 'wake_monk_tapped'
  | 'wake_monk_state_found'
  | 'wake_monk_sync_started'
  | 'wake_monk_sync_succeeded'
  | 'wake_monk_sync_no_data'
  | 'wake_monk_retry_tapped'
  | 'brief_rendered';

export function logMorningEvent(event: MorningEvent, meta?: Record<string, unknown>): void {
  try {
    const payload = {
      event,
      ts: new Date().toISOString(),
      ...meta,
    };
    console.log('[morning-loop]', payload);
    // Fire-and-forget to Supabase — no await, no block
    supabase.from('morning_events' as any).insert(payload as any).then(() => {}).catch(() => {});
  } catch {
    // Telemetry must never throw
  }
}

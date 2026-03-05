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
    // Telemetry must never break the response
    console.error('telemetry_write_failed', event.template_id);
  }
}

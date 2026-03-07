import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { composeBriefV2 } from '@the-munk/core/brief';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const today = new Date();
    const dayKey = today.toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });

    // 1. Fetch daily_state
    const { data: stateRow, error: stateErr } = await supabase
      .from('daily_state')
      .select('*')
      .eq('user_id', 'default')
      .eq('day_key', dayKey)
      .single();

    if (stateErr || !stateRow) {
      return NextResponse.json(
        { error: 'No state found for today. Run /api/state/today first.' },
        { status: 404 }
      );
    }

    // 2. Fetch daily_protocol
    const { data: protocolRow } = await supabase
      .from('daily_protocol')
      .select('*')
      .eq('user_id', 'default')
      .eq('day_key', dayKey)
      .single();

    // 3. Fetch protocol_schedule (optional)
    const { data: scheduleRow } = await supabase
      .from('protocol_schedule')
      .select('*')
      .eq('user_id', 'default')
      .eq('day_key', dayKey)
      .single();

    // 4. Fetch explanation from daily_briefs (optional)
    const { data: briefRow } = await supabase
      .from('daily_briefs')
      .select('what_it_might_mean')
      .eq('user_id', 'default')
      .eq('day_key', dayKey)
      .single();

    // 5. Fetch drift (optional)
    const { data: driftRow } = await supabase
      .from('nervous_system_drift')
      .select('drift_detected, window_days')
      .eq('user_id', 'default')
      .eq('window_days', 7)
      .order('computed_at', { ascending: false })
      .limit(1)
      .single();

    // 6. Fetch adherence (optional)
    const { data: adherenceRow } = await supabase
      .from('protocol_adherence')
      .select('adherence_score')
      .eq('user_id', 'default')
      .eq('day_key', dayKey)
      .single();

    // 7. Compose
    const brief = composeBriefV2({
      day_key: dayKey,
      state: {
        state: stateRow.state,
        confidence: stateRow.confidence ?? 'LOW',
        rationale_code: stateRow.rationale_code ?? 'UNKNOWN',
        signal_flags: stateRow.signal_flags ?? [],
      },
      protocol: protocolRow ?? {
        cognitive_load: 'low',
        training_recommendation: 'rest',
        nervous_system_mode: 'recover',
        deep_work_minutes: 0,
        recovery_minutes: 30,
        protocol_version: '1.0.0',
      },
      schedule: scheduleRow ?? null,
      explanation: briefRow ? { what_it_might_mean: briefRow.what_it_might_mean } : null,
      adherence: adherenceRow ?? null,
      drift: driftRow
        ? {
            status: driftRow.drift_detected ? 'drift_detected' : 'stable',
            drift_detected: driftRow.drift_detected,
          }
        : { status: 'insufficient_data' },
    });

    return NextResponse.json(brief, {
      headers: { 'Cache-Control': 'no-store' },
    });

  } catch (err) {
    console.error('[brief/v2/today] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

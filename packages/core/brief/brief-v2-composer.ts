import { DailyBriefV2Input, DailyBriefV2 } from './brief-v2-types';
import { BRIEF_V2_TEMPLATES, FALLBACK_EXPLANATION } from './brief-v2-templates';

function formatWindow(start?: string, end?: string): string | null {
  if (!start || !end) return null;
  return `${start}-${end}`;
}

export function composeBriefV2(input: DailyBriefV2Input): DailyBriefV2 {
  const { state, protocol, schedule, explanation, adherence, drift } = input;

  const template = BRIEF_V2_TEMPLATES[state.state][state.confidence];

  const today_plan = {
    cognitive_load: protocol.cognitive_load,
    deep_work_minutes: protocol.deep_work_minutes,
    deep_work_window: schedule
      ? formatWindow(schedule.deep_work_window_start, schedule.deep_work_window_end)
      : null,
    training_recommendation: protocol.training_recommendation,
    training_window: schedule
      ? formatWindow(schedule.training_window_start, schedule.training_window_end)
      : null,
    recovery_minutes: protocol.recovery_minutes,
    recovery_window: schedule
      ? formatWindow(schedule.recovery_window_start, schedule.recovery_window_end)
      : null,
  };

  const drift_status = drift?.status ?? 'not_available';

  const adherence_status = adherence != null
    ? `score_${Math.round(adherence.adherence_score * 100)}`
    : 'not_available';

  return {
    day_key: input.day_key,
    brief_version: '2.0.0',
    state: state.state,
    headline: template.headline,
    summary: template.summary,
    today_plan,
    signals: {
      confidence: state.confidence,
      rationale_code: state.rationale_code,
      signal_flags: state.signal_flags,
    },
    guidance: {
      nervous_system_mode: protocol.nervous_system_mode,
      what_it_might_mean: explanation?.what_it_might_mean ?? FALLBACK_EXPLANATION,
    },
    system_context: {
      drift_status,
      adherence_status,
    },
    meta: {
      protocol_version: protocol.protocol_version,
      template_id: template.template_id,
    },
  };
}

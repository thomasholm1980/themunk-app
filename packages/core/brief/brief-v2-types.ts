export type MunkStateCode = 'GREEN' | 'YELLOW' | 'RED';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DailyBriefV2Input {
  day_key: string;
  state: {
    state: MunkStateCode;
    confidence: ConfidenceLevel;
    rationale_code: string;
    signal_flags: string[];
  };
  protocol: {
    cognitive_load: 'high' | 'medium' | 'low';
    training_recommendation: string;
    nervous_system_mode: string;
    deep_work_minutes: number;
    recovery_minutes: number;
    protocol_version: string;
  };
  schedule: {
    deep_work_window_start: string;
    deep_work_window_end: string;
    training_window_start?: string;
    training_window_end?: string;
    recovery_window_start?: string;
    recovery_window_end?: string;
  } | null;
  explanation: {
    what_it_might_mean: string;
  } | null;
  adherence: {
    adherence_score: number;
  } | null;
  drift: {
    status: string;
    drift_detected?: boolean;
  } | null;
}

export interface DailyBriefV2 {
  day_key: string;
  brief_version: '2.0.0';
  state: MunkStateCode;
  headline: string;
  summary: string;
  today_plan: {
    cognitive_load: string;
    deep_work_minutes: number;
    deep_work_window: string | null;
    training_recommendation: string;
    training_window: string | null;
    recovery_minutes: number;
    recovery_window: string | null;
  };
  signals: {
    confidence: ConfidenceLevel;
    rationale_code: string;
    signal_flags: string[];
  };
  guidance: {
    nervous_system_mode: string;
    what_it_might_mean: string;
  };
  system_context: {
    drift_status: string;
    adherence_status: string;
  };
  meta: {
    protocol_version: string;
    template_id: string;
  };
}

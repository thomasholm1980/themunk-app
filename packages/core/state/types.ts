export type MunkState = 'GREEN' | 'YELLOW' | 'RED'
export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH'

export type ManualInput = {
  energy: number | null
  mood: number | null
  stress: number | null
  notes?: string | null
  created_at: string
}

export type WearableInput = {
  hrv?: number | null
  resting_hr?: number | null
  sleep_score?: number | null
  readiness_score?: number | null
  activity_score?: number | null
  sleep_duration_minutes?: number | null
  source: 'oura'
  day_key: string
  synced_at: string
}

export type ComputeStateV2Result = {
  state: MunkState
  manual_score: number | null
  wearable_score: number | null
  final_score: number
  confidence: Confidence
  disagreement_flag: boolean
  inputs_used: {
    manual: boolean
    wearable: boolean
  }
  signal_flags: string[]
  rationale_code: string
}

export type WearableScoreResult = {
  wearable_score: number | null
  signal_flags: string[]
  wearable_signals_used: string[]
  wearable_signal_count: number
}

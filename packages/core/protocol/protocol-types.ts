export type CognitiveLoad = 'high' | 'moderate' | 'low'
export type TrainingRecommendation = 'strength' | 'cardio' | 'mobility' | 'walk' | 'recovery'
export type NervousSystemMode = 'activate' | 'balance' | 'downregulate'
export type MunkState = 'GREEN' | 'YELLOW' | 'RED'

export type DailyProtocol = {
  day_key: string
  state: MunkState
  cognitive_load: CognitiveLoad
  training_recommendation: TrainingRecommendation
  nervous_system_mode: NervousSystemMode
  deep_work_minutes: number
  recovery_minutes: number
  protocol_version: string
  generated_at: string
}

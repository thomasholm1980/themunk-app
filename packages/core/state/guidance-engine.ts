export type MunkState = 'GREEN' | 'YELLOW' | 'RED'
export type GuidanceIntensity = 'light' | 'moderate' | 'recovery'

export interface GuidancePayload {
  title: string
  body: string
  intensity: GuidanceIntensity
  direction: string
}

const GUIDANCE_RULES: Record<MunkState, GuidancePayload> = {
  GREEN: {
    title: 'Your system is ready',
    body: 'Body signals are balanced today. Maintain your rhythm, protect your recovery window, and trust your capacity.',
    intensity: 'light',
    direction: 'maintain',
  },
  YELLOW: {
    title: 'Reduce tempo slightly today',
    body: 'Your system is showing mixed signals. Avoid unnecessary stress load, support recovery where you can, and keep demands manageable.',
    intensity: 'moderate',
    direction: 'reduce',
  },
  RED: {
    title: 'Recovery first today',
    body: 'Your body signals indicate elevated stress. Lower your demands, prioritize rest, and let your system regulate before pushing forward.',
    intensity: 'recovery',
    direction: 'rest',
  },
}

export function guidanceEngineV1(state: MunkState): GuidancePayload {
  return GUIDANCE_RULES[state]
}

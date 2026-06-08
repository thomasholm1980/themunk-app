// Dissonance Engine v0.1
// Compares Oura biometric state against Hume prosody scores

export type HumeEmotions = Record<string, number>

export type DissonanceMode = 'SUPPORTIVE' | 'ACCEPTANCE' | 'AUTHORITY' | null

export interface DissonanceResult {
  mode: DissonanceMode
  trigger: string | null
  systemPrompt: string | null
  binauralHz: number | null
}

export interface OuraContext {
  hrv: number
  hrv_7day_avg: number
  rhr: number
  rhr_baseline: number
}

const SYSTEM_PROMPTS: Record<NonNullable<DissonanceMode>, string> = {
  SUPPORTIVE: "You are a modern Stoic monk. You are warm but direct. Your task is to confront the user with the gap between their words and their physiology. Use short sentences. Be like a good friend who sees through the facade.",
  ACCEPTANCE: "You are deep calm personified. Speak slowly. Use long pauses. Your task is not to fix, but to be present in the pain. Your philosophy: it is okay to not be okay.",
  AUTHORITY: "You are the disciplined voice the user needs when they have lost control. You are authoritative, brief, and give clear instructions. Your task is to protect the user from their own mania."
}

// Binaural frequencies per mode (Web Audio API)
const BINAURAL_HZ: Record<NonNullable<DissonanceMode>, number> = {
  SUPPORTIVE: 5.5,  // Theta — deep relaxation
  ACCEPTANCE: 10.0, // Alpha — mental balance
  AUTHORITY:  2.5,  // Delta — force rest
}

export function analyzeDissonance(
  oura: OuraContext,
  emotions: HumeEmotions
): DissonanceResult {

  // 1. Dissonance check — body stressed, voice calm/happy
  const hrvDrop = (oura.hrv_7day_avg - oura.hrv) / oura.hrv_7day_avg
  const voiceCalm = Math.max(
    emotions['Joy'] ?? 0,
    emotions['Excitement'] ?? 0,
    emotions['Calm'] ?? 0
  )
  if (hrvDrop >= 0.20 && voiceCalm > 0.7) {
    return {
      mode: 'SUPPORTIVE',
      trigger: `HRV dropped ${Math.round(hrvDrop * 100)}% below average while voice shows calm/joy`,
      systemPrompt: SYSTEM_PROMPTS.SUPPORTIVE,
      binauralHz: BINAURAL_HZ.SUPPORTIVE
    }
  }

  // 2. Collapse check — emotional distress in voice
  const voiceDistress = Math.max(
    emotions['Sadness'] ?? 0,
    emotions['Distress'] ?? 0,
    emotions['Disappointment'] ?? 0
  )
  if (voiceDistress > 0.6) {
    return {
      mode: 'ACCEPTANCE',
      trigger: `Voice shows distress/sadness above threshold (${Math.round(voiceDistress * 100)}%)`,
      systemPrompt: SYSTEM_PROMPTS.ACCEPTANCE,
      binauralHz: BINAURAL_HZ.ACCEPTANCE
    }
  }

  // 3. Mania check — elevated RHR + high confidence
  const rhrElevated = oura.rhr > oura.rhr_baseline * 1.10
  const voiceConfident = (emotions['Confidence'] ?? 0) > 0.8
  if (rhrElevated && voiceConfident) {
    return {
      mode: 'AUTHORITY',
      trigger: `Elevated RHR with high vocal confidence — possible mania pattern`,
      systemPrompt: SYSTEM_PROMPTS.AUTHORITY,
      binauralHz: BINAURAL_HZ.AUTHORITY
    }
  }

  return { mode: null, trigger: null, systemPrompt: null, binauralHz: null }
}

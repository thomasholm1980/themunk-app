export interface PromptInput {
  state: string
  confidence: string
  final_score: number
  hrv: number | null
  resting_hr: number | null
  sleep_score: number | null
  readiness_score: number | null
}

export function buildInterpreterPrompt(input: PromptInput): string {
  const stressLabel =
    input.state === 'GREEN' ? 'low' :
    input.state === 'YELLOW' ? 'moderate' : 'high'

  const lines = [
    'The user has the following stress state today:',
    'Stress level: ' + stressLabel,
    'Confidence: ' + input.confidence.toLowerCase(),
    'Score: ' + input.final_score,
  ]

  if (input.sleep_score !== null) lines.push('Sleep quality: ' + input.sleep_score + '/100')
  if (input.readiness_score !== null) lines.push('Body readiness: ' + input.readiness_score + '/100')

  lines.push('')
  lines.push('Return a JSON object with these keys:')
  lines.push('- explanation: 1-2 short sentences describing the stress state in simple human terms')
  lines.push('- guidance: 1 short sentence of calm daily guidance')
  lines.push('- insight: 1 optional sentence if there is a pattern worth noting, otherwise empty string')
  lines.push('')
  lines.push('Rules:')
  lines.push('- Use simple English')
  lines.push('- Use words like stress, your body, your system, signals, recovery')
  lines.push('- Never use: HRV, readiness score, strain, technical terms')
  lines.push('- Calm, human, observant tone')
  lines.push('- Return valid JSON only. No markdown.')

  return lines.join('\n')
}

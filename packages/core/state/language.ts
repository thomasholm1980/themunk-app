// Language Layer v1 — deterministic mapping only, no LLM
// Maps pattern_codes to calm contextual sentences
// language_version: language_v1

export type PatternLanguageResult = {
  sentences: string[]
  language_version: 'language_v1'
}

const PATTERN_SENTENCES: Record<string, string> = {
  PATTERN_ACCUMULATING_STRAIN: 'Strain appears to be building over several days.',
  PATTERN_RECOVERY_DEBT:       'Recovery has looked reduced across recent days.',
  PATTERN_SLEEP_INSTABILITY:   'Sleep rhythm appears less stable than usual.',
}

const PRIORITY_ORDER = [
  'PATTERN_RECOVERY_DEBT',
  'PATTERN_ACCUMULATING_STRAIN',
  'PATTERN_SLEEP_INSTABILITY',
]

export function computeLanguageLayer(pattern_codes: string[]): PatternLanguageResult {
  if (pattern_codes.length === 0) {
    return { sentences: [], language_version: 'language_v1' }
  }
  const winner = PRIORITY_ORDER.find(code => pattern_codes.includes(code))
  if (!winner || !PATTERN_SENTENCES[winner]) {
    return { sentences: [], language_version: 'language_v1' }
  }
  return {
    sentences: [PATTERN_SENTENCES[winner]],
    language_version: 'language_v1',
  }
}

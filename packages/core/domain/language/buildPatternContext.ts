import { patternLanguageMap } from "./patternLanguageMap"
import type { PatternContext, PatternContextInput } from "./types"

export function buildPatternContext(input: PatternContextInput): PatternContext {
  const sentences: string[] = []

  for (const code of input.pattern_codes) {
    const mapped = patternLanguageMap[code]
    if (mapped) sentences.push(mapped)
  }

  return {
    version: "language_v1",
    sentences: sentences.slice(0, 1)
  }
}

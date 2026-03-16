export interface PatternInput {
  state: "GREEN" | "YELLOW" | "RED"
  sleep_score: number | null
  recent_states: string[]
  context_tags?: string[]
}

export interface PatternResult {
  pattern_detected: boolean
  pattern_id: string | null
  insight: string
}

export function patternEngineV1(input: PatternInput): PatternResult {
  const none: PatternResult = { pattern_detected: false, pattern_id: null, insight: "" }

  // Pattern 1: low sleep + yellow state
  if (
    input.state === "YELLOW" &&
    input.sleep_score !== null &&
    input.sleep_score < 70
  ) {
    return {
      pattern_detected: true,
      pattern_id: "low_sleep_stress",
      insight: "Your stress often rises after shorter sleep.",
    }
  }

  // Pattern 2: 3+ stress days in last 5
  const stressDays = input.recent_states.filter(
    (s) => s === "YELLOW" || s === "RED"
  ).length
  if (stressDays >= 3) {
    return {
      pattern_detected: true,
      pattern_id: "sustained_stress",
      insight: "Your system has been under steady pressure for several days.",
    }
  }

  // Pattern 3: work stress context tag
  if (
    input.state === "YELLOW" &&
    input.context_tags?.some((t) => t.toLowerCase().includes("work"))
  ) {
    return {
      pattern_detected: true,
      pattern_id: "work_stress",
      insight: "Work pressure often shows up in your stress signals.",
    }
  }

  return none
}

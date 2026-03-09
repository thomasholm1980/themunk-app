// stability.ts — Phase 19: Interpretation Stability Layer
// Prevents large day-to-day state jumps.
// Pure function — no side effects, no I/O.
// Spec: Manju | Implementation: Aval

import type { DecisionState } from './decision'
import type { PatternCode } from './patterns-v2'

const STATE_RANK: Record<DecisionState, number> = {
  GREEN:  2,
  YELLOW: 1,
  RED:    0,
}

const RANK_TO_STATE: Record<number, DecisionState> = {
  2: 'GREEN',
  1: 'YELLOW',
  0: 'RED',
}

export interface StabilityInput {
  today_state:      DecisionState
  yesterday_state:  DecisionState | null
  dominant_pattern: PatternCode | null
}

export interface StabilityResult {
  stable_state:    DecisionState
  was_stabilized:  boolean
  reason:          string | null
}

export function computeStableState(input: StabilityInput): StabilityResult {
  const { today_state, yesterday_state, dominant_pattern } = input

  // No history — accept raw state
  if (!yesterday_state) {
    return { stable_state: today_state, was_stabilized: false, reason: null }
  }

  const todayRank     = STATE_RANK[today_state]
  const yesterdayRank = STATE_RANK[yesterday_state]
  const delta         = todayRank - yesterdayRank  // positive = improvement, negative = worsening

  // Rule 1: State can only move one level per day
  if (delta > 1) {
    // e.g. RED → GREEN in one day: clamp to YELLOW
    const clampedRank = yesterdayRank + 1
    return {
      stable_state:   RANK_TO_STATE[clampedRank],
      was_stabilized: true,
      reason:         'STATE_JUMP_CLAMPED',
    }
  }

  if (delta < -1) {
    // e.g. GREEN → RED in one day: clamp to YELLOW
    const clampedRank = yesterdayRank - 1
    return {
      stable_state:   RANK_TO_STATE[clampedRank],
      was_stabilized: true,
      reason:         'STATE_DROP_CLAMPED',
    }
  }

  // Rule 2: Accumulating strain — block immediate improvement
  if (
    dominant_pattern === 'PATTERN_ACCUMULATING_STRAIN' &&
    delta > 0
  ) {
    return {
      stable_state:   yesterday_state,
      was_stabilized: true,
      reason:         'STRAIN_PATTERN_BLOCKS_IMPROVEMENT',
    }
  }

  // Rule 3: Slight worsening + yesterday stable — hold state for one day
  if (delta === -1 && yesterday_state === 'GREEN') {
    return {
      stable_state:   yesterday_state,
      was_stabilized: true,
      reason:         'SLIGHT_WORSENING_HELD',
    }
  }

  return { stable_state: today_state, was_stabilized: false, reason: null }
}

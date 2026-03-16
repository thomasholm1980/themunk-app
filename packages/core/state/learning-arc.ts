// packages/core/state/learning-arc.ts
// Learning Arc Trigger Logic v1
// System event only — not user data
// Never affects computeStateV2 or state delivery

export type LearningArcResult = {
  message: string
} | null

const LEARNING_MESSAGES = [
  "The Munk is beginning to learn how your body responds to stress and recovery.",
  "Over time, the Munk will begin to recognize patterns in your recovery signals.",
  "The Munk continues to observe your patterns."
]

export function selectLearningMessage(): string {
  return LEARNING_MESSAGES[Math.floor(Math.random() * LEARNING_MESSAGES.length)]
}

export const LEARNING_ARC_SUPPRESS_DAYS = 3

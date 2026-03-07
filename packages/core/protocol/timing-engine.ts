// packages/core/protocol/timing-engine.ts
// ProtocolTimingEngine v1
// Converts protocol output into scheduled time windows
// [ASSUMPTION] wake_time default = 07:00 Europe/Oslo until real wake-time ingestion exists

import type { MunkState } from './protocol-types'

export type ProtocolSchedule = {
  deep_work_window_start: string | null
  deep_work_window_end: string | null
  training_window_start: string | null
  training_window_end: string | null
  recovery_window_start: string | null
  recovery_window_end: string | null
  protocol_version: string
}

type TimingInput = {
  state: MunkState
  deep_work_minutes: number
  recovery_minutes: number
  wake_time?: string // HH:MM, defaults to 07:00
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

const PROTOCOL_VERSION = '1.0.0'

export function computeProtocolSchedule(input: TimingInput): ProtocolSchedule {
  const wake = input.wake_time ?? '07:00'

  if (input.state === 'GREEN') {
    // Deep work: morning, starts 1h after wake
    const dwStart = addMinutes(wake, 60)
    const dwEnd = addMinutes(dwStart, input.deep_work_minutes)
    // Training: afternoon, 8h after wake
    const trainStart = addMinutes(wake, 480)
    const trainEnd = addMinutes(trainStart, 60)
    // Recovery: evening, 30min wind-down
    const recStart = addMinutes(wake, 780)
    const recEnd = addMinutes(recStart, input.recovery_minutes)

    return {
      deep_work_window_start: dwStart,
      deep_work_window_end: dwEnd,
      training_window_start: trainStart,
      training_window_end: trainEnd,
      recovery_window_start: recStart,
      recovery_window_end: recEnd,
      protocol_version: PROTOCOL_VERSION,
    }
  }

  if (input.state === 'YELLOW') {
    // Shorter deep work: 2h after wake
    const dwStart = addMinutes(wake, 120)
    const dwEnd = addMinutes(dwStart, input.deep_work_minutes)
    // Light training: earlier, 6h after wake
    const trainStart = addMinutes(wake, 360)
    const trainEnd = addMinutes(trainStart, 45)
    // Recovery: mid-afternoon
    const recStart = addMinutes(wake, 600)
    const recEnd = addMinutes(recStart, input.recovery_minutes)

    return {
      deep_work_window_start: dwStart,
      deep_work_window_end: dwEnd,
      training_window_start: trainStart,
      training_window_end: trainEnd,
      recovery_window_start: recStart,
      recovery_window_end: recEnd,
      protocol_version: PROTOCOL_VERSION,
    }
  }

  // RED: no training, multiple recovery windows
  const rec1Start = addMinutes(wake, 60)
  const rec1End = addMinutes(rec1Start, 30)
  const rec2Start = addMinutes(wake, 360)
  const rec2End = addMinutes(rec2Start, 30)

  return {
    deep_work_window_start: null,
    deep_work_window_end: null,
    training_window_start: null,
    training_window_end: null,
    recovery_window_start: rec1Start,
    recovery_window_end: rec2End, // spans both windows
    protocol_version: PROTOCOL_VERSION,
  }
}

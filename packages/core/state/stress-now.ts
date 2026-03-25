// packages/core/state/stress-now.ts
// Stress nå V1 — deterministic interpretation layer
// Secondary, situational. Does NOT replace morning state.

export type MorningState = 'GREEN' | 'YELLOW' | 'RED'
export type SelfReport   = 'rolig' | 'spent' | 'tung' | 'presset'
export type TimeOfDay    = 'formiddag' | 'ettermiddag' | 'kveld'
export type StressNowLevel = 'LOW' | 'MODERATE' | 'HIGH'

export interface StressNowResult {
  stress_now_level: StressNowLevel
  headline:         string
  why_line:         string
  action_line:      string
}

export function inferTimeOfDay(osloHour: number): TimeOfDay {
  if (osloHour < 12) return 'formiddag'
  if (osloHour < 18) return 'ettermiddag'
  return 'kveld'
}

// Core decision matrix
function resolveLevel(
  morning: MorningState,
  report: SelfReport,
  time: TimeOfDay
): StressNowLevel {
  if (morning === 'GREEN') {
    if (report === 'rolig')   return 'LOW'
    if (report === 'spent')   return 'MODERATE'
    if (report === 'tung')    return 'MODERATE'
    if (report === 'presset') return time === 'kveld' ? 'HIGH' : 'MODERATE'
  }
  if (morning === 'YELLOW') {
    if (report === 'rolig')   return 'MODERATE'
    if (report === 'spent')   return 'MODERATE'
    if (report === 'tung')    return 'MODERATE'
    if (report === 'presset') return 'HIGH'
  }
  if (morning === 'RED') {
    if (report === 'rolig')   return 'MODERATE'
    if (report === 'spent')   return 'HIGH'
    if (report === 'tung')    return 'HIGH'
    if (report === 'presset') return 'HIGH'
  }
  return 'MODERATE'
}

const HEADLINES: Record<StressNowLevel, string> = {
  LOW:      'Lavt stress nå',
  MODERATE: 'Moderat stress nå',
  HIGH:     'Høyt stress nå',
}

function buildWhyLine(
  level: StressNowLevel,
  report: SelfReport,
  time: TimeOfDay,
  morning: MorningState
): string {
  if (level === 'LOW') {
    if (report === 'rolig') return 'Kroppen virker roligere akkurat nå'
    return 'Signalene tyder på at stresset har lagt seg'
  }
  if (level === 'HIGH') {
    if (time === 'ettermiddag' && morning !== 'GREEN')
      return 'Kroppen er fortsatt aktivert fra tidligere i dag'
    if (time === 'kveld')
      return 'Kroppen har ikke landet ennå'
    if (report === 'presset')
      return 'Kroppen signaliserer høyt aktiviseringsnivå'
    return 'Kroppen er under press akkurat nå'
  }
  // MODERATE
  if (time === 'kveld' && report === 'tung')
    return 'Kroppen er sliten men ikke kritisk belastet'
  if (morning === 'GREEN' && report === 'spent')
    return 'Stresset bygger seg opp igjen utover dagen'
  if (morning === 'YELLOW')
    return 'Kroppen har ikke hentet seg helt inn'
  return 'Kroppen er i moderat aktiveringstilstand'
}

function buildActionLine(
  level: StressNowLevel,
  time: TimeOfDay
): string {
  if (level === 'LOW') {
    return 'Behold tempoet du er i'
  }
  if (level === 'HIGH') {
    if (time === 'kveld')  return 'Prioriter ro og legg unna skjermen tidlig'
    return 'Ta en pause. Kroppen trenger det nå.'
  }
  // MODERATE
  if (time === 'kveld')  return 'Begynn å roe ned — unngå nye krav på kvelden'
  if (time === 'ettermiddag') return 'Vurder en kort pause før du fortsetter'
  return 'Hold et bevisst tempo resten av dagen'
}

export function computeStressNow(
  morning: MorningState,
  report: SelfReport,
  time: TimeOfDay
): StressNowResult {
  const level      = resolveLevel(morning, report, time)
  const headline   = HEADLINES[level]
  const why_line   = buildWhyLine(level, report, time, morning)
  const action_line = buildActionLine(level, time)

  return { stress_now_level: level, headline, why_line, action_line }
}

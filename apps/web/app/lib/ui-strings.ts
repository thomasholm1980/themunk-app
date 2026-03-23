// ui-strings.ts — sentralisert UI-tekst for The Munk
// Phase 1: Norsk marked. Ikke oversett — forenkle.
// Alle brukervendte strenger hentes herfra.

export const UI = {
  // App
  appName: 'The Munk',

  // Daglig status
  defaultInsight: 'Systemet ditt er stabilt i dag',

  // Seksjonsoverskrifter
  sectionReflection: 'Kort sjekk',
  sectionGuidance:   'Hva du bør gjøre',

  // Refleksjonsspørsmål
  reflectionQuestion: 'Hvordan kjennes kroppen i dag?',
  reflectionOptions: {
    low:  'Tung',
    mid:  'Nøytral',
    high: 'Lett',
  },

  // Ventetilstand
  waitingTitle: 'Vi gjør klar dagens stressnivå',
  waitingBody:  'Start rolig — kroppen bruker fortsatt natten',
  waitingHint:  '',

  // Morning Arrival (deaktivert)
  arrivalLine1: '',
  arrivalLine2: '',
} as const

// ui-strings.ts — sentralisert UI-tekst for The Munk
// Phase 1: Norsk marked. Ikke oversett — forenkle.
// Alle brukervendte strenger hentes herfra.

export const UI = {
  // App
  appName: 'The Munk',

  // Daglig status
  defaultInsight: 'Systemet ditt er stabilt i dag.',

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
  waitingTitle: 'Dataene er ikke klare ennå.',
  waitingBody:  'Vi venter på signal fra kroppen din.',
  waitingHint:  'Dette er vanligvis klart utpå morgenen.',

  // Morning Arrival
  arrivalLine1: 'Følger du med på alt...',
  arrivalLine2: '...bortsett fra stress?',
} as const

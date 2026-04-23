export const HUME_CONFIGS = {
  ARIA:         "ffbf28a8-1554-4344-add7-1090ce18b206",
  THE_PACER:    "6dd69e3f-234b-4236-8b5e-9ef9a431b9c3",
  ZEN_MASTER:   "0177c19c-7b9b-44d9-95b7-08eab2e50aee",
  THE_OBSERVER: "fea0476a-3f95-4b73-9575-00d4cc9c40c7",
  THE_GUARDIAN: "b63df75e-edbc-4fe0-bd40-951eb0c02d11",
} as const

export type HumeModeKey = keyof typeof HUME_CONFIGS

export const HUME_MODE_LABELS: Record<HumeModeKey, string> = {
  ARIA:         "Aria",
  THE_PACER:    "Pust",
  ZEN_MASTER:   "Meditasjon",
  THE_OBSERVER: "Mindfulness",
  THE_GUARDIAN: "Innsovning",
}

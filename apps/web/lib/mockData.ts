// Demo data for BI-sensor evaluation
export const DEMO_USER_ID = "demo-bi-sensor"
export const DEMO_CONTRACT = {
  state: "YELLOW" as "GREEN" | "YELLOW" | "RED",
  insight: "Kroppen din jobber stødig. HRV på 52ms viser et nervesystem i balanse — ikke perfekt, men kontrollert. Det er nok for i dag.",
  guidance: "Prioriter én oppgave av gangen. Unngå møter etter kl. 15. Ta 5 minutter ute mellom kl. 12 og 13.",
  hrv_rmssd: 52,
  resting_hr: 54,
}
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

// Demo data for BI-sensor evaluation
export const DEMO_USER_ID = "demo-bi-sensor"
export const DEMO_CONTRACT = {
  state: "GREEN" as "GREEN" | "YELLOW" | "RED",
  insight: "HRV at 107ms signals a well-recovered nervous system. Your body is ready for today.",
  guidance: "High capacity today. Use your energy on what matters most.",
  hrv_rmssd: 107,
  resting_hr: 46,
}
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

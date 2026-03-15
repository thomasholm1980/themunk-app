# The Munk - Pipeline Baseline and Debug Protocol

## Canonical Pipeline

Oura -> OuraAdapter -> wearable_logs -> computeStateV2 -> daily_state -> /api/state/today -> DecisionContract -> Daily Brief UI

## Operational Status (baseline: 2026-03-15)

- Oura sync: operational
- wearable_logs persistence: operational
- computeStateV2: operational
- daily_state persistence: operational
- /api/state/today: operational
- Daily Brief UI: operational

## MVP Real-Data Baseline

Reference user: Thomas Holm (user_id: thomas)
Reference wearable: Oura Ring
Primary signals: HRV, resting HR, sleep score, readiness score

NOTE: This is the MVP reference dataset only.
Thomas/Oura is the reference baseline, not the permanent global user model.
Do not treat hardcoded user_id thomas as a universal assumption.

## Debug Order

When something fails, debug in this exact order:

1. Data in - did Oura sync run? Check wearable_logs
2. State compute - did computeStateV2 run? Check daily_state
3. Persistence - does daily_state have a row for today?
4. Endpoint - does /api/state/today return 200?
5. UI - only investigate frontend after all above are confirmed

Do not start with UX or design before pipeline is verified.

## Safeguards

- sync self-verify: sync/route.ts reads back daily_state after upsert, returns 500 if missing
- smoke endpoint: /api/system/smoke checks all four pipeline layers
- health endpoint: /api/system/health uses service role, reports pipeline_ok and today_state_present

## Architecture Rules

- daily_state is canonical state storage, never recompute in product routes
- LLMs generate language only, never determine physiological state
- All stateful routes: force-dynamic + Cache-Control: no-store
- Service role key required for oura_tokens and daily_state access
- Oslo timezone (Europe/Oslo) for all day_key calculations

# Aria Biometric Pipeline

**Status:** Live on Preview (`feature/monster-launch`). Verified 2026-04-16.

## Flow
Oura Ring
│
▼
POST /api/wearables/oura/backfill        (triggered on OAuth callback + manually)
│
├─ OuraAdapter.fetchDay(userId, dayKey)
│
▼
wearable_logs                             (per-day raw biometrics)
│  columns: hrv_rmssd, resting_hr, sleep_score, readiness_score,
│           activity_score, sleep_duration_hours, raw_snapshot, source
│  unique:  (user_id, day_key, source)
│
├─ computeStateV2({ wearableInput })
│
▼
daily_state                               (computed canonical state)
columns: state (RED/YELLOW/GREEN), final_score, confidence,
hrv, rhr, sleep_score, recovery_score, state_trace, computed_at
unique:  (user_id, day_key)
│
▼
GET /api/state/today                      (DecisionContract assembly)
│
▼
/munk/page.tsx                            (fetches on mount)
│
├─ sets biometricContext state
│  { state, hrv, rhr, final_score, sleep_score, readiness_score }
│
▼
<HumeVoice biometricContext={...} />
│
├─ ws.onopen → sends session_settings message to Hume EVI
│  type: 'session_settings'
│  context.type: 'persistent'
│  context.text: human-readable summary of today's biometrics
│
▼
Aria (Hume EVI 3, voice Kora)
Receives biometric context as persistent session context.
Can reference HRV, RHR, state, scores in natural conversation.
System prompt behavior is controlled in Hume Dashboard (config
ffbf28a8-1554-4344-add7-1090ce18b206), NOT in this repo.
## Files

- `apps/web/app/api/auth/oura/callback/route.ts` — stores tokens, triggers backfill via request origin
- `apps/web/app/api/wearables/oura/backfill/route.ts` — 7-day backfill, writes to both `wearable_logs` and `daily_state`
- `apps/web/app/api/state/today/route.ts` — assembles DecisionContract from daily_state
- `apps/web/app/components/hume/HumeVoice.tsx` — accepts `biometricContext` prop, injects via session_settings on ws.onopen
- `apps/web/app/munk/page.tsx` — fetches /api/state/today, passes biometricContext to HumeVoice
- `packages/core/wearables/OuraAdapter.ts` — Oura API wrapper
- `apps/web/lib/oura-token.ts` — access token refresh with automatic 401 retry

## Database (Supabase project: gcmbuuzzjviviojcwgka — The Munk - Production)

Tables created during this session:
- `oura_tokens` (user_id PK, access_token, refresh_token, token_type, expires_in, updated_at) + RLS + service_role policy

Schema fixes applied during this session:
- `wearable_logs`: renamed `sleep_duration` → `sleep_duration_hours`; added UNIQUE (user_id, day_key, source)
- `daily_state`: added columns `state_trace jsonb`, `computed_at timestamptz`; added UNIQUE (user_id, day_key)

## Environment variables (Vercel Preview)

- `OURA_REDIRECT_URI` must match the Preview deployment URL for OAuth to resolve correctly. Production still points to www.themunk.ai.

## What is NOT in this repo

- Hume EVI system prompt (set in Hume Dashboard, config ffbf28a8-…)
- Aria's tone, voice (Kora), and response style rules — all dashboard-side
- If Aria should reference specific numeric values (e.g. "Your HRV is 19"),
  the system prompt in the Hume config must explicitly permit it.

## Verification (2026-04-16)

- Console log on ws.onopen confirmed:
  `[Hume] sent biometric context: User biometric snapshot from Oura today.
   Current state: RED. Stress score: 39/100. HRV: 19 ms.
   Resting heart rate: 64 bpm. Sleep score: 63. Readiness score: 66.`

## Backlog (owners)

- [ ] **Thomas/Manju:** Update Hume EVI system prompt in Dashboard to allow Aria
      to reference specific biometric values when relevant.
- [ ] **Ops:** Production `main` branch deploy is currently failing with
      `supabaseUrl is required` — investigate missing Production env vars.
      www.themunk.ai is still up on previous green deploy; no user-facing outage.
- [ ] **Later:** Merge feature/monster-launch → main once Aria + biometric
      pipeline has been stabilized on Preview and Oura OAuth redirect
      is moved back to www.themunk.ai.

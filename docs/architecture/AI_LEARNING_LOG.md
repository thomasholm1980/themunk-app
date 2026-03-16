# THE MUNK - AI Learning Log

This file documents significant system mistakes and lessons.
Updated only for pipeline failures, AI output problems, external API failures, or architecture mistakes.

---

## Date
2026-03-15

## Mistake
Daily Brief showed "Could not load today's forecast" every morning.

## Cause
sync/route.ts wrote to wearable_logs but never called computeStateV2 or wrote to daily_state.
Cron ran sync daily, but daily_state remained empty.
/api/state/today returned 404 because no row existed for today.

## Lesson
A route can appear healthy (status: ok) while silently failing to complete the pipeline.
Sync success does not mean state persistence success.

## Prevention
1. sync/route.ts now calls computeStateV2 and writes to daily_state after wearable_logs upsert.
2. sync self-verify: reads back daily_state row after upsert, returns 500 if missing.
3. /api/system/smoke verifies all four pipeline layers on demand.
4. /api/system/health uses service role and reports pipeline_ok and today_state_present.
5. Debug order documented in PIPELINE_BASELINE.md: data in -> state compute -> persistence -> endpoint -> UI.

---

## Date
2026-03-15

## Mistake
AI Interpreter returned wellness-coach language instead of The Munk voice.

## Cause
System prompt gave the model too much freedom.
No explicit bad examples. Temperature too high (0.4).

## Lesson
LLMs default to generic wellness language without tight constraints.
Tone must be enforced with explicit BAD and GOOD examples, not just descriptions.

## Prevention
1. System prompt now includes explicit BAD/GOOD examples.
2. Temperature lowered to 0.3.
3. Forbidden words listed directly in prompt.
4. AI_PLAYBOOK.md documents voice rules as permanent system truth.

---

## Date
2026-03-15

## Mistake
OPENAI_API_KEY appeared saved in Vercel but was empty (Sensitive flag issue).

## Cause
Sensitive environment variables in Vercel cannot be set for Development environment.
Multiple save attempts via UI failed silently without clear error.

## Lesson
Sensitive API keys must be added via Vercel CLI (npx vercel env add) for reliable storage.
UI-based entry for Sensitive vars is unreliable.

## Prevention
Use: npx vercel env add KEY_NAME production
Verify with: /api/system/debug-env endpoint (shows has_key and key_length, never value).

---

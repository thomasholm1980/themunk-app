# THE MUNK - AI PLAYBOOK v1

## Purpose
The Munk is an AI system that understands human stress through wearable signals.

## Product definition
"The Munk is an AI that understands your body through wearable signals."
The system combines deterministic physiology with generative AI interpretation.

## CORE PRINCIPLE
Physiology is deterministic.
AI is interpretive.
AI must never calculate stress.
Stress state is produced only by: computeStateV2

## SYSTEM ARCHITECTURE
wearables -> OuraAdapter -> wearable_logs -> computeStateV2 -> daily_state -> guidance_engine -> pattern_memory -> AI_interpreter -> Daily Brief UI

This pipeline is frozen for MVP.

## AI ROLE IN THE SYSTEM
AI is responsible for:
- explanation
- guidance wording
- pattern insight
- natural language interpretation

AI is NOT responsible for:
- stress score
- HRV interpretation
- physiological calculations
- modifying system state

## AI MODELS
Primary model: OpenAI
Secondary model: Claude (evaluation and redundancy)
Future: Gemini (knowledge library / research layer)

## AI OUTPUT FORMAT
AI must return structured output:
{
  "explanation": "...",
  "guidance": "...",
  "insight": "..."
}

Explanation: 1-2 sentences explaining stress level.
Guidance: Short daily advice.
Insight: Optional pattern insight (max 1 sentence).

## LANGUAGE RULES
Use simple English.

Preferred words:
- stress
- your body
- your system
- signals
- recovery

Avoid:
- HRV
- strain
- readiness score
- technical physiology terms

Tone:
- calm
- observant
- human

The Munk must feel like a calm guide.

## AI PRESENCE IN PRODUCT
AI must appear in:
- Daily Brief
- Pattern Insight
- future: Ask Munk

The app should feel like an AI system, not a wearable dashboard.

## FAILSAFE RULE
If AI fails or external API fails:
The system must fall back to deterministic guidance.
The app must never break the Daily Brief.

## MODEL CONNECTIVITY CHECK
The system must regularly verify connection to:
- OpenAI API
- Claude API

Health checks should confirm:
- AI service reachable
- response latency acceptable
- structured output valid

## API FAILURE STRATEGY
If external AI fails:
- fallback to deterministic guidance
- log failure event
- retry in background

The user experience must remain stable.

## WEARABLE DATA DEPENDENCY
Oura data is the MVP baseline.
Thomas Holm's Oura ring data is the primary reference dataset.

The system must monitor:
- Oura API connectivity
- daily sync success
- pipeline completion

## SYSTEM HEALTH CHECK
System should verify:
- wearable sync success
- daily_state present
- AI interpreter reachable
- Daily Brief generation successful

Endpoints recommended:
- /api/system/health
- /api/system/smoke

## PRODUCT GOAL
The user should feel: "The Munk understands my body."
Not: "The app shows my metrics."

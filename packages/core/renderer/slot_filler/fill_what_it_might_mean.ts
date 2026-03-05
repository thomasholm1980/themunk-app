// packages/core/renderer/slot_filler/fill_what_it_might_mean.ts
// LLM slot filler for what_it_might_mean. Untrusted — always gated.

import type { LLMAdapter } from '../../llm/llm_adapter';
import type { SlotFillerInput, SlotFillerOutput } from '../../llm/types';

const DETERMINISTIC_FALLBACK: Record<string, string[]> = {
  GREEN: [
    'This may be a good window for focused effort.',
    'Signals could suggest your system is well-regulated today.',
  ],
  YELLOW: [
    'This might indicate some strain worth monitoring.',
    'It could be worth pacing yourself through the day.',
  ],
  RED: [
    'This may be a signal that recovery is needed.',
    'It could be helpful to reduce demands where possible.',
  ],
};

function buildPrompt(input: SlotFillerInput): string {
  return `You are a wellness assistant. Based on the following readiness signal, write exactly 2 short bullets for "what_it_might_mean".

Readiness: ${input.readiness_band}
Signals: ${input.reasons.join(', ')}

Rules:
- Maximum 2 bullets
- Each bullet must contain uncertainty language (may, might, could, suggest, consider, possibly, appears to)
- No medical advice, no diagnosis, no medication references
- No "you should see a doctor" or similar
- Return ONLY valid JSON in this exact format:
{"what_it_might_mean": ["bullet 1", "bullet 2"]}`;
}

function parseResponse(text: string): string[] | null {
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (
      Array.isArray(parsed.what_it_might_mean) &&
      parsed.what_it_might_mean.length >= 1 &&
      parsed.what_it_might_mean.length <= 2
    ) {
      return parsed.what_it_might_mean.slice(0, 2);
    }
    return null;
  } catch {
    return null;
  }
}

export async function fillWhatItMightMean(
  input: SlotFillerInput,
  adapter: LLMAdapter,
): Promise<SlotFillerOutput> {
  const prompt = buildPrompt(input);

  try {
    // First attempt
    const response = await adapter.complete({
      prompt,
      max_tokens: 200,
      temperature: 0.3,
    });

    let bullets = parseResponse(response.text);

    // One retry if invalid
    if (!bullets) {
      const retry = await adapter.complete({
        prompt: prompt + '\n\nIMPORTANT: Return ONLY valid JSON. No other text.',
        max_tokens: 200,
        temperature: 0.1,
      });
      bullets = parseResponse(retry.text);
    }

    // Deterministic fallback if still invalid
    if (!bullets) {
      return {
        what_it_might_mean: DETERMINISTIC_FALLBACK[input.readiness_band],
        source: 'fallback',
      };
    }

    return {
      what_it_might_mean: bullets,
      source: 'llm',
    };
  } catch {
    return {
      what_it_might_mean: DETERMINISTIC_FALLBACK[input.readiness_band],
      source: 'fallback',
    };
  }
}

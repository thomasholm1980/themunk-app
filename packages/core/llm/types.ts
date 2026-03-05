// packages/core/llm/types.ts
// LLM adapter types. Keeps LLM boundary explicit.

export interface LLMRequest {
  prompt: string;
  max_tokens: number;
  temperature: number;
}

export interface LLMResponse {
  text: string;
  model: string;
}

export interface SlotFillerInput {
  readiness_band: 'GREEN' | 'YELLOW' | 'RED';
  reasons: string[];
  uncertainty_required: boolean;
}

export interface SlotFillerOutput {
  what_it_might_mean: string[];
  source: 'llm' | 'fallback';
}

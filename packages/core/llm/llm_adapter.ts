// packages/core/llm/llm_adapter.ts
// LLM adapter interface. Concrete implementation injected from apps/web.

import type { LLMRequest, LLMResponse } from './types';

export interface LLMAdapter {
  complete(request: LLMRequest): Promise<LLMResponse>;
}

// Deterministic fallback adapter — used when no LLM is available
export class FallbackAdapter implements LLMAdapter {
  async complete(_request: LLMRequest): Promise<LLMResponse> {
    return {
      text: '{"what_it_might_mean": ["This may be a signal worth paying attention to.", "It could be helpful to check in with how you are feeling."]}',
      model: 'fallback',
    };
  }
}

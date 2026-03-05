// apps/web/lib/anthropic_adapter.ts
// Anthropic Claude adapter. Server-side only. Never import in client components.

import type { LLMAdapter, LLMRequest, LLMResponse } from '@themunk/core';

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = parseInt(process.env.LLM_TIMEOUT_MS ?? '3000', 10);

export class AnthropicAdapter implements LLMAdapter {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY ?? '';
    this.model = DEFAULT_MODEL;
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: request.max_tokens,
          temperature: request.temperature,
          messages: [{ role: 'user', content: request.prompt }],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text ?? '';

      return { text, model: this.model };
    } finally {
      clearTimeout(timeout);
    }
  }
}

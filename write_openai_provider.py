import os
os.makedirs('apps/web/lib', exist_ok=True)
f = open('apps/web/lib/openai-provider.ts', 'w')
f.write("""export interface AIInterpretation {
  explanation: string
  guidance: string
  insight: string
}

export async function callOpenAI(prompt: string): Promise<AIInterpretation | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.warn('[openai-provider] OPENAI_API_KEY not set')
    return null
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 200,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: 'You are a calm, observant health guide. Return only valid JSON with keys: explanation, guidance, insight. No markdown. No extra text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!res.ok) {
      console.error('[openai-provider] API error', res.status)
      return null
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content ?? ''
    const parsed: AIInterpretation = JSON.parse(raw)

    if (!parsed.explanation || !parsed.guidance) return null

    return {
      explanation: parsed.explanation,
      guidance: parsed.guidance,
      insight: parsed.insight ?? '',
    }
  } catch (err) {
    console.error('[openai-provider] exception', err)
    return null
  }
}
""")
f.close()
print('written ok')

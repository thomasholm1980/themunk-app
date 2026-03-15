export interface AIInterpretation {
  explanation: string
  guidance: string
  insight: string
}

export async function callOpenAI(prompt: string): Promise<AIInterpretation | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error("[openai-provider] OPENAI_API_KEY missing")
    return null
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 200,
        temperature: 0.4,
        messages: [
          { role: "system", content: "You are a calm health guide. Return only valid JSON with keys: explanation, guidance, insight. No markdown." },
          { role: "user", content: prompt },
        ],
      }),
    })

    const responseText = await res.text()
    console.log("[openai-provider] status:", res.status)
    console.log("[openai-provider] response:", responseText.slice(0, 300))

    if (!res.ok) {
      console.error("[openai-provider] API error", res.status, responseText.slice(0, 200))
      return null
    }

    const data = JSON.parse(responseText)
    const raw = data.choices?.[0]?.message?.content ?? ""
    console.log("[openai-provider] raw content:", raw)
    const parsed: AIInterpretation = JSON.parse(raw)

    if (!parsed.explanation || !parsed.guidance) return null

    return {
      explanation: parsed.explanation,
      guidance: parsed.guidance,
      insight: parsed.insight ?? "",
    }
  } catch (err) {
    console.error("[openai-provider] exception:", err)
    return null
  }
}

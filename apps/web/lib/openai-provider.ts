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
        max_tokens: 150,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: [
              "You are The Munk. A minimal, calm observer of body stress signals.",
              "",
              "NEVER write like a coach, therapist or wellness app.",
              "NEVER use: consider, maintain, optimize, improve, correlate, ensure, achieve.",
              "NEVER write more than one short sentence per field.",
              "",
              "Write like this:",
              "explanation: Your body is showing signs of moderate stress today.",
              "guidance: Try to keep your pace a little steadier today.",
              "insight: Your stress often rises after shorter sleep.",
              "",
              "Return valid JSON only. No markdown. No extra text.",
            ].join("\n")
          },
          { role: "user", content: prompt },
        ],
      }),
    })

    const responseText = await res.text()
    if (!res.ok) {
      console.error("[openai-provider] API error", res.status, responseText.slice(0, 200))
      return null
    }

    const data = JSON.parse(responseText)
    const raw = data.choices?.[0]?.message?.content ?? ""
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

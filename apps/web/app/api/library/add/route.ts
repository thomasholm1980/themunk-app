export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const USER_ID = 'thomas'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'mangler url' }, { status: 400 })

    // Hent innhold fra URL
    let pageText = ''
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const html = await res.text()
      // Enkel tekst-ekstraksjon — fjern HTML-tags
      pageText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000)
    } catch {
      pageText = url
    }

    // AI-oppsummering og kategorisering
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Du er en assistent som oppsummerer innhold for en stressmestringsapp.

URL: ${url}
Innhold: ${pageText}

Returner KUN gyldig JSON uten markdown:
{
  "title": "kort tittel paa norsk (maks 8 ord)",
  "summary": "2 setninger paa norsk som forklarer hva dette handler om",
  "category": "stress" eller "recovery" eller "focus",
  "tags": ["tag1", "tag2"]
}`
      }]
    })

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    let parsed: { title: string; summary: string; category: string; tags: string[] }
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    } catch {
      parsed = { title: url, summary: 'Kunne ikke oppsummere innholdet.', category: 'focus', tags: [] }
    }

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('library_items')
      .insert({
        user_id: USER_ID,
        url,
        title: parsed.title,
        summary: parsed.summary,
        category: parsed.category,
        tags: parsed.tags,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, item: data })
  } catch (err) {
    console.error('[library/add] feil:', err)
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 })
  }
}
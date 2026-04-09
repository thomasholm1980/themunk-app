import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import * as postmark from 'postmark'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

const USER_ID = 'thomas'

function getOsloDayKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const day   = parts.find((p) => p.type === 'day')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const year  = parts.find((p) => p.type === 'year')?.value
  return `${year}-${month}-${day}`
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const day_key = getOsloDayKey()

  const { data: state, error } = await supabase
    .from('daily_state')
    .select('state, hrv, rhr, computed_at')
    .eq('user_id', USER_ID)
    .eq('day_key', day_key)
    .maybeSingle()

  if (error || !state) {
    console.error('[daily-greeting] ingen daily_state funnet', { day_key })
    return NextResponse.json({ error: 'Ingen state' }, { status: 500 })
  }

  const stressLabel = state.state === 'GREEN' ? 'lavt' : state.state === 'YELLOW' ? 'moderat' : 'hoyt'

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const prompt = `Du er Munken. En rolig men direkte mentor som gir korte kommandoer.

Dagens tilstand:
- Stressnivaa: ${stressLabel} (${state.state})
- Hjertets rytme (HRV): ${state.hrv ?? 'ukjent'} ms
- Hvilepuls: ${state.rhr ?? 'ukjent'} bpm

Skriv 3 setninger paa norsk:
1. Bare "Thomas."
2. En observasjon om kroppens signaler og restitusjonsbehov
3. En direkte kommando (eks: "Senk skuldrene og finn roen i 10 minutter.")

Regler:
- Bruk "restitusjon" ikke "hvile"
- Bruk "systemet" eller "fysiologisk balanse" ikke "nervoees balanse"
- Bruk "hjertets rytme" for HRV
- Direkte kommandoer, ikke forslag
- Ingen "kanskje", ingen "basert paa", ingen "data", ingen "score"
- Bare de tre setningene. Ingenting annet.`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const munkText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')

  const emailHtml = `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0D1A17;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1A17;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td align="center" style="padding:0 0 32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#D4AF37;">THE MUNK</p>
            </td>
          </tr>
          <tr>
            <td style="background:#162C27;border-radius:8px;padding:40px;">
              <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:18px;color:#f0ebe3;line-height:1.8;">${munkText}</p>
              <a href="https://www.themunk.ai/check-in"
                style="display:inline-block;margin-top:8px;padding:14px 28px;background:#D4AF37;color:#0D1A17;font-family:Georgia,serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:4px;">
                Sjekk stresset ditt
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 0 0;">
              <a href="https://www.themunk.ai" style="font-family:Georgia,serif;font-size:11px;color:#555;text-decoration:none;letter-spacing:1px;">themunk.ai</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN!)
  await postmarkClient.sendEmail({
    From: 'Thomas - Founder of The Munk <hei@themunk.ai>',
    To: 'thomas@themunk.ai',
    Subject: 'Munken sjekker inn',
    HtmlBody: emailHtml,
    TextBody: munkText + '\n\nSjekk stresset ditt: https://www.themunk.ai/check-in',
    MessageStream: 'outbound',
  })

  console.log('[daily-greeting] sendt kl.', new Date().toISOString())
  return NextResponse.json({ ok: true })
}
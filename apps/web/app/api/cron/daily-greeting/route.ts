import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import * as postmark from 'postmark'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: state, error } = await supabase
    .from('daily_state')
    .select('stress_level, hrv_ms, rhr_bpm, computed_at')
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !state) {
    console.error('[daily-greeting] ingen daily_state funnet')
    return NextResponse.json({ error: 'Ingen state' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const prompt = `Du er Munken. En rolig, direkte stemme som tolker kroppens signaler.

Dagens tilstand:
- Stressnivaa: ${state.stress_level}
- Hjertets rytme (HRV): ${state.hrv_ms} ms
- Hvilepuls: ${state.rhr_bpm} bpm

Skriv en kort paaminnelse til Thomas paa norsk. Maks 3 setninger.
1. Bare "Thomas."
2. En kort refleksjon basert paa stressnivaaet og signalene
3. Een konkret handling han kan gjoere naa

Bannlyste ord: data, score, prosent, kanskje
Bruk heller: kroppens signaler, nervoees balanse, restitusjonsgield, hjertets rytme
Ingen introduksjoner. Ingen Hei. Ingen avslutningshilsen. Bare de tre setningene.`

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
              <a href="https://www.themunk.ai"
                style="font-family:Georgia,serif;font-size:11px;color:#555;text-decoration:none;letter-spacing:1px;">
                themunk.ai
              </a>
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
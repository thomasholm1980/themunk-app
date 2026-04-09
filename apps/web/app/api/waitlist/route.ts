import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import * as postmark from 'postmark'

export const runtime = 'nodejs'

const EMAIL_HTML = `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Du er på listen – The Munk</title>
</head>
<body style="margin:0;padding:0;background:#051405;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#051405;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0a1e0a;border-radius:12px;overflow:hidden;border:1px solid rgba(212,175,55,0.15);">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:40px 40px 24px;">
              <img src="https://www.themunk.ai/assets/munk-logo.png"
                alt="The Munk"
                width="56"
                style="display:block;border-radius:50%;" />
              <p style="margin:12px 0 0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#D4AF37;">
                THE MUNK
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding:0 40px 8px;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:400;color:#ffffff;line-height:1.3;">
                Du er på listen.
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding:16px 40px;">
              <div style="width:40px;height:1px;background:#D4AF37;opacity:0.4;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px 16px;">
              <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.8;">Hei,</p>
              <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.8;">Du er nå på ventelisten til The Munk.</p>
              <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.8;">The Munk er bygget for å hjelpe deg å forstå stresset ditt bedre – ikke bare se tall.</p>
              <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.8;">Ved å bruke data fra wearables som klokker, helseringer og armbånd, tolker The Munk signalene fra kroppen din og gjør dem lettere å forstå i en travel hverdag.</p>
              <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.8;">Vi kombinerer fysiologiske data med generativ AI for å gi deg en roligere og mer menneskelig forståelse av:</p>

              <ul style="margin:0 0 20px;padding-left:24px;">
                <li style="font-family:Georgia,serif;font-size:16px;color:#ffffff;line-height:1.75;margin-bottom:6px;">hvordan kroppen din faktisk har det</li>
                <li style="font-family:Georgia,serif;font-size:16px;color:#ffffff;line-height:1.75;margin-bottom:6px;">hvorfor dagen kjennes som den gjør</li>
                <li style="font-family:Georgia,serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.8;">og hva du bør gjøre videre</li>
              </ul>

              <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.8;">Målet er enkelt:</p>
              <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.8;">Å gjøre stress tydeligere, roligere og mer håndterbart.</p>
              <p style="margin:0 0 32px;font-family:Georgia,serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.8;">Vi sier ifra så snart vi åpner.</p>
              <p style="margin:0;font-family:Georgia,serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.8;">– Thomas, Founder of The Munk</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:32px 40px 40px;">
              <div style="width:40px;height:1px;background:rgba(212,175,55,0.3);margin-bottom:20px;"></div>
              <a href="https://www.themunk.ai" style="font-family:Georgia,serif;font-size:12px;color:rgba(212,175,55,0.6);text-decoration:none;letter-spacing:2px;text-transform:uppercase;">themunk.ai</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

async function sendConfirmationEmail(to: string) {
  const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN!)
  await client.sendEmail({
    From: 'Thomas – Founder of The Munk <hei@themunk.ai>',
    To: to,
    Subject: 'Du er på listen – The Munk',
    HtmlBody: EMAIL_HTML,
    TextBody: `Hei,

Du er nå på ventelisten til The Munk.

The Munk er bygget for å hjelpe deg å forstå stresset ditt bedre – ikke bare se tall.

Ved å bruke data fra wearables som klokker, helseringer og armbånd, tolker The Munk signalene fra kroppen din og gjør dem lettere å forstå i en travel hverdag.

Vi kombinerer fysiologiske data med generativ AI for å gi deg en roligere og mer menneskelig forståelse av:
- hvordan kroppen din faktisk har det
- hvorfor dagen kjennes som den gjør
- og hva du bør gjøre videre

Målet er enkelt:
Å gjøre stress tydeligere, roligere og mer håndterbart.

Vi sier ifra så snart vi åpner.

– Thomas, Founder of The Munk`,
    MessageStream: 'outbound',
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email, utm_source, utm_campaign, utm_medium } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ugyldig e-postadresse' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from('waitlist_signups')
      .insert({
        email: email.toLowerCase().trim(),
        source: 'landing',
        page: '/landing',
        utm_source: utm_source ?? null,
        utm_campaign: utm_campaign ?? null,
        utm_medium: utm_medium ?? null,
        consent_text_version: 'v1',
      })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ ok: true })
      }
      console.error('[waitlist] insert error', error)
      return NextResponse.json({ error: 'Serverfeil' }, { status: 500 })
    }

    const cleanEmail = email.toLowerCase().trim()
    try {
      await sendConfirmationEmail(cleanEmail)
      console.log('[waitlist] confirmation email sent to:', cleanEmail)
    } catch (mailErr) {
      console.error('[waitlist] email send failed:', mailErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[waitlist] unexpected error', err)
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 })
  }
}

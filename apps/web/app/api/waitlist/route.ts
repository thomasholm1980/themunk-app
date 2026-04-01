import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

const EMAIL_HTML = `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Du er på listen – The Munk</title>
</head>
<body style="margin:0;padding:0;background:#f5f2ee;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ee;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:40px 40px 24px;">
              <img src="https://www.themunk.ai/assets/munk-logo.png"
                alt="The Munk"
                width="56"
                style="display:block;border-radius:50%;" />
              <p style="margin:12px 0 0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;">
                THE MUNK
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding:0 40px 8px;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1a1a1a;line-height:1.3;">
                Du er på listen.
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding:16px 40px;">
              <div style="width:40px;height:1px;background:#d4c9b8;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px 16px;">
              <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.75;">
                Hei,
              </p>
              <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.75;">
                Du er nå på ventelisten til The Munk.
              </p>
              <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.75;">
                The Munk er bygget for å hjelpe deg å forstå stresset ditt bedre – ikke bare se tall.
              </p>
              <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.75;">
                Ved å bruke data fra wearables som klokker, helseringer og armbånd, tolker The Munk signalene fra kroppen din og gjør dem lettere å forstå i en travel hverdag.
              </p>
              <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.75;">
                Vi kombinerer fysiologiske data med generativ AI for å gi deg en roligere og mer menneskelig forståelse av:
              </p>

              <!-- Bullet list -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;">
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:20px;vertical-align:top;font-family:Georgia,serif;font-size:16px;color:#c8a84b;padding-top:1px;">–</td>
                        <td style="font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.65;">hvordan kroppen din faktisk har det</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:20px;vertical-align:top;font-family:Georgia,serif;font-size:16px;color:#c8a84b;padding-top:1px;">–</td>
                        <td style="font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.65;">hvorfor dagen kjennes som den gjør</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:20px;vertical-align:top;font-family:Georgia,serif;font-size:16px;color:#c8a84b;padding-top:1px;">–</td>
                        <td style="font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.65;">og hva du bør gjøre videre</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.75;">
                Målet er enkelt:
              </p>
              <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.75;">
                Å gjøre stress tydeligere, roligere og mer håndterbart.
              </p>
              <p style="margin:0 0 32px;font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.75;">
                Vi sier ifra så snart vi åpner.
              </p>
              <p style="margin:0 0 0;font-family:Georgia,serif;font-size:16px;color:#2a2a2a;line-height:1.75;">
                – The Munk
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:32px 40px 40px;">
              <div style="width:40px;height:1px;background:#d4c9b8;margin-bottom:20px;"></div>
              <a href="https://www.themunk.ai"
                style="font-family:Georgia,serif;font-size:12px;color:#aaa;text-decoration:none;letter-spacing:1px;">
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

async function sendConfirmationEmail(to: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: 'The Munk <hei@themunk.ai>',
    to,
    subject: 'Du er på listen – The Munk',
    text: `Hei,

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

– The Munk`,
    html: EMAIL_HTML,
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

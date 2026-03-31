import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

async function sendConfirmationEmail(to: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'The Munk <hei@themunk.ai>',
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

    // Send confirmation email — non-blocking, fail gracefully
    try {
      await sendConfirmationEmail(email.toLowerCase().trim())
    } catch (mailErr) {
      console.error('[waitlist] email send failed', mailErr)
      // DB insert succeeded — signup is still valid
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[waitlist] unexpected error', err)
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 })
  }
}

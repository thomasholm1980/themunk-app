import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

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
        // Duplicate email — treat as success
        return NextResponse.json({ ok: true })
      }
      console.error('[waitlist] insert error', error)
      return NextResponse.json({ error: 'Serverfeil' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[waitlist] unexpected error', err)
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 })
  }
}

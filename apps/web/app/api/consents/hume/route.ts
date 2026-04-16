import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { consented, language } = body

    if (typeof consented !== 'boolean') {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }

    // For MVP: using service role to upsert consent
    // TODO: replace with auth.uid() when user auth is in place
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'supabase_not_configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // For now, using a fixed user_id placeholder until auth is integrated
    // TODO: replace with authenticated user_id
    const userIdHeader = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000'

    const { error } = await supabase
      .from('user_consents')
      .upsert({
        user_id: userIdHeader,
        biometric_emotion_v1: consented,
        consent_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_version: 'monster-0.1',
        source_origins: ['hume']
      }, { onConflict: 'user_id' })

    if (error) {
      return NextResponse.json({ error: 'db_write_failed', detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'consent_failed' }, { status: 500 })
  }
}

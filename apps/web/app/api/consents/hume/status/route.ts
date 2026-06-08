import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ consented: false, error: 'supabase_not_configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, { global: { fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' }) } })
    const userIdHeader = request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000000'

    const { data, error } = await supabase
      .from('user_consents')
      .select('biometric_emotion_v1, consent_timestamp')
      .eq('user_id', userIdHeader)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ consented: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { consented: data?.biometric_emotion_v1 === true, timestamp: data?.consent_timestamp || null },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err: any) {
    return NextResponse.json({ consented: false, error: 'status_check_failed' }, { status: 500 })
  }
}

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const supabase = getSupabase()
  const userId = req.headers.get('x-user-id') || 'thomas'
  const { data } = await supabase
    .from('legal_consents')
    .select('health_data_consent, consent_timestamp')
    .eq('user_id', userId)
    .maybeSingle()
  return NextResponse.json({
    consented: data?.health_data_consent === true,
    timestamp: data?.consent_timestamp ?? null
  }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const userId = req.headers.get('x-user-id') || 'thomas'
  const { consented } = await req.json()
  const { error } = await supabase
    .from('legal_consents')
    .upsert({
      user_id: userId,
      health_data_consent: consented,
      consent_timestamp: new Date().toISOString(),
      consent_version: 'v1.0',
      retention_months: 24,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

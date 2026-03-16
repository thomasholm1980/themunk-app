// apps/web/app/api/pattern-memory/verify/route.ts
// Internal verification route — not user-facing
// Returns last 10 pattern memory records + last 10 log entries

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const USER_ID_TEXT = 'thomas'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: memory } = await supabase
      .from('personal_pattern_memory' as any)
      .select('pattern_key, reflection_key, occurrence_count, stability_level, confidence, first_seen_at, last_seen_at')
      .eq('user_id', USER_ID_TEXT)
      .order('updated_at', { ascending: false })
      .limit(10)

    const { data: log } = await supabase
      .from('personal_pattern_memory_log' as any)
      .select('pattern_key, reflection_key, day_key, created_at')
      .eq('user_id', USER_ID_TEXT)
      .order('day_key', { ascending: false })
      .limit(10)

    return NextResponse.json(
      { ok: true, memory: memory ?? [], log: log ?? [] },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[pattern-memory/verify] error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

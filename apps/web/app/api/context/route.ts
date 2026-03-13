export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const VALID_TAGS = [
  'work_stress',
  'family_stress',
  'travel',
  'poor_sleep',
  'illness',
  'exercise_load',
  'mental_load',
  'neutral',
] as const

type ContextTag = typeof VALID_TAGS[number]

function getOsloDayKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const day   = parts.find((p) => p.type === 'day')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const year  = parts.find((p) => p.type === 'year')?.value

  if (!year || !month || !day) throw new Error('Failed to generate Oslo day_key')
  return `${year}-${month}-${day}`
}

// GET — fetch today's context
export async function GET() {
  try {
    const supabase = getServiceClient()
    const day_key  = getOsloDayKey()

    const { data, error } = await supabase
      .from('daily_context')
      .select('context_tag, optional_note, created_at')
      .eq('user_id', 'thomas')
      .eq('day_key', day_key)
      .maybeSingle()

    if (error) {
      console.error('[context] db error', error.message)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
    }

    return NextResponse.json(
      { context: data ?? null },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[context] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

// POST — set today's context
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const tag: ContextTag = body.context_tag
    const note: string | undefined = body.optional_note

    if (!VALID_TAGS.includes(tag)) {
      return NextResponse.json({ error: 'Invalid context_tag' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
    }

    const supabase = getServiceClient()
    const day_key  = getOsloDayKey()

    const { error } = await supabase
      .from('daily_context')
      .upsert(
        {
          user_id: 'thomas',
          day_key,
          context_tag: tag,
          optional_note: note ?? null,
        },
        { onConflict: 'user_id,day_key' }
      )

    if (error) {
      console.error('[context] upsert error', error.message)
      return NextResponse.json({ error: 'Failed to save context' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
    }

    console.log('[context] saved', { day_key, tag })

    return NextResponse.json(
      { success: true, day_key, context_tag: tag },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[context] unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

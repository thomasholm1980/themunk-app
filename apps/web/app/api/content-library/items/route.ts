// apps/web/app/api/content-library/items/route.ts
// Content Intelligence Foundation V1 — retrieval
// Supports simple filters: trust_status, library_status, topic_tag, stress_tag
// Completely separate from core interpretation engine.

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

function logTelemetry(event: string, meta?: Record<string, unknown>): void {
  try { console.log('[content-library]', { event, ...meta }) } catch { /* never throws */ }
}

export async function GET(req: NextRequest) {
  try {
    const supabase     = getServiceClient()
    const { searchParams } = req.nextUrl

    const trust_status   = searchParams.get('trust_status')
    const library_status = searchParams.get('library_status')
    const topic_tag      = searchParams.get('topic_tag')
    const stress_tag     = searchParams.get('stress_tag')

    let query = supabase
      .from('content_library')
      .select('id, slug, title, summary, source_type, source_name, source_url, topic_tags, stress_tags, evidence_level, trust_status, tone_fit, audience_fit, library_status, created_at')
      .order('created_at', { ascending: false })

    if (trust_status)   query = query.eq('trust_status', trust_status)
    if (library_status) query = query.eq('library_status', library_status)
    if (topic_tag)      query = query.contains('topic_tags', [topic_tag])
    if (stress_tag)     query = query.contains('stress_tags', [stress_tag])

    const { data, error } = await query

    if (error) {
      console.error('[content-library/items] db error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }

    logTelemetry('content_library_query', {
      filters: { trust_status, library_status, topic_tag, stress_tag },
      count: data?.length ?? 0,
    })

    return NextResponse.json(
      { items: data ?? [], count: data?.length ?? 0 },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[content-library/items] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

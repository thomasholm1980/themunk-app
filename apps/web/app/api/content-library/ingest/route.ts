// apps/web/app/api/content-library/ingest/route.ts
// Content Intelligence Foundation V1 — internal ingest only
// Accepts structured JSON. No scraping. No external connectors.
// Completely separate from computeStateV2 / daily_state / Daily Brief.

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

const VALID_SOURCE_TYPES   = ['research','creator','article','study','internal_note']
const VALID_EVIDENCE       = ['low','mixed','high']
const VALID_TRUST          = ['pending','approved','rejected']
const VALID_TONE_FIT       = ['fit','not_fit']
const VALID_AUDIENCE_FIT   = ['men_under_pressure','general','unknown']
const VALID_LIBRARY_STATUS = ['hidden','available']

function logTelemetry(event: string, meta?: Record<string, unknown>): void {
  try { console.log('[content-library]', { event, ...meta }) } catch { /* never throws */ }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body     = await req.json()

    const {
      slug, title, summary,
      source_type, source_name, source_url,
      topic_tags, stress_tags,
      evidence_level, trust_status,
      tone_fit, audience_fit,
      library_status, notes,
    } = body

    // Required fields
    if (!slug || !title || !source_type) {
      logTelemetry('content_item_rejected', { reason: 'missing_required_fields', slug })
      return NextResponse.json(
        { error: 'slug, title, and source_type are required' },
        { status: 400 }
      )
    }

    // Enum validation
    if (!VALID_SOURCE_TYPES.includes(source_type)) {
      logTelemetry('content_item_rejected', { reason: 'invalid_source_type', slug })
      return NextResponse.json({ error: 'Invalid source_type' }, { status: 400 })
    }
    if (evidence_level && !VALID_EVIDENCE.includes(evidence_level)) {
      return NextResponse.json({ error: 'Invalid evidence_level' }, { status: 400 })
    }
    if (trust_status && !VALID_TRUST.includes(trust_status)) {
      return NextResponse.json({ error: 'Invalid trust_status' }, { status: 400 })
    }
    if (tone_fit && !VALID_TONE_FIT.includes(tone_fit)) {
      return NextResponse.json({ error: 'Invalid tone_fit' }, { status: 400 })
    }
    if (audience_fit && !VALID_AUDIENCE_FIT.includes(audience_fit)) {
      return NextResponse.json({ error: 'Invalid audience_fit' }, { status: 400 })
    }
    if (library_status && !VALID_LIBRARY_STATUS.includes(library_status)) {
      return NextResponse.json({ error: 'Invalid library_status' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('content_library')
      .upsert(
        {
          slug, title, summary,
          source_type,
          source_name:    source_name    ?? null,
          source_url:     source_url     ?? null,
          topic_tags:     topic_tags     ?? [],
          stress_tags:    stress_tags    ?? [],
          evidence_level: evidence_level ?? 'low',
          trust_status:   trust_status   ?? 'pending',
          tone_fit:       tone_fit       ?? 'not_fit',
          audience_fit:   audience_fit   ?? 'unknown',
          library_status: library_status ?? 'hidden',
          notes:          notes          ?? null,
          updated_at:     new Date().toISOString(),
        },
        { onConflict: 'slug' }
      )
      .select()
      .single()

    if (error) {
      console.error('[content-library/ingest] db error:', error.message)
      return NextResponse.json({ error: 'Failed to ingest item' }, { status: 500 })
    }

    logTelemetry('content_item_ingested', { slug, source_type, trust_status: data.trust_status })

    return NextResponse.json(
      { ingested: true, item: data },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[content-library/ingest] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

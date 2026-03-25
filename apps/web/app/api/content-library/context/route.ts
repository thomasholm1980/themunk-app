// apps/web/app/api/content-library/context/route.ts
// Context Surface V1 — GET
// Returns MAX ONE relevant content item based on today's active pattern.
// Separate from core interpretation engine.

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveContextSurface } from '@themunk/core/state/context-surface-v1'
import type { ContentItem } from '@themunk/core/state/context-surface-v1'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function logTelemetry(event: string, meta?: Record<string, unknown>): void {
  try { console.log('[context-surface]', { event, ...meta }) } catch { /* never throws */ }
}

export async function GET(req: NextRequest) {
  try {
    const supabase     = getServiceClient()
    const patternCode  = req.nextUrl.searchParams.get('pattern_code')

    // Fetch approved + available items
    const { data, error } = await supabase
      .from('content_library')
      .select('id, slug, title, summary, source_type, source_name, topic_tags, stress_tags, evidence_level, audience_fit')
      .eq('trust_status', 'approved')
      .eq('library_status', 'available')

    if (error) {
      console.error('[content-library/context] db error:', error.message)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const items = (data ?? []) as ContentItem[]
    const result = resolveContextSurface(patternCode, items)

    if (result.show_context_card) {
      logTelemetry('context_card_available', { pattern_code: patternCode, title: result.item.title })
    } else {
      logTelemetry('context_card_suppressed', { pattern_code: patternCode })
    }

    return NextResponse.json(
      result,
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[content-library/context] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

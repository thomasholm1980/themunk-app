// apps/web/app/api/content-library/context/route.ts
// Context Surface V1 — GET
// Returns MAX ONE relevant content item based on today's active pattern.
// Separate from core interpretation engine.

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveContextSurface, STATE_FALLBACK_SLUGS } from '@themunk/core/state/context-surface-v1'
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
    const patternCode      = req.nextUrl.searchParams.get('pattern_code')
    const state            = req.nextUrl.searchParams.get('state') ?? undefined
    const sufficientData   = req.nextUrl.searchParams.get('sufficient_data') === 'true'

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

    // Pattern-based match (primary)
    let result = resolveContextSurface(patternCode, items)

    // State-based fallback when pattern_memory is missing or insufficient
    if (!result.show_context_card && !sufficientData && state) {
      const fallbackSlug = STATE_FALLBACK_SLUGS[state] ?? null
      if (fallbackSlug) {
        const fallbackItem = items.find(i => i.slug === fallbackSlug) ?? null
        if (fallbackItem) {
          result = {
            show_context_card: true,
            item: {
              title:       fallbackItem.title,
              summary:     fallbackItem.summary,
              source_type: fallbackItem.source_type,
              source_name: fallbackItem.source_name,
              topic_tags:  fallbackItem.topic_tags,
              stress_tags: fallbackItem.stress_tags,
            },
          }
          logTelemetry('context_card_state_fallback', { state, slug: fallbackSlug })
        }
      }
    }

    if (result.show_context_card) {
      logTelemetry('context_card_available', { pattern_code: patternCode, title: result.item.title })
    } else {
      logTelemetry('context_card_suppressed', { pattern_code: patternCode, state })
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

// packages/core/state/context-surface-v1.ts
// Context Surface V1 — deterministic relevance matcher
// Selects MAX ONE content item based on active pattern + stress_tags
// No LLM. No embeddings. No external calls.
// Completely separate from computeStateV2 / daily_state.

export type EvidenceLevel  = 'low' | 'mixed' | 'high'
export type AudienceFit    = 'men_under_pressure' | 'general' | 'unknown'

export interface ContentItem {
  id:             string
  slug:           string
  title:          string
  summary:        string | null
  source_type:    string
  source_name:    string | null
  topic_tags:     string[]
  stress_tags:    string[]
  evidence_level: EvidenceLevel
  audience_fit:   AudienceFit
}

export interface ContextSurfaceResult {
  show_context_card: true
  item: Pick<ContentItem, 'title' | 'summary' | 'source_type' | 'source_name' | 'topic_tags' | 'stress_tags'>
}

export interface ContextSurfaceSuppressed {
  show_context_card: false
}

export type ContextSurfaceOutput = ContextSurfaceResult | ContextSurfaceSuppressed

// State-based fallback slugs when pattern_memory is empty
// YELLOW/RED → one quiet support item. GREEN → nothing.
export const STATE_FALLBACK_SLUGS: Record<string, string | null> = {
  RED:    'seed-stress-accumulation-005',
  YELLOW: 'seed-stress-accumulation-005',
  GREEN:  null,
}

// Pattern → stress_tag mapping
const PATTERN_TAG_MAP: Record<string, string[]> = {
  repeated_elevated_stress: ['chronic_stress', 'allostatic_load', 'physiological', 'work_stress'],
  day_drift_negative:       ['sleep_debt', 'recovery', 'regulation', 'acute_stress'],
}

// Evidence level priority
const EVIDENCE_PRIORITY: Record<EvidenceLevel, number> = {
  high: 3, mixed: 2, low: 1,
}

// Audience fit priority
const AUDIENCE_PRIORITY: Record<AudienceFit, number> = {
  men_under_pressure: 3, general: 2, unknown: 1,
}

function countTagMatches(itemTags: string[], targetTags: string[]): number {
  return itemTags.filter(t => targetTags.includes(t)).length
}

export function resolveContextSurface(
  patternCode:   string | null,
  items:         ContentItem[]
): ContextSurfaceOutput {
  // Gate 1 — need an active pattern
  if (!patternCode) return { show_context_card: false }

  // Gate 2 — need a tag mapping for this pattern
  const targetTags = PATTERN_TAG_MAP[patternCode]
  if (!targetTags || targetTags.length === 0) return { show_context_card: false }

  // Score each item
  const scored = items
    .map(item => ({
      item,
      tagMatches:      countTagMatches(item.stress_tags, targetTags),
      evidencePriority: EVIDENCE_PRIORITY[item.evidence_level] ?? 1,
      audiencePriority: AUDIENCE_PRIORITY[item.audience_fit]   ?? 1,
    }))
    .filter(s => s.tagMatches > 0) // Gate 3 — at least one tag match

  if (scored.length === 0) return { show_context_card: false }

  // Sort: tag matches → evidence → audience
  scored.sort((a, b) => {
    if (b.tagMatches      !== a.tagMatches)      return b.tagMatches      - a.tagMatches
    if (b.evidencePriority !== a.evidencePriority) return b.evidencePriority - a.evidencePriority
    return b.audiencePriority - a.audiencePriority
  })

  const best = scored[0].item

  return {
    show_context_card: true,
    item: {
      title:       best.title,
      summary:     best.summary,
      source_type: best.source_type,
      source_name: best.source_name,
      topic_tags:  best.topic_tags,
      stress_tags: best.stress_tags,
    },
  }
}

// apps/web/lib/brief_cache.ts
// Per-user/day brief cache + call cap.

import { supabase } from './supabase';
import type { DailyBrief } from '@themunk/core';

const MAX_GENERATIONS_PER_DAY = parseInt(
  process.env.BRIEF_MAX_GENERATIONS ?? '5',
  10,
);

export interface CacheResult {
  brief: DailyBrief | null;
  generation_count: number;
  cache_hit: boolean;
  cap_triggered: boolean;
}

export async function getCachedBrief(
  user_id: string,
  day_key: string,
): Promise<CacheResult> {
  const { data, error } = await supabase
    .from('daily_briefs')
    .select('brief, generation_count')
    .eq('user_id', user_id)
    .eq('day_key', day_key)
    .maybeSingle();

  if (error) {
    console.error('brief_cache_read_failed', error.message);
  }

  if (!data) {
    return { brief: null, generation_count: 0, cache_hit: false, cap_triggered: false };
  }

  const cap_triggered = data.generation_count >= MAX_GENERATIONS_PER_DAY;

  return {
    brief: data.brief as DailyBrief,
    generation_count: data.generation_count,
    cache_hit: true,
    cap_triggered,
  };
}

export async function saveBrief(
  user_id: string,
  day_key: string,
  brief: DailyBrief,
  generation_count: number,
): Promise<void> {
  const { error } = await supabase.from('daily_briefs').upsert(
    {
      user_id,
      day_key,
      brief,
      generation_count,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,day_key' }
  );

  if (error) {
    console.error('brief_cache_write_failed', error.message);
  }
}

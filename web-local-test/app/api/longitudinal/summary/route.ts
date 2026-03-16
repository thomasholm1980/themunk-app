import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { resolveUserId, getOsloDateKey } from '../../../../lib/request-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId  = resolveUserId(req);
  const dayKey  = getOsloDateKey();

  const { data, error } = await supabase
    .from('longitudinal_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .in('window_type', ['7d', '14d']);

  if (error) {
    console.error('[longitudinal/summary] error', { userId, error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { data: null, message: 'No longitudinal summary available yet.' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const windows: Record<string, unknown> = {};
  for (const row of data) {
    windows[row.window_type] = row;
  }

  return NextResponse.json(
    { day_key: dayKey, windows },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

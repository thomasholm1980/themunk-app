import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase';
import { resolveUserId } from '../../../../lib/request-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient();

  let userId: string;
  try {
    userId = await resolveUserId(req, supabase);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('longitudinal_summary')
    .select('*')
    .eq('user_id', userId)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[longitudinal/summary] error', { userId, error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { data: null, message: 'No longitudinal summary available yet.' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
}

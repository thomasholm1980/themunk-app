export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const USER_ID = 'thomas'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const { content_id } = await req.json()
  if (!content_id) return NextResponse.json({ error: 'mangler content_id' }, { status: 400 })
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('saved_content')
    .upsert({ user_id: USER_ID, content_id }, { onConflict: 'user_id,content_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { content_id } = await req.json()
  if (!content_id) return NextResponse.json({ error: 'mangler content_id' }, { status: 400 })
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('saved_content')
    .delete()
    .eq('user_id', USER_ID)
    .eq('content_id', content_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('saved_content')
    .select('content_id')
    .eq('user_id', USER_ID)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ saved: data?.map(r => r.content_id) ?? [] })
}

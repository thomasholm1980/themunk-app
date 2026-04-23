export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { makeOuraTokenStore } from '../../../../../lib/oura-token'

export async function GET() {
  try {
    const tokenStore = makeOuraTokenStore()
    const token = await tokenStore.getAccessTokenWithRefresh('thomas')
    return NextResponse.json({ 
      ok: true, 
      has_token: !!token,
      token_prefix: token ? token.substring(0, 8) : null
    })
  } catch (err) {
    return NextResponse.json({ 
      ok: false, 
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : null
    }, { status: 500 })
  }
}

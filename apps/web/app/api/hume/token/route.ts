import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiKey = process.env.HUME_API_KEY
  const secretKey = process.env.HUME_SECRET_KEY

  if (!apiKey || !secretKey) {
    return NextResponse.json({ error: 'hume_not_configured' }, { status: 500 })
  }

  try {
    const credentials = Buffer.from(apiKey + ':' + secretKey).toString('base64')
    const res = await fetch('https://api.hume.ai/oauth2-cc/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + credentials
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'hume_auth_failed', status: res.status }, { status: res.status })
    }

    const data = await res.json()

    if (!data.access_token) {
      return NextResponse.json({ error: 'no_access_token' }, { status: 500 })
    }

    return NextResponse.json(
      { access_token: data.access_token, expires_in: data.expires_in },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err: any) {
    return NextResponse.json({ error: 'token_fetch_failed' }, { status: 500 })
  }
}

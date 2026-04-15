import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const apiKey = process.env.HUME_API_KEY
  const secretKey = process.env.HUME_SECRET_KEY
  if (!apiKey || !secretKey) {
    return NextResponse.json({ error: 'Hume keys not configured', hasApi: !!apiKey, hasSecret: !!secretKey }, { status: 500 })
  }
  try {
    const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString('base64')
    const res = await fetch('https://api.hume.ai/oauth2-cc/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials'
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Hume auth failed', status: res.status, detail: text.slice(0, 200) }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json({ token: data.access_token })
  } catch (err: any) {
    return NextResponse.json({ error: 'Token fetch failed', detail: err.message }, { status: 500 })
  }
}

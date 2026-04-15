import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiKey = process.env.HUME_API_KEY
  const secretKey = process.env.HUME_SECRET_KEY

  if (!apiKey || !secretKey) {
    return NextResponse.json({ error: 'Hume keys not configured' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.hume.ai/oauth2-cc/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${apiKey}:${secretKey}`).toString('base64')
      },
      body: 'grant_type=client_credentials'
    })
    const data = await res.json()
    return NextResponse.json({ token: data.access_token })
  } catch {
    return NextResponse.json({ error: 'Token fetch failed' }, { status: 500 })
  }
}

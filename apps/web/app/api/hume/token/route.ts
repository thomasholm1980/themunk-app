import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const apiKey = process.env.HUME_API_KEY
  const secretKey = process.env.HUME_SECRET_KEY
  if (!apiKey || !secretKey) {
    return NextResponse.json({ error: 'keys missing' }, { status: 500 })
  }
  try {
    const credentials = Buffer.from(apiKey + ':' + secretKey).toString('base64')
    const res = await fetch('https://api.hume.ai/oauth2-cc/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + credentials
      },
      body: 'grant_type=client_credentials'
    })
    const raw = await res.text()
    if (!res.ok) {
      return NextResponse.json({ error: 'hume_rejected', status: res.status, body: raw.slice(0, 500) }, { status: res.status })
    }
    const data = JSON.parse(raw)
    const tokenLength = (data.access_token || '').length
    return NextResponse.json({ token: data.access_token, token_length: tokenLength, keys_in_response: Object.keys(data) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

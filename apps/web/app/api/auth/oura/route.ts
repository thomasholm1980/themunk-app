export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.OURA_CLIENT_ID!
  const redirectUri = process.env.OURA_REDIRECT_URI!

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'daily sleep heartrate workout tag session spo2 stress',
  })

  const ouraAuthUrl = `https://cloud.ouraring.com/oauth/authorize?${params.toString()}`

  return NextResponse.redirect(ouraAuthUrl)
}

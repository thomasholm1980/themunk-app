// apps/web/app/api/auth/oura/start/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.OURA_CLIENT_ID;
  const redirectUri = process.env.OURA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'email personal daily heartrate workout tag session',
  });

  const authUrl = `https://cloud.ouraring.com/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}

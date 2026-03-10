import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function refreshAccessToken(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('oura_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single()

  if (!data?.refresh_token) return null

  const res = await fetch('https://api.ouraring.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: data.refresh_token,
      client_id: process.env.OURA_CLIENT_ID!,
      client_secret: process.env.OURA_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) {
    console.error('[oura-token] refresh failed', await res.text())
    return null
  }

  const tokens = await res.json() as Record<string, string>

  await supabase
    .from('oura_tokens')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? data.refresh_token,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  return tokens.access_token
}

export function makeOuraTokenStore() {
  return {
    getAccessToken: async (userId: string): Promise<string | null> => {
      const { data } = await supabase
        .from('oura_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .single()
      return data?.access_token ?? null
    },

    getAccessTokenWithRefresh: async (userId: string): Promise<string | null> => {
      const { data } = await supabase
        .from('oura_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .single()

      if (!data?.access_token) return null

      // Test token with a lightweight endpoint
      const testRes = await fetch(
        'https://api.ouraring.com/v2/usercollection/personal_info',
        { headers: { Authorization: `Bearer ${data.access_token}` } }
      )

      if (testRes.status === 401) {
        console.log('[oura-token] token expired, refreshing...')
        return await refreshAccessToken(userId)
      }

      return data.access_token
    },
  }
}

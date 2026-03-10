export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'

export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.themunk.ai'

  const res = await fetch(`${baseUrl}/api/wearables/oura/sync`, {
    method: 'POST',
  })

  const data = await res.json()

  return NextResponse.json(
    { triggered: true, result: data },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

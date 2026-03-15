export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    has_openai_key: !!process.env.OPENAI_API_KEY,
    openai_key_length: process.env.OPENAI_API_KEY?.length ?? 0,
  })
}

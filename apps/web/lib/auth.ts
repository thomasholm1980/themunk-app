// apps/web/lib/auth.ts
// MVP auth guard. Phase 1: trusts x-user-id header.
// Phase 2: replace with Supabase JWT verification.

import { NextRequest, NextResponse } from "next/server";

export interface AuthContext {
  userId: string;
}

export function getAuthContext(req: NextRequest): AuthContext | NextResponse {
  // Phase 1: simple header-based identity (no crypto verification)
  // Replace with Supabase JWT in Phase 2
  const userId = req.headers.get("x-user-id");

  if (!userId || userId.trim() === "") {
    return NextResponse.json(
      { error: "Unauthorized", message: "x-user-id header required" },
      { status: 401 }
    );
  }

  return { userId };
}

export function isAuthError(ctx: AuthContext | NextResponse): ctx is NextResponse {
  return ctx instanceof NextResponse;
}

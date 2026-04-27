import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length ?? 0,
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.length ?? 0,
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 8) ?? null,
    hasKeycloakUrl: !!process.env.KEYCLOAK_URL,
    hasKeycloakAdmin: !!process.env.KEYCLOAK_ADMIN_PASSWORD,
    nodeEnv: process.env.NODE_ENV,
  })
}

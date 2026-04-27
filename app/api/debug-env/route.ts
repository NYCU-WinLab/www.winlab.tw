import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    WL_SUPABASE_URL: !!process.env.WL_SUPABASE_URL,
    WL_SUPABASE_KEY: !!process.env.WL_SUPABASE_KEY,
    WL_AUTH_URL: !!process.env.WL_AUTH_URL,
    WL_AUTH_KEY: !!process.env.WL_AUTH_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    KEYCLOAK_URL: !!process.env.KEYCLOAK_URL,
    KEYCLOAK_ADMIN_CLIENT_ID: !!process.env.KEYCLOAK_ADMIN_CLIENT_ID,
    KEYCLOAK_ADMIN_CLIENT_SECRET: !!process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    allKeys: Object.keys(process.env)
      .filter(
        (k) =>
          !k.startsWith("__") &&
          !k.startsWith("npm_") &&
          !k.startsWith("AWS_") &&
          !k.startsWith("LD_")
      )
      .sort(),
  })
}

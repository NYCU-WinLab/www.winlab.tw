type SupabaseConfig = {
  url: string
  key: string
}

function readEnv(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]
    if (value) return value
  }
}

function readServerSupabaseConfig(): SupabaseConfig | null {
  const url = readEnv([
    "SUPABASE_URL",
    "WL_AUTH_URL",
    "WL_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
  ])
  const key = readEnv([
    "SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "WL_AUTH_KEY",
    "WL_SUPABASE_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
  ])

  if (!url || !key) {
    return null
  }

  return { url, key }
}

function readBrowserSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!url || !key) {
    return null
  }

  return { url, key }
}

export function getSupabaseConfig() {
  return readServerSupabaseConfig()
}

export function getBrowserSupabaseConfig() {
  return readBrowserSupabaseConfig()
}

export function hasSupabaseConfig() {
  return readServerSupabaseConfig() !== null
}

export function requireSupabaseConfig() {
  const config = readServerSupabaseConfig()

  if (!config) {
    throw new Error(
      "Missing Supabase auth config: set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel runtime env"
    )
  }

  return config
}

export function requireBrowserSupabaseConfig() {
  const config = readBrowserSupabaseConfig()

  if (!config) {
    throw new Error(
      "Missing public Supabase config: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
    )
  }

  return config
}

const DEFAULT_SUPABASE_URL = "https://yissfqcdmzsxwfnzrflz.supabase.co"
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_jwDS4JBmgcomECdzHVitaQ_jS6Z2ioZ"

export function getSupabaseConfig() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  return {
    url: supabaseUrl,
    key: supabaseKey,
  }
}

export function hasSupabaseConfig() {
  return getSupabaseConfig() !== null
}

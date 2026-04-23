export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

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

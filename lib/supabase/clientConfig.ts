// Client-safe check — unlike lib/env.ts's isSupabaseConfigured(), this only
// looks at NEXT_PUBLIC_* vars, since SUPABASE_SERVICE_ROLE_KEY is never
// available in the browser bundle.
export function isSupabaseConfiguredClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

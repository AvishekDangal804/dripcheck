import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

// Anon-key client for server components/actions, respecting the signed-in
// user's session via cookies. Used for reads and for RLS-gated writes
// (likes, saves). Never used for fit_checks/leaderboard_entries writes —
// those go through lib/supabase/admin.ts. See supabase/policies.sql.
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render; middleware refreshes
            // the session instead. Safe to ignore.
          }
        },
      },
    }
  );
}

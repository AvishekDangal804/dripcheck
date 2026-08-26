import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client. NEVER import this from a "use client" file or from
// anything under components/ or hooks/ — the `server-only` import above
// makes that a build-time error, not just a convention.
//
// This is the ONLY client allowed to write fit_checks / leaderboard_entries
// / storage.objects in the fit-checks bucket, which is why those tables
// have no insert policy for anon/authenticated roles (supabase/policies.sql).
let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return adminClient;
}

import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mockStore } from "@/lib/mockStore";
import type { Outfit } from "@/types/database";
import type { DiscoverTab } from "@/types/outfit";

// "trending" and "popular" currently fall back to the same score-led
// ordering as "highest-rated" — there is no engagement signal to rank by
// yet. Once likes are wired up (Phase 6), "popular" should order by like
// count and "trending" by a recency-weighted like count.
function sortForTab(outfits: Outfit[], tab: DiscoverTab): Outfit[] {
  const sorted = [...outfits];
  switch (tab) {
    case "newest":
      return sorted.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    case "highest-rated":
    case "trending":
    case "popular":
    default:
      return sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }
}

export async function listOutfits(tab: DiscoverTab): Promise<Outfit[]> {
  if (!isSupabaseConfigured()) {
    return sortForTab(mockStore.listOutfits(), tab);
  }

  const { data, error } = await getSupabaseAdminClient().from("outfits").select("*");
  if (error) throw new Error(`Failed to load outfits: ${error.message}`);
  return sortForTab((data ?? []) as Outfit[], tab);
}

// Uses the cookie-bound client, not admin — RLS ("users read their own
// saves") is what scopes this to the signed-in user, so there's no need to
// pass/trust a userId from the caller.
export async function listSavedOutfitsForCurrentUser(): Promise<Outfit[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("saved_outfits").select("outfit:outfits(*)");
  if (error) throw new Error(`Failed to load saved outfits: ${error.message}`);

  return ((data ?? []) as unknown as { outfit: Outfit }[]).map((row) => row.outfit).filter(Boolean);
}

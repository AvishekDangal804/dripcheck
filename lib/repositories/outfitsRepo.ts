import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
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

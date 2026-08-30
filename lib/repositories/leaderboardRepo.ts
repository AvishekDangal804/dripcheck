import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { mockStore } from "@/lib/mockStore";
import type { LeaderboardEntry, RankedLeaderboardEntry } from "@/types/database";

export async function insertLeaderboardEntry(
  data: Omit<LeaderboardEntry, "id" | "created_at">
): Promise<LeaderboardEntry> {
  if (!isSupabaseConfigured()) {
    return mockStore.insertLeaderboardEntry(data);
  }

  const { data: row, error } = await getSupabaseAdminClient()
    .from("leaderboard_entries")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`Failed to record leaderboard entry: ${error.message}`);
  return row as LeaderboardEntry;
}

export async function getTodayLeaderboard(): Promise<RankedLeaderboardEntry[]> {
  if (!isSupabaseConfigured()) {
    return mockStore.getTodayLeaderboard();
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("daily_leaderboard_view")
    .select("*")
    .order("rank", { ascending: true });

  // Never let a leaderboard read failure white-screen Home / Leaderboard.
  if (error) {
    console.error("[leaderboard] read failed", error.message);
    return [];
  }
  return (data ?? []) as RankedLeaderboardEntry[];
}

export async function getTodayTop3(): Promise<RankedLeaderboardEntry[]> {
  return (await getTodayLeaderboard()).slice(0, 3);
}

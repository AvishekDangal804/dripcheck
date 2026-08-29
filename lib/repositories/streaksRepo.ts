import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mockStore } from "@/lib/mockStore";
import type { Streak } from "@/types/database";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD, UTC
}

function daysBetween(fromKey: string, toKey: string): number {
  const from = Date.parse(`${fromKey}T00:00:00Z`);
  const to = Date.parse(`${toKey}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/**
 * Pure streak transition — exported so it can be unit-tested without a DB.
 * A streak advances on the FIRST successful fit check of a new day:
 *  - no prior check .............. current = 1
 *  - last check was today ........ unchanged (multiple checks/day don't stack)
 *  - last check was yesterday .... current + 1
 *  - last check was older ........ reset to 1
 */
export function nextStreak(
  prev: Pick<Streak, "current_streak" | "longest_streak" | "last_check_date"> | null,
  todayKey: string
): { current_streak: number; longest_streak: number; last_check_date: string } {
  if (!prev || !prev.last_check_date) {
    return { current_streak: 1, longest_streak: Math.max(1, prev?.longest_streak ?? 0), last_check_date: todayKey };
  }

  const gap = daysBetween(prev.last_check_date, todayKey);
  let current: number;
  if (gap <= 0) current = prev.current_streak; // same day (or clock skew) — no change
  else if (gap === 1) current = prev.current_streak + 1;
  else current = 1;

  return {
    current_streak: current,
    longest_streak: Math.max(prev.longest_streak, current),
    last_check_date: gap <= 0 ? prev.last_check_date : todayKey,
  };
}

export async function getStreakForCurrentUser(): Promise<Streak | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load streak: ${error.message}`);
  return (data as Streak) ?? null;
}

/**
 * Called server-side after a successful fit check by a logged-in user.
 * Idempotent within a day.
 */
export async function recordDailyCheck(userId: string): Promise<Streak> {
  const todayKey = toDateKey(new Date());

  if (!isSupabaseConfigured()) {
    const prev = mockStore.getStreak(userId);
    const next = nextStreak(prev, todayKey);
    return mockStore.saveStreak({ user_id: userId, ...next, updated_at: new Date().toISOString() });
  }

  const admin = getSupabaseAdminClient();
  const { data: prev, error: readError } = await admin
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw new Error(`Failed to read streak: ${readError.message}`);

  const next = nextStreak((prev as Streak) ?? null, todayKey);

  const { data, error } = await admin
    .from("streaks")
    .upsert(
      { user_id: userId, ...next, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to update streak: ${error.message}`);
  return data as Streak;
}

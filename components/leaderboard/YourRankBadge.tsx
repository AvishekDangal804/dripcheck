"use client";

import { useEffect, useState } from "react";
import { formatScore } from "@/lib/utils";
import type { RankedLeaderboardEntry } from "@/types/database";

export function YourRankBadge({ entries }: { entries: RankedLeaderboardEntry[] }) {
  const [yourEntry, setYourEntry] = useState<RankedLeaderboardEntry | null>(null);

  // Reads localStorage after mount, not during the lazy initializer, so the
  // client's first render matches the server's (no localStorage there) and
  // React doesn't flag a hydration mismatch. This is exactly the "read from
  // an external system on mount" case the set-state-in-effect rule expects.
  useEffect(() => {
    let lastFitCheckId: string | null = null;
    try {
      lastFitCheckId = localStorage.getItem("dripcheck:lastFitCheckId");
    } catch {
      return;
    }
    if (!lastFitCheckId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYourEntry(entries.find((entry) => entry.fit_check_id === lastFitCheckId) ?? null);
  }, [entries]);

  if (!yourEntry) return null;

  return (
    <div className="mt-6 rounded-sm border border-accent-200 bg-accent-50 px-5 py-3 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-accent-600">Your Rank</p>
      <p className="mt-1 font-display text-2xl text-accent-700">
        #{yourEntry.rank} &middot; {formatScore(yourEntry.score)}
      </p>
    </div>
  );
}

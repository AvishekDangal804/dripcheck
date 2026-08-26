import Link from "next/link";
import { formatScore } from "@/lib/utils";
import type { RankedLeaderboardEntry } from "@/types/database";

const MEDALS = ["🥇", "🥈", "🥉"];

export function TopThreeWidget({ entries }: { entries: RankedLeaderboardEntry[] }) {
  return (
    <div className="w-full max-w-xs rounded-sm border border-stone/60 bg-warm-white/95 p-5 shadow-[0_8px_30px_-12px_rgba(28,23,18,0.25)] backdrop-blur">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-500">Today&rsquo;s Top 3</p>

      {entries.length === 0 ? (
        <p className="text-sm text-near-black/50">No fit checks yet today. Be the first.</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, index) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 truncate">
                <span aria-hidden>{MEDALS[index]}</span>
                <span className="truncate text-near-black">{entry.participant_name}</span>
              </span>
              <span className="font-display text-accent-600">{formatScore(entry.score)}</span>
            </li>
          ))}
        </ol>
      )}

      <Link href="/leaderboard" className="mt-4 block text-xs uppercase tracking-wide text-accent-600 hover:underline">
        Full leaderboard →
      </Link>
    </div>
  );
}

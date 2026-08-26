import { formatScore, formatTime } from "@/lib/utils";
import type { RankedLeaderboardEntry } from "@/types/database";

export function RankedList({ entries }: { entries: RankedLeaderboardEntry[] }) {
  if (entries.length === 0) {
    return <p className="mt-6 text-center text-near-black/50">No more entries yet.</p>;
  }

  return (
    <ol className="mt-8 divide-y divide-stone/60 border-y border-stone/60">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
          <span className="w-8 font-display text-lg text-near-black/40">#{entry.rank}</span>
          <span className="flex-1 truncate text-near-black">{entry.participant_name}</span>
          <span className="hidden w-32 text-sm text-near-black/50 md:block">{entry.style ?? "—"}</span>
          <span className="w-16 text-sm text-near-black/40">{formatTime(entry.created_at)}</span>
          <span className="w-14 text-right font-display text-lg text-accent-600">{formatScore(entry.score)}</span>
        </li>
      ))}
    </ol>
  );
}

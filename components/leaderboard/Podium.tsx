import { formatScore } from "@/lib/utils";
import type { RankedLeaderboardEntry } from "@/types/database";

const ORDER = [2, 1, 3];
const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const HEIGHTS: Record<number, string> = { 1: "h-40", 2: "h-32", 3: "h-24" };

export function Podium({ entries }: { entries: RankedLeaderboardEntry[] }) {
  const byRank = new Map(entries.map((entry) => [entry.rank, entry]));

  return (
    <div className="flex items-end justify-center gap-4 md:gap-8">
      {ORDER.map((rank) => {
        const entry = byRank.get(rank);
        return (
          <div key={rank} className="flex w-28 flex-col items-center gap-2 md:w-36">
            <span className="text-2xl" aria-hidden>
              {MEDALS[rank]}
            </span>
            <p className="truncate text-sm font-medium text-near-black">{entry?.participant_name ?? "—"}</p>
            <p className="font-display text-xl text-accent-600">{entry ? formatScore(entry.score) : "--"}</p>
            <div className={`w-full rounded-t-sm bg-accent-50 ${HEIGHTS[rank]}`} />
          </div>
        );
      })}
    </div>
  );
}

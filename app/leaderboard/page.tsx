import { PageShell } from "@/components/layout/PageShell";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { Podium } from "@/components/leaderboard/Podium";
import { RankedList } from "@/components/leaderboard/RankedList";
import { YourRankBadge } from "@/components/leaderboard/YourRankBadge";
import { getTodayLeaderboard } from "@/lib/repositories/leaderboardRepo";

export default async function LeaderboardPage() {
  const entries = await getTodayLeaderboard();
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <PageShell className="py-14 md:py-20">
      <EditorialHeading eyebrow="Today's Drip" as="h1" className="text-center mx-auto">
        Leaderboard
      </EditorialHeading>

      {entries.length === 0 ? (
        <p className="mt-10 text-center text-near-black/50">No fit checks yet today. Be the first to check yours.</p>
      ) : (
        <div className="mt-12">
          <Podium entries={top3} />
          <RankedList entries={rest} />
        </div>
      )}

      <YourRankBadge entries={entries} />
    </PageShell>
  );
}

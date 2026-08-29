import { Hero } from "@/components/home/Hero";
import { LiveFitCheckTeaser } from "@/components/home/LiveFitCheckTeaser";
import { WearTodayTeaser } from "@/components/home/WearTodayTeaser";
import { TrendingFits } from "@/components/home/TrendingFits";
import { StyleInspiration } from "@/components/home/StyleInspiration";
import { WhyDripCheck } from "@/components/home/WhyDripCheck";
import { getTodayTop3 } from "@/lib/repositories/leaderboardRepo";

// Today's Top 3 must reflect fit checks taken since the last deploy, so this
// page can never be build-time static.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const top3 = await getTodayTop3();

  return (
    <>
      <Hero top3={top3} />
      <LiveFitCheckTeaser />
      <WearTodayTeaser />
      <TrendingFits />
      <StyleInspiration />
      <WhyDripCheck />
    </>
  );
}

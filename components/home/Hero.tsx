import { Button } from "@/components/ui/Button";
import { EditorialVisual } from "@/components/ui/EditorialVisual";
import { TopThreeWidget } from "@/components/home/TopThreeWidget";
import type { RankedLeaderboardEntry } from "@/types/database";

export function Hero({ top3 }: { top3: RankedLeaderboardEntry[] }) {
  return (
    <section className="relative border-b border-stone/60 bg-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-2 md:items-center md:gap-12 md:px-8 md:py-20">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-accent-500">DRIPCHECK</p>
          <h1 className="font-display text-5xl leading-[1.05] text-near-black md:text-6xl">
            What&rsquo;s the verdict on your fit?
          </h1>
          <p className="mt-6 max-w-md text-base text-near-black/70">
            Check your outfit with AI, discover your style and see how your fit stacks up.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/live" size="lg">
              Live Fit Check
            </Button>
            <Button href="/live?mode=upload" variant="secondary" size="lg">
              Upload a Fit
            </Button>
          </div>
        </div>

        <div className="relative">
          <EditorialVisual
            seed="hero"
            label="Today's fit check"
            className="aspect-[4/5] w-full rounded-sm md:aspect-[3/4]"
          />
          <div className="mt-4 md:absolute md:-top-6 md:right-0 md:mt-0 md:translate-x-6">
            <TopThreeWidget entries={top3} />
          </div>
        </div>
      </div>
    </section>
  );
}

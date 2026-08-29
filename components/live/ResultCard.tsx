import { Button } from "@/components/ui/Button";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { TopThreeCelebration } from "@/components/live/TopThreeCelebration";
import { StreakBadge } from "@/components/StreakBadge";
import { CATEGORY_KEYS, CATEGORY_LABELS } from "@/types/fit-analysis";
import { formatScore } from "@/lib/utils";
import type { AnalyzeFitResult } from "@/hooks/useLiveCheckMachine";

interface ResultCardProps {
  participantName: string;
  result: AnalyzeFitResult;
  onNextFit: () => void;
}

export function ResultCard({ participantName, result, onNextFit }: ResultCardProps) {
  const { analysis, leaderboard } = result;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-16 text-center">
      <p className="text-sm uppercase tracking-wide text-near-black/50">{participantName}</p>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-500">Drip Score</p>
        <ScoreBadge score={analysis.overallScore} size="lg" className="mt-2" />
      </div>

      <p className="font-display text-2xl text-near-black">{analysis.style}</p>
      <p className="max-w-md text-near-black/70">{analysis.description}</p>

      {analysis.disclosure && (
        <p className="rounded-full bg-beige px-4 py-2 text-xs text-near-black/70">{analysis.disclosure}</p>
      )}

      <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-3 text-left sm:grid-cols-3">
        {CATEGORY_KEYS.map((key) => {
          const category = analysis.categories[key];
          return (
            <div key={key} className="border-b border-stone/60 pb-2">
              <dt className="text-xs uppercase tracking-wide text-near-black/50">{CATEGORY_LABELS[key]}</dt>
              <dd className="font-display text-lg text-near-black">
                {category.visible ? formatScore(category.score!) : <span className="text-sm text-near-black/40">Not visible</span>}
              </dd>
            </div>
          );
        })}
      </dl>

      {analysis.suggestions.length > 0 && (
        <div className="w-full text-left">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent-500">Suggestions</p>
          <ul className="space-y-1 text-sm text-near-black/70">
            {analysis.suggestions.map((suggestion) => (
              <li key={suggestion}>&bull; {suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-near-black/40">Scores are based only on what the camera can see.</p>

      <TopThreeCelebration rank={leaderboard.rank} />

      {result.streak && result.streak.current > 0 && (
        <StreakBadge current={result.streak.current} longest={result.streak.longest} />
      )}

      <Button onClick={onNextFit} size="lg">
        Next Fit
      </Button>
    </div>
  );
}

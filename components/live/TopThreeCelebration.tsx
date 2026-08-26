const RANK_COPY: Record<number, string> = {
  1: "🏆 NEW #1",
  2: "🥈 YOU'RE #2 TODAY",
  3: "🥉 YOU'RE #3 TODAY",
};

export function TopThreeCelebration({ rank }: { rank: number | null }) {
  if (!rank || rank > 3) return null;

  return (
    <div className="rounded-sm border border-accent-200 bg-accent-50 px-5 py-3 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-accent-600">🔥 You made the Top 3</p>
      <p className="mt-1 font-display text-2xl text-accent-700">{RANK_COPY[rank]}</p>
    </div>
  );
}

"use client";

const MILESTONES = [30, 14, 7, 3];

export function milestoneFor(current: number): number | null {
  return MILESTONES.find((m) => current >= m) ?? null;
}

interface StreakBadgeProps {
  current: number;
  longest?: number;
}

export function StreakBadge({ current, longest }: StreakBadgeProps) {
  if (current <= 0) return null;
  const milestone = milestoneFor(current);

  return (
    <div className="streak-pop rounded-sm border border-accent-200 bg-accent-50 px-5 py-3 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-accent-600">🔥 Fit Check Streak</p>
      <p className="mt-1 font-display text-2xl text-accent-700">
        {current} day{current === 1 ? "" : "s"}
      </p>
      {milestone && (
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-accent-500">🔥 {milestone}-day milestone</p>
      )}
      {typeof longest === "number" && longest > current && (
        <p className="mt-0.5 text-[11px] text-near-black/40">Longest: {longest} days</p>
      )}
      <style>{`
        @keyframes streakPop { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .streak-pop { animation: streakPop 0.45s ease-out; }
        @media (prefers-reduced-motion: reduce) { .streak-pop { animation: none; } }
      `}</style>
    </div>
  );
}

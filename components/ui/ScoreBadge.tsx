import { cn } from "@/lib/utils";
import { formatScore } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "lg";
  className?: string;
}

export function ScoreBadge({ score, size = "sm", className }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-full border border-accent-200 bg-accent-50 font-display text-accent-700",
        size === "lg" ? "px-4 py-2 text-2xl" : "px-3 py-1 text-sm",
        className
      )}
    >
      {formatScore(score)}
    </span>
  );
}

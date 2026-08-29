import { cn } from "@/lib/utils";
import type { FramingStatus } from "@/hooks/useFramingHeuristic";

const COPY: Record<FramingStatus, string> = {
  checking: "Step into the frame.",
  insufficient: "Step back so we can see your full fit.",
  ready: "Perfect. Ready?",
};

export function FramingOverlay({ status }: { status: FramingStatus }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-6 pb-28">
      <span className="rounded-full bg-near-black/60 px-3 py-1 text-xs uppercase tracking-wide text-warm-white">
        Full Fit Check
      </span>

      <div
        className={cn(
          "h-[70%] w-[60%] max-w-xs rounded-[2rem] border-2 transition-colors duration-300",
          status === "ready" ? "border-accent-400" : "border-warm-white/70"
        )}
      />

      <p className="rounded-full bg-near-black/60 px-4 py-2 text-sm text-warm-white">{COPY[status]}</p>
    </div>
  );
}

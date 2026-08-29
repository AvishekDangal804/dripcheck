"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { FramingOverlay } from "@/components/live/FramingOverlay";
import { CountdownOverlay } from "@/components/live/CountdownOverlay";
import { AnalyzingOverlay } from "@/components/live/AnalyzingOverlay";
import { useFullscreen } from "@/hooks/useFullscreen";
import type { FramingStatus } from "@/hooks/useFramingHeuristic";

interface CameraStageProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  phase: "framing" | "ready" | "countdown" | "analyzing";
  framingStatus: FramingStatus;
  countdownCount: number;
  onConfirmReady: () => void;
}

export function CameraStage({ videoRef, phase, framingStatus, countdownCount, onConfirmReady }: CameraStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(containerRef);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden bg-near-black md:aspect-[4/3] md:max-w-2xl"
    >
      {/* Natural camera stream — no digital zoom, object-fit is only for
          filling the container, never cropping in aggressively. */}
      <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />

      {(phase === "framing" || phase === "ready") && <FramingOverlay status={framingStatus} />}
      {phase === "countdown" && <CountdownOverlay count={countdownCount} />}
      {phase === "analyzing" && <AnalyzingOverlay />}

      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-4 rounded-full bg-near-black/60 px-3 py-1.5 text-xs uppercase tracking-wide text-warm-white"
      >
        {isFullscreen ? "Exit Full Screen" : "Full Screen"}
      </button>

      {/* Manual capture is always available while the camera is live — the
          framing heuristic only *suggests* when you're well positioned, it
          must never be the only way to take the shot (many webcams never
          trip it). */}
      {(phase === "framing" || phase === "ready") && (
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2">
          <Button onClick={onConfirmReady} size="lg">
            {phase === "ready" ? "Perfect — Take the Shot" : "Take the Shot"}
          </Button>
          {phase === "framing" && (
            <span className="rounded-full bg-near-black/60 px-3 py-1 text-[11px] uppercase tracking-wide text-warm-white/80">
              Tap when you&rsquo;re in frame
            </span>
          )}
        </div>
      )}
    </div>
  );
}

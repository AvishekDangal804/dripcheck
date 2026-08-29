"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { FramingOverlay } from "@/components/live/FramingOverlay";
import { ScanningOverlay } from "@/components/live/ScanningOverlay";
import { AnalyzingOverlay } from "@/components/live/AnalyzingOverlay";
import { useFullscreen } from "@/hooks/useFullscreen";
import type { FramingStatus } from "@/hooks/useFramingHeuristic";

interface CameraStageProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  phase: "framing" | "ready" | "scanning" | "analyzing";
  framingStatus: FramingStatus;
  scanProgress: number;
  scanStageLabel: string;
  scanStageHint: string;
  onStartScan: () => void;
}

export function CameraStage({
  videoRef,
  phase,
  framingStatus,
  scanProgress,
  scanStageLabel,
  scanStageHint,
  onStartScan,
}: CameraStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(containerRef);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden bg-near-black md:aspect-[4/3] md:max-w-2xl"
    >
      {/* Mirror the PREVIEW only (transform is display-only — the canvas
          capture in app/live/page.tsx draws the real, un-mirrored frame).
          object-contain, never object-cover: the camera feed keeps its
          natural proportions and the whole outfit stays visible — no
          digital zoom, no crop-to-fill (§ "NO DIGITAL ZOOM"). */}
      <video
        ref={videoRef}
        muted
        playsInline
        className="h-full w-full object-contain"
        style={{ transform: "scaleX(-1)" }}
      />

      {(phase === "framing" || phase === "ready") && <FramingOverlay status={framingStatus} />}
      {phase === "scanning" && (
        <ScanningOverlay progress={scanProgress} stageLabel={scanStageLabel} stageHint={scanStageHint} />
      )}
      {phase === "analyzing" && <AnalyzingOverlay />}

      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-4 rounded-full bg-near-black/60 px-3 py-1.5 text-xs uppercase tracking-wide text-warm-white"
      >
        {isFullscreen ? "Exit Full Screen" : "Full Screen"}
      </button>

      {/* Manual start is always available while the camera is live — the
          framing heuristic only *suggests* readiness, it must never be the
          only way to begin (many webcams never trip it). */}
      {(phase === "framing" || phase === "ready") && (
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2">
          <Button onClick={onStartScan} size="lg">
            {phase === "ready" ? "I'm Ready — Scan My Fit" : "Scan My Fit"}
          </Button>
          {phase === "framing" && (
            <span className="rounded-full bg-near-black/60 px-3 py-1 text-[11px] uppercase tracking-wide text-warm-white/80">
              Tap when your full outfit is in frame
            </span>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { CategoryKey } from "@/types/fit-analysis";

export type FramingStatus = "checking" | "insufficient" | "ready";

const SAMPLE_SIZE = 48;
const CONTRAST_THRESHOLD = 18;
const STABLE_READS_REQUIRED = 4;

function regionStdDev(data: Uint8ClampedArray, width: number, yStart: number, yEnd: number): number {
  const values: number[] = [];
  for (let y = yStart; y < yEnd; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      values.push((data[i] + data[i + 1] + data[i + 2]) / 3);
    }
  }
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// Purely local heuristic — never calls the AI. Samples the live video onto a
// tiny offscreen canvas and checks contrast in the lower two-thirds of the
// frame as a proxy for "is there a body/outfit filling the frame, or is it
// mostly empty background." Good enough for "step back a bit" guidance; not
// a substitute for the actual AI analysis that happens once, on capture.
export function useFramingHeuristic(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean
): { status: FramingStatus; hints: Partial<Record<CategoryKey, boolean>> } {
  const [status, setStatus] = useState<FramingStatus>("checking");
  const [hints, setHints] = useState<Partial<Record<CategoryKey, boolean>>>({});
  const [wasActive, setWasActive] = useState(active);
  const stableCountRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // See hooks/useCountdown.ts for why this reset happens during render
  // rather than inside the effect below.
  if (active !== wasActive) {
    setWasActive(active);
    if (!active) setStatus("checking");
  }

  useEffect(() => {
    if (!active) return;

    stableCountRef.current = 0;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = SAMPLE_SIZE;
      canvasRef.current.height = SAMPLE_SIZE;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || !ctx || video.readyState < 2) return;

      ctx.drawImage(video, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
      const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

      const topContrast = regionStdDev(data, SAMPLE_SIZE, 0, Math.floor(SAMPLE_SIZE / 3));
      const midContrast = regionStdDev(data, SAMPLE_SIZE, Math.floor(SAMPLE_SIZE / 3), Math.floor((2 * SAMPLE_SIZE) / 3));
      const bottomContrast = regionStdDev(data, SAMPLE_SIZE, Math.floor((2 * SAMPLE_SIZE) / 3), SAMPLE_SIZE);

      const bottomVisible = bottomContrast > CONTRAST_THRESHOLD;
      const midVisible = midContrast > CONTRAST_THRESHOLD;
      const topVisible = topContrast > CONTRAST_THRESHOLD;

      setHints({
        top: topVisible || midVisible,
        bottom: bottomVisible,
        shoes: bottomVisible,
        accessories: topVisible || midVisible,
        layers: midVisible,
        colors: true,
        overallStyle: true,
      });

      if (bottomVisible && midVisible) {
        stableCountRef.current += 1;
      } else {
        stableCountRef.current = 0;
      }

      setStatus(stableCountRef.current >= STABLE_READS_REQUIRED ? "ready" : "insufficient");
    }, 250);

    return () => clearInterval(interval);
  }, [active, videoRef]);

  return { status, hints };
}

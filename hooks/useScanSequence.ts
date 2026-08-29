"use client";

import { useEffect, useRef, useState } from "react";

export interface ScanStage {
  label: string;
  hint: string;
}

// Roughly a 180° rotation and back, paced so a person has time to actually
// move. Total is a FIXED duration — the scan never finishes early, even if
// the AI would respond faster (§4 of the brief).
export const SCAN_STAGES: ScanStage[] = [
  { label: "Face forward", hint: "Full outfit in frame, stand tall" },
  { label: "Turn slowly…", hint: "Rotate towards your side" },
  { label: "Show the back", hint: "Keep turning" },
  { label: "…and around", hint: "Rotate to the other side" },
  { label: "Hold still", hint: "Almost done" },
];

const SCAN_MS = 7000;
// Fractions of the scan at which a frame is grabbed — one per stage,
// nudged slightly into each stage so the pose has settled.
const CHECKPOINTS = [0.08, 0.3, 0.52, 0.74, 0.95];

interface ScanState {
  progress: number;
  stage: ScanStage;
  stageIndex: number;
  stageCount: number;
}

/**
 * Drives the timed Live Fit Check capture. While `active`, runs for a fixed
 * SCAN_MS, reports progress + the current rotation stage, grabs a frame at
 * each checkpoint via `captureFrame`, and finally hands every captured frame
 * to `onComplete`.
 */
export function useScanSequence(
  active: boolean,
  captureFrame: () => string | null,
  onComplete: (frames: string[]) => void
): ScanState {
  const [progress, setProgress] = useState(0);

  const framesRef = useRef<string[]>([]);
  const onCompleteRef = useRef(onComplete);
  const captureRef = useRef(captureFrame);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    captureRef.current = captureFrame;
  }, [onComplete, captureFrame]);

  // Reset progress the moment the scan is switched off, via the
  // React-endorsed "adjust state during render" pattern (no ref writes here
  // — those happen in the effect below).
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (!active) setProgress(0);
  }

  useEffect(() => {
    if (!active) return;

    framesRef.current = [];
    let nextCheckpoint = 0;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min((now - start) / SCAN_MS, 1);
      setProgress(p);

      while (nextCheckpoint < CHECKPOINTS.length && p >= CHECKPOINTS[nextCheckpoint]) {
        const shot = captureRef.current();
        if (shot) framesRef.current.push(shot);
        nextCheckpoint += 1;
      }

      if (p >= 1) {
        if (framesRef.current.length === 0) {
          const shot = captureRef.current();
          if (shot) framesRef.current.push(shot);
        }
        onCompleteRef.current(framesRef.current.slice());
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const stageIndex = Math.min(SCAN_STAGES.length - 1, Math.floor(progress * SCAN_STAGES.length));

  return {
    progress,
    stage: SCAN_STAGES[stageIndex],
    stageIndex,
    stageCount: SCAN_STAGES.length,
  };
}

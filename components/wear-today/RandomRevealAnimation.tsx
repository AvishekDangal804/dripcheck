"use client";

import { useEffect, useState } from "react";
import { listVibes } from "@/services/outfits/vibeTemplates";

export function RandomRevealAnimation({ finalLabel, onDone }: { finalLabel: string; onDone: () => void }) {
  const [displayLabel, setDisplayLabel] = useState(finalLabel);
  const labels = listVibes().map((v) => v.label);

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      setDisplayLabel(labels[tick % labels.length]);
      tick += 1;
    }, 90);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplayLabel(finalLabel);
      setTimeout(onDone, 500);
    }, 900);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalLabel]);

  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-sm uppercase tracking-wide text-near-black/50">Your random vibe is...</p>
      <p className="font-display text-4xl text-accent-600">{displayLabel}</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const PHRASES = ["Checking your drip...", "Reading your colors...", "Analyzing your style...", "Building your verdict..."];

export function AnalyzingOverlay() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % PHRASES.length), 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-near-black/50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-warm-white/30 border-t-warm-white" />
      <p key={index} className="font-display text-xl text-warm-white transition-opacity duration-300">
        {PHRASES[index]}
      </p>
    </div>
  );
}

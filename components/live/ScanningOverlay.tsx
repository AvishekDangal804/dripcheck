"use client";

interface ScanningOverlayProps {
  progress: number; // 0–1
  stageLabel: string;
  stageHint: string;
}

export function ScanningOverlay({ progress, stageLabel, stageHint }: ScanningOverlayProps) {
  const pct = Math.round(progress * 100);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dim the feed slightly so the scan UI reads clearly. */}
      <div className="absolute inset-0 bg-near-black/25" />

      {/* Sweeping scan line. */}
      <div className="absolute inset-x-0 top-0 h-full">
        <div className="scan-line absolute inset-x-0 h-px bg-warm-white/80 shadow-[0_0_18px_2px_rgba(255,253,251,0.55)]" />
        <div className="scan-band absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-accent-200/15 to-transparent" />
      </div>

      {/* Corner tracking marks. */}
      {[
        "left-4 top-4 border-l-2 border-t-2",
        "right-4 top-4 border-r-2 border-t-2",
        "left-4 bottom-4 border-l-2 border-b-2",
        "right-4 bottom-4 border-r-2 border-b-2",
      ].map((pos) => (
        <span key={pos} className={`absolute h-7 w-7 border-warm-white/70 ${pos}`} />
      ))}

      {/* Stage prompt. */}
      <div className="absolute inset-x-0 top-10 flex flex-col items-center gap-1 text-center">
        <p className="rounded-full bg-near-black/60 px-4 py-1.5 font-display text-lg text-warm-white">
          {stageLabel}
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-warm-white/70">{stageHint}</p>
      </div>

      {/* Progress. */}
      <div className="absolute inset-x-8 bottom-10">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-warm-white/80">
          <span>Scanning your fit</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-warm-white/20">
          <div
            className="h-full rounded-full bg-accent-400 transition-[width] duration-150 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scanSweep {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(calc(100% - 1px)); }
          100% { transform: translateY(0); }
        }
        @keyframes scanBandSweep {
          0%   { transform: translateY(-6rem); }
          50%  { transform: translateY(100%); }
          100% { transform: translateY(-6rem); }
        }
        .scan-line { animation: scanSweep 3.4s ease-in-out infinite; }
        .scan-band { animation: scanBandSweep 3.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .scan-line, .scan-band { animation-duration: 6.8s; }
        }
      `}</style>
    </div>
  );
}

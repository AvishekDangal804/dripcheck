export function CountdownOverlay({ count }: { count: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-near-black/30">
      <span key={count} className="animate-[fadeScale_1s_ease-out] font-display text-9xl text-warm-white">
        {count > 0 ? count : ""}
      </span>
      <style>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

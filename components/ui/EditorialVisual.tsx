import { cn } from "@/lib/utils";

// Generated editorial-style placeholder visual, used in place of licensed
// photography (see README — public/images/* is where real photography
// drops in later with zero component changes). Deterministic per `seed` so
// the same outfit/style always renders the same look instead of flashing
// between variants on re-render.
const GRADIENT_VARIANTS = [
  "from-[#e8d9c4] via-[#d3b892] to-[#8f5f36]",
  "from-[#efe6d8] via-[#c9a877] to-[#74492a]",
  "from-[#e3d5c2] via-[#b17c4c] to-[#332c25]",
  "from-[#f2e9dc] via-[#dcb894] to-[#573620]",
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface EditorialVisualProps {
  seed: string;
  label?: string;
  monogram?: string;
  className?: string;
}

export function EditorialVisual({ seed, label, monogram, className }: EditorialVisualProps) {
  const variant = GRADIENT_VARIANTS[hashSeed(seed) % GRADIENT_VARIANTS.length];
  const glyph = monogram ?? label?.[0] ?? seed[0];

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        variant,
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(28,23,18,0.5) 0px, rgba(28,23,18,0.5) 1px, transparent 1px, transparent 10px)",
        }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-6 -right-2 select-none font-display text-[8rem] leading-none text-near-black/10"
        aria-hidden
      >
        {glyph?.toUpperCase()}
      </span>
      {label && (
        <span className="absolute bottom-4 left-4 rounded-full bg-warm-white/85 px-3 py-1 text-xs uppercase tracking-wide text-near-black">
          {label}
        </span>
      )}
    </div>
  );
}

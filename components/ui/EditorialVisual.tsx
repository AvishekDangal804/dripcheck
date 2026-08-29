import { cn } from "@/lib/utils";

// Generated editorial-style visual, used in place of licensed photography
// (see README — public/images/* is where real photography drops in later
// with zero component changes). Deterministic per `seed`: the same
// outfit/style always renders the same gradient + figure instead of
// flashing between variants on re-render.
const GRADIENT_VARIANTS = [
  "from-[#e8d9c4] via-[#d3b892] to-[#8f5f36]",
  "from-[#efe6d8] via-[#c9a877] to-[#74492a]",
  "from-[#e3d5c2] via-[#b17c4c] to-[#332c25]",
  "from-[#f2e9dc] via-[#dcb894] to-[#573620]",
];

// Stylised fashion-illustration silhouettes, drawn once so every card/tile
// reads as an outfit rather than a blank swatch. viewBox is 0 0 200 260.
const FIGURES: string[] = [
  // 0 — Long coat / trench
  "M100 34a17 17 0 1 0 .01 0ZM70 60c0-6 8-12 30-12s30 6 30 12l10 96-14 4-6-70-2 118H82L80 90l-6 70-14-4Z M100 62v150",
  // 1 — Oversized hoodie + joggers
  "M100 36a16 16 0 1 0 .01 0ZM62 66c6-8 16-12 38-12s32 4 38 12l8 60-20 6-4-40v52H80v-52l-4 40-20-6Z M84 130v96h14l2-70 2 70h14v-96Z",
  // 2 — Waisted dress
  "M100 34a16 16 0 1 0 .01 0ZM78 56c4-6 8-8 22-8s18 2 22 8l-8 46 22 108H64l22-108Z M92 214l4 34h8l4-34Z",
  // 3 — Tailored blazer + trousers
  "M100 34a16 16 0 1 0 .01 0ZM72 58l28-6 28 6 12 70-18 6-8-52-4 60H90l-4-60-8 52-18-6Z M88 138l-4 92h12l4-74 4 74h12l-4-92Z",
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
  const h = hashSeed(seed);
  const variant = GRADIENT_VARIANTS[h % GRADIENT_VARIANTS.length];
  const figure = FIGURES[h % FIGURES.length];
  const glyph = monogram ?? label?.[0] ?? seed[0];

  return (
    <div
      className={cn("relative overflow-hidden bg-gradient-to-br", variant, className)}
    >
      {/* Fine diagonal hatch — subtle editorial paper texture. */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(28,23,18,0.5) 0px, rgba(28,23,18,0.5) 1px, transparent 1px, transparent 10px)",
        }}
        aria-hidden
      />

      {/* Deterministic outfit silhouette. */}
      <svg
        viewBox="0 0 200 260"
        preserveAspectRatio="xMidYMax meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <path d={figure} fill="#1c1712" fillOpacity={0.17} />
        <path d={figure} fill="none" stroke="#fffdfb" strokeOpacity={0.28} strokeWidth={1.5} />
      </svg>

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

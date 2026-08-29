import type { VibeKey } from "@/services/outfits/vibeTemplates";
import type {
  ClosetCategory,
  ClosetItem,
  GeneratedOutfit,
  GeneratedOutfitItem,
  OutfitOccasion,
  OutfitSlot,
} from "@/types/closet";

// Deterministic, closet-only outfit builder. It ONLY ever combines items the
// user actually uploaded — it can't invent a piece. Scoring is a small
// colour/style/occasion heuristic (§ "OUTFIT COMPATIBILITY").

const NEUTRALS = new Set(["black", "white", "grey", "gray", "beige", "navy", "tan", "cream", "olive", "brown", "charcoal"]);

const SLOT_FOR_CATEGORY: Record<ClosetCategory, OutfitSlot> = {
  tshirt: "top",
  shirt: "top",
  pants: "bottom",
  jeans: "bottom",
  shorts: "bottom",
  shoes: "shoes",
  jacket: "outerwear",
  outerwear: "outerwear",
  accessory: "accessory",
};

const VIBE_LABEL: Record<VibeKey, string> = {
  "old-money": "Old Money",
  casual: "Casual",
  formal: "Formal",
  streetwear: "Streetwear",
  simple: "Simple",
};

const NAME_ADJECTIVES = ["Clean", "Easy", "Sharp", "Relaxed", "Quiet", "Effortless", "Modern", "Considered"];

function isFormalOccasion(o?: OutfitOccasion | null): boolean {
  return o === "formal-event" || o === "night-out" || o === "date";
}
function isWarmOccasion(o?: OutfitOccasion | null): boolean {
  return o === "summer" || o === "spring";
}

function colourHarmony(colours: string[]): number {
  const known = colours.filter(Boolean).map((c) => c.toLowerCase());
  if (known.length < 2) return 0.4;
  const neutralCount = known.filter((c) => NEUTRALS.has(c)).length;
  const distinctNonNeutral = new Set(known.filter((c) => !NEUTRALS.has(c)));
  if (neutralCount === known.length) return 1; // all-neutral always reads clean
  if (distinctNonNeutral.size <= 1) return 0.8; // neutrals + one accent colour
  if (distinctNonNeutral.size === 2) return 0.5;
  return 0.25; // three+ competing colours
}

function styleCoherence(items: ClosetItem[]): number {
  const styles = items.map((i) => i.style?.toLowerCase()).filter(Boolean) as string[];
  if (styles.length < 2) return 0.5;
  const unique = new Set(styles);
  return unique.size === 1 ? 1 : unique.size === 2 ? 0.7 : 0.45;
}

function occasionFit(top: ClosetItem, bottom: ClosetItem, occasion?: OutfitOccasion | null): number {
  if (!occasion) return 0.6;
  if (isFormalOccasion(occasion)) {
    let s = 0.4;
    if (top.category === "shirt") s += 0.35;
    if (bottom.category === "pants") s += 0.25;
    return Math.min(s, 1);
  }
  if (isWarmOccasion(occasion)) {
    let s = 0.5;
    if (bottom.category === "shorts") s += 0.3;
    if (top.category === "tshirt") s += 0.2;
    return Math.min(s, 1);
  }
  // college / regular-day / casual-hangout / concert / party
  let s = 0.55;
  if (top.category === "tshirt") s += 0.2;
  if (bottom.category === "jeans") s += 0.2;
  return Math.min(s, 1);
}

function pickBy<T>(pool: T[], seed: number): T | undefined {
  if (pool.length === 0) return undefined;
  return pool[seed % pool.length];
}

function bucketize(items: ClosetItem[]): Record<OutfitSlot, ClosetItem[]> {
  const buckets: Record<OutfitSlot, ClosetItem[]> = {
    top: [],
    bottom: [],
    shoes: [],
    outerwear: [],
    accessory: [],
  };
  for (const item of items) buckets[SLOT_FOR_CATEGORY[item.category]].push(item);
  return buckets;
}

function seedFromIds(ids: string[]): number {
  return ids.join("").split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7) >>> 0;
}

function outfitName(vibe: VibeKey | null, occasion: OutfitOccasion | null, seed: number): string {
  const adj = NAME_ADJECTIVES[seed % NAME_ADJECTIVES.length];
  const noun = vibe ? VIBE_LABEL[vibe] : occasion ? occasion.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Everyday";
  return `${adj} ${noun} Fit`;
}

function rationale(chosen: GeneratedOutfitItem[], harmony: number): string {
  const top = chosen.find((c) => c.slot === "top")?.item;
  const bottom = chosen.find((c) => c.slot === "bottom")?.item;
  const shoes = chosen.find((c) => c.slot === "shoes")?.item;
  const parts: string[] = [];
  if (top && bottom) {
    const t = [top.color, top.style].filter(Boolean).join(" ") || "the top";
    const b = [bottom.color, bottom.style].filter(Boolean).join(" ") || "the bottom";
    parts.push(`The ${t} sits cleanly with ${b}.`);
  }
  if (harmony >= 0.8) parts.push("The palette stays tight, so nothing competes.");
  else if (harmony >= 0.5) parts.push("One accent colour keeps it interesting without clashing.");
  else parts.push("A few colours are in play — swap one out if it feels busy.");
  if (shoes) parts.push(`The ${shoes.color ?? ""} ${shoes.category} ties it off.`.replace(/\s+/g, " ").trim());
  return parts.join(" ");
}

export interface GenerateResult {
  outfits: GeneratedOutfit[];
  reason?: string;
}

export function generateOutfits(
  items: ClosetItem[],
  opts: { vibe?: VibeKey | "random" | null; occasion?: OutfitOccasion | null } = {}
): GenerateResult {
  const vibe: VibeKey | null =
    opts.vibe && opts.vibe !== "random"
      ? opts.vibe
      : opts.vibe === "random"
        ? (["old-money", "casual", "formal", "streetwear", "simple"] as VibeKey[])[
            seedFromIds(items.map((i) => i.id)) % 5
          ]
        : null;
  const occasion = opts.occasion ?? null;

  const buckets = bucketize(items);
  if (buckets.top.length === 0 || buckets.bottom.length === 0) {
    return {
      outfits: [],
      reason: "Add at least one top and one bottom to your closet to build fits.",
    };
  }

  const combos: GeneratedOutfit[] = [];
  for (const top of buckets.top) {
    for (const bottom of buckets.bottom) {
      const seed = seedFromIds([top.id, bottom.id, vibe ?? "", occasion ?? ""]);
      const shoes = pickBy(buckets.shoes, seed);
      const outer = isWarmOccasion(occasion) ? undefined : pickBy(buckets.outerwear, seed >> 3);
      const accessory = pickBy(buckets.accessory, seed >> 5);

      const chosen: GeneratedOutfitItem[] = [
        { item: top, slot: "top" },
        { item: bottom, slot: "bottom" },
        ...(shoes ? [{ item: shoes, slot: "shoes" as OutfitSlot }] : []),
        ...(outer ? [{ item: outer, slot: "outerwear" as OutfitSlot }] : []),
        ...(accessory ? [{ item: accessory, slot: "accessory" as OutfitSlot }] : []),
      ];

      const usedItems = chosen.map((c) => c.item);
      const colours = usedItems.map((i) => i.color).filter(Boolean) as string[];
      const harmony = colourHarmony(colours);
      const coherence = styleCoherence(usedItems);
      const occ = occasionFit(top, bottom, occasion);

      const raw = 6.2 + harmony * 2.0 + coherence * 1.0 + occ * 0.9;
      const compatibility = Math.max(6.0, Math.min(9.7, Math.round(raw * 10) / 10));

      const palette = [...new Set(colours.map((c) => c.toLowerCase()))].slice(0, 4);

      combos.push({
        name: outfitName(vibe, occasion, seed),
        vibe: vibe ? VIBE_LABEL[vibe] : null,
        occasion,
        palette,
        compatibility,
        rationale: rationale(chosen, harmony),
        items: chosen,
      });
    }
  }

  combos.sort((a, b) => b.compatibility - a.compatibility);
  // De-dupe identical top+bottom names can repeat with different accessories;
  // just cap the list.
  return { outfits: combos.slice(0, 8) };
}

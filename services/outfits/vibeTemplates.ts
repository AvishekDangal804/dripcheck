export type VibeKey = "old-money" | "casual" | "formal" | "streetwear" | "simple";

export interface OutfitPieces {
  top: string;
  bottom: string;
  shoes: string;
  accessory: string;
}

export interface OutfitTemplate {
  vibe: VibeKey;
  label: string;
  pieces: OutfitPieces;
  colorPalette: string[];
  whyItWorks: string;
  alternative: OutfitPieces;
}

// Plain data on purpose: a future weather-aware layer can wrap
// getTemplate()/pickRandomVibe() to filter or swap templates by condition
// without this file, or any component that imports it, needing to change.
const TEMPLATES: Record<VibeKey, OutfitTemplate> = {
  "old-money": {
    vibe: "old-money",
    label: "Old Money",
    pieces: { top: "Clean knit polo", bottom: "Tailored chinos", shoes: "Leather loafers", accessory: "Minimal watch" },
    colorPalette: ["Cream", "Navy", "Tan"],
    whyItWorks: "Neutral tones and clean tailoring read effortless and put-together without trying hard.",
    alternative: { top: "Crisp button-down", bottom: "Pleated trousers", shoes: "Suede loafers", accessory: "Leather belt" },
  },
  casual: {
    vibe: "casual",
    label: "Casual",
    pieces: { top: "Plain T-shirt", bottom: "Straight jeans", shoes: "Classic sneakers", accessory: "Overshirt" },
    colorPalette: ["White", "Denim Blue", "Grey"],
    whyItWorks: "Comfortable, low-effort pieces that still look intentional together.",
    alternative: { top: "Crewneck sweatshirt", bottom: "Relaxed cargos", shoes: "Retro runners", accessory: "Canvas cap" },
  },
  formal: {
    vibe: "formal",
    label: "Formal",
    pieces: { top: "Fitted dress shirt", bottom: "Tailored trousers", shoes: "Formal derby shoes", accessory: "Blazer" },
    colorPalette: ["Charcoal", "White", "Black"],
    whyItWorks: "A structured blazer over a plain shirt makes a presentation-ready fit that still feels like you.",
    alternative: { top: "Turtleneck", bottom: "Wool trousers", shoes: "Chelsea boots", accessory: "Structured overcoat" },
  },
  streetwear: {
    vibe: "streetwear",
    label: "Streetwear",
    pieces: { top: "Oversized T-shirt", bottom: "Baggy cargo pants", shoes: "Chunky sneakers", accessory: "Cap" },
    colorPalette: ["Black", "White", "Silver"],
    whyItWorks: "Oversized proportions and a neutral palette keep the fit loud without clashing.",
    alternative: { top: "Graphic hoodie", bottom: "Relaxed track pants", shoes: "High-top sneakers", accessory: "Silver chain" },
  },
  simple: {
    vibe: "simple",
    label: "Simple",
    pieces: { top: "Minimal T-shirt", bottom: "Straight pants", shoes: "Clean white sneakers", accessory: "Thin bracelet" },
    colorPalette: ["White", "Beige", "Grey"],
    whyItWorks: "One tone, clean lines — proof that restraint is its own kind of statement.",
    alternative: { top: "Fitted long sleeve", bottom: "Tapered trousers", shoes: "Minimal slip-ons", accessory: "None needed" },
  },
};

export function getTemplate(vibe: VibeKey): OutfitTemplate {
  return TEMPLATES[vibe];
}

export function listVibes(): OutfitTemplate[] {
  return Object.values(TEMPLATES);
}

export function pickRandomVibe(): OutfitTemplate {
  const vibes = Object.keys(TEMPLATES) as VibeKey[];
  return TEMPLATES[vibes[Math.floor(Math.random() * vibes.length)]];
}

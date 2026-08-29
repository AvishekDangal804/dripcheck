export type ClosetCategory =
  | "tshirt"
  | "shirt"
  | "pants"
  | "jeans"
  | "shorts"
  | "shoes"
  | "jacket"
  | "outerwear"
  | "accessory";

export const CLOSET_CATEGORIES: ClosetCategory[] = [
  "tshirt",
  "shirt",
  "pants",
  "jeans",
  "shorts",
  "shoes",
  "jacket",
  "outerwear",
  "accessory",
];

export const CLOSET_CATEGORY_LABELS: Record<ClosetCategory, string> = {
  tshirt: "T-Shirts",
  shirt: "Shirts",
  pants: "Pants",
  jeans: "Jeans",
  shorts: "Shorts",
  shoes: "Shoes",
  jacket: "Jackets",
  outerwear: "Outerwear",
  accessory: "Accessories",
};

export function isClosetCategory(value: unknown): value is ClosetCategory {
  return typeof value === "string" && (CLOSET_CATEGORIES as string[]).includes(value);
}

export interface ClosetItem {
  id: string;
  user_id: string;
  category: ClosetCategory;
  name: string;
  image_url: string;
  color: string | null;
  style: string | null;
  pattern: string | null;
  created_at: string;
}

/** What the vision model returns for a single uploaded garment photo. */
export interface IdentifiedItem {
  category: ClosetCategory;
  name: string;
  color: string | null;
  style: string | null;
  pattern: string | null;
}

/** A closet row before it has an id / created_at. */
export interface NewClosetItem {
  user_id: string;
  category: ClosetCategory;
  name: string;
  image_url: string;
  color: string | null;
  style: string | null;
  pattern: string | null;
}

// ── Create-a-Fit ─────────────────────────────────────────────────────────

export type OutfitSlot = "top" | "bottom" | "shoes" | "outerwear" | "accessory";

export type OutfitOccasion =
  | "college"
  | "regular-day"
  | "date"
  | "summer"
  | "spring"
  | "party"
  | "concert"
  | "casual-hangout"
  | "formal-event"
  | "night-out";

export const OUTFIT_OCCASIONS: { key: OutfitOccasion; label: string }[] = [
  { key: "college", label: "College" },
  { key: "regular-day", label: "Regular Day" },
  { key: "date", label: "Date" },
  { key: "summer", label: "Summer" },
  { key: "spring", label: "Spring" },
  { key: "party", label: "Party" },
  { key: "concert", label: "Concert" },
  { key: "casual-hangout", label: "Casual Hangout" },
  { key: "formal-event", label: "Formal Event" },
  { key: "night-out", label: "Night Out" },
];

export function isOutfitOccasion(v: unknown): v is OutfitOccasion {
  return typeof v === "string" && OUTFIT_OCCASIONS.some((o) => o.key === v);
}

export interface GeneratedOutfitItem {
  item: ClosetItem;
  slot: OutfitSlot;
}

export interface GeneratedOutfit {
  id?: string;
  name: string;
  vibe: string | null;
  occasion: string | null;
  palette: string[];
  compatibility: number;
  rationale: string;
  items: GeneratedOutfitItem[];
}

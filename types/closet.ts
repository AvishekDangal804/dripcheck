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

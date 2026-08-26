export type CategoryKey =
  | "top"
  | "bottom"
  | "shoes"
  | "accessories"
  | "layers"
  | "colors"
  | "overallStyle";

export const CATEGORY_KEYS: CategoryKey[] = [
  "top",
  "bottom",
  "shoes",
  "accessories",
  "layers",
  "colors",
  "overallStyle",
];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  top: "Top",
  bottom: "Bottom",
  shoes: "Shoes",
  accessories: "Accessories",
  layers: "Layering",
  colors: "Colors",
  overallStyle: "Style",
};

export interface CategoryResult {
  visible: boolean;
  confidence: number;
  score: number | null;
  reason: string;
}

export type CheckType = "full" | "partial";

export interface FitAnalysis {
  checkType: CheckType;
  categories: Record<CategoryKey, CategoryResult>;
  overallScore: number;
  style: string;
  description: string;
  suggestions: string[];
  disclosure: string | null;
}

export const PARTIAL_CHECK_DISCLOSURE =
  "This score is based only on the visible part of your outfit.";

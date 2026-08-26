import { CATEGORY_KEYS, type CategoryResult, type CategoryKey, type CheckType } from "@/types/fit-analysis";

// The one and only place an overall Drip Score is computed. Called
// server-side from app/api/analyze-fit/route.ts after a provider (real or
// mock) returns category results — never trusts a score from the client,
// and never lets a provider's own "overall" opinion skip this aggregation.
export function computeOverallScore(
  categories: Record<CategoryKey, CategoryResult>
): { score: number; checkType: CheckType } {
  const visible = CATEGORY_KEYS.map((key) => categories[key]).filter(
    (category): category is CategoryResult & { score: number } =>
      category.visible && category.score != null
  );

  if (visible.length === 0) {
    throw new Error("No visible categories to score — capture did not contain any usable outfit detail.");
  }

  const average = visible.reduce((sum, category) => sum + category.score, 0) / visible.length;
  const checkType: CheckType = visible.length === CATEGORY_KEYS.length ? "full" : "partial";

  return { score: Math.round(average * 10) / 10, checkType };
}

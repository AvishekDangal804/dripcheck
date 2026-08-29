import "server-only";
import { z } from "zod";
import { CATEGORY_KEYS, PARTIAL_CHECK_DISCLOSURE, type CategoryKey, type CategoryResult, type FitAnalysis } from "@/types/fit-analysis";
import { computeOverallScore } from "@/lib/scoring";
import { getAiProvider } from "@/services/ai/provider-registry";
import type { FitFrame, RawAnalysis, VisibleHints } from "@/services/ai/types";

const categoryResultSchema = z.object({
  visible: z.boolean(),
  confidence: z.number().min(0).max(1).catch(0.5),
  score: z.number().min(1).max(10).nullable(),
  reason: z.string().min(1).catch("No detail provided."),
});

const rawAnalysisSchema = z.object({
  categories: z.record(z.string(), categoryResultSchema),
  style: z.string().min(1).catch("Personal Style"),
  description: z.string().min(1).catch("A clean, coordinated fit."),
  suggestions: z.array(z.string()).catch([]),
});

// Enforces the one invariant nothing is allowed to violate, no matter what
// a provider returns: a category that isn't visible NEVER carries a score.
// This runs regardless of provider (real or mock) — see §8/9 of the product
// brief this was built from.
function normalizeCategory(raw: unknown): CategoryResult {
  const parsed = categoryResultSchema.safeParse(raw);

  if (!parsed.success) {
    return { visible: false, confidence: 0, score: null, reason: "Not visible in any frame." };
  }

  if (!parsed.data.visible || parsed.data.score == null) {
    return { ...parsed.data, visible: false, score: null };
  }

  return parsed.data;
}

function normalize(raw: RawAnalysis): Pick<FitAnalysis, "categories" | "style" | "description" | "suggestions"> {
  const categories = {} as Record<CategoryKey, CategoryResult>;
  for (const key of CATEGORY_KEYS) {
    categories[key] = normalizeCategory(raw.categories?.[key]);
  }

  const parsedTop = rawAnalysisSchema.safeParse(raw);
  const style = parsedTop.success ? parsedTop.data.style : "Personal Style";
  const description = parsedTop.success ? parsedTop.data.description : "A clean, coordinated fit.";
  const suggestions = (parsedTop.success ? parsedTop.data.suggestions : []).slice(0, 4);

  return { categories, style, description, suggestions };
}

export async function analyzeFit(frames: FitFrame[], hints?: VisibleHints): Promise<FitAnalysis> {
  if (frames.length === 0) throw new Error("No frames provided for analysis.");

  const provider = getAiProvider();
  const raw = await provider.analyze(frames, hints);
  const { categories, style, description, suggestions } = normalize(raw);

  const { score, checkType } = computeOverallScore(categories);

  return {
    checkType,
    categories,
    overallScore: score,
    style,
    description,
    suggestions,
    disclosure: checkType === "partial" ? PARTIAL_CHECK_DISCLOSURE : null,
  };
}

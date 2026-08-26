import type { CategoryKey, CategoryResult } from "@/types/fit-analysis";

export interface RawAnalysis {
  categories: Record<CategoryKey, CategoryResult>;
  style: string;
  description: string;
  suggestions: string[];
}

export interface VisibleHints {
  framingHint?: Partial<Record<CategoryKey, boolean>>;
}

export interface AiProvider {
  analyze(imageBase64: string, mimeType: string, hints?: VisibleHints): Promise<RawAnalysis>;
}

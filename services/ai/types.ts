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

export interface FitFrame {
  /** Base64 (no data: prefix) of one captured frame. */
  data: string;
  mimeType: string;
  /** Where in the rotation this frame was taken, for the model's context. */
  view: "front" | "turning" | "side" | "back" | "final";
}

export interface AiProvider {
  /**
   * Analyze one or more frames of the SAME person captured across a short
   * rotation (front → side → back → front). A category counts as visible if
   * it is clearly visible in AT LEAST ONE frame; observations are combined.
   */
  analyze(frames: FitFrame[], hints?: VisibleHints): Promise<RawAnalysis>;
}

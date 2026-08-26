import { CATEGORY_KEYS, type CategoryKey, type CategoryResult } from "@/types/fit-analysis";
import type { AiProvider, RawAnalysis, VisibleHints } from "@/services/ai/types";

const REASON_POOL: Record<CategoryKey, string[]> = {
  top: ["Clean silhouette with a relaxed fit.", "Good proportions for a layered look.", "Neutral tone keeps it versatile."],
  bottom: ["Fits well without being too tight.", "Nice contrast against the top.", "Clean hem, no bunching."],
  shoes: ["Great contrast against the rest of the fit.", "Clean pair, well kept.", "Ties the look together nicely."],
  accessories: ["Subtle finishing touch.", "Adds a little personality without overdoing it.", "Nice small detail."],
  layers: ["Adds depth without looking bulky.", "Good balance between the pieces.", "Works well for the season."],
  colors: ["Palette feels cohesive.", "Neutral tones balance the outfit well.", "Nice use of contrast."],
  overallStyle: ["Reads as clean and intentional.", "Confident, put-together look.", "Has a clear point of view."],
};

const STYLE_LABELS = ["Clean Streetwear", "Old Money", "Minimal Modern", "Casual Layered", "Sharp Formal"];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

export const mockProvider: AiProvider = {
  async analyze(imageBase64: string, _mimeType: string, hints?: VisibleHints): Promise<RawAnalysis> {
    // Small artificial delay so the cycling loading copy in the UI is
    // actually visible during a demo, rather than resolving instantly.
    await new Promise((resolve) => setTimeout(resolve, 1800 + Math.random() * 700));

    const seed = imageBase64.length + imageBase64.charCodeAt(Math.min(50, imageBase64.length - 1));
    const rand = seededRandom(seed);

    const categories = {} as Record<CategoryKey, CategoryResult>;
    for (const key of CATEGORY_KEYS) {
      const hinted = hints?.framingHint?.[key];
      // overallStyle and colors are always assessable from any usable frame.
      const alwaysVisible = key === "overallStyle" || key === "colors";
      const visible = alwaysVisible || hinted !== false;

      categories[key] = visible
        ? {
            visible: true,
            confidence: 0.75 + rand() * 0.24,
            score: Math.round((6.5 + rand() * 3) * 10) / 10,
            reason: pick(REASON_POOL[key], rand),
          }
        : {
            visible: false,
            confidence: 0.1 + rand() * 0.15,
            score: null,
            reason: "Not clearly visible in this frame.",
          };
    }

    const suggestions: string[] = [];
    if (categories.accessories.visible) {
      suggestions.push("A simple silver chain or watch could add a finishing touch.");
    } else {
      suggestions.push("Show your accessories for a more specific recommendation.");
    }
    if (categories.shoes.visible) {
      suggestions.push("White sneakers would create sharp contrast with this palette.");
    } else {
      suggestions.push("Show your footwear so we can score it specifically.");
    }
    if (categories.layers.visible && (categories.layers.score ?? 0) < 8) {
      suggestions.push("An overshirt or light jacket could add more depth to the fit.");
    }

    return {
      categories,
      style: pick(STYLE_LABELS, rand),
      description:
        "Clean, coordinated energy — the palette stays balanced and the silhouette reads as intentional rather than thrown together.",
      suggestions: suggestions.slice(0, 4),
    };
  },
};

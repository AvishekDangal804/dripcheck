import "server-only";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { getConfiguredAiProvider } from "@/lib/env";
import { CLOSET_CATEGORIES, isClosetCategory, type ClosetCategory, type IdentifiedItem } from "@/types/closet";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const IDENTIFY_PROMPT = `You are a wardrobe cataloguer. You are shown ONE photo of a single clothing item or accessory. \
Identify only what is clearly visible. Respond with ONLY minified JSON, no prose, no markdown:
{
  "category": one of ["tshirt","shirt","pants","jeans","shorts","shoes","jacket","outerwear","accessory"],
  "name": short label, e.g. "White oversized T-shirt" (max 6 words),
  "color": the dominant colour as one lowercase word, or null if unclear,
  "style": one short lowercase word like "oversized", "slim", "relaxed", "formal", or null,
  "pattern": one short lowercase word like "plain", "striped", "check", "graphic", or null
}
Only include a value you are reasonably confident about; otherwise use null. Never guess the category — if it is
genuinely unclear, use "accessory".`;

const identifiedSchema = z.object({
  category: z.string(),
  name: z.string().min(1).catch("Clothing item"),
  color: z.string().nullable().catch(null),
  style: z.string().nullable().catch(null),
  pattern: z.string().nullable().catch(null),
});

function coerce(raw: unknown): IdentifiedItem {
  const parsed = identifiedSchema.safeParse(raw);
  const data = parsed.success
    ? parsed.data
    : { category: "accessory", name: "Clothing item", color: null, style: null, pattern: null };

  const category: ClosetCategory = isClosetCategory(data.category) ? data.category : "accessory";
  return {
    category,
    name: data.name.slice(0, 60),
    color: data.color?.toLowerCase().slice(0, 20) ?? null,
    style: data.style?.toLowerCase().slice(0, 20) ?? null,
    pattern: data.pattern?.toLowerCase().slice(0, 20) ?? null,
  };
}

// Deterministic stand-in when no real vision provider is configured, so the
// closet still works end to end in mock mode (§ "If an API key is missing,
// tell us — do not silently fake it": the closet page surfaces a notice).
function mockIdentify(base64: string): IdentifiedItem {
  const seed = base64.length + base64.charCodeAt(Math.min(40, base64.length - 1));
  const category = CLOSET_CATEGORIES[seed % CLOSET_CATEGORIES.length];
  const colors = ["black", "white", "grey", "navy", "beige", "olive"];
  return {
    category,
    name: `${colors[seed % colors.length]} ${category}`,
    color: colors[seed % colors.length],
    style: ["relaxed", "slim", "oversized", "classic"][seed % 4],
    pattern: "plain",
  };
}

export const CLOSET_AI_IS_REAL = getConfiguredAiProvider() === "gemini";

export async function identifyItem(base64: string, mimeType: string): Promise<IdentifiedItem> {
  if (!CLOSET_AI_IS_REAL) {
    return mockIdentify(base64);
  }

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      { role: "user", parts: [{ text: IDENTIFY_PROMPT }, { inlineData: { mimeType, data: base64 } }] },
    ],
    config: { responseMimeType: "application/json" },
  });

  const text = response.text;
  if (!text) throw new Error("Item recognition returned an empty response.");
  return coerce(JSON.parse(text));
}

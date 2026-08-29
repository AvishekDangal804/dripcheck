import "server-only";
import { GoogleGenAI } from "@google/genai";
import { FIT_ANALYSIS_SYSTEM_PROMPT } from "@/services/ai/prompt";
import type { AiProvider, FitFrame, RawAnalysis } from "@/services/ai/types";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export const geminiProvider: AiProvider = {
  async analyze(frames: FitFrame[]): Promise<RawAnalysis> {
    if (frames.length === 0) throw new Error("No frames to analyze.");

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [{ text: FIT_ANALYSIS_SYSTEM_PROMPT }];

    frames.forEach((frame, i) => {
      parts.push({ text: `Frame ${i + 1} of ${frames.length} — ${frame.view} view:` });
      parts.push({ inlineData: { mimeType: frame.mimeType, data: frame.data } });
    });

    const response = await getClient().models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts }],
      config: { responseMimeType: "application/json" },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini returned an empty response.");

    return JSON.parse(text) as RawAnalysis;
  },
};

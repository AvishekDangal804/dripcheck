import "server-only";
import { GoogleGenAI } from "@google/genai";
import { FIT_ANALYSIS_SYSTEM_PROMPT } from "@/services/ai/prompt";
import type { AiProvider, RawAnalysis } from "@/services/ai/types";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export const geminiProvider: AiProvider = {
  async analyze(imageBase64: string, mimeType: string): Promise<RawAnalysis> {
    const response = await getClient().models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: FIT_ANALYSIS_SYSTEM_PROMPT }, { inlineData: { mimeType, data: imageBase64 } }],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini returned an empty response.");

    return JSON.parse(text) as RawAnalysis;
  },
};

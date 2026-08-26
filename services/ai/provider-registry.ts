import "server-only";
import { getConfiguredAiProvider } from "@/lib/env";
import { mockProvider } from "@/services/ai/providers/mock";
import { geminiProvider } from "@/services/ai/providers/gemini";
import { openaiProvider } from "@/services/ai/providers/openai";
import { anthropicProvider } from "@/services/ai/providers/anthropic";
import type { AiProvider } from "@/services/ai/types";

export function getAiProvider(): AiProvider {
  switch (getConfiguredAiProvider()) {
    case "gemini":
      return geminiProvider;
    case "openai":
      return openaiProvider;
    case "anthropic":
      return anthropicProvider;
    default:
      return mockProvider;
  }
}

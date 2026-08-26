import "server-only";
import type { AiProvider, RawAnalysis } from "@/services/ai/types";

// Stubbed behind the same AiProvider interface as gemini.ts so this can be
// filled in later without touching provider-registry.ts, analyzeFit.ts, or
// any UI code — swapping providers is meant to be a zero-app-code-change,
// env-var-only operation once this is implemented.
export const openaiProvider: AiProvider = {
  async analyze(): Promise<RawAnalysis> {
    throw new Error("OpenAI provider is not implemented yet. Set AI_PROVIDER=gemini or leave unset for mock mode.");
  },
};

import "server-only";
import type { AiProvider, RawAnalysis } from "@/services/ai/types";

// Stubbed behind the same AiProvider interface as gemini.ts — see
// openai.ts for why this is intentionally left unimplemented for now.
export const anthropicProvider: AiProvider = {
  async analyze(): Promise<RawAnalysis> {
    throw new Error("Anthropic provider is not implemented yet. Set AI_PROVIDER=gemini or leave unset for mock mode.");
  },
};

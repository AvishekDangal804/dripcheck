export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export type AiProviderName = "gemini" | "openai" | "anthropic" | "mock";

export function getConfiguredAiProvider(): AiProviderName {
  const requested = process.env.AI_PROVIDER?.toLowerCase();

  if (requested === "gemini" && process.env.GEMINI_API_KEY) return "gemini";
  if (requested === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (requested === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";

  return "mock";
}

export function isMockMode(): boolean {
  return !isSupabaseConfigured();
}

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

/** Pull the first JSON object/array out of a model response. */
export function parseJsonLoose<T>(text: string): T | null {
  const cleaned = text
    .replace(/```json/gi, "```")
    .split("```")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  const candidates = [text, ...cleaned];
  for (const candidate of candidates) {
    const start = candidate.search(/[[{]/);
    if (start === -1) continue;
    const end = Math.max(candidate.lastIndexOf("]"), candidate.lastIndexOf("}"));
    if (end <= start) continue;
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

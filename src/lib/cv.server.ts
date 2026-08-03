import { generateText } from "ai";
import { createLovableAiGatewayProvider, parseJsonLoose } from "./ai-gateway.server";
import { buildTailorPrompt } from "./job-prompts.server";
import type { TailorResult } from "./types";

export async function runCvTailor(input: {
  cvText: string;
  jobTitle: string;
  employer: string;
  jobDescription: string;
}): Promise<TailorResult> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");

  const gateway = createLovableAiGatewayProvider(key);
  const { text } = await generateText({
    model: gateway("openai/gpt-5.4"),
    prompt: buildTailorPrompt(input),
  });

  const parsed = parseJsonLoose<TailorResult>(text);
  if (!parsed?.cvMarkdown) {
    throw new Error("The tailored CV came back empty. Try again.");
  }

  return {
    cvMarkdown: String(parsed.cvMarkdown),
    matchNotes: Array.isArray(parsed.matchNotes) ? parsed.matchNotes.map(String).slice(0, 6) : [],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).slice(0, 12) : [],
    coverNote: String(parsed.coverNote ?? ""),
  };
}

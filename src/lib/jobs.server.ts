import { generateText } from "ai";
import { createLovableAiGatewayProvider, parseJsonLoose } from "./ai-gateway.server";
import { buildJobSearchPrompt } from "./job-prompts.server";
import type { JobCategory, JobLead } from "./types";

type RawJob = Omit<JobLead, "id" | "category">;

export async function runJobSearch(
  category: JobCategory,
  extraArea: string,
): Promise<{ jobs: JobLead[]; searchedAt: string }> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");

  const gateway = createLovableAiGatewayProvider(key);

  const { text } = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    prompt: buildJobSearchPrompt(category, extraArea),
    providerOptions: {
      lovable: { plugins: [{ id: "web", max_results: 8 }] },
    },
  }).catch(async (error: unknown) => {
    // Retry without the web plugin if the provider rejects it.
    console.error("job search with web plugin failed, retrying plain", error);
    return generateText({
      model: gateway("google/gemini-3.6-flash"),
      prompt: buildJobSearchPrompt(category, extraArea),
    });
  });

  const raw = parseJsonLoose<RawJob[]>(text);
  if (!raw || !Array.isArray(raw)) {
    throw new Error("Could not read the job results. Try again in a moment.");
  }

  const jobs: JobLead[] = raw.slice(0, 14).map((job, index) => ({
    id: `${category}-${Date.now()}-${index}`,
    category,
    title: String(job.title ?? "Role"),
    employer: String(job.employer ?? "Employer"),
    location: String(job.location ?? "Kent / London"),
    payHint: String(job.payHint ?? ""),
    summary: String(job.summary ?? ""),
    whyYou: String(job.whyYou ?? ""),
    requirements: Array.isArray(job.requirements) ? job.requirements.map(String).slice(0, 6) : [],
    applyUrl: String(job.applyUrl ?? ""),
    source: String(job.source ?? ""),
    postedHint: String(job.postedHint ?? ""),
  }));

  return { jobs, searchedAt: new Date().toISOString() };
}

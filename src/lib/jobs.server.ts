import { streamText } from "ai";
import { createLovableAiGatewayProvider, parseJsonLoose } from "./ai-gateway.server";
import { buildJobSearchPrompt } from "./job-prompts.server";
import type { JobCategory, JobLead } from "./types";

type RawJob = Omit<JobLead, "id" | "category">;

/** Drop anything that isn't a usable, real-looking application link. */
function isUsableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (/example\.com|localhost|your-?site/i.test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function runJobSearch(
  category: JobCategory,
  extraArea: string,
): Promise<{ jobs: JobLead[]; searchedAt: string }> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");

  const gateway = createLovableAiGatewayProvider(key);
  const today = new Date().toISOString().slice(0, 10);

  // Web search is required — without it the model invents stale links.
  const result = streamText({
    model: gateway("google/gemini-3.6-flash"),
    prompt: buildJobSearchPrompt(category, extraArea, today),
    maxRetries: 1,
    providerOptions: {
      lovable: { plugins: [{ id: "web", max_results: 10 }] },
    },
  });

  let text: string;
  try {
    text = await result.text;
  } catch (error) {
    console.error("job search failed", error);
    throw new Error("The search couldn't finish. Try again in a moment.");
  }

  const raw = parseJsonLoose<RawJob[]>(text);
  if (!raw || !Array.isArray(raw)) {
    throw new Error("Could not read the job results. Try again in a moment.");
  }

  const jobs: JobLead[] = raw
    .filter((job) => isUsableUrl(String(job?.applyUrl ?? "")))
    .slice(0, 14)
    .map((job, index) => ({
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

  if (jobs.length === 0) {
    throw new Error("No live listings came back with working links. Try again or widen the area.");
  }

  return { jobs, searchedAt: new Date().toISOString() };
}

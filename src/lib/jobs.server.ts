import { fetchLiveJobs } from "./reed.server";
import { fetchGreenhouseJobs } from "./greenhouse.server";
import type { JobCategory, JobLead } from "./types";

export async function runJobSearch(
  category: JobCategory,
  extraArea: string,
): Promise<{ jobs: JobLead[]; searchedAt: string }> {
  const [reed, company] = await Promise.all([
    fetchLiveJobs(category, extraArea),
    fetchGreenhouseJobs(category),
  ]);

  const seen = new Set<string>();
  const jobs: JobLead[] = [];
  const key = (j: JobLead) => `${j.title}|${j.employer}`.toLowerCase().replace(/\s+/g, " ");
  // Company-board roles come straight from the employer, so list them first.
  for (const { postedAt: _p, ...job } of company.sort((a, b) => b.postedAt - a.postedAt)) {
    if (!seen.has(key(job))) (seen.add(key(job)), jobs.push(job));
  }
  for (const job of reed) if (!seen.has(key(job))) (seen.add(key(job)), jobs.push(job));

  if (jobs.length === 0) {
    throw new Error(
      "No live openings came back just now. Try again, or add a keyword like “retail”.",
    );
  }
  return { jobs, searchedAt: new Date().toISOString() };
}

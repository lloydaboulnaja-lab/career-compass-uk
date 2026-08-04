import { fetchLiveJobs } from "./reed.server";
import type { JobCategory, JobLead } from "./types";

export async function runJobSearch(
  category: JobCategory,
  extraArea: string,
): Promise<{ jobs: JobLead[]; searchedAt: string }> {
  const jobs = await fetchLiveJobs(category, extraArea);

  if (jobs.length === 0) {
    throw new Error(
      "No live openings came back just now. Try again, or widen it with a keyword like “warehouse”.",
    );
  }

  return { jobs, searchedAt: new Date().toISOString() };
}

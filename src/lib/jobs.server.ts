import { fetchLiveJobs } from "./reed.server";
import { fetchGreenhouseJobs } from "./greenhouse.server";
import type { JobCategory, JobLead } from "./types";

export async function runJobSearch(
  category: JobCategory,
  extraArea: string,
): Promise<{ jobs: JobLead[]; searchedAt: string; notice: string | null }> {
  const [reed, company] = await Promise.all([
    fetchLiveJobs(category, extraArea),
    fetchGreenhouseJobs(category),
  ]);

  let reedResult = reed;
  let notice: string | null = null;
  // Broaden the date window only when a working source genuinely has no matches.
  if (reed.available && reed.jobs.length === 0 && company.jobs.length === 0) {
    reedResult = await fetchLiveJobs(category, extraArea, true);
    if (reedResult.jobs.length > 0) notice = "No matches from this week; showing still-listed roles from the last month.";
  }
  if (!reed.available && !company.jobs.length) {
    throw new Error("The job sites couldn't be reached just now. Please try again shortly — this doesn't mean there are no jobs.");
  }
  if (!reedResult.available || (category === "tech" && !company.available)) {
    notice = "One job source is temporarily unavailable; showing results from the sources that responded.";
  }

  const seen = new Set<string>();
  const jobs: JobLead[] = [];
  const key = (j: JobLead) => `${j.title}|${j.employer}|${j.location}`.toLowerCase().replace(/\s+/g, " ");
  for (const { postedAt: _p, ...job } of [...company.jobs, ...reedResult.jobs].sort((a, b) => b.postedAt - a.postedAt)) {
    if (!seen.has(key(job))) (seen.add(key(job)), jobs.push(job));
  }
  return { jobs, searchedAt: new Date().toISOString(), notice };
}

import type { JobCategory, JobLead } from "./types";
import { isEligibleJob, type JobSourceResult } from "./job-eligibility";

/** London-area employers with public Greenhouse careers boards. */
const BOARDS: { slug: string; name: string }[] = [
  { slug: "monzo", name: "Monzo" },
  { slug: "gocardless", name: "GoCardless" },
  { slug: "deliveroo", name: "Deliveroo" },
];

const AREA = /london|dartford|\bkent\b|gravesend|bexley|erith|crayford|(?:remote.*(?:united kingdom|\buk\b)|(?:united kingdom|\buk\b).*remote)/i;

interface GhJob {
  id: number;
  title: string;
  absolute_url: string;
  updated_at: string;
  content?: string;
  location: { name: string };
}

function posted(date: string): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days <= 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  return `Updated ${days} days ago`;
}

/** Company careers boards only carry tech/office roles, so only feed the tech tab. */
export async function fetchGreenhouseJobs(
  category: JobCategory,
): Promise<JobSourceResult<JobLead & { postedAt: number }>> {
  if (category !== "tech") return { jobs: [], available: true };
  const batches = await Promise.all(
    BOARDS.map(async (board) => {
      try {
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs?content=true`, {
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return { jobs: [], available: false };
        const data = (await res.json()) as { jobs?: GhJob[] };
        if (!Array.isArray(data.jobs)) return { jobs: [], available: false };
        return { jobs: data.jobs.map((job) => ({ job, board })), available: true };
      } catch {
        return { jobs: [], available: false };
      }
    }),
  );

  const jobs = batches
    .flatMap((batch) => batch.jobs)
    .filter(
      ({ job, board }) =>
        AREA.test(job.location?.name ?? "") && isEligibleJob(category, job.title, board.name, plainText(job.content ?? "")),
    )
    .map(({ job, board }) => ({
      postedAt: new Date(job.updated_at).getTime() || 0,
      id: `gh-${board.slug}-${job.id}`,
      category,
      title: job.title.trim(),
      employer: board.name,
      location: job.location.name,
      payHint: "Pay not listed",
      summary: plainText(job.content ?? "").slice(0, 1200) || `Listed on ${board.name}'s official careers page. Check the full advert for eligibility.`,
      whyYou:
        "An entry-level tech title — check the full advert for experience, qualifications and right-to-work requirements.",
      requirements: [],
      applyUrl: job.absolute_url,
      source: `${board.name} careers`,
      postedHint: posted(job.updated_at),
    }));
  return { jobs, available: batches.some((batch) => batch.available) };
}

function plainText(html: string): string {
  return html.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<[^>]*>/g, " ").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

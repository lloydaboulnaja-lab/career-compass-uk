import type { JobCategory, JobLead } from "./types";

/** London-area employers with public Greenhouse careers boards. */
const BOARDS: { slug: string; name: string }[] = [
  { slug: "monzo", name: "Monzo" },
  { slug: "gocardless", name: "GoCardless" },
  { slug: "deliveroo", name: "Deliveroo" },
];

const AREA = /london|dartford|kent|gravesend|bexley|erith|crayford|united kingdom|uk\b/i;
const ENTRY =
  /\b(intern|internship|graduate|junior|associate|trainee|entry|apprentice|support analyst|it support|service desk|help ?desk|tester|qa)\b/i;
const EXCLUDE =
  /\b(senior|lead|head|director|manager|principal|staff|architect|ii|iii|iv|phd)\b/i;

interface GhJob {
  id: number;
  title: string;
  absolute_url: string;
  updated_at: string;
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
): Promise<(JobLead & { postedAt: number })[]> {
  if (category !== "tech") return [];
  const batches = await Promise.all(
    BOARDS.map(async (board) => {
      try {
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs`, {
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { jobs?: GhJob[] };
        return (data.jobs ?? []).map((job) => ({ job, board }));
      } catch {
        return [];
      }
    }),
  );

  return batches
    .flat()
    .filter(
      ({ job }) =>
        AREA.test(job.location?.name ?? "") && ENTRY.test(job.title) && !EXCLUDE.test(job.title),
    )
    .map(({ job, board }) => ({
      postedAt: new Date(job.updated_at).getTime() || 0,
      id: `gh-${board.slug}-${job.id}`,
      category,
      title: job.title.trim(),
      employer: board.name,
      location: job.location.name,
      payHint: "Pay not listed",
      summary: `Open role on ${board.name}'s official careers page. Listings here are removed by the company as soon as they close.`,
      whyYou:
        "Entry-level tech work that lines up with your Level 3 T Level — check the advert's right-to-work criteria.",
      requirements: [],
      applyUrl: job.absolute_url,
      source: `${board.name} careers`,
      postedHint: posted(job.updated_at),
    }));
}

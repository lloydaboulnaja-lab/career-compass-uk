import type { JobCategory, JobLead } from "./types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

interface ReedJobDetail {
  jobId: number;
  jobTitle: string;
  jobDescriptionSnippet: string;
  dateCreated: string;
  expiryDate: string;
  displayLocationName: string;
  ouName: string;
  salaryFrom: number;
  salaryTo: number;
  salaryType: number;
  isPartTime: boolean;
}

interface ReedJob {
  jobDetail: ReedJobDetail;
  url: string;
}

interface SearchSpec {
  keywords: string[];
  proximity: number;
  offset: "LastThreeDays" | "LastWeek";
  partTime: boolean;
}

const SEARCHES: Record<JobCategory, SearchSpec> = {
  tech: {
    keywords: [
      "IT support",
      "service desk",
      "junior data analyst",
      "software tester",
      "IT technician",
      "trainee developer",
    ],
    proximity: 20,
    offset: "LastWeek",
    partTime: false,
  },
  casual: {
    keywords: [
      "retail assistant",
      "team member",
      "crew member",
      "customer assistant",
      "sales assistant",
      "barista",
    ],
    proximity: 10,
    offset: "LastThreeDays",
    partTime: true,
  },
  apprenticeship: {
    keywords: [
      "IT apprentice",
      "software apprentice",
      "data apprentice",
      "digital support apprentice",
      "cyber security apprentice",
      "software developer apprenticeship",
    ],
    proximity: 25,
    offset: "LastWeek",
    partTime: false,
  },
};

/** Roles that need years of experience or a degree — not worth showing. */
const EXCLUDE_TITLE =
  /\b(senior|lead|head of|director|manager|principal|architect|consultant|engineer ii|3rd line|third line|cleaner|cleaning|driver|driving|courier|delivery|warehouse|security officer|nursery|childcare|care assistant|carer)\b/i;
const EXCLUDE_EMPLOYER = /cashback|survey|self-?employed|commission only/i;

const ALLOW_TITLE: Record<JobCategory, RegExp> = {
  tech:
    /\b(data analyst|software tester|qa tester|quality assurance|IT support|service desk|help\s?desk|IT technician|technical support|junior (?:software|web|data|IT)|trainee (?:developer|tester|analyst|IT)|digital support|software developer|web developer|cyber security)\b/i,
  casual:
    /\b(barista|retail assistant|sales assistant|shop assistant|customer assistant|store assistant|crew member|team member|waiter|waitress|restaurant server|front of house|cashier|food service assistant)\b/i,
  apprenticeship:
    /\b(?:apprentice|apprenticeship)\b.*\b(?:IT|software|data|digital|technology|tech|cyber|developer|support)\b|\b(?:IT|software|data|digital|technology|tech|cyber|developer|support)\b.*\b(?:apprentice|apprenticeship)\b/i,
};

const AGE_RESTRICTED_DESCRIPTION =
  /\b(?:must be|need to be|applicants? must be|aged)\s+(?:at least\s+)?18\b|\b18\+\b|\bfull (?:UK )?driving licen[cs]e required\b/i;

const WHY: Record<JobCategory, string> = {
  tech: "Entry-level tech work that lines up with your Level 3 T Level in Digital Software Development.",
  casual: "A customer-facing role suitable to check as a 17-year-old near Dartford.",
  apprenticeship:
    "A tech apprenticeship that builds on your Level 3 T Level — check the advert's residency and visa criteria.",
};

function money(job: ReedJobDetail): string {
  const { salaryFrom: from, salaryTo: to, salaryType: type } = job;
  if (!from) return "Pay not listed";
  if (type === 1) return from === to ? `£${from}/hr` : `£${from}–£${to}/hr`;
  if (type === 5) {
    const k = (value: number) => `£${Math.round(value / 1000)}k`;
    return from === to ? `${k(from)}` : `${k(from)}–${k(to)}`;
  }
  return `£${from}`;
}

function posted(dateCreated: string): string {
  const days = Math.floor((Date.now() - new Date(dateCreated).getTime()) / 86_400_000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}

async function fetchReed(spec: SearchSpec, keywords: string): Promise<ReedJob[]> {
  const url = `https://www.reed.co.uk/jobs?keywords=${encodeURIComponent(keywords)}&location=Dartford&proximity=${spec.proximity}&datecreatedoffset=${spec.offset}${spec.partTime ? "&parttime=on" : ""}`;
  try {
    const response = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html" },
      redirect: "follow",
    });
    if (!response.ok) return [];
    const html = await response.text();
    const match = /id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s.exec(html);
    if (!match?.[1]) return [];
    const data = JSON.parse(match[1]) as {
      props?: { pageProps?: { searchResults?: { jobs?: ReedJob[] } } };
    };
    return data.props?.pageProps?.searchResults?.jobs ?? [];
  } catch (error) {
    console.error("reed fetch failed", keywords, error);
    return [];
  }
}

export async function fetchLiveJobs(
  category: JobCategory,
  extraArea: string,
): Promise<JobLead[]> {
  const spec = SEARCHES[category];
  const queries = extraArea.trim() ? [extraArea.trim(), ...spec.keywords] : spec.keywords;

  const batches = await Promise.all(queries.map((keywords) => fetchReed(spec, keywords)));

  const now = Date.now();
  const seen = new Set<number>();
  const leads: JobLead[] = [];

  for (const batch of batches) {
    for (const { jobDetail: detail, url } of batch) {
      if (!detail || seen.has(detail.jobId)) continue;
      if (detail.expiryDate && new Date(detail.expiryDate).getTime() < now) continue;
      if (EXCLUDE_TITLE.test(detail.jobTitle)) continue;
      if (EXCLUDE_EMPLOYER.test(detail.ouName ?? "")) continue;
      if (!ALLOW_TITLE[category].test(detail.jobTitle)) continue;
      if (AGE_RESTRICTED_DESCRIPTION.test(detail.jobDescriptionSnippet ?? "")) continue;
      seen.add(detail.jobId);

      leads.push({
        id: `reed-${detail.jobId}`,
        category,
        title: detail.jobTitle,
        employer: detail.ouName || "Employer",
        location: detail.displayLocationName || "Kent / London",
        payHint: money(detail),
        summary: (detail.jobDescriptionSnippet || "").replace(/\s+/g, " ").trim(),
        whyYou: WHY[category],
        requirements: detail.isPartTime ? ["Part-time hours available"] : [],
        applyUrl: `https://www.reed.co.uk${url}`,
        source: "Reed",
        postedHint: posted(detail.dateCreated),
      });
    }
  }

  return leads
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 24);
}

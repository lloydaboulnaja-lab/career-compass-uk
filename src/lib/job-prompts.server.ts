import type { JobCategory } from "./types";

const AREA = `Dartford (DA1/DA2), Gravesend, Bexleyheath, Erith, Crayford, Swanley, Sidcup, Bluewater Shopping Centre, Greenhithe, Bromley, and central/South East London reachable by train from Dartford`;

const CANDIDATE = `The candidate is an international student in the UK living in Dartford, Kent. They are studying a Level 3 T Level in Digital Software Development. They are NOT eligible for a standard apprenticeship funding route or home-fee university at the moment, and cannot afford international fees. They have limited formal work experience but real coding coursework. They usually hold a student visa with a 20 hours/week term-time work limit.`;

export const CATEGORY_BRIEF: Record<JobCategory, string> = {
  tech: `Entry-level / junior tech and digital roles that explicitly do NOT require a degree: data analyst, junior data/reporting analyst, software tester / QA tester, IT support technician, IT admin, service desk / 1st line support, junior developer, digital marketing analyst, tech-adjacent office roles. Prioritise employers who accept T Levels, BTECs, or "no degree required".`,
  casual: `Casual, part-time, weekend and flexible jobs suited to a student working up to 20 hours a week: fast food (McDonald's, Wingstop, KFC, Five Guys, Nando's), restaurants and hospitality (Wagamama, Pizza Express, TGI, local cafes), retail (Primark, H&M, M&S, Foot Locker, JD Sports, Sports Direct, Next, Zara, Superdrug, Boots), supermarkets (Tesco, Sainsbury's, Aldi, Lidl, Asda), Bluewater Shopping Centre stores, warehouse/stockroom, cinema, leisure and local independent shops.`,
  apprenticeship: `Level 4+ (and higher/degree) apprenticeships in tech that follow on from a Level 3 T Level. IMPORTANT: flag clearly whether the employer sponsors or accepts non-UK/EU nationals, or requires 3 years UK residency. Prefer large employers and government/NHS/finance/tech schemes that state visa or residency criteria openly.`,
};

export function buildJobSearchPrompt(category: JobCategory, extraArea: string, today: string) {
  return `You are a UK job-hunting research assistant with live web search. Today's date is ${today}. Search the web NOW and only report openings you actually found in the search results.

CANDIDATE
${CANDIDATE}

AREA
${AREA}${extraArea ? `\nExtra focus requested by the candidate: ${extraArea}` : ""}

WHAT TO FIND
${CATEGORY_BRIEF[category]}

FRESHNESS RULES — the most important part
- Search live job boards and employer careers sites (Indeed UK, Reed, Totaljobs, LinkedIn Jobs, GOV.UK Find a job, NHS Jobs, and employers' own careers pages).
- Only include vacancies that are OPEN RIGHT NOW as of ${today}. If a listing looks older than ~30 days, closed, or you cannot confirm it from search results, DROP IT.
- "applyUrl" must be a URL you actually saw in the search results and that still resolves. Never construct or guess a URL with invented job IDs. If you only have the employer's careers search page, use that page — that is better than a dead deep link.
- "postedHint" must state the real freshness you saw ("Posted 2 days ago", "Listed 12 Aug 2026", "Rolling — always hiring").
- "source" is the site the listing came from (e.g. "Indeed UK", "Tesco Careers").

OTHER RULES
- Only roles a person with no degree and no long work history can realistically apply for.
- "payHint": realistic UK pay (e.g. "£12.21/hr (NLW)" or "£24k-£27k").
- "whyYou": one punchy sentence linking the role to the candidate's T Level / situation.
- Return 8-12 results. Quality and freshness beat quantity — fewer confirmed-live roles is better than padding with stale ones.

Reply with ONLY a JSON array, no prose, each item exactly:
{"title":"","employer":"","location":"","payHint":"","summary":"","whyYou":"","requirements":["",""],"applyUrl":"","source":"","postedHint":""}`;
}


export function buildTailorPrompt(input: {
  cvText: string;
  jobTitle: string;
  employer: string;
  jobDescription: string;
}) {
  return `You are a sharp UK recruitment consultant who has placed hundreds of school-leavers and career starters. You rewrite CVs so a busy hiring manager says "interview" in 8 seconds.

TARGET ROLE: ${input.jobTitle} at ${input.employer}
JOB DETAILS / ADVERT:
${input.jobDescription}

CANDIDATE'S CURRENT CV:
${input.cvText}

REWRITE RULES — these matter:
- Sound like a real person wrote it. Plain, confident, specific British English.
- BANNED words and phrases: "leverage", "utilise", "passionate about", "dynamic", "synergy", "spearheaded", "delve", "in today's fast-paced world", "proven track record", "team player", "detail-oriented" (show it instead), em dashes used as drama, and any sentence that could describe anyone.
- Every bullet: action + what you actually did + a concrete number, tool, or outcome. Invent NOTHING — only reframe what is already in the CV. If a number is genuinely unknown, use scope instead ("across a 6-week group project").
- Mirror the exact keywords from the advert (ATS matters) but only where they're honest.
- Keep it to one page of content. Short profile (max 3 lines), then the sections that matter most for THIS job first.
- For casual/retail/hospitality roles: lead with reliability, customer interaction, availability and pace, not code.
- For tech roles: lead with tools, projects, and what was built or tested.

Reply with ONLY JSON, no prose:
{
  "cvMarkdown": "the full tailored CV in markdown, using # Name, ## Section headings and - bullets",
  "matchNotes": ["3-5 short notes on what you changed and why it lands"],
  "keywords": ["6-10 exact keywords from the advert now present in the CV"],
  "coverNote": "a 90-120 word message they can paste into an application form or email. Human, direct, no filler opening line."
}`;
}

export type JobCategory = "tech" | "casual" | "apprenticeship";

export interface JobLead {
  id: string;
  title: string;
  employer: string;
  location: string;
  category: JobCategory;
  payHint: string;
  summary: string;
  whyYou: string;
  requirements: string[];
  applyUrl: string;
  source: string;
  postedHint: string;
}

export interface TailorResult {
  cvMarkdown: string;
  matchNotes: string[];
  keywords: string[];
  coverNote: string;
}

export const CATEGORY_LABEL: Record<JobCategory, string> = {
  tech: "Entry-level tech",
  casual: "Casual & retail",
  apprenticeship: "Level 4+ apprenticeships",
};

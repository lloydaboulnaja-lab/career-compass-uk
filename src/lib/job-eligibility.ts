import type { JobCategory } from "./types";

const EXCLUDED_TITLE = /\b(senior|lead|head of|director|manager|principal|architect|consultant|engineer ii|3rd line|third line|cleaner|cleaning|driver|driving|courier|delivery|warehouse|security officer|nursery|childcare|care assistant|carer|legal counsel|sales engineer|field service|field hardware)\b/i;
const COURSE = /job guarantee|guaranteed job|boot\s?camp|training course|course fee|self[- ]funded|study now|traineeship programme fee|training and placement|pay.*(?:course|training)|(?:course|training).*payment|(?:government[- ]funded|IT support|software development|cyber security) course|opportunity that leads to (?:a |an )?(?:rewarding )?job/i;
const COURSE_EMPLOYER = /cashback|survey|self-?employed|commission only|ITOL Recruit|IT Career Switch|ITonlinelearning|The Training Room/i;
const RESTRICTED = /\b(?:must be|need to be|applicants? must be|aged)\s+(?:at least\s+)?18\b|\b18\+(?:\s|$)|\b(?:full (?:UK )?)?driving licen[cs]e (?:is )?(?:required|essential)\b/i;
const DEGREE_REQUIRED = /(?:degree|bachelor[’']?s|master[’']?s)\s+(?:is\s+)?(?:required|essential)|(?:must have|requires?|hold|holding|pursuing|enrolled in|working towards)\s+(?:an?\s+)?(?:[^.!?\n]{0,45}\s)?(?:degree|bachelor[’']?s|master[’']?s)|\bminimum\s+\d+\s+years?\b/i;
const TECH = /\b(?:IT (?:support|technician|admin(?:istrator)?|helpdesk)|information technology|service desk|software (?:tester|developer|engineer)|web developer|data (?:analyst|scientist|engineer)|QA(?: tester| engineer)?|quality assurance|digital support|cyber ?security|computer hardware|technical support|help\s?desk)\b/i;
const IT_CONTEXT = /\b(?:IT|software|hardware|computer|technical|technology|network|windows|microsoft|SaaS|SQL|Python)\b/i;
const ENTRY = /\b(?:junior|trainee|intern|internship|entry[- ]level|associate|1st line|first line|IT support|IT technician|IT admin(?:istrator)?|service desk|help\s?desk|software tester|QA tester|technical support)\b/i;
const CASUAL = /\b(?:barista|retail assistant|sales assistant|shop assistant|customer assistant|store assistant|crew member|team member|waiter|waitress|restaurant server|front of house|cashier|food service assistant)\b/i;
const APPRENTICE = /\bapprentice(?:ship)?\b/i;
const APPRENTICE_TECH = /\b(?:IT|software|data|digital|technology|tech|cyber|developer)\b/i;
const EXPERIENCED = /\b(?:recruiting|looking|searching) for an? (?:experienced|skilled)\b|\bopportunity for an? experienced\b|\b(?:proven|extensive|significant|strong) (?:commercial |professional )?experience (?:is )?(?:required|essential)\b/i;

/** Conservative screening of advertised text, not a guarantee of eligibility. */
export function isEligibleJob(category: JobCategory, title: string, employer: string, description: string): boolean {
  const text = `${title} ${description}`;
  if (EXCLUDED_TITLE.test(title) || COURSE_EMPLOYER.test(employer) || COURSE.test(text) || RESTRICTED.test(text)) return false;
  if (category === "casual") return CASUAL.test(title);
  if (DEGREE_REQUIRED.test(description)) return false;
  if (category === "apprenticeship") return APPRENTICE.test(title) && APPRENTICE_TECH.test(title);
  if (EXPERIENCED.test(description)) return false;
  if (APPRENTICE.test(title) || !TECH.test(title) || !ENTRY.test(title)) return false;
  // Facilities/customer-service helpdesks are not necessarily IT roles.
  if (/help\s?desk|technical support/i.test(title) && !IT_CONTEXT.test(text)) return false;
  return true;
}

export interface JobSourceResult<T> {
  jobs: T[];
  available: boolean;
}
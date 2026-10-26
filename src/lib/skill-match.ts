import type { JobLead } from './types';

const SKILLS = [
  ['Python', ['python'], 'Build a small data-cleaning script and describe what it does.'],
  ['SQL', ['sql', 'mysql', 'postgresql'], 'Practise joins and grouping on a sample dataset; add the project to your CV.'],
  ['Excel', ['excel', 'spreadsheets'], 'Create a spreadsheet with formulas, a pivot table and a useful chart.'],
  ['Power BI', ['power bi', 'powerbi'], 'Build a dashboard with a public dataset and explain one finding.'],
  ['JavaScript', ['javascript', 'js'], 'Build a small interactive page and publish the source.'],
  ['TypeScript', ['typescript'], 'Add types and validation to a small web project.'],
  ['React', ['react', 'reactjs'], 'Build a small React app with forms and state.'],
  ['HTML', ['html'], 'Build a semantic, accessible page and include a project link.'],
  ['CSS', ['css'], 'Make a page work across phone and desktop sizes.'],
  ['Java', ['java'], 'Build a small Java project with tests.'],
  ['C#', ['c#', 'c sharp'], 'Build a small C# application and explain its purpose.'],
  ['Git', ['git', 'github', 'version control'], 'Use commits and branches in a project; include the repository link.'],
  ['Software testing', ['software testing', 'manual testing', 'test cases', 'quality assurance', 'qa', 'software tester'], 'Write test cases for a project, record bugs and show how you retested fixes.'],
  ['IT support', ['it support', 'technical support', 'helpdesk', 'service desk', 'troubleshooting'], 'Document a troubleshooting example: the issue, steps taken and the fix.'],
  ['Networking', ['networking', 'tcp/ip', 'dns', 'network support'], 'Practise diagnosing a connection issue and explain the steps.'],
  ['Microsoft 365', ['microsoft 365', 'office 365', 'm365'], 'Practise common account and document tasks; describe only those you can do.'],
  ['Data analysis', ['data analysis', 'data analyst', 'data analytics'], 'Analyse a public dataset and write up the question, method and finding.'],
  ['Customer service', ['customer service', 'customer support', 'customer assistant', 'customer enquiries'], 'Use a real example of helping someone, explaining a solution and following up.'],
  ['Communication', ['communication', 'communicate', 'communicating'], 'Add an example of explaining a project or helping a customer clearly.'],
  ['Teamwork', ['teamwork', 'team work', 'team player', 'collaboration', 'collaborated'], 'Describe your own contribution to a group project, not just the team result.'],
  ['Sales', ['sales', 'selling', 'sales assistant'], 'Add genuine experience helping someone choose a product; do not invent sales figures.'],
  ['Cash handling', ['cash handling', 'till', 'pos', 'point of sale'], 'If you have till experience, describe it; otherwise ask about supervised training.'],
  ['Barista skills', ['barista', 'coffee making', 'espresso'], 'Practise safe drink preparation through supervised training; add real experience only.'],
  ['Food service', ['food service', 'waiter', 'waitress', 'waiting tables', 'front of house'], 'Show real customer-facing experience and ask about food-safety training.'],
] as const;

function contains(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i').test(text);
}

function lines(text: string) {
  return text.split(/\n|(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
}

export function extractCvSkills(cv: string) {
  return SKILLS.flatMap(([name, aliases]) => {
    const evidence = lines(cv).find(line => aliases.some(alias => contains(line, alias)) && !/\b(no experience|not familiar|never used|want to learn|interested in learning)\b/i.test(line));
    if (!evidence) return [];
    const level = /\b(built|created|developed|tested|used|supported|served|analysed|analyzed|managed|worked|implemented|maintained)\b/i.test(evidence) ? 'Practical evidence' : /\b(learning|basic|beginner|studying|course|studied)\b/i.test(evidence) ? 'Learning' : 'Mentioned';
    return [{ name, level, evidence }];
  });
}

export function matchCvToJob(cv: string, job: Pick<JobLead, 'title' | 'summary' | 'requirements'>, advert?: string) {
  const description = advert?.trim() || [job.summary, ...job.requirements].join('\n');
  const cvSkills = extractCvSkills(cv);
  const skills = SKILLS.flatMap(([name, aliases, improvement]) => {
    const explicit = lines(description).find(line => aliases.some(alias => contains(line, alias)));
    const inTitle = aliases.some(alias => contains(job.title, alias));
    if (!explicit && !inTitle) return [];
    const candidate = cvSkills.find(skill => skill.name === name);
    const requiredLevel = explicit && /\b(advanced|expert|proficient|experienced)\b/i.test(explicit) ? 'Experience requested' : explicit && /\b(basic|beginner|entry.level|training provided)\b/i.test(explicit) ? 'Basic / training' : 'Not specified';
    return [{ name, requiredLevel, source: explicit ? 'Advert text' : 'Role title only', level: candidate?.level ?? 'Not shown', evidence: candidate?.evidence ?? '', improvement, met: Boolean(candidate) }];
  });
  const matched = skills.filter(skill => skill.met).length;
  return { skills, matched, total: skills.length, score: skills.length ? Math.round(matched / skills.length * 100) : null };
}
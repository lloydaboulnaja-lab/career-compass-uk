import { useMemo, useState } from 'react';
import { Check, CircleHelp } from 'lucide-react';
import { matchCvToJob } from '@/lib/skill-match';
import type { JobLead } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

export function JobSkillMatch({ job, cvText, fullAdvert, expanded = false, onAdvertChange }: { job: Pick<JobLead, 'title' | 'summary' | 'requirements'>; cvText: string; fullAdvert?: string; expanded?: boolean; onAdvertChange?: (advert: string) => void }) {
  const [advert, setAdvert] = useState('');
  const match = useMemo(() => matchCvToJob(cvText, job, fullAdvert || advert), [cvText, job.title, job.summary, job.requirements, fullAdvert, advert]);
  return <div className="space-y-2 border-t border-border pt-3">
    <div className="flex items-center justify-between gap-2 text-sm"><h4 className="font-semibold">CV skill match</h4><span className="font-semibold text-primary">{cvText && match.score !== null ? `${match.score}%` : 'Not rated'}</span></div>
    {cvText && match.score !== null && <Progress value={match.score} aria-label="CV skill evidence coverage" />}
    <p className="text-xs text-muted-foreground">{!cvText ? 'Add your CV above to compare your skills.' : match.total ? `${match.matched} of ${match.total} detected skills shown in your CV.` : 'Not enough skill detail in this listing to score.'} Evidence coverage, not a hiring probability or eligibility check.</p>
    <details open={expanded || undefined} className="text-xs">
      <summary className="cursor-pointer py-1 font-medium text-primary">Skills, gaps & tailoring tips</summary>
      <div className="space-y-3 pt-2">
        <p className="text-muted-foreground">Levels reflect wording, not tested ability. Title-only skills are inferred; check the full advert for requirements.</p>
        {match.skills.map(skill => <div key={skill.name} className="space-y-1 border-b border-border pb-3">
          <div className="flex items-start gap-2">{skill.met ? <Check className="mt-0.5 size-3.5 shrink-0 text-primary" /> : <CircleHelp className="mt-0.5 size-3.5 shrink-0 text-signal" />}<span className="font-semibold">{skill.name} · {cvText ? skill.level : 'CV needed'}</span></div>
          <p className="text-muted-foreground">Job level: {skill.requiredLevel} · {skill.source}</p>
          {skill.evidence && <p className="break-words text-muted-foreground">CV evidence: “{skill.evidence.slice(0, 220)}”</p>}
          <p>{skill.met ? `Tailoring: move your real ${skill.name} example nearer the top; say what you did and the result. ${skill.requiredLevel === 'Experience requested' ? 'A mention alone does not establish the requested level.' : ''}` : skill.improvement}</p>
        </div>)}
        {fullAdvert === undefined && <div className="space-y-1"><label className="font-medium">Full advert for a closer match<Textarea aria-label={`Full advert for ${job.title}`} className="mt-1 text-xs" rows={4} value={advert} maxLength={8000} onChange={event => { setAdvert(event.target.value); onAdvertChange?.(event.target.value); }} placeholder="Paste the employer’s requirements" /></label></div>}
        <p className="text-muted-foreground">Keep only genuine skills. Use plain wording and one specific example, not inflated claims.</p>
      </div>
    </details>
  </div>;
}
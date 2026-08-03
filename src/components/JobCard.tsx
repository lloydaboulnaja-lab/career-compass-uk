import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Sparkles, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JobLead } from "@/lib/types";

interface Props {
  job: JobLead;
  saved: boolean;
  onToggleSave: (job: JobLead) => void;
  onTailor: (job: JobLead) => void;
}

export function JobCard({ job, saved, onToggleSave, onTailor }: Props) {
  return (
    <article className="surface-card flex h-full flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold leading-tight">{job.title}</h3>
          <p className="text-sm font-medium text-muted-foreground">{job.employer}</p>
        </div>
        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save job"}
          onClick={() => onToggleSave(job)}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {saved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="secondary" className="gap-1 font-normal">
          <MapPin className="size-3" /> {job.location}
        </Badge>
        {job.payHint && (
          <Badge variant="secondary" className="gap-1 font-normal">
            <Wallet className="size-3" /> {job.payHint}
          </Badge>
        )}
        {job.postedHint && (
          <Badge variant="outline" className="font-normal">
            {job.postedHint}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{job.summary}</p>

      {job.whyYou && (
        <p className="rounded-md bg-signal/25 px-3 py-2 text-sm font-medium text-foreground">
          {job.whyYou}
        </p>
      )}

      {job.requirements.length > 0 && (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {job.requirements.slice(0, 4).map((req) => (
            <li key={req} className="flex gap-2">
              <span aria-hidden className="text-primary">
                •
              </span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <Button asChild size="sm" variant="outline">
          <a href={job.applyUrl} target="_blank" rel="noreferrer noopener">
            Apply <ExternalLink className="size-3.5" />
          </a>
        </Button>
        <Button asChild size="sm" onClick={() => onTailor(job)}>
          <Link to="/cv">
            <Sparkles className="size-3.5" /> Tailor my CV
          </Link>
        </Button>
      </div>
      {job.source && <p className="text-xs text-muted-foreground">Source: {job.source}</p>}
    </article>
  );
}

import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, ArrowUpRight, MapPin, Sparkles, Wallet } from "lucide-react";
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
    <article className="surface-card group relative flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {job.postedHint && (
            <span className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="size-1.5 rounded-full bg-signal" aria-hidden />
              {job.postedHint}
            </span>
          )}
          <h3 className="font-display text-lg font-bold leading-tight">{job.title}</h3>
          <p className="truncate text-sm font-medium text-muted-foreground">{job.employer}</p>
        </div>
        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save job"}
          onClick={() => onToggleSave(job)}
          className="shrink-0 rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
      </div>

      <p className="line-clamp-4 text-sm text-muted-foreground">{job.summary}</p>

      {job.whyYou && (
        <p className="rounded-md border-l-2 border-signal bg-signal/20 px-3 py-2 text-sm font-medium text-foreground">
          {job.whyYou}
        </p>
      )}

      {job.requirements.length > 0 && (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {job.requirements.slice(0, 3).map((req) => (
            <li key={req} className="flex gap-2">
              <span aria-hidden className="text-primary">
                •
              </span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button asChild size="sm" className="flex-1">
          <a href={job.applyUrl} target="_blank" rel="noreferrer noopener">
            Apply <ArrowUpRight className="size-3.5" />
          </a>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1" onClick={() => onTailor(job)}>
          <Link to="/cv">
            <Sparkles className="size-3.5" /> Tailor CV
          </Link>
        </Button>
        {job.source && (
          <span className="w-full text-[11px] text-muted-foreground">Live on {job.source}</span>
        )}
      </div>
    </article>
  );
}

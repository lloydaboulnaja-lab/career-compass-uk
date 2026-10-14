import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, ArrowUpRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { savedJobs, subscribeStore, trackerStore, TRACK_STATUSES, type TrackStatus } from "@/lib/storage";
import { CATEGORY_LABEL, type JobLead } from "@/lib/types";

export function ApplicationTracker() {
  const [jobs, setJobs] = useState<JobLead[]>([]);
  const [statuses, setStatuses] = useState<Record<string, TrackStatus>>({});

  useEffect(() => {
    const sync = () => {
      setJobs(savedJobs.get());
      setStatuses(trackerStore.get());
    };
    sync();
    return subscribeStore(sync);
  }, []);

  return (
    <>
      <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {TRACK_STATUSES.map((status) => (
          <div key={status} className="border-b border-border py-3">
            <p className="text-2xl font-bold">{jobs.filter((job) => (statuses[job.id] ?? "Saved") === status).length}</p>
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
        ))}
      </div>
      {jobs.length === 0 ? (
        <div className="py-12 text-center">
          <Bookmark className="mx-auto mb-4 size-8 text-primary" />
          <h2 className="text-xl font-bold">No applications yet</h2>
          <Button asChild className="mt-5"><Link to="/">Browse jobs <ArrowUpRight /></Link></Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <article key={job.id} className="surface-card flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <span className="text-xs font-medium text-primary">{CATEGORY_LABEL[job.category]}</span>
                <h2 className="mt-1 text-lg font-bold">{job.title}</h2>
                <p className="text-sm text-muted-foreground">{job.employer} · {job.location}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <select
                  aria-label={`Application status for ${job.title}`}
                  value={statuses[job.id] ?? "Saved"}
                  onChange={(event) => trackerStore.set(job.id, event.target.value as TrackStatus)}
                  className="h-9 min-w-28 rounded-md border border-input bg-background px-2 text-sm"
                >
                  {TRACK_STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
                <Button asChild size="sm" variant="outline"><a href={job.applyUrl} target="_blank" rel="noreferrer noopener">Open <ArrowUpRight /></a></Button>
                <Button size="icon" variant="ghost" aria-label={`Remove ${job.title} from tracker`} title="Remove from tracker" onClick={() => savedJobs.remove(job.id)}><Trash2 /></Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
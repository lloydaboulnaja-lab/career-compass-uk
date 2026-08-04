import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Inbox, Loader2, Mail, Radar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findJobs } from "@/lib/bot.functions";
import { digestStore, savedJobs, subscribeStore, type DigestEntry } from "@/lib/storage";
import { CATEGORY_LABEL, type JobCategory, type JobLead } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dartford Job Bot — entry-level tech & casual jobs in Kent" },
      {
        name: "description",
        content:
          "A job bot for Dartford, Gravesend, Bexley and London: no-degree tech roles, casual retail and hospitality work, Level 4 apprenticeships, plus CV tailoring for every application.",
      },
      { property: "og:title", content: "Dartford Job Bot — jobs that don't need a degree" },
      {
        property: "og:description",
        content:
          "Daily entry-level tech, casual and apprenticeship openings across Kent and South East London, with a CV tailored to each role.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Feed,
});

const CATEGORIES: JobCategory[] = ["tech", "casual", "apprenticeship"];
const EMPTY_JOBS: JobLead[] = [];
const EMPTY_DIGEST: DigestEntry[] = [];

function Feed() {
  const [category, setCategory] = useState<JobCategory>("tech");
  const [extraArea, setExtraArea] = useState("");
  const [jobs, setJobs] = useState<JobLead[]>([]);
  const [ranAt, setRanAt] = useState<string | null>(null);

  const [saved, setSaved] = useState<JobLead[]>(EMPTY_JOBS);
  const [digest, setDigest] = useState<DigestEntry[]>(EMPTY_DIGEST);

  useEffect(() => {
    const sync = () => {
      setSaved(savedJobs.get());
      setDigest(digestStore.get());
    };
    sync();
    return subscribeStore(sync);
  }, []);

  const run = useServerFn(findJobs);
  const mutation = useMutation({
    mutationFn: (input: { category: JobCategory; extraArea: string }) =>
      run({ data: input }),
    onSuccess: (result, variables) => {
      setJobs(result.jobs);
      setRanAt(result.searchedAt);
      digestStore.add({
        id: `${Date.now()}`,
        sentAt: result.searchedAt,
        subject: `${result.jobs.length} ${CATEGORY_LABEL[variables.category].toLowerCase()} openings near Dartford`,
        jobs: result.jobs,
      });
      toast.success(`Found ${result.jobs.length} openings`);
    },
    onError: (error: Error) => toast.error(error.message || "The bot couldn't finish that run."),
  });

  useEffect(() => {
    setJobs([]);
    setRanAt(null);
  }, [category]);

  const savedIds = new Set(saved.map((j) => j.id));

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="grid-paper border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <Badge className="mb-4 bg-signal text-signal-foreground hover:bg-signal">
            Dartford · Gravesend · Bexley · London
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            Jobs you can actually get, without a degree.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Run the bot and it goes looking for entry-level tech roles, casual shifts at the places
            round you, and Level 4 apprenticeships that take international students. Then it rewrites
            your CV for whichever one you go for.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={extraArea}
              onChange={(event) => setExtraArea(event.target.value)}
              placeholder="Anything specific? e.g. Bluewater weekends, IT support only"
              maxLength={200}
              className="sm:max-w-md"
            />
            <Button
              size="lg"
              onClick={() => mutation.mutate({ category, extraArea })}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Searching…
                </>
              ) : (
                <>
                  <Radar className="size-4" /> Run the bot
                </>
              )}
            </Button>
          </div>

          <Tabs
            value={category}
            onValueChange={(value) => setCategory(value as JobCategory)}
            className="mt-6"
          >
            <TabsList>
              {CATEGORIES.map((item) => (
                <TabsTrigger key={item} value={item}>
                  {CATEGORY_LABEL[item]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {ranAt && (
          <p className="mb-4 text-sm text-muted-foreground">
            Last run {new Date(ranAt).toLocaleString("en-GB")} · always double-check the listing is
            still open before you apply.
          </p>
        )}

        {mutation.isPending && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="surface-card h-56 animate-pulse bg-muted/40" />
            ))}
          </div>
        )}

        {!mutation.isPending && jobs.length === 0 && (
          <div className="surface-card p-10 text-center">
            <h2 className="font-display text-xl font-bold">Nothing in the feed yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Pick a category above and hit “Run the bot”. Each run also drops a digest into your
              inbox below.
            </p>
          </div>
        )}

        {jobs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedIds.has(job.id)}
                onToggleSave={(target) => {
                  const added = savedJobs.toggle(target);
                  toast.success(added ? "Saved" : "Removed from saved");
                }}
                onTailor={(target) => {
                  window.localStorage.setItem("kjb.selectedJob", JSON.stringify(target));
                  window.dispatchEvent(new Event("kjb-storage"));
                }}
              />
            ))}
          </div>
        )}

        {saved.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold">Saved ({saved.length})</h2>
            <div className="mt-4 grid gap-3">
              {saved.map((job) => (
                <div
                  key={job.id}
                  className="surface-card flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.employer} · {job.location}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <a href={job.applyUrl} target="_blank" rel="noreferrer noopener">
                        Open
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => savedJobs.remove(job.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}



      </main>
    </div>
  );
}

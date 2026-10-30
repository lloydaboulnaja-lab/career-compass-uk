import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, Radar } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { JobCard } from "@/components/JobCard";
import { ApplicationTracker } from "@/components/ApplicationTracker";
import { extractCvSkills } from "@/lib/skill-match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findJobs } from "@/lib/bot.functions";
import {
  savedJobs,
  cvStore,
  subscribeStore,
} from "@/lib/storage";
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

function Feed() {
  const [category, setCategory] = useState<JobCategory>("tech");
  const [extraArea, setExtraArea] = useState("");
  const [jobs, setJobs] = useState<JobLead[]>([]);
  const [ranAt, setRanAt] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [saved, setSaved] = useState<JobLead[]>(EMPTY_JOBS);
  const [cvText, setCvText] = useState("");

  useEffect(() => {
    const sync = () => {
      setSaved(savedJobs.get());
      setCvText(cvStore.get());
    };
    sync();
    return subscribeStore(sync);
  }, []);

  const run = useServerFn(findJobs);
  const mutation = useMutation({
    mutationFn: (input: { category: JobCategory; extraArea: string }) =>
      run({ data: input }),
    onSuccess: (result) => {
      setJobs(result.jobs);
      setRanAt(result.searchedAt);
      setNotice(result.notice);
      if (result.jobs.length) toast.success(`Found ${result.jobs.length} live openings`);
    },
    onError: (error: Error) => toast.error(error.message || "The bot couldn't finish that run."),
  });


  useEffect(() => {
    setJobs([]);
    setRanAt(null);
    setNotice(null);
  }, [category]);

  const savedIds = new Set(saved.map((j) => j.id));

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="grid-paper border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <Badge className="mb-4 bg-signal text-signal-foreground hover:bg-signal">
            Dartford · Gravesend · Bexley · London
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold leading-[1.05] sm:text-5xl">
            Jobs you can actually get, without a degree.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
             Entry-level tech, local retail and tech apprenticeships, with CV matching and optional
             tailoring. Known closed adverts and advertised course fees are filtered out;
             check each employer’s full requirements before applying.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
            {["Live adverts only", "No cleaner / driver roles", "16–18 friendly", "Tech-only apprenticeships"].map(
              (chip) => (
                <span key={chip} className="rounded-full border border-border bg-card px-3 py-1">
                  {chip}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
          <Tabs value={category} onValueChange={(value) => setCategory(value as JobCategory)}>
            <TabsList className="w-full">
              {CATEGORIES.map((item) => (
                <TabsTrigger key={item} value={item} className="flex-1 text-xs sm:text-sm">
                  {CATEGORY_LABEL[item]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={extraArea}
              onChange={(event) => setExtraArea(event.target.value)}
              placeholder="Anything specific? e.g. Bluewater weekends, IT support"
              maxLength={200}
              className="sm:max-w-md"
            />
            <Button
              onClick={() => mutation.mutate({ category, extraArea })}
              disabled={mutation.isPending}
              className="sm:w-auto"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Checking adverts…
                </>
              ) : (
                <>
                  <Radar className="size-4" /> Run the bot
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-8 space-y-3 border-b border-border pb-6">
          <h2 className="text-xl font-bold">Your skills & job fit</h2>
          {cvText ? <>
            <div className="flex flex-wrap gap-2">{extractCvSkills(cvText).map(skill => <Badge key={skill.name} variant="secondary">{skill.name} · {skill.level}</Badge>)}</div>
            <p className="text-sm text-muted-foreground">Matches below compare available job text with your CV. Missing evidence is not necessarily a missing skill.</p>
          </> : <p className="text-sm text-muted-foreground">No CV added yet. Add yours with the upload button at the top right.</p>}
        </section>
        {ranAt && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{jobs.length}</strong> live{" "}
              {CATEGORY_LABEL[category].toLowerCase()} openings
            </span>
            <span>Checked {new Date(ranAt).toLocaleString("en-GB")}</span>
          </div>
        )}
        {notice && <p role="status" className="mb-4 text-sm text-muted-foreground">{notice}</p>}
        {mutation.isError && <p role="alert" className="mb-4 text-sm text-destructive">{mutation.error.message}</p>}

        {mutation.isPending && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="surface-card h-56 animate-pulse bg-muted/40" />
            ))}
          </div>
        )}

        {!mutation.isPending && jobs.length === 0 && (
          <div className="surface-card p-8 text-center sm:p-10">
            <h2 className="font-display text-xl font-bold">
              {ranAt ? "Nothing live in that category right now" : "Nothing in the feed yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {ranAt
                 ? "No roles met the filters in the latest search. Try another category or check again later."
                : "Pick a category above and hit “Run the bot” — it only keeps adverts that are still open."}
            </p>
          </div>
        )}

        {jobs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                cvText={cvText}
                saved={savedIds.has(job.id)}
                onToggleSave={(target) => {
                  const added = savedJobs.toggle(target);
                  toast.success(added ? "Added to your tracker" : "Removed from tracker");
                }}
                onTailor={(target) => {
                  window.localStorage.setItem("kjb.selectedJob", JSON.stringify(target));
                  window.dispatchEvent(new Event("kjb-storage"));
                }}
              />
            ))}
          </div>
        )}

        <section className="mt-12 border-t border-border pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold sm:text-2xl">Application tracker</h2>
            <Button asChild variant="outline" size="sm"><Link to="/tracker">View tracker</Link></Button>
          </div>
          <ApplicationTracker />
        </section>



      </main>
    </div>
  );
}

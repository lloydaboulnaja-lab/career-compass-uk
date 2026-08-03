import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Copy, Download, FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tailorCv } from "@/lib/bot.functions";
import { cvStore, savedJobs, tailoredStore } from "@/lib/storage";
import { cvMarkdownToHtml, downloadCvDoc, slugify } from "@/lib/cv-doc";
import type { JobLead, TailorResult } from "@/lib/types";

export const Route = createFileRoute("/cv")({
  head: () => ({
    meta: [
      { title: "CV studio — tailor your CV to each job | Dartford Job Bot" },
      {
        name: "description",
        content:
          "Paste your CV once, then rewrite it for any role — retail, hospitality, IT support or junior tech — in plain, human language that gets you an interview.",
      },
      { property: "og:title", content: "CV studio — a CV rewritten for every application" },
      {
        property: "og:description",
        content:
          "Upload your CV and tailor it to any job advert, then download it as a Word document.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CvStudio,
});

function CvStudio() {
  const [cvText, setCvText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
  const [edited, setEdited] = useState("");
  const [saved, setSaved] = useState<JobLead[]>([]);

  useEffect(() => {
    setCvText(cvStore.get());
    setSaved(savedJobs.get());
    const raw = window.localStorage.getItem("kjb.selectedJob");
    if (raw) {
      try {
        const job = JSON.parse(raw) as JobLead;
        setJobTitle(job.title);
        setEmployer(job.employer);
        setJobDescription(
          [job.summary, job.requirements?.join("\n- "), `Location: ${job.location}`]
            .filter(Boolean)
            .join("\n- "),
        );
      } catch {
        /* ignore */
      }
      window.localStorage.removeItem("kjb.selectedJob");
    }
  }, []);

  const run = useServerFn(tailorCv);
  const mutation = useMutation({
    mutationFn: () =>
      run({ data: { cvText, jobTitle, employer, jobDescription } }),
    onSuccess: (data) => {
      setResult(data);
      setEdited(data.cvMarkdown);
      tailoredStore.add({
        ...data,
        id: `${Date.now()}`,
        jobTitle,
        employer,
        createdAt: new Date().toISOString(),
      });
      toast.success("Tailored CV ready");
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't tailor that one."),
  });

  const handleFile = async (file: File) => {
    if (file.size > 400_000) {
      toast.error("That file is a bit big — paste the text instead.");
      return;
    }
    const text = await file.text();
    setCvText(text);
    cvStore.set(text);
    toast.success("CV loaded");
  };

  const canRun = cvText.trim().length >= 50 && jobTitle.trim().length >= 2 && !mutation.isPending;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold sm:text-4xl">CV studio</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Your CV stays on this device. Pick a job, and it gets rewritten for that advert — same
          truth, sharper angle, no robotic waffle.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <section className="surface-card space-y-5 p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cv">Your CV</Label>
                <Button asChild size="sm" variant="outline">
                  <label className="cursor-pointer">
                    <Upload className="size-3.5" /> Upload .txt / .md
                    <input
                      type="file"
                      accept=".txt,.md,.markdown,text/plain"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleFile(file);
                      }}
                    />
                  </label>
                </Button>
              </div>
              <Textarea
                id="cv"
                value={cvText}
                onChange={(event) => setCvText(event.target.value)}
                onBlur={() => cvStore.set(cvText)}
                rows={14}
                placeholder="Paste your whole CV here — name, contact, T Level, projects, any work or volunteering."
              />
              <p className="text-xs text-muted-foreground">
                Got a PDF or Word CV? Open it, select all, copy, paste here once. Saved automatically.
              </p>
            </div>

            {saved.length > 0 && (
              <div className="space-y-2">
                <Label>Use a saved job</Label>
                <div className="flex flex-wrap gap-2">
                  {saved.slice(0, 8).map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => {
                        setJobTitle(job.title);
                        setEmployer(job.employer);
                        setJobDescription(
                          [job.summary, ...(job.requirements ?? [])].filter(Boolean).join("\n- "),
                        );
                      }}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                    >
                      {job.title} · {job.employer}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Job title</Label>
                <Input
                  id="title"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder="Crew Member"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employer">Employer</Label>
                <Input
                  id="employer"
                  value={employer}
                  onChange={(event) => setEmployer(event.target.value)}
                  placeholder="Wagamama, Bluewater"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="advert">Job advert / description</Label>
              <Textarea
                id="advert"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={7}
                placeholder="Paste the advert. The more of it you paste, the better the match."
              />
            </div>

            <Button size="lg" className="w-full" disabled={!canRun} onClick={() => mutation.mutate()}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Rewriting…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Tailor my CV
                </>
              )}
            </Button>
          </section>

          <section className="surface-card p-6">
            {!result && (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                <FileText className="size-8 text-muted-foreground" />
                <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                  Your tailored CV will show up here — editable, then downloadable as a Word file.
                </p>
              </div>
            )}

            {result && (
              <Tabs defaultValue="cv">
                <TabsList>
                  <TabsTrigger value="cv">CV</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="note">Cover note</TabsTrigger>
                  <TabsTrigger value="why">What changed</TabsTrigger>
                </TabsList>

                <TabsContent value="cv" className="space-y-3">
                  <Textarea
                    value={edited}
                    onChange={(event) => setEdited(event.target.value)}
                    rows={22}
                    className="font-mono text-xs"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        downloadCvDoc(edited, `cv-${slugify(jobTitle)}-${slugify(employer || "role")}`)
                      }
                    >
                      <Download className="size-4" /> Download Word doc
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        void navigator.clipboard.writeText(edited);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="size-4" /> Copy text
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <div
                    className="prose-sm max-w-none space-y-2 rounded-md border border-border bg-card p-6 [&_h1]:mb-1 [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-5 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-1 [&_h2]:font-display [&_h2]:text-sm [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wide [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_li]:text-sm [&_p]:text-sm"
                    dangerouslySetInnerHTML={{ __html: cvMarkdownToHtml(edited) }}
                  />
                </TabsContent>

                <TabsContent value="note" className="space-y-3">
                  <Textarea value={result.coverNote} readOnly rows={10} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      void navigator.clipboard.writeText(result.coverNote);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="size-4" /> Copy note
                  </Button>
                </TabsContent>

                <TabsContent value="why" className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {result.matchNotes.map((note) => (
                      <li key={note} className="flex gap-2">
                        <span aria-hidden className="text-primary">
                          →
                        </span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

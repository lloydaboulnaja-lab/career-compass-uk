import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { ApplicationTracker } from "@/components/ApplicationTracker";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Application tracker | Dartford Job Bot" },
      { name: "description", content: "Track your saved tech, retail and apprenticeship applications from saved to offer." },
      { property: "og:title", content: "Application tracker | Dartford Job Bot" },
      { property: "og:description", content: "Your tech, casual and apprenticeship applications in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackerPage,
});

function TrackerPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <p className="mb-2 text-sm font-medium text-primary">Your applications</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Application tracker</h1>
        <div className="mt-6"><ApplicationTracker /></div>
      </main>
    </div>
  );
}
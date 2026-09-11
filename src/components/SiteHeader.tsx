import { Link, useRouterState } from "@tanstack/react-router";
import { Bot } from "lucide-react";

const links = [
  { to: "/", label: "Job feed" },
  { to: "/cv", label: "CV studio" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-ink text-ink-foreground">
            <Bot className="size-5" />
          </span>
          <span className="font-display text-base font-bold tracking-tight sm:text-lg">
            Dartford Job Bot
          </span>
        </Link>
        <nav className="flex items-center gap-1 rounded-lg bg-secondary p-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === link.to
                  ? "bg-ink text-ink-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

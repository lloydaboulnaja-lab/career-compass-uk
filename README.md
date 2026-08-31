# A Job Bot

A fast, focused job-search assistant built for a 17-year-old T Level Digital Software Development student in Kent, England. It pulls live entry-level roles from Reed.co.uk and uses AI to tailor your CV to any job you want to apply for.

> Built because scrolling through expired listings and rewriting CVs by hand is a waste of time.

## What it does

1. **Finds real jobs near you** — searches Reed.co.uk in parallel for:
   - **Entry-level tech** (IT support, service desk, junior data analyst, software tester, trainee developer)
   - **Casual & retail** (barista, retail assistant, sales assistant, crew member, waiter/waitress)
   - **Tech apprenticeships** (software, data, digital support, cyber security apprenticeships)

2. **Filters out the wrong stuff** — automatically drops roles that are:
   - Expired
   - Age-restricted (18+, driving licence required)
   - Not relevant (cleaner, driver, courier, warehouse, security, nursery, care assistant)
   - Non-tech apprenticeships

3. **Tailors your CV with AI** — paste your CV and a job advert, and it rewrites it to:
   - Mirror the advert’s keywords for ATS
   - Use plain, confident British English
   - Lead with what matters for that role
   - Avoid AI buzzwords like "passionate about", "dynamic", "leverage", "synergy"

4. **Keeps everything local** — your CV, saved jobs and tailored versions are stored in your browser’s `localStorage`. No account needed.

## Tech stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework with server functions
- [TanStack Router](https://tanstack.com/router) — file-based routing
- [TanStack Query](https://tanstack.com/query) — server-state management
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [shadcn/ui](https://ui.shadcn.com) — UI components
- [AI SDK](https://sdk.vercel.ai) — streaming AI generation
- [Lovable AI Gateway](https://docs.lovable.dev/features/ai-gateway) — model access

## Project structure

```
src/
├── components/          # Reusable UI components
│   ├── JobCard.tsx        # Individual job listing card
│   └── SiteHeader.tsx     # Top navigation
├── lib/
│   ├── ai-gateway.server.ts   # Lovable AI Gateway provider setup
│   ├── bot.functions.ts      # Server functions exposed to the client
│   ├── cv.server.ts          # CV tailoring AI pipeline
│   ├── cv-doc.ts             # Generate .doc download from tailored CV
│   ├── error-capture.ts      # Client error handling
│   ├── error-page.ts         # Error page helpers
│   ├── job-prompts.server.ts # Prompts for AI CV rewriting
│   ├── jobs.server.ts        # Job search orchestration
│   ├── reed.server.ts        # Reed.co.uk scraper & filtering
│   ├── storage.ts            # localStorage stores (CV, saved jobs, history)
│   ├── types.ts              # Shared TypeScript types
│   └── utils.ts              # Utility helpers
├── routes/
│   ├── __root.tsx            # Root layout & providers
│   ├── index.tsx             # Dashboard / job feed
│   └── cv.tsx                # CV Studio
├── server.ts                 # Server function middleware
├── start.ts                  # App entry / server config
└── styles.css                # Global styles & Tailwind theme
```

## How the job search works

The bot does not use an AI model to find jobs. It scrapes Reed.co.uk directly:

- Builds category-specific search URLs with keywords and location filters
- Pulls the structured `__NEXT_DATA__` payload from each page
- Runs every result through filters:
  - `EXCLUDE_TITLE` — drops senior/lead/manager roles and adult-only work
  - `ALLOW_TITLE` — only keeps titles that match the category
  - `AGE_RESTRICTED_DESCRIPTION` — removes 18+ or driving-licence roles
  - Expiry check — removes expired listings
  - Deduplication by job ID
- Returns the freshest 24 results with real apply links and actual posting dates

Searches run in parallel, so a full run usually takes a couple of seconds and costs nothing in AI credits.

## How the CV studio works

When you hit **Tailor my CV**:

1. Your CV text and the job details are sent to a server function
2. The AI is prompted to act like a sharp UK recruitment consultant
3. It returns JSON with:
   - `cvMarkdown` — the rewritten CV
   - `matchNotes` — what changed and why
   - `keywords` — advert keywords now in your CV
   - `coverNote` — a short human application message
4. You can copy the result or download it as a `.doc` file

The prompt is tuned for a 17-year-old candidate: it never implies you can drive, work age-restricted duties, or hold experience you have not stated.

## Getting started locally

```sh
# 1. Clone the repo
git clone <this-repository-url>
cd <repository-name>

# 2. Install dependencies (npm, yarn, pnpm or bun)
bun i

# 3. Start the dev server
bun run dev
```

The app will be available at `http://localhost:8080`.

## Environment variables

The only secret the app needs is your Lovable AI Gateway key, used for CV tailoring.

```env
LOVABLE_API_KEY=your_lovable_api_key_here
```

If you are running inside Lovable, this is already configured. For local runs, copy the key from your Lovable project settings.

## Available scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start the development server |
| `bun run build` | Build for production |
| `bun run build:dev` | Build in development mode |
| `bun run preview` | Preview the production build |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

## Notes & limitations

- **Job data comes from Reed.co.uk.** If Reed changes their page structure, the scraper may need updating.
- **No email digests yet.** The current version focuses on the live job feed and CV studio. Email alerts can be added later with a scheduled backend job.
- **Local storage only.** Your data stays in your browser. Clearing site data will reset your saved jobs and CV history.
- **Designed for Dartford / North Kent.** The location filters are tuned for Dartford, Gravesend, Bexley, Erith, Crayford and nearby London areas.

## License

This project is yours — built in Lovable and synced to your GitHub account. Use it, fork it, extend it.

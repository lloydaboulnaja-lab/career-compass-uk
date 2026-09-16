# Refresh the job finder

## What will change
- Replace the current lime-and-cream look with a clearer, higher-contrast teal, coral, and neutral theme across the job feed and CV studio.
- Tighten the mobile layout, category controls, result summary, and job cards so source, freshness, location, and actions are easier to scan.
- Keep Reed, then add another reliable live source for current UK vacancies and merge both feeds into one deduplicated list.
- Preserve the existing rules: no cleaner, driver, care, nursery, adult-only, fake course, or unrelated apprenticeship listings; apprenticeships remain tech-only.
- Check links before displaying jobs, rank the newest valid listings first, and clearly label each listing’s source.

## Technical details
- Add a separate source adapter rather than mixing source-specific parsing into the feed.
- Normalize all sources into the existing job format, deduplicate by title/employer/location, and limit slow link checks so searches return promptly.
- Update shared visual tokens and the existing feed/header/card presentation without changing the CV-tailoring logic.
- Validate all three categories in the live preview on mobile and desktop, including opening sample application links.

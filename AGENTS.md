<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep application tracking in the dedicated `/tracker` route using the shared browser stores, so every job category is accessible without running a search.
- Keep skill matching deterministic and browser-local, using shared CV text; label title-derived skills and text evidence rather than claiming verified proficiency, so comparisons do not trigger AI calls.
- Load PDF and DOCX readers dynamically in browser upload handlers, so file parsing stays on-device and outside SSR execution.

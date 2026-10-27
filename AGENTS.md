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
- Page list and sidebar come from src/lib/nav.ts; add new pages there so navigation stays in one place.
- Office pages live under src/routes/_authenticated (sign-in required); roles come from the user_roles table, and the first account to sign up becomes Admin automatically.

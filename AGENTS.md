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

- The Python SLT engine lives in `python-service/` and is exposed by FastAPI (`python-service/api/server.py`); the web app only talks to it through `src/services/*TranslationService.ts`. Why: recognition must stay in Python and the transport must stay swappable.

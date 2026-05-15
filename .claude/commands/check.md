---
description: Run typecheck, lint, and build to verify the project is in a healthy state. Use this at the end of every phase before marking work complete.
---

Run these three checks in order. Stop and report on the first failure — do not continue past a failed check, and do not attempt to fix issues unless I ask.

1. **Typecheck:**
   ```bash
   pnpm exec tsc --noEmit
   ```

2. **Lint** (if configured — skip if not):
   ```bash
   pnpm lint
   ```

3. **Build:**
   ```bash
   pnpm build
   ```

Report:
- ✅ or ❌ for each step
- Number of errors/warnings if any
- The first 5 errors verbatim (do not paraphrase or truncate)
- Total time

If everything passes, also output the current file tree:
```bash
find src supabase docs .claude -type f -not -path '*/node_modules/*' -not -path '*/.next/*' | sort
```

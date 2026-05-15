---
description: Stage all changes, generate a conventional commit message from the diff, show it for approval, then commit. Saves time vs writing commit messages manually after every phase.
---

Do this in order:

1. Show me `git status` and `git diff --stat` so I see scope of what's about to be committed.

2. Look at the actual diff (`git diff` and `git diff --staged`) and propose a conventional commit message:
   - Format: `<type>(<scope>): <subject>` where type is one of `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`
   - Subject in imperative mood, <72 chars
   - Body (optional, blank line before): 1-3 bullets explaining the *why*, not the *what*
   - No emoji, no "🤖 Generated with Claude Code" footer

3. Show me the proposed message. **Stop here. Do not commit yet.** Wait for my approval.

4. If I approve (or give edits), run:
   ```bash
   git add -A
   git commit -m "<the approved message>"
   ```

5. Show me the resulting `git log -1 --stat`.

Constraints:
- Never commit `.env.local`, `.env.*.local`, `node_modules`, `.next`
- Never use `git commit --no-verify` or skip hooks
- If `git status` shows nothing to commit, just say so and stop

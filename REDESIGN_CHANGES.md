# PreCare Redesign Changes

## Implemented Routes

- `/` is now the landing page based on `precare-design/project/index.html`.
- `/triage` now contains the Asha voice triage call experience.
- `/admin/login` uses the redesigned split-panel admin sign-in layout.
- `/admin` keeps the live dashboard behavior with redesigned KPI, chart, queue, and table presentation.
- `/admin/[id]` keeps the session detail behavior with redesigned outcome, transcript, symptoms, and audit panels.

## Patient Experience

- Added the full landing page with hero, process section, care tiers, safety strip, and footer.
- Moved the previous patient call UI from `/` to `/triage`.
- Redesigned the triage screen with:
  - dark instrument status strip
  - Asha voice triage header
  - circular risk meter
  - transcript card
  - symptom extraction panel
  - final classification card
  - fixed call dock
- Preserved the existing Vapi call hook and patient-side live event behavior.

## Admin Experience

- Added shared admin chrome outside the login route.
- Redesigned admin login to match the supplied dark clinical operations panel.
- Redesigned admin dashboard with:
  - live status header
  - KPI cards
  - volume chart treatment
  - outcome donut
  - live queue
  - recent sessions table
- Redesigned session detail with:
  - session hero
  - recommendation outcome card
  - red-flag override indicator
  - transcript feed
  - symptoms extracted panel
  - audit log panel

## Shared Styling

- Added PreCare design tokens in `src/app/globals.css`.
- Added reusable classes for instrument strips, brand mark, cards, headings, and tier pills.
- Added the design font stack through `next/font`.

## Not Implemented Yet

See `DESIGN_FEATURES_TO_REVIEW.md` for prototype features that still need product/backend review before implementation.

## Verification

- `npx tsc --noEmit` passed.
- `npm run build` passed.
- Local route checks passed for `/`, `/triage`, and `/admin/login`.

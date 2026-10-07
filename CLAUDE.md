# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

This repository holds problem sets for the course MGMT6110. As of 2026-10-07 the frontend is
scaffolded, typechecks and carries the Problem Set 1 CRM screens; the backend is a minimal Express
server with one health route.

### Repo root - `npm run dev` starts both apps

- `npm run dev` at the root runs `scripts/dev.mjs`, which starts the `backend/` and `frontend/` dev
  servers together and labels each output line `[backend]` or `[frontend]`. Ctrl+C stops both (press
  it twice to force). If either app exits on its own (for example because port 5173 is busy), the
  script stops the other and exits non-zero.
- The root `package.json` has no dependencies and is not an npm workspace, so never run
  `npm install` at the root. On a fresh clone, run `npm install` in `frontend/` and in `backend/`
  first; the script refuses to start and names any app whose `node_modules` is missing.

### frontend/ - React Router 7.14 (framework mode, SSR on), Vite 8, Tailwind v4, React 19, TypeScript

- Install: `cd frontend && npm install`. It has its own `package.json`/`package-lock.json` and is not
  an npm workspace - never run `npm install` at the repo root. Node 20.19+ (the local Node 26 works;
  its `DEP0205` deprecation warning and npm's note that esbuild's install script was skipped are
  harmless).
- Dev: `npm run dev` -> http://localhost:5173 (`strictPort`: exits if 5173 is busy instead of moving).
  This starts the frontend alone; the root `npm run dev` starts both apps.
- Check: `npm run typecheck` (`react-router typegen` then `tsc`; bare `tsc` fails on a fresh tree
  because the `./+types/*` imports are generated). This is the only check - there is no test runner
  and no linter yet, so "run a single test" does not apply.
- Prod: `npm run build` -> `build/client` + `build/server/index.js`; `npm run start` serves on
  http://localhost:3000, or the next free port if 3000 is taken (`PORT=3001` to choose). It listens
  on every network interface unless `HOST=127.0.0.1` is set.
- Versions are exact pins matching AWSC's. `npm audit` flags react-router 7.14.0 and vite 8.0.10
  (fixed in 7.18.x and 8.0.16+); upgrade both projects together to keep them comparable.
- Routes: `app/routes.ts`; pages in `app/routes/` render inside the `app-layout.tsx` sidebar shell.
  `/` redirects to `/triage` (loader in `home.tsx`), then the three CRM screens `/triage`,
  `/records`, `/attachments` (see "Problem Set 1: CRM front end" below), `/components` showcase of
  every UI component (the style reference - open it after any kit change; linked at the bottom of
  the sidebar, not in the phone's bottom bar), `*` not-found (its loader returns HTTP 404 and keeps the shell).
- UI kit: `app/components/catalyst/` is Tailwind Plus Catalyst copied verbatim from the AWSC project
  (`/Users/gohkokhong/Documents/GitHub/AWSC/frontend`) - re-sync with `diff`, do not restyle ad hoc.
  Shared pieces: `PageContainer` (page width), `Modal` (the only dialog; size via `width`),
  `TableControls` (`TableSearchInput`, `TablePagination`, `ColumnFilter`, `ColumnSort`,
  `ColumnHint`), `FolderTabs`. Icons: `@heroicons/react/20/solid` (16/solid inside table headers).
  Forms: react-hook-form + zod via `zodResolver`, as on `/components`. AWSC's `use-table-state.ts` +
  `table-state-store.ts` (remembered table views) were left out and can be copied in when needed.
- Styling rules (AWSC's `awsc-docs/CONVENTIONS.md` §11-14): `className` goes first in `clsx` and
  there is no tailwind-merge, so a colour class passed via `className` loses - use
  `<Text tone="subtle|warning|danger">`, `<Strong>`, `Button color="danger"`. Neutrals are zinc;
  `brand` for links, the default action, focus rings and current state; `brand-strong` for CTAs and
  every table header band. Headings only via `Heading`/`Subheading`; tables only via
  `catalyst/table.tsx` (pin every column but one with `w-*`); type scale `text-xs/5` (floor),
  `text-sm/6`, `text-base/6`; no `font-bold` in page code. Badges are inline spans. Brand tokens live
  in `app/app.css` `@theme`. Dark mode follows the OS setting only.
- SSR: every page renders on the server first, so nothing may read `window`, storage, the clock or
  the locale while rendering (format dates by hand, as `/components` does) - a server/browser
  difference breaks hydration.

### Problem Set 1: CRM front end (MGMT 6110 Human-AI Collaboration, SMU)

A front end only, for a clinic CRM used by 10 doctors in Singapore. Three screens, all on invented data.

- Constraints from the brief: screens and invented data only. No call to the Gemini API or any other
  model, no outside service, no `fetch` from any URL, no database, no login or accounts, no
  analytics, no features beyond the three screens, no real company's name, logo or trademark, and no
  confidential or real data. Keep it that way when extending this app.
- Every invented value lives in ONE file, `frontend/app/data/crm-data.ts` (10 doctors, 1,040
  patients, 2,204 visits, 1,145 attachments), plus its types and the small reference lists (urgency
  levels, visit statuses, attachment kinds). Nothing else holds invented values. The file is static:
  it was produced once by a throwaway seeded script that is deliberately not in the repo, so edit
  the file directly. "Today" is fixed there (`TODAY` 2026-10-07, `NOW` 14:20) rather than read from
  the clock, to keep server and browser output identical.
- A visit row carries both the triage result (urgency P1-P4, complaint, vitals, nurse) and the
  consultation record (diagnosis, notes); waiting and in-consultation visits have empty
  diagnosis/notes. Attachments point at a visit; patient and date come from it.
- Screens (`app/routes/`): `triage.tsx` (urgency tiles + results), `records.tsx` (Today / Past tabs),
  `attachments.tsx`. Sections live in `app/components/crm/`: `UrgencySummary`, `TriageList`,
  `RecordList`, `AttachmentList`, `ListFilters`, `VisitDetail` (the modal every row opens),
  `BottomNav` (phone bar), `badges`, `FileName`. Helpers: `app/lib/crm.ts` (lookups, hand-rolled
  date/size formatting), `app/lib/use-paged-list.ts`.
- Phone first: below 1024px each list renders as large tappable cards (a table from `lg` up), the
  three screens sit in a bottom bar below 1280px and in the sidebar above it, and badges are a size
  up below `sm`. Screens move by router links, so navigation never reloads the page.

### backend/ - Express 4.22, TypeScript, Node (ESM), run with tsx

- Install: `cd backend && npm install`. Like the frontend, it has its own `package.json` and
  `package-lock.json`.
- Dev: `npm run dev` (`tsx watch src/server.ts`, restarts on save) -> http://localhost:4000, or set
  `PORT` to change it. The only route so far is `GET /api/health`, which returns `{"ok":true}`.
- Check: `npm run typecheck` (`tsc --noEmit`). No tests yet.
- Prod: `npm run build` -> `dist/`, then `npm run start`.
- Versions are exact pins matching AWSC's backend (Express 4, not 5). `npm audit` flags `qs`
  through express 4.22.2 (fixed in 4.22.3); upgrade it together with AWSC.

### How the frontend talks to the backend

- Dev: `frontend/vite.config.ts` proxies same-origin `/api/*` to `http://localhost:4000`, the
  backend's default port - change both together. No CORS needed while the proxy is used.
- The CRM screens do not call the backend at all (they read `crm-data.ts`); the proxy and the
  `/api/health` route are unused by them.
- No env vars yet, so no `.env.example`. When an API client lands, follow AWSC: `VITE_API_URL`
  (empty = same-origin `/api`), inlined at build time.
- Prod: `react-router-serve` has no proxy - put a reverse proxy in front or set `VITE_API_URL`.

### Problem-set inputs and outputs

- Not decided yet. Shared inputs (problem statements, data files, submission PDFs) go at the repo
  root or in a clearly named sibling folder, never inside `frontend/` or `backend/`. The one
  exception is data that is source code for a single app: Problem Set 1's `crm-data.ts` is a
  typed TypeScript module that only the frontend imports, so it lives in `frontend/app/data/`.
- Submission-format constraints: none recorded beyond the Problem Set 1 brief under "Problem Set 1:
  CRM front end" - add the rest here as soon as they are known (what to hand in, and in what form).

## Working in this directory

- The path contains a space (`MGMT6110_Problem Sets`). Always quote it in shell commands
  and prefer absolute paths.
- Keep backend and frontend concerns in their respective top-level folders. Put anything
  shared across both (data files, problem statements, submission PDFs) at the repo root
  or in a clearly named sibling folder, not inside either app.

## Keep this file current

Keep the "Current state" section accurate whenever commands, ports, or input/output locations
change, and record the course's submission-format constraints as soon as they are known.

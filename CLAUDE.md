# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

This repository holds problem sets for the course MGMT6110. As of 2026-09-27 the frontend is
scaffolded and typechecks; the backend is still empty.

### frontend/ - React Router 7.14 (framework mode, SSR on), Vite 8, Tailwind v4, React 19, TypeScript

- Install: `cd frontend && npm install`. It has its own `package.json`/`package-lock.json` and is not
  an npm workspace - never run `npm install` at the repo root. Node 20.19+ (the local Node 26 works;
  its `DEP0205` deprecation warning and npm's note that esbuild's install script was skipped are
  harmless).
- Dev: `npm run dev` -> http://localhost:5173 (`strictPort`: exits if 5173 is busy instead of moving).
- Check: `npm run typecheck` (`react-router typegen` then `tsc`; bare `tsc` fails on a fresh tree
  because the `./+types/*` imports are generated). This is the only check - there is no test runner
  and no linter yet, so "run a single test" does not apply.
- Prod: `npm run build` -> `build/client` + `build/server/index.js`; `npm run start` serves on
  http://localhost:3000, or the next free port if 3000 is taken (`PORT=3001` to choose). It listens
  on every network interface unless `HOST=127.0.0.1` is set.
- Versions are exact pins matching AWSC's. `npm audit` flags react-router 7.14.0 and vite 8.0.10
  (fixed in 7.18.x and 8.0.16+); upgrade both projects together to keep them comparable.
- Routes: `app/routes.ts`; pages in `app/routes/` render inside the `app-layout.tsx` sidebar shell.
  `/` home, `/components` showcase of every UI component (the style reference - open it after any
  kit change), `*` not-found (its loader returns HTTP 404 and keeps the shell).
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

### backend/

Empty - no language or framework chosen. Ask before picking one.

### How the frontend talks to the backend

- Dev: `frontend/vite.config.ts` proxies same-origin `/api/*` to `http://localhost:4000` (placeholder
  port - change it when the backend picks its own). No CORS needed while the proxy is used.
- No env vars yet, so no `.env.example`. When an API client lands, follow AWSC: `VITE_API_URL`
  (empty = same-origin `/api`), inlined at build time.
- Prod: `react-router-serve` has no proxy - put a reverse proxy in front or set `VITE_API_URL`.

### Problem-set inputs and outputs

- Not decided yet. Shared inputs (problem statements, data files, submission PDFs) go at the repo
  root or in a clearly named sibling folder, never inside `frontend/` or `backend/`.
- Submission-format constraints: none recorded yet - add them here as soon as they are known.

## Working in this directory

- The path contains a space (`MGMT6110_Problem Sets`). Always quote it in shell commands
  and prefer absolute paths.
- Keep backend and frontend concerns in their respective top-level folders. Put anything
  shared across both (data files, problem statements, submission PDFs) at the repo root
  or in a clearly named sibling folder, not inside either app.

## Keep this file current

Keep the "Current state" section accurate whenever commands, ports, or input/output locations
change, and record the course's submission-format constraints as soon as they are known.

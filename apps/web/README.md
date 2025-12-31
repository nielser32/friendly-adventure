# Web app (apps/web)

React + TypeScript front-end built with Vite. The app now explores the semantic graph powered by the API workspace: browse/search nodes, open details, edit metadata, and view neighbor relationships with an accessible graph canvas.

## Scripts

- `npm run dev:web` — start the Vite dev server (http://localhost:5173).
- `npm run build` — type-check and build for production.
- `npm run lint` — run ESLint.
- `npm run test` — run Vitest.

## Notes

- Styling lives in `src/App.css` and `src/index.css`; components use semantic headings, labels, and keyboardable controls (graph canvas supports arrow-key panning and +/- zoom).
- Data fetching flows through a typed API client + React Query (`src/api`) with Zod validation for responses and optimistic cache updates on mutations.
- Routes live in `src/pages`:
  - `/` — list and search nodes with client-side filtering.
  - `/nodes/:id` — node detail with tags and neighbor graph.
  - `/nodes/:id/edit` — edit form for title, summary, and tags.
  - `/nodes/new` — create flow sharing the same form component.
- Configure `VITE_API_URL` (defaults to `http://localhost:4000`) to point at the API workspace during development.
- Apply the Front-End Checklist and UX/Performance checklists from the project root `AGENTS.md` before shipping UI changes.

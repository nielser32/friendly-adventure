# Web app (apps/web)

React + TypeScript front-end built with Vite. The landing page surfaces the repository playbook (quality checklists, resource links, and next steps) so newcomers know how to work in the stack.

## Scripts

- `npm run dev:web` — start the Vite dev server (http://localhost:5173).
- `npm run build` — type-check and build for production.
- `npm run lint` — run ESLint.
- `npm run test` — run Vitest.

## Notes

- Styling lives in `src/App.css` and `src/index.css`; keep components semantic and accessible.
- When adding data fetching, prefer typed clients and handle loading/empty/error states explicitly.
- Apply the Front-End Checklist and UX/Performance checklists from the project root `AGENTS.md` before shipping UI changes.

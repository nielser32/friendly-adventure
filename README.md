# friendly-adventure

An opinionated starter workspace that pairs a React front-end (Vite + TypeScript) with an Express + TypeScript API. It leans on checklists and UX patterns from [AGENTS.md](./AGENTS.md) to keep quality high as you add features.

## What you get

- **Monorepo with npm workspaces**: `apps/web` (Vite/React) and `apps/api` (Express). Shared root scripts for build, lint, and tests.
- **Type-safe defaults**: Strict TypeScript configurations in both workspaces.
- **Security and ergonomics**: API uses `helmet` and `cors` with a typed health endpoint validated by `zod`; front-end uses accessible, semantic layout.
- **Testing & linting**: Vitest suites for API and web; ESLint on the web and type-driven linting on the API.
- **Environment handling**: `.env.example` documents required variables.

## Project layout

```
/AGENTS.md            Guidance and resources to follow
/.env.example         Documented environment variables
/package.json         Root workspace orchestration and scripts
/apps/web             Vite + React + TypeScript front-end
/apps/api             Express + TypeScript API with health endpoint
```

## Getting started

1. **Install dependencies** (from repo root):
   ```bash
   npm install
   ```
2. **Run the front-end dev server**:
   ```bash
   npm run dev:web
   ```
   Vite serves on http://localhost:5173 by default.
3. **Run the API locally**:
   ```bash
   cp .env.example .env
   npm run dev:api
   ```
   API defaults to http://localhost:4000 with `/health` reporting status.

## Quality checks

- **Tests**: `npm test` (runs all workspace tests).
- **Lint**: `npm run lint` (ESLint for web; type-check lint for API).
- **Build**: `npm run build` to verify production builds across workspaces.

## Architecture notes

- **Front-end** (`apps/web`)
  - React + TypeScript, Vite tooling, ESLint, and Vitest.
  - Landing page highlights the AGENTS resources and next-step playbook.
- **API** (`apps/api`)
  - Express + TypeScript with middleware (`helmet`, `cors`, JSON body parsing).
  - Health endpoint uses Zod validation and is covered by Vitest + Supertest.

## Next steps to explore

- Add CI to run lint/test/build on each push (GitHub Actions matrix for web + api).
- Connect the front-end to the API (e.g., fetch `/health` and surface runtime status).
- Layer in authentication/authorization when user-facing routes are added.
- Add a shared UI kit package if you expect multiple front-ends.
- Apply the linked checklists (performance, accessibility, UX patterns) before shipping.

## References (from AGENTS.md)

- https://www.w3schools.com/whatis/whatis_fullstack.asp
- https://github.com/thedaviddias/Front-End-Checklist
- https://github.com/thedaviddias/Front-End-Design-Checklist
- https://github.com/thedaviddias/Front-End-Performance-Checklist
- https://github.com/thedaviddias/indie-dev-toolkit
- https://uxpatterns.dev/

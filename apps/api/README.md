# API (apps/api)

Express + TypeScript service that powers the starter health endpoint and future APIs.

## Scripts

- `npm run dev:api` — start the API with `tsx` (http://localhost:4000 by default).
- `npm run build` — emit compiled JS to `dist/`.
- `npm run lint` — TypeScript `--noEmit` for static checks.
- `npm run test` — run Vitest + Supertest suites.

## Endpoints

- `GET /health` — returns `{ service, status, timestamp, environment }` and is schema-validated with Zod.
- `GET /` — simple metadata response indicating the API is ready.

## Notes

- Environment variables are loaded from `.env`; see `.env.example` at the repo root.
- Keep middleware minimal and explicit (helmet, cors, json parsing) and validate inbound/outbound payloads.
- Add authentication/authorization when you introduce user-facing routes.

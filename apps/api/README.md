# API (apps/api)

Express + TypeScript service that powers the starter health endpoint and future APIs.

## Scripts

- `npm run dev:api` — start the API with `tsx` (http://localhost:4000 by default).
- `npm run build` — emit compiled JS to `dist/`.
- `npm run lint` — TypeScript `--noEmit` for static checks.
- `npm run test` — run Vitest + Supertest suites.
- `npm run db:migrate` — apply Prisma migrations to the Postgres database.
- `npm run db:generate` — regenerate the Prisma client.
- `npm run db:seed` — seed the database with sample users, concepts, tags, and relationships.
- `npm run db:studio` — open Prisma Studio for local inspection.

## Endpoints

- `GET /health` — returns `{ service, status, timestamp, environment }` and is schema-validated with Zod.
- `GET /` — simple metadata response indicating the API is ready.

## Notes

- Environment variables are loaded from `.env`; see `.env.example` at the repo root.
- Keep middleware minimal and explicit (helmet, cors, json parsing) and validate inbound/outbound payloads.
- Add authentication/authorization when you introduce user-facing routes.

## Database

- **Engine**: PostgreSQL (see `docker-compose.yml` for a local service at `postgres://postgres:postgres@localhost:5432/friendly_adventure`).
- **Prisma schema**: `prisma/schema.prisma`.
- **Migrations**: `prisma/migrations/` (committed SQL produced via `prisma migrate diff` for Postgres).
- **Seed data**: `prisma/seed.ts` populates:
  - `User` — creators of knowledge assets.
  - `Concept` — knowledge graph nodes with `title` and `summary`.
  - `Relationship` — typed links (`relates_to`, `supports`, `contradicts`, `derives_from`) connecting source and target concepts.
  - `Tag` & `ConceptTag` — labels attached to concepts.

**ERD overview**

- `User` 1..* `Concept`
- `User` 1..* `Relationship`
- `Concept` 1..* `Relationship` (as `source`), `Concept` 1..* `Relationship` (as `target`)
- `Concept` *..* `Tag` via `ConceptTag`

### Local workflow

1. Start Postgres (Docker example):
   ```bash
   docker compose up -d db
   ```
2. Configure `DATABASE_URL` in `.env` (see `.env.example`).
3. Run migrations and seed data:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
4. Inspect data with Prisma Studio:
   ```bash
   npm run db:studio
   ```

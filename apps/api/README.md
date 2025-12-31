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
- `GET /nodes` — list all graph nodes.
- `POST /nodes` — create a node with `title`, `summary`, and optional `tags`.
- `GET /nodes/:id` — fetch a single node (UUID).
- `PUT /nodes/:id` — update `title`, `summary`, or `tags`.
- `DELETE /nodes/:id` — remove a node and its attached edges.
- `GET /edges` — list all edges.
- `POST /edges` — create an edge with `type`, `sourceId`, `targetId`, and optional `description`.
- `GET /edges/:id` — fetch a single edge (UUID).
- `PUT /edges/:id` — update an edge `type` or `description`.
- `DELETE /edges/:id` — remove an edge.
- `GET /graph/path?sourceId=...&targetId=...` — return the node path (if any) from source to target.
- `POST /graph/traverse` — breadth-first traversal from a start node with a bounded `depth` (1–5).

### Request/response examples

Create a node:

```bash
curl -X POST http://localhost:4000/nodes \
  -H "Content-Type: application/json" \
  -d '{"title":"GraphQL","summary":"A query language","tags":["api","schema"]}'
```

Response:

```json
{
  "id": "c489c5c5-ef49-4821-9e34-e1d2cd4d3f1e",
  "title": "GraphQL",
  "summary": "A query language",
  "tags": ["api", "schema"],
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

Create an edge between two nodes:

```bash
curl -X POST http://localhost:4000/edges \
  -H "Content-Type: application/json" \
  -d '{"type":"supports","sourceId":"<nodeA>","targetId":"<nodeB>","description":"Node A supports Node B"}'
```

Graph traversal:

```bash
curl -X POST http://localhost:4000/graph/traverse \
  -H "Content-Type: application/json" \
  -d '{"startId":"<nodeA>","depth":2}'
```

Response:

```json
{
  "startId": "<nodeA>",
  "depth": 2,
  "nodes": [{ "id": "<nodeA>", "title": "A", "summary": "Start", "tags": [], "createdAt": "...", "updatedAt": "..." }],
  "edges": [{ "id": "<edge>", "type": "supports", "sourceId": "<nodeA>", "targetId": "<nodeB>", "createdAt": "..." }]
}
```

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

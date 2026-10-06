# let-me-know backend

Express + TypeScript + Prisma + PostgreSQL backend with JWT auth and Products CRUD.

## Local setup

1. Postgres is running in Docker on port **5433** (container `letmeknow-postgres`):
   ```
   docker start letmeknow-postgres
   ```
   (already created; if it doesn't exist, see `docker run` command in project notes)

2. Install deps: `npm install`
3. Copy `.env.example` to `.env` and adjust if needed.
4. Run migrations: `npm run prisma:migrate`
5. Seed sample data: `npm run seed`
6. Start dev server: `npm run dev` (http://localhost:4000)

## Seeded admin login

- email: `admin@letmeknow.dev`
- password: `Admin@12345`

## Endpoints

- `POST /api/auth/register` — first registered user becomes ADMIN automatically
- `POST /api/auth/login` — returns `{ token, user }`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`
- `GET /api/products` — public, query params: `type`, `brand`, `search`
- `GET /api/products/:id` — public
- `POST /api/products` — admin only
- `PUT /api/products/:id` — admin only
- `DELETE /api/products/:id` — admin only

## Schema

- `User` — auth + role (ADMIN/USER)
- `Product` — name, brandName, productType, desc, alias, specs (JSON), createdBy/updatedBy
- `Gallery` — media (image/video) linked to a product
- `PriceTable` — per country/market price with min/max, linked to a product

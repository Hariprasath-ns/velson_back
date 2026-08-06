# velson_back

A Node.js REST API backend built with Express.js and Prisma ORM. Supports dual PostgreSQL databases — Neon (cloud) and a local Docker instance — selectable per request via a query parameter.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js v5 |
| ORM | Prisma v7 |
| Database | PostgreSQL 16 |
| Cloud DB | Neon (serverless Postgres) |
| Local DB | Docker (postgres:16) |

---

## Prerequisites

Before setting up, make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — required only if you plan to use the local database

---

## Project Structure

```
velson_back/
├── src/
│   ├── server.js               # Entry point — starts Express server
│   ├── config/
│   │   └── db.js               # DB connection initializer
│   ├── routes/
│   │   └── userRoute.js        # User API routes
│   ├── controllers/
│   │   └── userController.js   # Request handlers
│   ├── models/
│   │   └── userModel.js        # Prisma query layer
│   └── middlewares/
│       └── dbSelect.js         # Per-request DB selection middleware
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.js                 # Seed script (5 dummy users)
│   └── migrations/             # Prisma migration files
├── docker-compose.yml          # Local PostgreSQL setup
├── prisma.config.ts            # Prisma config (schema + migrations path)
├── package.json
└── .env                        # Environment variables (not committed)
```

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Sujeeth-P/velson_back.git
cd velson_back
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000

# Set to "neon" to use Neon cloud DB, or "docker" to use local Docker DB
DB_ENV=neon

# Neon Cloud PostgreSQL (get this from your Neon project dashboard)
NEON_DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require

# Local Docker PostgreSQL
DOCKER_DATABASE_URL=postgresql://postgres:password@localhost:5432/velson_db
```

> **Note:** Never commit your `.env` file — it is already listed in `.gitignore`.

---

## Database Setup

You can use either the **Neon cloud database** or a **local Docker database**. Both can be configured and used simultaneously.

---

### Option A — Neon (Cloud Database)

1. Sign up at [neon.tech](https://neon.tech) and create a new project.
2. Copy the connection string from the Neon dashboard.
3. Paste it as `NEON_DATABASE_URL` in your `.env` file.
4. Set `DB_ENV=neon`.
5. Run migrations:

```bash
npx prisma migrate deploy
```

---

### Option B — Docker (Local Database)

1. Make sure Docker Desktop is running.
2. Start the PostgreSQL container:

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container with:
- **Host:** `localhost:5432`
- **Database:** `velson_db`
- **Username:** `postgres`
- **Password:** `password`

3. Set `DB_ENV=docker` in your `.env` file (or use the query param at request time — see [Switching Databases Per Request](#switching-databases-per-request)).
4. Run migrations:

```bash
npx prisma migrate deploy
```

---

### Generate Prisma Client

After running migrations, generate the Prisma client:

```bash
npx prisma generate
```

---

### Seed the Database

Populate the database with 5 dummy users (Alice, Bob, Charlie, Diana, Eve):

```bash
npm run seed
```

> The seed script inserts into the database specified by `DB_ENV` in your `.env`.

---

## Running the Server

### Development (with auto-reload)

```bash
npm run dev
```

The server starts on `http://localhost:3000`.

---

## API Reference

All routes are prefixed with `/api`.

### Switching Databases Per Request

Append `?db=neon` or `?db=docker` to any request to target a specific database regardless of the `DB_ENV` setting.

```
GET /api/users?db=neon
GET /api/users?db=docker
```

---

### Users

#### Get all users

```
GET /api/users
```

**Response**

```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@velson.dev",
    "createdAt": "2026-05-07T11:19:10.000Z",
    "updatedAt": "2026-05-07T11:19:10.000Z"
  }
]
```

---

#### Get a user by ID

```
GET /api/users/:id
```

**Response:** Single user object or `404` if not found.

---

#### Create a user

```
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:** `201` with the created user object. Returns `409` if the email already exists.

---

#### Update a user

```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Jane Doe"
}
```

**Response:** Updated user object or `404` if not found.

---

#### Delete a user

```
DELETE /api/users/:id
```

**Response:** `200` with deleted user object or `404` if not found.

---

## Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm run seed` | Seed the database with dummy data |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma studio` | Open Prisma Studio (GUI for your database) |
| `docker compose up -d` | Start local PostgreSQL container |
| `docker compose down` | Stop local PostgreSQL container |
| `docker compose down -v` | Stop container and delete volume (wipes data) |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Port the server listens on (default: `3000`) |
| `DB_ENV` | Yes | Default database to use: `neon` or `docker` |
| `NEON_DATABASE_URL` | If using Neon | PostgreSQL connection string for Neon |
| `DOCKER_DATABASE_URL` | If using Docker | PostgreSQL connection string for local Docker |

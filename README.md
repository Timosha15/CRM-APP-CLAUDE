# Victor

Victor is a lightweight CRM for sales teams — contacts, companies, a drag-and-drop
deal pipeline, tasks, and activity tracking, inspired by tools like Apollo.io.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) + TypeScript
- [Prisma](https://www.prisma.io/) + PostgreSQL
- Tailwind CSS
- JWT-based auth (httpOnly cookie, `jose` + `bcryptjs`)

## Getting started

You need a Postgres database — a free one from [Neon](https://neon.tech) or
[Vercel Postgres](https://vercel.com/storage/postgres) takes about a minute to
create and works fine for local dev too (no local Postgres install needed).

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL (see above) and a random JWT_SECRET
npm run db:push           # create the schema in your database
npm run db:seed           # populate demo data
npm run dev                # start the dev server on http://localhost:3000
```

Sign in with the seeded demo account, or create your own from the login page:

- **Email:** `demo@victorcrm.app`
- **Password:** `victor123`

## Deploying to Vercel

1. Import the repo into Vercel.
2. Create a Postgres database (Vercel Postgres, Neon, Supabase — any works) and
   copy its connection string.
3. In the Vercel project's **Settings → Environment Variables**, add:
   - `DATABASE_URL` — the Postgres connection string. If your provider gives you
     both a pooled and a direct URL, use the **pooled** one — serverless
     functions open many short-lived connections and will exhaust a
     non-pooled Postgres quickly.
   - `JWT_SECRET` — any long random string.
4. Redeploy. `npm run build` runs `prisma generate` automatically; run
   `npm run db:push` and `npm run db:seed` locally (pointed at the same
   `DATABASE_URL`) once to create the schema and demo data, since Vercel's
   build step doesn't do that for you.

Without `DATABASE_URL` set, the build fails at the `prisma generate` step and
Vercel will show a plain `404: NOT_FOUND` for every route, since there's no
successful deployment to route to.

## Features

- **Dashboard** — pipeline value, won-this-month, task alerts, pipeline-by-stage
  chart, recent activity feed.
- **Contacts** — searchable/filterable list, detail page with activity timeline,
  related deals and tasks.
- **Companies** — same, plus a roll-up of contacts, deals, and open pipeline value.
- **Pipeline** — Kanban board with drag-and-drop stage changes, plus a list view.
- **Tasks** — calls, emails, meetings, and to-dos with due-date filters
  (today / overdue / upcoming / completed).
- **Global search** — jump to any contact, company, or deal from the top bar.
- **Activity timeline** — log notes, calls, and emails against any record; status
  changes are logged automatically.

## Scripts

| Command            | Description                                      |
| ------------------ | ------------------------------------------------- |
| `npm run dev`       | Start the dev server                              |
| `npm run build`     | Production build (also runs `prisma generate`)    |
| `npm run start`     | Start the production server                       |
| `npm run typecheck` | Run `tsc --noEmit`                                 |
| `npm run db:push`   | Sync the Postgres schema                           |
| `npm run db:seed`   | Seed demo data                                     |
| `npm run db:reset`  | Drop, recreate, and reseed the database            |

## Project structure

```
prisma/schema.prisma       Data model (User, Company, Contact, Deal, Task, Activity)
prisma/seed.ts             Demo data seed script
src/app/                   Routes (App Router) — auth pages + the authenticated app shell
src/app/api/                REST-style API routes used by the client pages
src/components/            UI primitives + feature components (contacts, deals, tasks, ...)
src/lib/                   Prisma client, auth helpers, shared formatting/labels
```

Note: `next dev` and `next build`/`next start` should not be run against the same
`.next` directory at the same time — stop the dev server before building for
production (or vice versa) to avoid stale build artifacts.

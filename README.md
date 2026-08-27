# Victor

Victor is a lightweight CRM for sales teams — contacts, companies, a drag-and-drop
deal pipeline, tasks, and activity tracking, inspired by tools like Apollo.io.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) + TypeScript
- [Prisma](https://www.prisma.io/) + SQLite
- Tailwind CSS
- JWT-based auth (httpOnly cookie, `jose` + `bcryptjs`)

## Getting started

```bash
npm install
cp .env.example .env      # already present locally; edit JWT_SECRET for real use
npm run db:push           # create the SQLite database from the Prisma schema
npm run db:seed           # populate demo data
npm run dev                # start the dev server on http://localhost:3000
```

Sign in with the seeded demo account, or create your own from the login page:

- **Email:** `demo@victorcrm.app`
- **Password:** `victor123`

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
| `npm run db:push`   | Sync the SQLite schema                             |
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

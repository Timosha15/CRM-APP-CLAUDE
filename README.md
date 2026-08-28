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

## Email: sending + task reminders

Emails are sent through [Resend](https://resend.com) (free tier). Without it
configured, sending an email or requesting a reminder returns a clear
"email isn't configured" error instead of failing silently.

1. Create a free Resend account and grab an API key.
2. Add to your environment (locally in `.env`, and in Vercel's Environment
   Variables for production):
   - `RESEND_API_KEY` — your key.
   - `EMAIL_FROM` — defaults to `Victor <onboarding@resend.dev>`, Resend's
     shared test sender (works immediately, no domain setup). To send from
     your own domain, [verify it in Resend](https://resend.com/docs/dashboard/domains/introduction)
     and set this to an address on it.
   - `NEXT_PUBLIC_APP_URL` — your deployed URL (e.g. `https://your-app.vercel.app`),
     used for links inside emails.
   - `CRON_SECRET` — any random string. Vercel sends it automatically as a
     bearer token when it triggers the scheduled job below, so the endpoint
     can tell a real cron call from a random request.
3. `vercel.json` already schedules `/api/cron/task-reminders` to run daily
   (Vercel Cron, included on the free Hobby plan). It emails each user a
   digest of their overdue + due-today tasks and marks them so the same
   task isn't reminded about twice in one day. Nothing to configure beyond
   the env vars above — it starts working on your next deploy.
4. To test without waiting for the schedule, open **Tasks** in the app and
   click **Email me a reminder** — it sends your own digest immediately.

Sending a real email from a contact or deal page (the **Email** tab in the
activity composer) works the same way — it needs `RESEND_API_KEY` set, sends
through Resend, and logs the result (sent or failed, with the reason) to that
record's activity timeline either way.

If you set up your database before this feature existed, your existing table
won't have the columns it needs. Run this once against your database (Neon's
SQL Editor, or `psql`) to add them:

```sql
-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'FAILED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN "emailStatus" "EmailStatus", ADD COLUMN "subject" TEXT;
```

(Anyone starting fresh doesn't need this — `npm run db:push` already includes it.)

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
- **Activity timeline** — log notes and calls, or send real emails (via
  Resend) against any contact/deal; status changes are logged automatically.
- **Task reminder emails** — a daily digest of overdue + due-today tasks,
  emailed to each user automatically (Vercel Cron), plus an on-demand
  "Email me a reminder" button.

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

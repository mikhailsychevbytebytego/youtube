# Exercise: Move static page data into Supabase with Drizzle

Continue from [EXERCISE-0060](EXERCISE-0060-ASSIGNMENT-02-shorts-feed.md): the pages, dark theme, and Shorts feed still read from files in `src/lib`. Replace that mock data with a real database: connect the project to Supabase, model the domain with Drizzle, then have Agent convert the static content into seeded rows and load it dynamically.

## Part 1: Connect to Supabase

Create a Supabase project (or reuse an empty one) and put its Postgres connection string into `.env` as `DATABASE_URL`. Gotchas to check:

1. Use the Supavisor pooler host (`aws-…pooler.supabase.com`) — the direct `db.<ref>.supabase.co` host is IPv6-only and doesn't resolve everywhere. Port 6543 is transaction mode; 5432 is session mode.
2. URL-encode special characters in the password (e.g. `?` becomes `%3F`).
3. Make sure the connection string points at the project you think it does — the ref in `DATABASE_URL` should match the project you check in the dashboard.

## Part 2: Create tables

Ask Agent:

> Let's create necessary data structures to represent users, channels (separate, but linked to users), videos and push them to Supabase using Drizzle.

The agent should end up doing roughly the following — verify each point when it's done:

1. Install `drizzle-orm` + `postgres` (runtime) and `drizzle-kit` + `dotenv` (dev), and add `db:push` / `db:generate` / `db:studio` scripts.
2. Define a schema in `src/db/schema.ts`: `users`, `channels` (FK to `users`), `videos` (FK to `channels`) with sensible columns — uuid primary keys, unique handle/email, a `video_type` enum (`video` / `short` / `live`), counts as numbers, timestamps with time zone.
3. Enable RLS on every table with explicit read policies (Supabase exposes `public` tables through its Data API), and configure `entities.roles.provider = "supabase"` in `drizzle.config.ts` so drizzle-kit doesn't fight the built-in `anon` / `authenticated` roles.
4. Create the db client in `src/db/index.ts` with `prepare: false` (the transaction pooler doesn't support prepared statements).
5. Push with `drizzle-kit push` and verify against the live database: tables exist, RLS is on, policies and foreign keys are in place — e.g. by running a test insert + join that gets rolled back.

## Part 3: Switch static to dynamic

Ask Agent:

> Now let's convert our existing data present on the static pages to these new tables and load them dynamically on the pages.

The agent should end up doing roughly the following — verify each point when it's done:

1. Write a re-runnable seed script (`npm run db:seed`) that converts every mock channel and video into rows, parsing display strings into real values: "1.2M views" → `viewCount: 1200000`, "2 days ago" → a `publishedAt` offset, "4:12" → `durationSeconds: 252`.
2. Add a query layer (`src/lib/queries.ts`) instead of scattering DB calls through components — home videos/shorts, watch video with channel, up next, channel content, sidebar subscriptions with derived flags (live now, published recently).
3. Add formatting helpers (`src/lib/format.ts`) that turn the numbers back into display strings, rather than storing formatted text in the database.
4. Make pages async server components that fetch and pass data down as props; the watch page takes `?v=<id>` (awaiting `searchParams`), uses `generateMetadata` for the title, and 404s on unknown ids.
5. Link pages together with real ids: video cards and up-next items navigate to `/watch?v=<id>`, the channel name on the watch page navigates to `/channel`.
6. Delete the old `src/lib/*-data.ts` mock files once nothing imports them, keeping purely presentational bits (filter chips, tabs) as local constants.
7. Verify its own work: seed runs, `npm run lint` and `npx tsc --noEmit` pass, and all three pages render database content in the dev server.

**Check yourself:** open [http://localhost:3000](http://localhost:3000), click through to a watch page and a channel page, and confirm the URLs carry real ids and every title/view count/age on screen exists as a row in Supabase (spot-check with `npm run db:studio` or the dashboard). Then edit a row in the database, reload, and confirm the page changes. Bonus: confirm re-running `npm run db:seed` doesn't duplicate data.

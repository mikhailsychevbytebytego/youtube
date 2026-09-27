# Exercise: Video autoplay, watch time tracking, and admin analytics

Continue from [EXERCISE-0180](EXERCISE-0180-appearance-menu.md): Video playback on MewTube currently lacks autoplay, user watch time isn't measured, and platform admins have no visibility into daily watch time metrics. Have Agent implement video autoplay, client-side watch time pinging, backend event logging, fake data seeding, configurable admin user setup, and an admin analytics dashboard with a visual watch time chart.

Prerequisite:
- **File a Linear issue (outside of Cursor):** create an issue ticket in your Linear workspace describing video autoplay and watch time tracking (e.g. "Video autoplay and watch time tracking").

Ask Agent:

> Work on Linear issue MIK-8

The agent should end up doing roughly the following — verify each point when it's done:

1. **Database Schema & Migrations (`src/db/schema.ts`):** Define a `watch_events` table with `id`, `videoId` (foreign key to `videos.id` with cascade delete), `seconds` (integer, default 2), and `createdAt` (timestamp with timezone). Add relations (`videosRelations` and `watchEventsRelations`) and run `npm run db:push` to apply the migration to Postgres.
2. **Watch Time Ingestion & Video Player (`src/app/api/watch-time/route.ts`, `src/components/watch/video-player.tsx`):** Create a Next.js POST API endpoint at `/api/watch-time` that validates `videoId` and inserts a new watch event row. Update `VideoPlayer` to enable autoplay and start a periodic 2-second timer while the video is playing to ping the endpoint. Include a subtle debug toast overlay on the watch player that notifies when a ping (+2s) succeeds with timestamp.
3. **Admin User Script & Seed Data (`src/scripts/setup-admin.ts`, `src/db/seed.ts`, `src/db/mock.ts`):** Update `setup-admin.ts` and `seed.ts` to read admin credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`) from `.env` or CLI arguments with sensible defaults. Add `seedWatchEvents()` in `src/db/seed.ts` to populate realistic fake watch events across the last 7 days when seeding the database (`npm run db:seed`). Add `"db:admin"` script to `package.json`.
4. **Admin UI & Chart Component (`src/components/admin/watch-time-chart.tsx`, `src/app/admin/watch-time/page.tsx`, `src/app/admin/page.tsx`):**
   - Create `WatchTimeChart` as an interactive SVG chart featuring bar and line chart view toggles, hover tooltips, daily average metrics, and peak watch time highlights.
   - Build the `/admin/watch-time` page presenting cumulative platform watch time and the daily watch time chart. Add a "Watch time" link to `AdminNav`.
   - Update the main Admin Dashboard (`/admin/page.tsx`) to display a total watch time stat card. Add a per-video watch time summary to the video edit page (`/admin/videos/[id]/page.tsx`).
5. **Verify its own work:** `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass cleanly with zero errors.

**Check yourself:**
1. Open the Watch page (`/watch`) for any video and verify that playback begins automatically. While playing, watch for the subtle toast overlay in the bottom-right corner confirming periodic watch time pings (+2s) every 2 seconds. Pause the video and verify pings stop.
2. Navigate to the Admin Dashboard (`/admin`) and explore the watch time metrics and charts on `/admin/watch-time`.
3. Edit a video in `/admin/videos/[id]` and confirm total watch time and daily breakdown stats are displayed for that specific video.
4. Test running `npm run db:admin` and `npm run db:seed` from the command line to verify smooth admin setup and fake data seeding.

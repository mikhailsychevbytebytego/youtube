# Exercise: Build an admin CRUD interface with an AI agent

Continue from [EXERCISE-0070](EXERCISE-0070-supabase-drizzle.md): the pages read from Supabase, but the only way to change data is the seed script or the dashboard. Have Agent build a proper admin section on top of the same Drizzle setup.

Ask Agent:

> Create a CRUD interface for all these entries, a separate /admin path where we can view paginated data for each type, a dashboard and ability to edit/add entries.

The agent should end up doing roughly the following — verify each point when it's done:

1. Give `/admin` its own layout and nav (Dashboard, Users, Channels, Videos, link back to the site), visually separate from the consumer UI but reusing the project's Tailwind conventions. No new dependencies — server components for reads, Server Actions for writes.
2. Dashboard at `/admin` with entity counts, aggregate stats (e.g. total views), and a list of recent items linking to their edit pages.
3. Paginated list pages (`?page=N`, awaited `searchParams`) with a shared pagination component, joined columns (channel owner, video channel), and an admin-only view of drafts — unpublished videos should be visible here but not on the public pages.
4. Create and edit share one form component per entity (`useActionState` + Server Actions bound with the row id); relations are picked via `<select>` (channel owner, video channel), enums via a select, dates via `datetime-local`. Unknown or malformed ids → `notFound()`.
5. Server actions parse `FormData` into typed values, `revalidatePath` + `redirect` on success, and return friendly errors for required fields and unique-constraint violations (duplicate email/handle) instead of crashing. Note: Drizzle wraps the Postgres error — the `23505` code is on `error.cause`.
6. Deletes go through a confirm dialog that warns about cascades (deleting a user deletes their channels and videos).
7. Verify its own work: lint/type checks pass and every flow is exercised against the dev server — paginate, create, edit, delete each entity, and confirm an edit shows up on the public pages.

**Check yourself:** open [http://localhost:3000/admin](http://localhost:3000/admin), walk each section, and: create a user, give them a channel, add a video to it, then find the video on the home page; edit a video title and reload its `/watch?v=<id>` page; untick "Published" and confirm the video vanishes from the home page but stays in the admin list; delete the test user and confirm their channel and video are gone too. Bonus: note that `/admin` is wide open — protecting it with auth is a later exercise.

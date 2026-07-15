# Exercise: Add Better Auth on the existing users table and guard /admin

Continue from [EXERCISE-0100](EXERCISE-0100-actual-video-creation.md): the app has real data and an admin section, but `/admin` is wide open — the gap noted back in [EXERCISE-0060](EXERCISE-0060-admin-crud.md). Have Agent integrate Better Auth reusing the `users` table that already exists, add an admin flag, and lock the admin section down.

Prerequisite: `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in `.env` (any random 32+ byte hex works for the secret; the URL is `http://localhost:3000` in dev).

Ask Agent:

> Lets integrate Better Auth taking into account we already have user database we want to reuse and lets add dedicated flag for admin access and guard admin page so that you need to be both logged in and admin

The agent should end up doing roughly the following — verify each point when it's done:

1. Install `better-auth` and extend the schema rather than replace it: `users` gains `emailVerified` and `isAdmin` (both boolean, not null, default false), plus new `sessions`, `accounts`, and `verifications` tables in the project's style (uuid `defaultRandom()` primary keys, timezone timestamps). Enable RLS on the new tables with **no** policies — the server connects as the table owner, and session tokens must not leak through Supabase's Data API. Apply with `npm run db:push`.
2. Configure the Drizzle adapter around the existing naming in `src/lib/auth.ts`, dodging three real gotchas: plural table names need an explicit `schema: { user: users, session: sessions, ... }` mapping; Better Auth's `image` field maps to our `avatarUrl` via `user.fields` (and `additionalFields` keys must match the Drizzle property name — `fieldName` is not supported); and `advanced.database.generateId: false` so Postgres generates the uuid ids instead of Better Auth's base62 strings, which would violate the uuid column type.
3. Declare `isAdmin` as an additional field with `input: false`, so a crafted sign-up request can't grant itself admin.
4. Mount the API at `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler`), create the React client in `src/lib/auth-client.ts`, and build a `/signin` page that toggles between sign in and sign up (email + password), shows friendly errors, and redirects to `/admin` on success.
5. Centralize the guard in `src/lib/require-admin.ts`: get the session from request headers; no session → redirect to `/signin`; then read `isAdmin` **fresh from the users table** (not from the session payload, so promotions and demotions apply immediately); not admin → redirect to `/`. Call it in the admin layout **and** at the top of every server action in `src/app/admin/actions.ts` — actions are directly invokable HTTP endpoints, so guarding pages alone protects nothing.
6. Let admins grant admin: an "Admin access" checkbox on the admin user form, parsed in the create/update actions. The very first admin is bootstrapped once via SQL: sign up on `/signin`, then `update users set is_admin = true where email = '...'`.
7. Show the signed-in email and a working sign-out button in the admin header, and verify the flows end-to-end against the dev server.

**Check yourself:** open [http://localhost:3000/admin](http://localhost:3000/admin) in a private window — you should land on `/signin`. Sign up, and confirm you get bounced to the home page (logged in but not admin). Flip your `is_admin` in the database, reload `/admin`, and you're in — with your email and a sign-out button in the header. Sign out and confirm `/admin` redirects again, while the public pages never required login.

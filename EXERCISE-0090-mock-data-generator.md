# Exercise: Generate mock data with an LLM via a 3rd party service (e.g. fal.ai)

Continue from [EXERCISE-0080](EXERCISE-0080-admin-crud.md): the seed script and admin CRUD can populate data, but everything is hand-written. Have Agent build a generator script that asks an LLM to invent fake users and channels, then validates and inserts them.

Prerequisite: a fal.ai API key in `.env` as `FAL_KEY` (from [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)).

Ask Agent:

> Connect fal.ai API and using openrouter/router endpoint with 'gemini-3.5-flash' model add a new script that would create fake users in the database and associated channels, only text for now, no avatars. Generate json and validate it when parsing (zod?)

The agent should end up doing roughly the following — verify each point when it's done:

1. Add `zod` as the only new dependency — no fal SDK needed, a single `fetch` POST to `https://fal.run/openrouter/router` with an `Authorization: Key $FAL_KEY` header is enough. The model slug must be `google/gemini-3.5-flash` — bare `gemini-3.5-flash` is not a valid OpenRouter id, so the agent should catch and fix that.
2. Create `src/db/mock.ts` with a `db:mock` npm script, taking an optional count argument (`npm run db:mock -- 8`, default 5, sanity-bounded). Each generated user owns exactly one channel, matching the seed script's model; `avatarUrl`/`bannerUrl` stay null.
3. Prompt the model for strict JSON only (no prose, no markdown fences) and include an example object of the expected shape, themed to the site. Query existing user emails and channel handles first and list them in the prompt as "do not reuse", to reduce unique-constraint collisions.
4. Defensively parse the response: strip markdown fences the model may add anyway, `JSON.parse`, then validate with a Zod schema (valid email, handle matching `/^@[a-z0-9_.]{3,30}$/`, non-negative integer subscriber count). On failure, print the raw model output plus the Zod issues and exit non-zero — never insert unvalidated data.
5. Insert non-destructively — unlike `db:seed`, nothing is cleared. Users and channels go in with `.onConflictDoNothing()`; a duplicate email skips that user's channel too, and each row logs an inserted/skipped line plus a final summary.
6. Verify its own work: run the script at least twice against the live database and confirm the rows landed (admin pages, `db:studio`, or a direct query) and that duplicates are skipped rather than crashing.

**Check yourself:** run `npm run db:mock -- 3`, then open [http://localhost:3000/admin/users](http://localhost:3000/admin/users) and [http://localhost:3000/admin/channels](http://localhost:3000/admin/channels) and find the new cat-themed users and channels. Re-run the script and confirm the totals report skips instead of throwing unique-constraint errors. The home page should be unchanged — the generated channels have no videos yet. Bonus: temporarily break the Zod schema (e.g. require `subscriberCount` to be a string) and confirm the script refuses to insert and prints the validation errors instead.

# Exercise: Lexical search with Postgres `tsvector`

Continue from [EXERCISE-0130](EXERCISE-0130-clip-embeddings.md): videos have CLIP embeddings, but nothing reads them and the header search box is still decorative. This is the **alternative** to the CLIP path on `0140-semantic-search` — same results page and header wiring, but rank with Postgres full-text search instead of CLIP. No new columns, no extension, no catalog reset, and the CLIP model never runs at request time.

Prerequisite: a populated `videos` table with titles and descriptions (the Cloudflare catalog from the previous exercises is fine). Full-text search is built into Postgres; you do not enable pgvector for this path and you do not run `db:push`.

Ask Agent:

> Lets implement search with postgres tsquery. Title and description get turned into a tsvector in the query, match with websearch_to_tsquery, rank with ts_rank, and wire the header box to a real /search page.

The agent should end up doing roughly the following — verify each point when it's done:

1. Add `searchVideos(query, limit)` to `src/lib/queries.ts` using the query builder — the relational API can't order by an expression. Build a document `tsvector` in SQL with `setweight(to_tsvector('english', title), 'A') || setweight(to_tsvector('english', coalesce(description, '')), 'B')` so title matches outrank description matches. Parse the user string with `websearch_to_tsquery('english', query)` (safe for ordinary phrases; don't interpolate into `to_tsquery` by hand). Filter `isPublished` plus `document @@ tsquery`, order by `ts_rank` descending, inner-join `channels`, and map rows back to the existing `VideoWithChannel` shape so `VideoCard` works unchanged. Compute the vector at query time — a stored generated column and GIN index are unnecessary at this catalog size.
2. Create `src/app/search/page.tsx` as a server component: read `searchParams.q`, call `searchVideos` with the trimmed string (skip the query when it's blank), and render the same 4-column `VideoCard` grid the home page uses, with empty states for a blank query and for no results.
3. Wire both header search boxes (`src/components/header.tsx` and `src/components/watch/watch-header.tsx`) by wrapping the existing input and button in `<form action="/search">` with `name="q"` — a plain GET form navigates to `/search?q=...` with zero client JS, so both headers stay server components. The search page passes the query back so the box stays filled on the results page.
4. Verify its own work: `npx tsc --noEmit` passes, and a word that appears in a title (for example `"space"` against a "Space Launch" video) ranks that video first. CLIP embeddings are unused.

**Check yourself:** search from the header box for a word that is actually in a title or description and confirm the matching video is first. Then try a thematic query whose words do **not** appear in the text — `"astronaut"` against a first-contact / space-launch catalog, or `"cooking disaster"` when the title only says "soufflé" — and confirm FTS returns nothing or a weak lexical hit. That miss is the point of this path: `tsvector` matches tokens (with English stemming), not meaning or thumbnail pixels. Confirm the URL is `/search?q=...`, the box stays filled, results click through to watch pages, and a blank submit shows the empty state rather than every video. Bonus: search `"detectives"` and see stemming match `"detective"` in a title.

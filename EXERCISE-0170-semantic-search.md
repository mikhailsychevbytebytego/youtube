# Exercise: Semantic search over CLIP embeddings

Continue from [EXERCISE-0160](EXERCISE-0160-clip-embeddings.md): every new video carries three CLIP embeddings, but nothing reads them and the header search box is still decorative. Have Agent close the loop — embed the search query with CLIP on the server, rank videos by the closest of their three embeddings, and wire the search box to a real results page. Along the way, reset the catalog so everything is Cloudflare-backed and searchable.

Prerequisite: the Cloudflare token and embeddings setup from the previous two exercises.

> **Cost note:** regenerating the catalog means 9 Seedance videos at ~$1.45 each (~$13), running sequentially for 35-45 minutes. The reset itself is destructive — all seed videos, shorts, and live rows are deleted for good.

Ask Agent:

> Now let's implement full search expeirence by calculating query CLIP and finding closest videos using min off all 3 embeddings. we should also clear db from all non cloudflare videos and generate 9 new videos (with embeddings and full cloudflare backing)

The agent should end up doing roughly the following — verify each point when it's done:

1. Reset the catalog: delete every row whose `video_url` is null or not a `cloudflarestream.com` URL (channels and users stay), then backfill embeddings for any Cloudflare video created before the embeddings step — text embedded directly, thumbnail downloaded back from its `imagedelivery.net` URL — via a temporary script that's removed after running. Known consequence: the home shorts rail goes empty, since no shorts survive.
2. Rebuild with `npm run db:mock -- --videos 9` — the existing pipeline already does Cloudflare uploads plus embeddings, so no new generation code is needed. End state: 11 videos, all with Stream URLs, UIDs, and all three embeddings.
3. Add `searchVideos(queryEmbedding, limit)` to `src/lib/queries.ts` using the query builder — the relational API can't order by an expression. Compute three `cosineDistance(...)` values against the query and combine them with a `LEAST(...)` sql fragment: Postgres `LEAST` ignores nulls, so a video missing its thumbnail embedding still ranks on its text distances. Inner-join `channels`, filter on `isPublished` plus a non-null title embedding (the title is always embedded first, so it doubles as the "has any embeddings" marker), order by the min distance ascending, and map rows back to the existing `VideoWithChannel` shape so `VideoCard` works unchanged.
4. Add `serverExternalPackages: ["@huggingface/transformers"]` to `next.config.ts` — transformers.js ships native ONNX bindings that must not be bundled, and until now it only ran in `tsx` scripts, never inside Next's server runtime.
5. Create `src/app/search/page.tsx` as a server component: read `searchParams.q`, embed it with `embedText`, call `searchVideos`, and render the same 4-column `VideoCard` grid the home page uses, with empty states for a blank query and for no results.
6. Wire both header search boxes (`src/components/header.tsx` and `src/components/watch/watch-header.tsx`) by wrapping the existing input and button in `<form action="/search">` with `name="q"` — a plain GET form navigates to `/search?q=...` with zero client JS, so both headers stay server components. The search page passes the query back so the box stays filled on the results page.
7. Verify its own work: `npx tsc --noEmit` passes, the database holds 11 fully Cloudflare-backed rows with embeddings, and thematic queries against the dev server rank sensibly.

**Check yourself:** search from the header box for queries that match your generated catalog thematically rather than verbatim — things like "cooking disaster in the kitchen", "detective mystery", or "peaceful meditation zen" — and confirm the top result is the right video even though the words don't appear in its title. The first search after a server restart is slow while the CLIP model loads; after that it's fast. Confirm the URL is `/search?q=...`, the box stays filled, results click through to playable watch pages, and a nonsense query still returns a ranked (if arbitrary) list — cosine distance always produces an ordering. Bonus: compare where a query ranks a video whose *thumbnail* matches visually but whose title doesn't, to see the cross-modal `LEAST` at work.

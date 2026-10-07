# Exercise: Build the Up Next rail from CLIP similarity

Continue from [EXERCISE-0170](EXERCISE-0170-semantic-search.md): search finds videos closest to a query, but the watch page's "Up next" rail is still just recency with the current channel filtered out. Have Agent reuse the stored embeddings to make the rail genuinely related — the videos closest to the one currently playing.

Prerequisite: the embedded, Cloudflare-backed catalog from the previous exercise. No new services, dependencies, or generation cost — this is pure SQL over vectors that already exist.

Ask Agent:

> Lets use similarity to find closest videos to currently opened video and construct related based on this similarity.

The agent should end up doing roughly the following — verify each point when it's done:

1. Add `getRelatedVideos(current, limit)` to `src/lib/queries.ts` next to the search query. Unlike search, there's nothing to embed at request time — the current video's vectors come straight off the row that `getWatchVideo` already loaded, so no CLIP model runs on a watch page view.
2. Rank by the smallest **same-modality** distance: title-to-title, description-to-description, thumbnail-to-thumbnail, combined with a `LEAST(...)` sql fragment. Cross-modal pairs (this title vs that thumbnail) are systematically further apart in CLIP space, so mixing them would just add noise. Guard each term in TypeScript — if the current video lacks an embedding, substitute sql `null` rather than sending a null parameter into `cosineDistance` — and `LEAST` ignores the nulls on the candidate side.
3. Keep the sensible filters (not the current video, no shorts, published, has embeddings) but **drop** the old "different channel only" rule — a genuinely similar video from the same channel is exactly what a related rail should surface. Fall back to the recency-based `getUpNextVideos` when the current video predates embeddings.
4. Swap `getUpNextVideos(video)` for `getRelatedVideos(video)` in `src/app/watch/page.tsx` — the rail component already takes `VideoWithChannel[]`, so no UI changes at all.
5. Verify its own work: `npx tsc --noEmit` passes, and the rendered rail order matches a hand-written SQL ranking (`least(v.title_embedding <=> cur.title_embedding, ...)`) for the same video.

**Check yourself:** open a few videos and confirm each one's "Up next" list differs and reflects the video you're watching, then re-run the ranking by hand in psql with a `WITH cur AS (SELECT * FROM videos WHERE id = '...')` query and confirm the page order matches the distances exactly. Expect some surprises in what CLIP considers "closest" on a small catalog of quirky titles — similarity can read as visual style or tone rather than topic; judge whether the cooking video's neighbors feel related and why. Bonus: watch the Postgres query with `EXPLAIN ANALYZE` — at 11 rows it's a sequential scan and that's fine; note at what catalog size you'd reach for an HNSW index, and why an index on three separate columns under a `LEAST` can't be used directly anyway.

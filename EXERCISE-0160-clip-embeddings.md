# Exercise: Store CLIP embeddings for videos with pgvector

Continue from [EXERCISE-0150](EXERCISE-0150-ASSIGNMENT-03-mweb.md): videos now live on Cloudflare, but finding them still means exact-match SQL on titles. Lay the groundwork for semantic search — have Agent enable pgvector on Supabase and store CLIP embeddings for each video's title, description, and thumbnail right on the `videos` row. CLIP maps text and images into one shared vector space, so a text query can later be compared against thumbnails and vice versa.

Prerequisite: none beyond the existing setup — embeddings run locally via transformers.js, so there's no API key or per-call cost. The first run downloads the CLIP model (~100 MB, cached afterwards).

Ask Agent:

> New task, lets us store CLIP embedings for the videos's thumbnail, title, description. We probably want install pgvector into supabase. Update mock tools generating it to creeate such data and put them into the same table where the video object is encided.

The agent should end up doing roughly the following — verify each point when it's done:

1. Enable the extension by hand — `drizzle-kit push` manages tables, not extensions — with `CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;`, following the Supabase convention of keeping extensions out of `public` (pgvector 0.8.x is preinstalled on Supabase, just not enabled).
2. Add three nullable columns to `videos` in `src/db/schema.ts` using drizzle's built-in `vector` type: `titleEmbedding`, `descriptionEmbedding`, `thumbnailEmbedding`, all `{ dimensions: 512 }` to match CLIP ViT-B/32, applied with `npm run db:push`. Same table as the video object — no side table.
3. Create `src/lib/embeddings.ts` on `@huggingface/transformers` (transformers.js) with the `Xenova/clip-vit-base-patch32` model: `embedText` through `AutoTokenizer` + `CLIPTextModelWithProjection`, `embedImage` through `AutoProcessor` + `CLIPVisionModelWithProjection` (fed the PNG bytes via `RawImage`). Both L2-normalize to unit length — cosine similarity comes free — and lazy-load the model once per process behind a cached promise, since the script embeds in a loop.
4. Wire it into `insertVideo` in `src/db/mock.ts`: keep the thumbnail bytes around from the generation step (they're already in memory before the Cloudflare upload — no re-download), embed title, description, and thumbnail, and include all three vectors in the same insert as the rest of the row. Match the script's resilience: a failed embedding warns and inserts nulls, and a missing thumbnail still gets its two text embeddings.
5. Verify its own work: `npx tsc --noEmit` passes, a real `npm run db:mock -- --videos 1` run logs the embedding step, and the new row carries three 512-dim vectors — checked with `vector_dims()` and a cosine-operator (`<=>`) sanity query in psql.

**Check yourself:** run `npm run db:mock -- --videos 1`, then in psql: `SELECT title, vector_dims(title_embedding), round((1 - (title_embedding <=> description_embedding))::numeric, 2), round((1 - (title_embedding <=> thumbnail_embedding))::numeric, 2) FROM videos ORDER BY created_at DESC LIMIT 1;` — expect 512 dims, title-to-description similarity around 0.7-0.8 (they describe the same video), and title-to-thumbnail around 0.2-0.3 (CLIP cross-modal scores run lower but still rank correctly). Older rows keep null embeddings — only new mock generation computes them. Bonus: with a few embedded videos in place, order by `title_embedding <=> (SELECT title_embedding FROM videos WHERE id = '<some-id>')` and judge whether the nearest neighbors actually feel related.

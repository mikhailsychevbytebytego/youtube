# Exercise: Video generation caching and mock data cleanup

Continue from [EXERCISE-0190](EXERCISE-0190-video-autoplay-and-watch-time.md): Mock video generation involves expensive AI model calls (LLM prompts, Seedream image generation, Seedance video rendering, and CLIP embeddings). Have Agent implement local disk-based asset caching for `src/db/mock.ts` under a `.mock-cache/` directory, update the video duration to 8 seconds, enforce AI video filtering in database queries, and clean up non-AI placeholder content.

Ask Agent:

> Using video generation tasks in @src/db/mock.ts, implement resource caching under a new `.mock-cache` folder so when we run db-mock we always reuse cached AI assets (LLM outputs, images, videos, embeddings). Change VIDEO_DURATION_SECONDS to 8. Clean up static non-AI videos from the database and ensure queries only return playable AI videos.

The agent should end up doing roughly the following — verify each point when it's done:

1. **Video Duration Update (`src/db/mock.ts`):** Update `VIDEO_DURATION_SECONDS` from 6 to 8 seconds, and adjust the JSON prompt instructions/examples to reflect 8-second video scripts.
2. **Local Resource Caching (`src/db/mock.ts`):**
   - Create local cache directory structure (`.mock-cache/llm`, `.mock-cache/images`, `.mock-cache/videos`, `.mock-cache/embeddings`). Add `/.mock-cache/` to `.gitignore`.
   - Wrap `callLlm` to cache validated raw JSON responses keyed by `sha256(prompt)`.
   - Wrap `generateImage` to cache PNG image buffers and metadata JSON keyed by `sha256(prompt:size)`.
   - Wrap `generateVideo` to cache MP4 video buffers keyed by `sha256(script:sourceImage)`.
   - Wrap `embedText` and `embedImage` with `getCachedEmbedText` and `getCachedEmbedImage` stored under `.mock-cache/embeddings/`.
3. **Player & Query Refinements (`src/components/watch/video-player.tsx`, `src/lib/queries.ts`):**
   - Refine `getStreamEmbedUrl` in `VideoPlayer` to generate clean `https://iframe.videodelivery.net/<uid>` iframe embed URLs.
   - Update `getHomeVideos`, `getWatchVideo`, `getUpNextVideos`, and `searchVideos` in `src/lib/queries.ts` to filter with `isNotNull(videos.videoUrl)`.
   - Clean up static/non-AI placeholder videos from the database.
4. **Verify its own work:** `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass cleanly. Running `npm run db:mock -- --videos 1` reuses cached assets when re-run.

**Check yourself:**
1. Check `.gitignore` contains `/.mock-cache/` and verify cache files exist under `.mock-cache/` after running `npm run db:mock`.
2. Run `npm run db:mock -- --videos 1` a second time and verify logs show `[cache hit]` for LLM, image, video, and embedding generations.
3. Open the home page and click on any video; confirm that all listed videos open and play real AI-generated video content via Cloudflare Stream.

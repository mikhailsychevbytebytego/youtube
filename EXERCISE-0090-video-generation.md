# Exercise: Generate fake videos with scripts and thumbnails

Continue from [EXERCISE-0080](EXERCISE-0080-avatar-generation.md): the generator produces users, channels, and avatars, but the channels are empty. Have Agent extend it so the LLM also invents the videos — title, viewer description, and a production script for a 5-second clip — and a text-to-image model renders each video's thumbnail.

Ask Agent:

> Now lets move to mock video generation, use LLM to create name and script of a 5 second funny cat video, use variety of styles from photorealism to anime and variety of stories, from slice of life to medieval fantasy. Use the generated/validated JSON to also create a thumbnail for the video and ultimately create the video entry.

Decisions to make with the agent up front: whether videos attach only to newly generated channels or also to existing ones (do both — a flag for the latter), and where the script lives (a new nullable `script` column on `videos`, keeping `description` viewer-facing).

The agent should end up doing roughly the following — verify each point when it's done:

1. Add `script: text("script")` to the `videos` table in `src/db/schema.ts` (nullable — seed rows have none) and apply it with `npm run db:push`.
2. Extend the LLM prompt and Zod schemas with a `videos` array (1-3 per channel): `title`, viewer-facing `description`, `script` (visual style, scene, the cat's action, camera notes for a 5-second video), `thumbnailPrompt`, and plausible `viewCount`/`likeCount`. The prompt must explicitly demand variety ACROSS videos — styles from photorealism through claymation to anime, stories from slice of life through sci-fi to medieval fantasy — and require `thumbnailPrompt` to restate the chosen style so the image matches the script.
3. Add a second mode for existing channels: `npm run db:mock -- --videos 5` picks random channels from the DB, sends their names/handles/descriptions to the LLM, and generates one themed video per channel, keyed by handle and validated the same way (fences stripped, `JSON.parse`, `safeParse`).
4. Get the thumbnail ratio right: generalize the avatar image helper to `generateImage(prompt, size)` and pass an explicit `image_size: { width: 2560, height: 1440 }` — video cards render 16:9 and that's exactly Seedream's minimum pixel count, so presets won't do. Save as `public/images/mock-thumb-<title-slug>.png`.
5. Insert video rows with `channelId`, `title`, `description`, `script`, `thumbnailUrl`, `durationSeconds: 5`, and a `publishedAt` randomized over the last 90 days. A failed thumbnail warns and inserts the row with a null thumbnail (same policy as avatars); the summary reports video and thumbnail counts.
6. Verify its own work: `npx tsc --noEmit` passes, both modes run against the live database, the PNGs are 2560x1440, rows carry scripts and thumbnail paths, and the watch pages render — with the script NOT visible to viewers.

**Check yourself:** run `npm run db:mock -- 1` and then `npm run db:mock -- --videos 2` (each thumbnail costs ~$0.035; a full run takes a couple of minutes). Confirm `file public/images/mock-thumb-*.png` reports 2560x1440, read a few `script` values in the DB and enjoy the genre spread, and open a new video's `/watch?v=<id>` page to see the title, channel, and thumbnail — but no production script. Note the home page sorts by `publishedAt`, so randomly backdated videos may not crack the top 8; find them via their channel or the admin videos list instead. Bonus: re-run `--videos` and confirm the LLM stays on-theme for channels it has never seen before.

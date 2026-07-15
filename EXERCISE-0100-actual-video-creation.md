# Exercise: Create real videos with an image-to-video model

Continue from [EXERCISE-0090](EXERCISE-0090-video-generation.md): every mock video has a script and a thumbnail, but the watch page still shows a static mock player. Have Agent close the loop — feed the script and thumbnail into an image-to-video model and play the result on the site.

> **Cost note:** Seedance 2.0 Fast is priced per second of output (~$1.45 for a 6-second clip), so keep counts low — `--videos 1` is plenty for testing. If you'd rather not spend on generation at all, the additional course materials include a library of pregenerated videos you can drop into `public/videos/` instead (provided as a separate package).

Ask Agent:

> Now, lets extend the video generation with actual video creation. Use seedance 2.0 fast on fal to create a 6 second video using our script and source image as input

The agent should end up doing roughly the following — verify each point when it's done:

1. Add a nullable `videoUrl` column to `videos` in `src/db/schema.ts` and apply it with `npm run db:push`.
2. Use fal's **queue API** (`https://queue.fal.run/bytedance/seedance-2.0/fast/image-to-video`) instead of the synchronous `fal.run` host — generation takes minutes and a held-open HTTP request would time out. Submit the job, poll the returned `status_url` every ~10 seconds until `COMPLETED` (with an overall timeout), then fetch `response_url` and download the mp4. Every queue response gets its own small Zod schema before being trusted.
3. Wire the inputs from what already exists: the LLM's `script` is the motion prompt, and the video's own thumbnail is the source image — the image helper must return the fal-hosted URL alongside the downloaded bytes so it can be passed as `image_url` (Seedance animates that exact frame). Request `duration: "6"`, `resolution: "720p"`, `aspect_ratio: "16:9"`. If the thumbnail failed, skip video generation — there's no source frame.
4. Save files to `public/videos/mock-video-<title-slug>.mp4` (creating the directory), store the local path in `videoUrl`, set `durationSeconds: 6`, and update the prompts from 5-second to 6-second scripts. A failed generation warns and inserts the row without a video; summaries report a video-file count.
5. Update `src/components/watch/video-player.tsx`: when a video has a `videoUrl`, render a real `<video>` element with controls and the thumbnail as poster; everything else keeps the static mock player.
6. Verify its own work: `npx tsc --noEmit` and `npm run lint` pass, a real run produces an mp4 (check duration and resolution with `ffprobe`), the row carries the `/videos/...` path, and the watch page serves the file and renders the `<video>` element.

**Check yourself:** run `npm run db:mock -- --videos 1` and watch the queue statuses tick by (expect 2-4 minutes). Confirm `ffprobe public/videos/mock-video-*.mp4` reports ~6 seconds at 1280x720, then open the new video's `/watch?v=<id>` page and actually play it — the clip should start from its thumbnail frame, since that image seeded the generation. Older videos without files should still show the static player. Bonus: compare the played clip against its `script` in the database and judge how faithfully the model followed the camera notes.

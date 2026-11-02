# Assignment 7: Add real video uploads to Cloudflare

> **These are assignments, not walkthroughs.** The exercises so far told you roughly what
> the agent should produce. These two don't. You get the goal and the constraints; the
> planning is yours. Build them the way you practiced in the session: plan the task, let
> the agent implement it, review the diff, verify in the browser, then commit.

Continue from [EXERCISE-0260](EXERCISE-0260-ASSIGNMENT-06-channel-creation.md): accounts
can create a channel, and `/you` is the personal page. The only videos in the catalog
still come from seed data and the fal.ai mock generator. Those already land on Cloudflare
Stream when `db:mock` runs; a signed-in creator cannot send a file of their own.

## The goal

Build an upload system that sends user videos to Cloudflare. These uploads sit alongside
the AI-generated catalog you already have.

## Constraints

- **The file does not go through Next as a giant body.** Ask Stream for a direct creator
  upload URL, PUT or POST the bytes from the browser, then write a `videos` row. Reuse
  `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_STREAM_API_TOKEN` from exercise 0140.
- **Same pipeline as generated media.** Store `streamUid` and a Cloudflare playback URL
  on the video row so `/watch`, home, and the channel page use the player you already
  built. Do not add a second player for "user uploads."
- **A channel is required.** Assignment 6 comes first. Signed-out visitors sign in;
  signed-in users without a channel create one before they can upload.
- **The generated catalog stays.** Seed and mock videos keep working. User uploads are
  more rows in the same table, not a parallel library.

## What you'll practice

- Wiring an upload path from the browser to cloud storage
- Serving user content and generated content through the same pipeline
- Finishing a feature end to end, from UI to storage to playback

## Check yourself

Create a channel, then upload an mp4 from `/you/upload`. The file should leave the
browser for Cloudflare (watch the Network tab: not a huge POST to `/api/...` carrying
the bytes). When it is done, `/watch?v=<id>` plays it in the Stream iframe, the public
channel page lists it under Uploads, and home can show it next to generated videos.

Open an older catalog video and confirm it still plays the same way. If the Cloudflare
env vars are missing, the upload page should say so rather than failing opaquely.

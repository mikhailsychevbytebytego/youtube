# Exercise: Generate avatars with a text-to-image model

Continue from [EXERCISE-0070](EXERCISE-0070-mock-data-generator.md): the mock data generator invents users and channels, but leaves avatars null. Have Agent extend it so the LLM also writes an image prompt per user, and a text-to-image model turns it into a real profile picture.

Ask Agent:

> Extend the user generator with avatar creation using FAL and `bytedance/seedream/v5/lite/text-to-image` to create a corresponding avatar, extend the llm part to provide prompt for the image generation, use 1:1 ratio for image

The agent should end up doing roughly the following — verify each point when it's done:

1. Keep everything in `src/db/mock.ts` with no new dependencies — the image endpoint is just a second `fetch` POST to `https://fal.run/bytedance/seedream/v5/lite/text-to-image` with the same `Authorization: Key $FAL_KEY` header.
2. Extend the LLM prompt and Zod schema with an `avatarPrompt` field: a one-to-two sentence text-to-image prompt per user describing their cat avatar (style, colors, personality matching the channel theme), including it in the example JSON so the model returns the right shape.
3. Get the 1:1 ratio right: Seedream requires total pixels between 2560x1440 and 4096x4096, and the enum presets (`auto_2K`) don't guarantee square — so pass an explicit `image_size: { width: 2048, height: 2048 }`, the smallest square that fits.
4. Validate the image response with its own small Zod schema (non-empty `images` array of `{ url }`) before trusting it, then download the bytes, save to `public/images/mock-avatar-<handle>.png`, and store the local `/images/...` path on **both** the user and channel rows — matching the seed data convention, so `next/image` needs no `next.config.ts` changes.
5. Order the work to avoid paying for wasted generations: insert the user first (a duplicate email skips the avatar entirely), then generate + save the image and update the row. If image generation fails, warn and continue with a null avatar instead of aborting the batch, and report an avatar count in the final summary.
6. Verify its own work: run the script against the live database and confirm the PNG files exist, the `avatar_url` columns point at them, and the avatars render on the admin pages.

**Check yourself:** run `npm run db:mock -- 2` (each avatar costs ~$0.035 and takes ~30s), then confirm `public/images/mock-avatar-*.png` files exist and are square (`file public/images/mock-avatar-*.png`), and open [http://localhost:3000/admin/users](http://localhost:3000/admin/users) and [http://localhost:3000/admin/channels](http://localhost:3000/admin/channels) to see the generated cat avatars next to the new rows. Re-run the script and confirm skipped duplicates don't generate images. Bonus: point `FAL_KEY` at an invalid value after the user insert step would succeed — or just break the image endpoint URL — and confirm the script still inserts users and channels, just without avatars.

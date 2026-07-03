import { fal } from "@fal-ai/client";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MODEL = "bytedance/seedance-2.0/fast/image-to-video";
const PROMPT =
  "The cat gently turns its head and blinks, tail twitching slightly, soft sunlight on the windowsill";
const INPUT_IMAGE = path.join(process.cwd(), "public/meowtube/generated-cat.png");
const OUTPUT_VIDEO = path.join(process.cwd(), "public/meowtube/generated-cat.mp4");

async function main() {
  if (!process.env.FAL_KEY || process.env.FAL_KEY === "your_fal_api_key_here") {
    throw new Error(
      "FAL_KEY is missing. Add your fal.ai API key to .env (https://fal.ai/dashboard/keys).",
    );
  }

  try {
    await access(INPUT_IMAGE);
  } catch {
    throw new Error(
      `Input image not found at ${INPUT_IMAGE}. Run npm run generate:cat-image first.`,
    );
  }

  console.log("Uploading image to fal storage...");
  const imageBuffer = await readFile(INPUT_IMAGE);
  const imageFile = new File([new Uint8Array(imageBuffer)], "generated-cat.png", {
    type: "image/png",
  });
  const imageUrl = await fal.storage.upload(imageFile);
  console.log(`Uploaded: ${imageUrl}`);

  console.log("Generating video (this may take a few minutes)...");
  const { data } = await fal.subscribe(MODEL, {
    input: {
      prompt: PROMPT,
      image_url: imageUrl,
      resolution: "480p",
      duration: "4",
      aspect_ratio: "16:9",
    },
  });

  const videoUrl = data.video?.url;
  if (!videoUrl) throw new Error("No video returned from fal.ai");

  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(OUTPUT_VIDEO, buffer);

  console.log(`Saved: ${OUTPUT_VIDEO}`);
  console.log(`URL: ${videoUrl}`);
  console.log(`Seed: ${data.seed}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Generation failed:", err);
    process.exit(1);
  });

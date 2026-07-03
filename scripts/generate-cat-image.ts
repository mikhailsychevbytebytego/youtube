import { fal } from "@fal-ai/client";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const MODEL = "fal-ai/bytedance/seedream/v5/lite/text-to-image";
const PROMPT =
  "A cute fluffy cat sitting on a windowsill, soft natural lighting, photorealistic, high detail";
const OUTPUT = path.join(process.cwd(), "public/meowtube/generated-cat.png");

async function main() {
  if (!process.env.FAL_KEY || process.env.FAL_KEY === "your_fal_api_key_here") {
    throw new Error(
      "FAL_KEY is missing. Add your fal.ai API key to .env (https://fal.ai/dashboard/keys).",
    );
  }

  const { data } = await fal.subscribe(MODEL, {
    input: { prompt: PROMPT, image_size: "landscape_16_9", num_images: 1 },
  });

  const imageUrl = data.images[0]?.url;
  if (!imageUrl) throw new Error("No image returned from fal.ai");

  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(OUTPUT, buffer);

  console.log(`Saved: ${OUTPUT}`);
  console.log(`URL: ${imageUrl}`);
  console.log(`Seed: ${data.seed}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Generation failed:", err);
    process.exit(1);
  });

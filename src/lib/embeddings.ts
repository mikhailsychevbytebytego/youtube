import {
  AutoProcessor,
  AutoTokenizer,
  CLIPTextModelWithProjection,
  CLIPVisionModelWithProjection,
  RawImage,
  type PreTrainedModel,
  type PreTrainedTokenizer,
  type Processor,
} from "@huggingface/transformers";

// CLIP maps text and images into the same 512-dimensional space, so a
// title embedding can be compared directly against a thumbnail embedding.
const CLIP_MODEL = "Xenova/clip-vit-base-patch32";
export const EMBEDDING_DIMENSIONS = 512;

let textPipelinePromise: Promise<{
  tokenizer: PreTrainedTokenizer;
  model: PreTrainedModel;
}> | null = null;

let visionPipelinePromise: Promise<{
  processor: Processor;
  model: PreTrainedModel;
}> | null = null;

function getTextPipeline() {
  textPipelinePromise ??= Promise.all([
    AutoTokenizer.from_pretrained(CLIP_MODEL),
    CLIPTextModelWithProjection.from_pretrained(CLIP_MODEL),
  ]).then(([tokenizer, model]) => ({ tokenizer, model }));
  return textPipelinePromise;
}

function getVisionPipeline() {
  visionPipelinePromise ??= Promise.all([
    AutoProcessor.from_pretrained(CLIP_MODEL),
    CLIPVisionModelWithProjection.from_pretrained(CLIP_MODEL),
  ]).then(([processor, model]) => ({ processor, model }));
  return visionPipelinePromise;
}

function normalize(values: Float32Array): number[] {
  let sumOfSquares = 0;
  for (const value of values) {
    sumOfSquares += value * value;
  }
  const magnitude = Math.sqrt(sumOfSquares) || 1;
  return Array.from(values, (value) => value / magnitude);
}

/** Embeds text with CLIP's text encoder; returns a unit-length 512-dim vector. */
export async function embedText(text: string): Promise<number[]> {
  const { tokenizer, model } = await getTextPipeline();
  const inputs = tokenizer([text], { padding: true, truncation: true });
  const { text_embeds } = await model(inputs);
  return normalize(text_embeds.data as Float32Array);
}

/** Embeds image bytes with CLIP's vision encoder; returns a unit-length 512-dim vector. */
export async function embedImage(image: Buffer): Promise<number[]> {
  const { processor, model } = await getVisionPipeline();
  const rawImage = await RawImage.fromBlob(
    new Blob([new Uint8Array(image)]),
  );
  const inputs = await processor(rawImage);
  const { image_embeds } = await model(inputs);
  return normalize(image_embeds.data as Float32Array);
}

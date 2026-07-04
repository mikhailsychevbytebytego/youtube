import path from "node:path";

const MODEL_ID = "Xenova/clip-vit-base-patch32";

let tokenizer: any = null;
let textModel: any = null;
let processor: any = null;
let visionModel: any = null;
let RawImageClass: any = null;

const lastLoggedProgress: Record<string, number> = {};

function progressCallback(info: any) {
  if (info.status === "progress_total") {
    const key = `total_${info.name}`;
    const last = lastLoggedProgress[key] ?? -10;
    if (info.progress - last >= 10 || info.progress === 100) {
      lastLoggedProgress[key] = info.progress;
      console.log(`[CLIP Model Load] Overall Progress: ${info.progress.toFixed(1)}%`);
    }
  } else if (info.status === "progress") {
    const key = `${info.name}_${info.file}`;
    const last = lastLoggedProgress[key] ?? -10;
    if (info.progress - last >= 10 || info.progress === 100) {
      lastLoggedProgress[key] = info.progress;
      const loadedMB = info.loaded ? (info.loaded / 1024 / 1024).toFixed(1) : "0";
      const totalMB = info.total ? (info.total / 1024 / 1024).toFixed(1) : "0";
      console.log(`[CLIP Model Load] Downloading ${info.file || "file"}: ${info.progress.toFixed(1)}% (${loadedMB}MB / ${totalMB}MB)`);
    }
  } else if (info.status === "done") {
    console.log(`[CLIP Model Load] Done downloading ${info.file}`);
  } else if (info.status === "ready") {
    console.log(`[CLIP Model Load] Model component ready: ${info.name}`);
  }
}

async function initTextPipeline() {
  if (tokenizer && textModel) return;

  console.log(`[CLIP Init] Dynamically importing @xenova/transformers for Text...`);
  const { AutoTokenizer, CLIPTextModelWithProjection, env } = await import("@xenova/transformers");
  
  const isVercel = !!process.env.VERCEL || process.env.USE_BROWSER_AI === "true";
  env.cacheDir = isVercel ? "/tmp/.cache" : path.join(process.cwd(), ".cache");

  const backends = env.backends as any;
  // Only force WASM if explicitly requested, otherwise allow Node CPU backend
  if (process.env.FORCE_WASM === "true" && backends && typeof backends.setPriority === "function") {
    console.log(`[CLIP Init] Setting @xenova/transformers backend priority to WASM for Vercel compatibility`);
    backends.setPriority(["wasm", "cpu"]);
  }

  if (!tokenizer) {
    console.log(`[CLIP Init] Initializing Tokenizer for ${MODEL_ID}...`);
    tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, { progress_callback: progressCallback });
    console.log(`[CLIP Init] Tokenizer loaded successfully.`);
  }
  if (!textModel) {
    console.log(`[CLIP Init] Initializing Text Model for ${MODEL_ID}...`);
    textModel = await CLIPTextModelWithProjection.from_pretrained(MODEL_ID, { progress_callback: progressCallback });
    console.log(`[CLIP Init] Text Model loaded successfully.`);
  }
}

async function initVisionPipeline() {
  if (processor && visionModel && RawImageClass) return;

  console.log(`[CLIP Init] Dynamically importing @xenova/transformers for Vision...`);
  const { AutoProcessor, CLIPVisionModelWithProjection, RawImage, env } = await import("@xenova/transformers");
  
  const isVercel = !!process.env.VERCEL || process.env.USE_BROWSER_AI === "true";
  env.cacheDir = isVercel ? "/tmp/.cache" : path.join(process.cwd(), ".cache");
  RawImageClass = RawImage;

  const backends = env.backends as any;
  if (process.env.FORCE_WASM === "true" && backends && typeof backends.setPriority === "function") {
    console.log(`[CLIP Init] Setting @xenova/transformers backend priority to WASM for Vercel compatibility`);
    backends.setPriority(["wasm", "cpu"]);
  }

  if (!processor) {
    console.log(`[CLIP Init] Initializing Image Processor for ${MODEL_ID}...`);
    processor = await AutoProcessor.from_pretrained(MODEL_ID, { progress_callback: progressCallback });
    console.log(`[CLIP Init] Image Processor loaded successfully.`);
  }
  if (!visionModel) {
    console.log(`[CLIP Init] Initializing Vision Model for ${MODEL_ID}...`);
    visionModel = await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, { progress_callback: progressCallback });
    console.log(`[CLIP Init] Vision Model loaded successfully.`);
  }
}

function l2Normalize(arr: number[]): number[] {
  const sumOfSquares = arr.reduce((sum, val) => sum + val * val, 0);
  const magnitude = Math.sqrt(sumOfSquares);
  if (magnitude === 0) return arr;
  return arr.map((val) => val / magnitude);
}

/**
 * Generates a 512-dimensional CLIP embedding for the given text.
 */
export async function getTextEmbedding(text: string): Promise<number[]> {
  const start = Date.now();
  if (!text || !text.trim()) {
    return new Array(512).fill(0);
  }
  const snippet = text.length > 50 ? `${text.slice(0, 50)}...` : text;
  const isWasmOnly = process.env.FORCE_WASM === "true";

  console.log(`[CLIP Embeddings] Generating text embedding (${isWasmOnly ? "WASM fallback" : "local CPU/GPU"}) for: "${snippet}"`);
  
  await initTextPipeline();
  
  const tokenStart = Date.now();
  const inputs = await tokenizer([text], { padding: true, truncation: true });
  const modelStart = Date.now();
  const { text_embeds } = await textModel(inputs);
  
  const rawEmbeds = Array.from(text_embeds.data) as number[];
  const normalized = l2Normalize(rawEmbeds);
  const end = Date.now();
  
  console.log(`[CLIP Embeddings] Completed text embedding in ${end - start}ms (tokenization: ${modelStart - tokenStart}ms, inference: ${end - modelStart}ms). Dimensions: ${normalized.length}`);
  return normalized;
}

/**
 * Generates a 512-dimensional CLIP embedding for the given image (URL or local path or Buffer).
 */
export async function getImageEmbedding(urlOrBuffer: string | Buffer): Promise<number[]> {
  const start = Date.now();
  const label = Buffer.isBuffer(urlOrBuffer)
    ? `Buffer (${(urlOrBuffer.length / 1024).toFixed(1)} KB)`
    : (typeof urlOrBuffer === "string" ? urlOrBuffer : "Unknown");
  console.log(`[CLIP Embeddings] Generating image embedding for: ${label}`);
  
  await initVisionPipeline();
  
  let image: any;
  try {
    const readStart = Date.now();
    if (Buffer.isBuffer(urlOrBuffer)) {
      image = await RawImageClass.fromBlob(new Blob([new Uint8Array(urlOrBuffer)]));
    } else if (typeof urlOrBuffer === "string" && urlOrBuffer.startsWith("data:")) {
      const base64Data = urlOrBuffer.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      image = await RawImageClass.fromBlob(new Blob([new Uint8Array(buffer)]));
    } else {
      let imageInput: string;
      if (typeof urlOrBuffer === "string") {
        if (urlOrBuffer.startsWith("http://") || urlOrBuffer.startsWith("https://")) {
          imageInput = urlOrBuffer;
        } else {
          // Resolve local relative path against public/ folder
          const cleanPath = urlOrBuffer.startsWith("/") ? urlOrBuffer.slice(1) : urlOrBuffer;
          imageInput = path.join(process.cwd(), "public", cleanPath);
        }
      } else {
        imageInput = urlOrBuffer;
      }
      image = await RawImageClass.read(imageInput);
    }
    const processStart = Date.now();
    const inputs = await processor(image);
    const modelStart = Date.now();
    const { image_embeds } = await visionModel(inputs);
    
    const rawEmbeds = Array.from(image_embeds.data) as number[];
    const normalized = l2Normalize(rawEmbeds);
    const end = Date.now();
    
    console.log(`[CLIP Embeddings] Completed image embedding in ${end - start}ms (read: ${processStart - readStart}ms, preprocess: ${modelStart - processStart}ms, inference: ${end - modelStart}ms). Dimensions: ${normalized.length}`);
    return normalized;
  } catch (error) {
    console.error(`[CLIP Embeddings] Failed to generate image embedding for: ${label}`, error);
    // Return a zero vector fallback to ensure robustness
    return new Array(512).fill(0);
  }
}

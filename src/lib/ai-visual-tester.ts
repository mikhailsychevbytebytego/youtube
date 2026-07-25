import { embedImage, embedText } from "./embeddings";
import type { Page } from "@playwright/test";

export interface VisualAssertionResult {
  prompt: string;
  similarity: number;
  threshold: number;
  passed: boolean;
  screenshotPath?: string;
  details: string;
}

/**
 * Calculates cosine similarity between two unit-normalized vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

/**
 * Clever AI Visual Tester: Uses local CLIP visual embeddings (@huggingface/transformers)
 * to evaluate Playwright screenshots against natural language prompts without external API dependencies.
 */
export class AIVisualTester {
  /**
   * Asserts that a Playwright page visually matches a natural language description.
   */
  static async assertVisualMatch(
    page: Page,
    prompt: string,
    options: {
      threshold?: number;
      elementSelector?: string;
      saveScreenshotPath?: string;
    } = {}
  ): Promise<VisualAssertionResult> {
    const threshold = options.threshold ?? 0.22; // CLIP text-image cross-modal baseline threshold
    
    // Take screenshot of whole page or specific element
    let imageBuffer: Buffer;
    if (options.elementSelector) {
      const element = page.locator(options.elementSelector).first();
      imageBuffer = await element.screenshot({ type: "png" });
    } else {
      imageBuffer = await page.screenshot({ type: "png", fullPage: true });
    }

    if (options.saveScreenshotPath) {
      const fs = await import("fs/promises");
      await fs.writeFile(options.saveScreenshotPath, imageBuffer);
    }

    // Embed screenshot and prompt via local CLIP model
    const [imageVec, textVec] = await Promise.all([
      embedImage(imageBuffer),
      embedText(prompt),
    ]);

    const similarity = cosineSimilarity(imageVec, textVec);
    const passed = similarity >= threshold;

    const details = passed
      ? `[PASS] Visual match for "${prompt}" (Score: ${(similarity * 100).toFixed(1)}%, Threshold: ${(threshold * 100).toFixed(1)}%)`
      : `[FAIL] Visual match for "${prompt}" (Score: ${(similarity * 100).toFixed(1)}%, Expected: >= ${(threshold * 100).toFixed(1)}%)`;

    return {
      prompt,
      similarity,
      threshold,
      passed,
      screenshotPath: options.saveScreenshotPath,
      details,
    };
  }

  /**
   * Compares two screenshots or page states to detect visual changes and quantify difference score using AI embeddings.
   */
  static async compareVisualStates(
    beforeImage: Buffer,
    afterImage: Buffer,
    targetChangePrompt: string
  ): Promise<{
    similarityDifference: number;
    beforeScore: number;
    afterScore: number;
    prompt: string;
  }> {
    const textVec = await embedText(targetChangePrompt);
    const [beforeVec, afterVec] = await Promise.all([
      embedImage(beforeImage),
      embedImage(afterImage),
    ]);

    const beforeScore = cosineSimilarity(beforeVec, textVec);
    const afterScore = cosineSimilarity(afterVec, textVec);
    const similarityDifference = afterScore - beforeScore;

    return {
      similarityDifference,
      beforeScore,
      afterScore,
      prompt: targetChangePrompt,
    };
  }
}

import { test as base, expect } from "@playwright/test";
import { AIVisualTester } from "../src/lib/ai-visual-tester";
import fs from "fs/promises";
import path from "path";

const screenshotDir = path.join(process.cwd(), "test-results", "screenshots");

base.describe("Clever AI Visual Testing Suite for MewTube Subscriptions & Cat Confetti", () => {
  base.beforeAll(async () => {
    await fs.mkdir(screenshotDir, { recursive: true });
  });

  base("1. AI Visual Test: Home page layout & sidebar visual analysis", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    // Local CLIP AI Visual Assertion on Home Page
    const homeResult = await AIVisualTester.assertVisualMatch(
      page,
      "a video streaming platform home page with video cards, sidebar navigation rail, and dark theme",
      {
        threshold: 0.20,
        saveScreenshotPath: path.join(screenshotDir, "01-home-page.png"),
      }
    );

    console.log(homeResult.details);
    expect(homeResult.passed).toBe(true);
  });

  base("2. AI Visual Test: Unauthenticated subscribe attempt redirects to sign-in page", async ({
    page,
  }) => {
    // Navigate home and click first video card link
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    const videoLink = page.locator("a[href^='/watch?v=']").first();
    await expect(videoLink).toBeVisible();
    await videoLink.click();

    await page.waitForSelector("button:has-text('Purrscribe')", { timeout: 10000 });

    // Click subscribe button while signed out
    await page.click("button:has-text('Purrscribe')");

    // Should redirect to /signin
    await page.waitForURL("**/signin**", { timeout: 5000 });

    // AI visual assertion on sign-in page
    const signinResult = await AIVisualTester.assertVisualMatch(
      page,
      "a user authentication sign in login form with email and password fields",
      {
        threshold: 0.20,
        saveScreenshotPath: path.join(screenshotDir, "02-signin-redirect.png"),
      }
    );

    console.log(signinResult.details);
    expect(signinResult.passed).toBe(true);
  });

  base("3. AI Visual Test: Authenticated subscription, instant button feedback, and cat confetti animation", async ({
    page,
  }) => {
    // 1. Sign in via /signin page
    await page.goto("http://localhost:3000/signin");
    await page.fill("input[type='email']", "mikhail.sychev.bytebytego@gmail.com");
    await page.fill("input[type='password']", "mew-admin");
    await page.click("button[type='submit']");

    // Wait for redirect after sign in
    await page.waitForURL((url) => !url.pathname.includes("/signin"), { timeout: 10000 });

    // 2. Navigate to first video watch page
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    const videoLink = page.locator("a[href^='/watch?v=']").first();
    await expect(videoLink).toBeVisible();
    await videoLink.click();

    // Wait for watch page button
    const subBtn = page.locator("button:has-text('Purrscribe'), button:has-text('Purrscribed')").first();
    await expect(subBtn).toBeVisible({ timeout: 10000 });

    // If currently subscribed, unsubscribe first to test clean subscribe flow
    const btnText = await subBtn.innerText();
    if (btnText.includes("Purrscribed")) {
      await subBtn.click();
      await page.waitForTimeout(500);
    }

    // Capture screenshot BEFORE subscribing
    const beforeScreenshot = await page.screenshot({ type: "png" });
    await fs.writeFile(path.join(screenshotDir, "03-before-subscribe.png"), beforeScreenshot);

    // Click 'Purrscribe'
    await page.click("button:has-text('Purrscribe')");

    // Instant check: button text changes to 'Purrscribed'
    await expect(page.locator("button:has-text('Purrscribed')").first()).toBeVisible({
      timeout: 2000,
    });

    // Capture screenshot during floating cat confetti animation
    await page.waitForTimeout(500); // confetti floating up
    const confettiScreenshot = await page.screenshot({ type: "png" });
    await fs.writeFile(path.join(screenshotDir, "04-cat-confetti.png"), confettiScreenshot);

    // AI Visual Comparison Score using local CLIP model
    const delta = await AIVisualTester.compareVisualStates(
      beforeScreenshot,
      confettiScreenshot,
      "happy cat emojis floating across the screen in celebration confetti"
    );

    console.log(
      `[AI Visual Test] Cat Confetti Visual Scores -> Before: ${(delta.beforeScore * 100).toFixed(
        1
      )}%, Confetti Active: ${(delta.afterScore * 100).toFixed(
        1
      )}% (Delta: +${(delta.similarityDifference * 100).toFixed(1)}%)`
    );

    // Confirm that the confetti state visually matches the cat emoji confetti prompt better or equal
    expect(delta.afterScore).toBeGreaterThanOrEqual(delta.beforeScore);

    // AI Visual assertion on confetti page
    const confettiMatch = await AIVisualTester.assertVisualMatch(
      page,
      "video player screen with subscribed status and floating cat emoji particles",
      {
        threshold: 0.18,
      }
    );
    console.log(confettiMatch.details);
    expect(confettiMatch.passed).toBe(true);
  });
});

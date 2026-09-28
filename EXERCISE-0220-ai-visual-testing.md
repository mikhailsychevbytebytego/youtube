# Exercise: AI-driven visual & E2E testing with npm packages

Continue from [EXERCISE-0210](EXERCISE-0210-channel-subscriptions-and-cat-confetti.md): MewTube has channel subscriptions, a cookie-backed appearance menu, and dynamic cat confetti animations. To ensure these visual UI interactions and animations remain pixel-perfect and free from regressions, implement an AI-driven visual testing suite using standard npm packages (`@playwright/test`, `@midscene/web`, and `@huggingface/transformers` local CLIP multimodal embeddings).

Ask Agent:

> Set up clever AI-driven visual and E2E testing using npm packages like Playwright and Midscene. Ensure tests run 100% locally with zero external API dependencies or FAL requests, using local CLIP visual embeddings to analyze screenshots, verify login gating redirects, measure visual delta scores for cat confetti animations, and assert page layouts via natural language.

The agent should end up doing roughly the following — verify each point when it's done:

1. **Install AI Testing NPM Packages (`package.json`):**
   - Install `@playwright/test` and `@midscene/web` as devDependencies.
   - Configure `@huggingface/transformers` for local CLIP (`clip-vit-base-patch32`) visual embedding generation.

2. **Build Local AI Visual Tester Helper (`src/lib/ai-visual-tester.ts`):**
   - Implement `AIVisualTester.assertVisualMatch()` to take Playwright screenshots and compute cosine similarity between normalized 512-dim image embeddings and natural language prompt embeddings.
   - Implement `AIVisualTester.compareVisualStates()` to quantify visual delta differences (e.g., detecting state transitions and confetti animations).

3. **Configure Playwright (`playwright.config.ts`):**
   - Configure Playwright runner for Chromium with 1280x720 viewport, local server integration (`http://localhost:3000`), and HTML report generation.

4. **Write AI-Driven E2E Test Suite (`e2e/ai-subscriptions.spec.ts`):**
   - **Test 1:** Analyze home page layout and sidebar navigation using local CLIP visual similarity assertions.
   - **Test 2:** Verify login gating by attempting to subscribe while signed out, asserting redirect to `/signin` and checking sign-in form visual match.
   - **Test 3:** Sign in, subscribe to a channel, verify instant button update to "Purrscribed", capture floating cat confetti particles, and compute visual delta score confirming animation rendering.

5. **Verify its own work:**
   - Execute `npm run test:ai` (`npx playwright test`) and verify all AI visual assertions pass with zero errors.

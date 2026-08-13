# Exercise: Implement a home page from an image mock

Take the MewTube home page from idea to working code in two steps: generate a visual mock with an AI agent, then hand that image straight to Agent and ask it to build the page.

This is the short path through the design-to-code loop — no Figma, no MCP server, no design tokens. Agent gets exactly what you get: a flat PNG. The point of the exercise is to feel where that constraint helps (nothing to set up, one prompt) and where it hurts (nothing exact to read — no spacing, no hex values, no real assets).

## Part 1: Create a home page mock

Ask an image-generating agent for the mock:

> Generate a desktop home page mock for "MeowTube", a toy YouTube reimplementation about cats. Include a header with logo and search bar, a left sidebar with navigation and subscriptions, filter chips, a grid of video cards with thumbnails and metadata, and a "Cat Shorts" section with vertical thumbnails.

Verify the result before moving on:

1. Follows familiar YouTube layout conventions (header / sidebar / content grid) so it's implementable.
2. Has consistent spacing, a coherent type scale, and realistic placeholder content (titles, channel names, view counts).
3. Every label is legible at full size. The image is the entire spec — text Agent can't read is a detail it will invent.
4. Is desktop-sized and you know the width you intended. You'll want to state it in Part 2; see the note below on why.

Save the image somewhere you can attach it to a chat.

## Part 2: Implement the design from the image

In the project from EXERCISE-0010, attach the PNG and prompt Agent with nothing more than:

> Implement this design

The agent should end up doing roughly the following — verify each point when it's done:

1. Read the relevant bundled Next.js docs under `node_modules/next/dist/docs/` (as `AGENTS.md` instructs) before writing code, instead of pattern-matching a Next.js version from training data.
2. **Ask before guessing where the imagery comes from.** The mock is full of cat photos that exist nowhere on disk. Silently hotlinking a remote placeholder service, or shipping `<img>` tags with invented paths, is the main failure mode. A deliberate answer (CSS/gradient placeholders, hand-rolled SVG, or asking you to supply files) is what you want.
3. Check icon names against the installed icon library rather than trusting memory. `lucide-react` has renamed icons across majors — `Home` is now `House`, `MoreVertical` is `EllipsisVertical`, `CheckCircle` is `CircleCheck` — so an agent working from training data writes imports that don't resolve.
4. Structure the code sensibly: components in `src/components/`, mock data and formatting helpers in `src/lib/`, rather than one giant page file. Content from the mock (titles, view counts, channel names) belongs in data, not hardcoded in JSX.
5. Keep the page a Server Component, pushing `"use client"` down to only the parts that need it (sidebar toggle, chip selection, shorts scrolling).
6. Configure Tailwind the v4 way. There is no `tailwind.config.ts` in this project, and creating one achieves nothing — v4 is CSS-first and ignores a JS config unless a stylesheet opts in via `@config`. Design tokens belong in an `@theme` block in `src/app/globals.css`. An agent that writes a config file full of colors and declares success has tested nothing.
7. Clear the two traps sitting in the scaffold's default `globals.css`: `body { font-family: Arial, Helvetica, sans-serif; }` silently overrides whatever font `layout.tsx` configures, and a `prefers-color-scheme: dark` block inverts the palette — so on a dark-mode machine the finished page won't resemble the light mock at all.
8. Flag the naming mismatch rather than deciding silently: the project is **MewTube** (`package.json`, README) but the mock's wordmark reads **MeowTube**.
9. Verify its own work: `npx tsc --noEmit` passes and `npm run build` succeeds, with lint clean for `src/`. If leftover build output or reports from earlier work are sitting in the working tree, ESLint will lint those too — an agent that reports "lint fails" without saying *whose* code failed is not done.

**Check yourself:** open [http://localhost:3000](http://localhost:3000) side by side with the PNG and compare the header, active sidebar item, selected chip, grid column count, and shorts aspect ratio. Then confirm the mock's content lives in `src/lib/`, no invented image URLs remain in `src/`, and nothing you can't rebuild got staged in git.

## What the image-only route costs you

Worth noticing, because it's the whole lesson of running this variant next to the Figma one:

- **No exact values.** Figma hands over `#0f0f0f`, `16px`, `240px`. An image forces the agent to eyeball or fall back on convention, so expect a follow-up pass on spacing, radii, and color.
- **No viewport.** A screenshot has no CSS pixel width, so responsive breakpoints are guesswork. If the mock shows six columns, the agent can't tell whether that's six columns at 1024px or at 1440px — and it'll pick one. Saying "this was designed at 1440px wide" in your prompt removes an entire round of correction.
- **No assets.** Figma exports the real thumbnails. An image mock has pictures baked into pixels that can't be extracted as files, which is why point 2 above is the decision that shapes the whole implementation.
- **Faster to start, slower to finish.** You skip all the Figma setup, and you pay it back in refinement rounds. For a rough internal page that trade is usually worth it; for a design that has to ship pixel-accurate, it usually isn't.

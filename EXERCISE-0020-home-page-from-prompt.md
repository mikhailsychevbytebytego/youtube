# Exercise: Implement a home page from a text prompt

Take the MewTube home page from a written description straight to working code. No mock image, no Figma, no pen.dev, no MCP design server.

This is the shortest path through the design-to-code loop — Agent gets only words. The point of the exercise is to feel where that constraint helps (nothing to set up, one prompt) and where it hurts (nothing to measure against — no spacing, no hex values, no assets, no labels to copy).

## Implement the home page

In the project from EXERCISE-0010, prompt Agent with nothing more than:

> Implement the home page of a toy YouTube called MewTube, containing videos of cats. Include a header with logo and search bar, a left sidebar with navigation and subscriptions, filter chips, a grid of video cards with thumbnails and metadata, and a "Cat Shorts" section with vertical thumbnails.

Do not attach a screenshot, a Figma link, or a `.pen` file. Do not ask Agent to generate a mock first. The prompt is the entire spec.

The agent should end up doing roughly the following — verify each point when it's done:

1. Read the relevant bundled Next.js docs under `node_modules/next/dist/docs/` (as `AGENTS.md` instructs) before writing code, instead of pattern-matching a Next.js version from training data.
2. Stay on the text → code path. Opening Figma/Pencil or generating a mockup image is missing the exercise — there is no design file. The prompt is the spec.
3. **Ask before guessing where the imagery comes from.** The prompt asks for cat videos; there are no thumbnails on disk. Silently hotlinking a remote placeholder service, or shipping `<img>` tags with invented paths, is the main failure mode. A deliberate answer (CSS/gradient placeholders, hand-rolled SVG, or asking you to supply files) is what you want.
4. Check icon names against the installed icon library rather than trusting memory. `lucide-react` has renamed icons across majors — `Home` is now `House`, `MoreVertical` is `EllipsisVertical`, `CheckCircle` is `CircleCheck` — so an agent working from training data writes imports that don't resolve.
5. Structure the code sensibly: components in `src/components/`, mock data and formatting helpers in `src/lib/`, rather than one giant page file. Invented content (titles, view counts, channel names) belongs in data, not hardcoded in JSX. Inventing plausible cat videos is expected — there is nothing to transcribe.
6. Keep the page a Server Component, pushing `"use client"` down to only the parts that need it (sidebar toggle, chip selection, shorts scrolling).
7. Configure Tailwind the v4 way. There is no `tailwind.config.ts` in this project, and creating one achieves nothing — v4 is CSS-first and ignores a JS config unless a stylesheet opts in via `@config`. Design tokens belong in an `@theme` block in `src/app/globals.css`. An agent that writes a config file full of colors and declares success has tested nothing.
8. Clear the two traps sitting in the scaffold's default `globals.css`: `body { font-family: Arial, Helvetica, sans-serif; }` silently overrides whatever font `layout.tsx` configures, and a `prefers-color-scheme: dark` block inverts the palette — so on a dark-mode machine the finished page won't resemble the light YouTube-like UI the prompt implies.
9. Keep the product name **MewTube** (`package.json`, README, the prompt). Silently rebranding to "MeowTube" or "YouTube" is a miss; if the agent wants a punnier wordmark, it should ask.
10. Verify its own work: `npx tsc --noEmit` passes and `npm run build` succeeds, with lint clean for `src/`. If leftover build output or reports from earlier work are sitting in the working tree, ESLint will lint those too — an agent that reports "lint fails" without saying *whose* code failed is not done.

**Check yourself:** open [http://localhost:3000](http://localhost:3000) and confirm it is recognizably a YouTube home page (header, sidebar, chips, video grid, shorts) filled with cat content. Then confirm the invented titles live in `src/lib/`, no invented image URLs remain in `src/`, and nothing you can't rebuild got staged in git. There is no mock to pixel-match — "looks like YouTube, about cats" is the bar.

## What the text-only route costs you

Worth noticing, because it's the whole lesson of running this variant next to the Figma and image ones:

- **No visual source of truth.** Figma hands over `#0f0f0f`, `16px`, `240px`. An image at least gives something to eyeball. A prompt leaves layout, type scale, color, and density entirely to the model's idea of "YouTube," so two runs of the same prompt will not look the same.
- **No content to transcribe.** The image and Figma routes have titles, channel names, and view counts baked in. Here the agent has to invent them. That is fine — put them in `src/lib/` — but you will not get the same catalog twice, and a sparse prompt will not mention how many videos or which filters to show.
- **No viewport.** "A grid of video cards" does not say whether that is two columns or six, or at which width. The agent will pick one. Adding "desktop, about 1440px, four columns" to the prompt removes an entire round of correction; leaving it out is a valid experiment in how much convention fills the gap.
- **No assets.** Same hole as the image route, with a worse temptation: there is not even a picture to "copy," so hotlinking `picsum` / `placekitten` / a hallucinated `/images/cat-1.jpg` is the default failure. The right move is still to stop and ask.
- **Fastest to start, least bounded.** You skip mock generation, Figma, and every MCP. You also skip any shared picture of done. This is the right tool for a throwaway internal page and the wrong tool when several people need to agree the UI is finished.

A useful follow-up, once the first page is up: run the same prompt again in a fresh checkout, or tighten it ("four columns at 1440px, light theme, MewTube not MeowTube, CSS placeholders for thumbnails") and compare what changed. The delta is the spec you never wrote.

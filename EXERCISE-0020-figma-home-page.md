# Exercise: Design and implement a home page with AI agents

Take the MewTube home page from idea to working code in three steps: generate a visual mock with an AI agent, recreate it as a real design in Figma, then have Agent implement it pixel-for-pixel.

## Part 1: Create a home page mock using Codex

Ask Codex to generate a home page mockup image:

> Generate a desktop home page mock for "MeowTube", a toy YouTube reimplementation about cats. Include a header with logo and search bar, a left sidebar with navigation and subscriptions, filter chips, a grid of video cards with thumbnails and metadata, and a "Cat Shorts" section with vertical thumbnails.

The result should be a single image mock — verify it:

1. Follows familiar YouTube layout conventions (header / sidebar / content grid) so it's implementable.
2. Has consistent spacing, a coherent type scale, and realistic placeholder content (titles, channel names, view counts).
3. Is desktop-sized (roughly 1440px wide) so it can be recreated 1:1 in Figma.

## Part 2: Convert the image mock to a real mock in Figma

Use the Figma agent to convert the image into an actual Figma design, then have it fix any obvious issues (misaligned frames, missing auto-layout, garbled text, off colors). Verify:

1. The design is built from real Figma layers — auto-layout frames, text nodes, and image fills — not just the pasted screenshot.
2. Layers have meaningful names (e.g. `Header`, `Sidebar`, `video-card`, `nav-item-Home`) so generated code context is readable.
3. Icons are proper vector nodes (ideally named after a real icon set like lucide, e.g. `house`, `compass`, `bell-dot`) so they map 1:1 to an icon library in code.
4. Colors and fonts are consistent (e.g. `#0f0f0f` text, `#f2f2f2` surfaces, Geist) rather than dozens of near-duplicate values.

## Part 3: Implement the design with Agent

Ask Agent (in the project from EXERCISE-0010) to:

> Implement this design from Figma.
> [link to your Figma frame with node-id]

The agent should end up doing roughly the following — verify each point when it's done:

1. Fetch the design through the Figma MCP server (`get_design_context`) rather than eyeballing a screenshot.
2. Download the raster assets (thumbnails, avatars) into `public/images/` with descriptive names — the Figma-hosted asset URLs expire, so none may remain in the code.
3. Use a real icon library (e.g. `lucide-react`) for icons instead of exported SVG images, and plain CSS borders for divider lines.
4. Structure the code sensibly: extract components (header, sidebar, video card, shorts card) into `src/components/` and mock data into `src/lib/`, instead of one giant page file.
5. Adapt the generated reference code to the project's conventions (Tailwind, `next/image`, App Router server components) rather than pasting Figma's absolute-positioned output.
6. Verify its own work: `npm run lint` and `npx tsc --noEmit` pass, and the rendered page visually matches the Figma frame.

**Check yourself:** open [http://localhost:3000](http://localhost:3000) side by side with the Figma frame and compare the header, sidebar states, chip states, grid spacing, and shorts aspect ratio. Then confirm no `figma.com` URLs remain in `src/` and no large asset caches ended up staged in git.

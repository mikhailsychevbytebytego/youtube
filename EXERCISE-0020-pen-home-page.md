# Exercise: Design and implement a home page with AI agents

Take the MewTube home page from idea to working code in three steps: generate a visual mock with an AI agent, recreate it as a real design in pen.dev, then have Agent implement it pixel-for-pixel.

## Part 1: Create a home page mock using Codex

Ask Codex to generate a home page mockup image:

> Generate a desktop home page mock for "MeowTube", a toy YouTube reimplementation about cats. Include a header with logo and search bar, a left sidebar with navigation and subscriptions, filter chips, a grid of video cards with thumbnails and metadata, and a "Cat Shorts" section with vertical thumbnails.

The result should be a single image mock — verify it:

1. Follows familiar YouTube layout conventions (header / sidebar / content grid) so it's implementable.
2. Has consistent spacing, a coherent type scale, and realistic placeholder content (titles, channel names, view counts).
3. Is desktop-sized (roughly 1440px wide) so it can be recreated 1:1 in pen.dev.

## Part 2: Convert the image mock to a real mock in pen.dev

Before using an agent against the canvas, install the [pen.dev](https://pen.dev) Cursor extension, complete activation, and confirm the `pencil` MCP server is connected (Settings → Tools & MCP). The MCP server starts locally when Pencil is open; Agent cannot read a `.pen` file without it.

Use an agent connected to pen.dev to convert the image into an actual `.pen` design, then have it fix any obvious issues (collapsed layout, clipped text, off colors, unnamed layers). Verify:

1. The design is built from real Pencil layers — layout frames, text nodes, and image fills — not just the pasted screenshot sitting on the canvas.
2. Layers have meaningful names (e.g. `Header`, `Sidebar`, `Video Card`, `Home Label`) so generated code context is readable.
3. Icons are proper icon nodes from a real set (ideally lucide, e.g. `house`, `bell`, `paw-print`) so they map 1:1 to an icon library in code.
4. Colors and fonts are document variables (e.g. `$red`, `$ink`, `$font`) rather than dozens of near-duplicate hardcoded values.

Save the `.pen` file somewhere Agent can `@`-mention it (the project, Downloads, or a sibling folder). Raster fills live next to the file in an `images/` directory — keep that folder with the `.pen`.

## Part 3: Implement the design with Agent

Connect your LLM to pen.dev (Pencil open, `pencil` MCP showing as connected), then in the project from EXERCISE-0010 ask Agent to:

> Implement this mock
> [@path/to/your-file.pen]

The agent should end up doing roughly the following — verify each point when it's done:

1. Fetch the design through the Pencil MCP server (`get_app_state`, `get_screenshot`, `execute`) rather than reading the `.pen` as a text file — `.pen` files are encrypted, so `Read` / `Grep` will not work.
2. Copy the raster assets (thumbnails, avatars, shorts covers) from the `.pen` file's sibling `images/` folder into `public/images/` with descriptive names — none of the original `generated-*.png` paths may remain in the code.
3. Use a real icon library (e.g. `lucide-react`) for icons instead of exported SVG images, and plain CSS borders for divider lines.
4. Structure the code sensibly: extract components (header, sidebar, video card, shorts card) into `src/components/` and mock data into `src/lib/`, instead of one giant page file.
5. Adapt any exported HTML/Tailwind reference to the project's conventions (Tailwind v4 `@theme`, `next/image`, App Router server components) rather than pasting Pencil's absolute-positioned output.
6. Verify its own work: `npm run lint` and `npx tsc --noEmit` pass, and the rendered page visually matches the Pencil frame.

**Check yourself:** open [http://localhost:3000](http://localhost:3000) side by side with the Pencil canvas and compare the header, sidebar states, chip states, grid spacing, and shorts aspect ratio. Then confirm no `generated-*.png` paths remain in `src/` and no large asset caches ended up staged in git.

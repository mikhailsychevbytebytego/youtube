# MewTube — an AI-assisted build-along course

MewTube is a toy YouTube reimplementation (Next.js App Router, TypeScript, Tailwind,
Supabase/Postgres, Cloudflare media, fal.ai generation, local CLIP embeddings).

You build it one exercise at a time, and you build it **by directing an AI coding agent**
rather than by typing the code yourself.

**This branch (`main`) is a signpost only — it contains no code.** The course lives on the
`NNNN-*` branches described below.

---

## 1. Start here

```bash
git clone https://github.com/mikhailsychevbytebytego/youtube.git
cd youtube
git fetch --all
git checkout 0010-nextjs-setup
npm install
```

Then read `EXERCISE-0010-nextjs-setup.md` on that branch.

The finished application is on **`0200-ai-visual-testing`**.

---

## 2. Prerequisites

| Requirement | Version / notes |
| --- | --- |
| Node.js | **22 LTS recommended.** 20.9 is the hard floor — Next.js 16 refuses to run below it, and several dependencies (`undici`, `kysely`, `nanostores`, `playwright`) want 22. |
| npm | Ships with Node. |
| Git | Any recent version. |
| Editor | VS Code, or anything that hosts a coding agent. |
| Coding agent | Claude Code, Cursor, or similar. The exercises are written as prompts for one. |

### Installing Node 22

Do **not** use `apt install nodejs` on Ubuntu — it installs Node 18, which is too old, and
you will hit a hard refusal from Next.js on the very first exercise. Use a version manager:

```bash
# macOS / Linux / WSL
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
exec $SHELL
nvm install 22
nvm use 22
node -v   # expect v22.x
```

On Windows, use [nvm-windows](https://github.com/coreybutler/nvm-windows) or run the whole
course inside WSL.

### Setting up the agent in VS Code

1. Open the Extensions panel and install your agent's extension (e.g. *Claude Code for VS Code*).
2. Open a terminal (**Terminal → New Terminal**), `cd` into the cloned repo, and launch the
   agent (e.g. `claude`). Follow its prompts to authenticate.
3. `cd` into the repo and run `code .` to open the project.

---

## 3. How the course works

**The `EXERCISE-*.md` files are prompts, not manual instructions.** Each one contains a
block-quoted request meant to be pasted into your coding agent, followed by a checklist of
what the agent should have produced so you can verify its work. You are not expected to
hand-write the implementation.

For example, `EXERCISE-0010` asks you to give the agent this:

> Set up a new Next.js project for "MewTube", a toy YouTube reimplementation. Only the
> basic project setup according to modern Next.js best practices, nothing more yet.

**One branch per exercise.** Branch `NNNN-*` holds the *finished* state of exercise `NNNN`,
together with that exercise's prompt file and every prior exercise's file. Checking out a
branch therefore shows you both the assignment and the result it should produce, so you can
read the prompt and study what the agent built from it. Diffing two adjacent branches shows
exactly what one exercise adds.

### Branch map

| Branch | Exercise |
| --- | --- |
| `0010-nextjs-setup` | Scaffold a project with an AI agent |
| `0020-static-home` | Design and implement a home page with AI agents *(mainline)* |
| `0030-watch-page` | Design and implement a watch page |
| `0040-channel-page` | Design and implement a channel page |
| `0050-supabase-drizzle` | Move static page data into Supabase with Drizzle |
| `0060-admin-crud` | Build an admin CRUD interface with an AI agent |
| `0070-mock-data-generator` | Generate mock data with an LLM via fal.ai |
| `0080-avatar-generation` | Generate avatars with a text-to-image model |
| `0090-video-generation` | Generate fake videos with scripts and thumbnails |
| `0100-actual-video-creation` | Create real videos with an image-to-video model |
| `0110-better-auth` | Add Better Auth on the users table and guard `/admin` |
| `0120-cloudflare-media` | Serve mock media from Cloudflare Images and Stream |
| `0130-clip-embeddings` | Store CLIP embeddings for videos with pgvector |
| `0140-semantic-search` | Semantic search over CLIP embeddings |
| `0150-related-videos` | Build the Up Next rail from CLIP similarity |
| `0160-dark-mode` | Dark mode support and appearance menu |
| `0170-video-autoplay-and-watch-time` | Autoplay, watch time tracking, admin analytics |
| `0180-video-generation-caching-and-cleanup` | Video generation caching and mock data cleanup |
| `0190-channel-subscriptions-and-cat-confetti` | Subscriptions, subscription feed, cat confetti |
| `0200-ai-visual-testing` | AI-driven visual & E2E testing — **the complete project** |

### The four home-page variants at step 0020

Exercise 0020 has four parallel branches, all forking from `0010-nextjs-setup`. They reach
the same home page by different routes, so you can compare how the starting artifact changes
what the agent produces:

| Branch | Approach |
| --- | --- |
| `0020-static-home` | From a Figma design — **this is the mainline; `0030` continues from it** |
| `0020-alt-static-home` | From an image mock |
| `0020-pen-home` | From a Pencil / pen.dev design |
| `0020-prompt-home` | From a text prompt only |

Pick whichever you like, but continue the course from `0030-watch-page`.

### Branches that are not part of the course

- `main` — this signpost. No code.
- `archive/pre-course-demo` — an early standalone prototype with completely unrelated git
  history, built before most of the course existed. It is **not** the finished project and
  is kept only for reference. The finished project is `0200-ai-visual-testing`.

---

## 4. Accounts you will need

Free tiers are sufficient throughout, with one exception noted below.

| Service | First needed at | Used for |
| --- | --- | --- |
| [Figma](https://figma.com) | `0020` | Design source for the page-building exercises. Requires a registered account **and an activated subscription plan** for agent operations — see exercise 0020. The `0020-alt-static-home`, `0020-pen-home`, and `0020-prompt-home` variants avoid Figma entirely. |
| [Supabase](https://supabase.com) | `0050` | Hosted Postgres (plus `pgvector` from `0130`). |
| [fal.ai](https://fal.ai) | `0070` | LLM text, image, and video generation. Pay-as-you-go credits. |
| [Cloudflare](https://cloudflare.com) | `0120` | Images and Stream for media hosting. |

No account is needed for the testing exercise (`0200`) — it runs a CLIP model locally.

---

## 5. Environment variables

The app reads configuration from a `.env` file at the repo root, which you create yourself.
Variables unlock as you progress — nothing before exercise `0050` needs any of them, so you
do not need all of this on day one.

| Variable | From exercise | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `0050` | Supabase Postgres connection string. |
| `FAL_KEY` | `0070` | fal.ai API key. |
| `BETTER_AUTH_SECRET` | `0110` | Any long random string. |
| `BETTER_AUTH_URL` | `0110` | `http://localhost:3000` in development. |
| `CLOUDFLARE_ACCOUNT_ID` | `0120` | Cloudflare account identifier. |
| `CLOUDFLARE_STREAM_API_TOKEN` | `0120` | Token with Stream and Images permissions. |
| `ADMIN_EMAIL` | `0170` | Seed admin user for `npm run db:admin`. |
| `ADMIN_NAME` | `0170` | Seed admin user. |
| `ADMIN_PASSWORD` | `0170` | Seed admin user. |

`.env` is gitignored — never commit real keys.

---

## 6. Running the finished project

```bash
git checkout 0200-ai-visual-testing
npm install
# create .env at the repo root with the variables from section 5
npm run db:push          # create the schema
npm run db:seed          # seed baseline data
npm run db:admin         # create the admin user from ADMIN_* vars
npm run dev
```

Open <http://localhost:3000>.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack). |
| `npm run build` / `npm run start` | Production build and serve. |
| `npm run lint` | ESLint. |
| `npm run db:generate` | Generate Drizzle migrations. |
| `npm run db:push` | Push schema to the database. |
| `npm run db:studio` | Drizzle Studio. |
| `npm run db:seed` | Seed baseline data. |
| `npm run db:mock` | Generate mock data (needs `FAL_KEY`). |
| `npm run db:admin` | Create the admin user from `ADMIN_*`. |
| `npm run test:ai` | AI visual + E2E suite (Playwright + Midscene + local CLIP). |
| `npm run test:ai:headed` / `npm run test:ai:ui` | Same suite, headed or in the Playwright UI. |

The AI test suite runs entirely on your machine — local CLIP embeddings, no external API
calls or credits consumed. The first run downloads the model, so expect it to be slow.

---

## 7. Known gotchas

- **`npm install` reports security advisories.** Most come from development-only tooling
  (`@midscene/web` → Puppeteer, `@huggingface/transformers` → onnxruntime). They do not
  affect the course and `npm audit fix` is not required. Do not let the red text alarm you.
- **`AGENTS.md` points the agent at `node_modules/next/dist/docs/`.** That directory only
  exists after `npm install`, so always install before starting an agent session. This
  matters: the Next.js version used here has breaking changes relative to what most models
  were trained on, and the agent needs those docs to write correct code.
- **Node 18 will fail immediately** with `You are using Node.js 18.19.1. For Next.js,
  Node.js version ">=20.9.0" is required.` See section 2.

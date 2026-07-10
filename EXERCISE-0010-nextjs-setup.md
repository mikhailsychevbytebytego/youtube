# Exercise: Scaffold a project with an AI agent

Create a new Next.js project by asking Agent to:

> Set up a new Next.js project for "MewTube", a toy YouTube reimplementation. Only the basic project setup according to modern Next.js best practices, nothing more yet.

The agent should end up doing roughly the following — verify each point when it's done:

1. Scaffold with `create-next-app@latest` using modern defaults: TypeScript, App Router, `src/` directory, Tailwind CSS, ESLint, and the `@/*` import alias.
2. Handle a non-empty target directory gracefully (e.g. scaffold into a temp folder and move files in) without clobbering existing files like `.env` or the git repo.
3. Rebrand the boilerplate: app name in `package.json`, page title/description in `layout.tsx`, a minimal placeholder home page, and a short README.
4. Verify its own work: `npm run lint` and `npx tsc --noEmit` pass, and `npm run dev` serves the page on localhost.

**Check yourself:** open [http://localhost:3000](http://localhost:3000) and confirm the page says "MewTube", then confirm no secrets (`.env`) or caches ended up staged in git.

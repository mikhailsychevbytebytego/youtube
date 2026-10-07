# Exercise: Appearance menu in the avatar dropdown

Continue from [EXERCISE-0180](EXERCISE-0180-related-videos.md): MewTube already has a cookie-backed light/dark theme from the week-1 assignment, but the only control is a header toggle. Have Agent replace that toggle with an avatar dropdown that includes an Appearance submenu.

Prerequisite:

- **File a Linear issue (outside of Cursor):** create a ticket in your Linear workspace describing that MewTube needs an appearance menu in the avatar dropdown.
- **Enable Linear MCP in Cursor:** make sure the Linear MCP server is configured so the agent can read the issue.

Ask Agent:

> Let's implement the Linear issue about MewTube's missing appearance menu. Dark mode already exists via a cookie and CSS variables — do not add a theme library. Build an avatar dropdown with an Appearance submenu that writes the same cookie.

The agent should end up doing roughly the following — verify each point when it's done:

1. Build `src/components/user-menu.tsx`: profile header (avatar, name, email) and an **Appearance** submenu with Light and Dark. Close on outside click and Escape.
2. Wire it into `src/components/header.tsx` and `src/components/watch/watch-header.tsx`, replacing the standalone theme toggle and the static avatar.
3. Keep using the existing cookie + `class="dark"` on `<html>`. Do not install `next-themes` or add a `ThemeProvider`.
4. Verify: `npx tsc --noEmit` is clean, and choosing Dark/Light in the menu updates the page immediately and survives a refresh.

**Check yourself:** click the profile avatar. Confirm the dropdown shows profile details and that **Appearance** opens a submenu. Pick Dark, then Light, then refresh — the choice should persist from the cookie.

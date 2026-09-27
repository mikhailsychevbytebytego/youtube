# Assignment 1: Add dark mode

> **These are assignments, not walkthroughs.** The exercises so far told you roughly what
> the agent should produce. These two don't. You get the goal and the constraints; the
> planning is yours. Build them the way you practiced in the session: plan the task, let
> the agent implement it, review the diff, verify in the browser, then commit.

Continue from [EXERCISE-0040](EXERCISE-0040-figma-channel-page.md): MewTube has a home page,
a watch page, and a channel page, all locked to a light theme with colors hardcoded into
every component.

## The goal

Give MewTube a dark theme with a toggle, and save the choice in a cookie so a returning
visitor sees the theme they picked.

## Constraints

- **Use a cookie, not `localStorage`.** This is the interesting part. A cookie is sent with
  the request, so the server already knows the theme when it renders the page. `localStorage`
  is only readable after JavaScript runs, which means a returning visitor gets a flash of the
  wrong theme before it corrects itself.
- **No theme libraries.** CSS custom properties and Tailwind are enough.
- **The media stays dark.** A video player is dark in both themes, and so are the duration
  badges sitting on top of thumbnails. So is the brand red. Not every color is a theme color,
  and deciding which is which is part of the work.

## What you'll practice

- Running a small feature through the full planning and review loop
- Handling state that has to survive a page reload
- Verifying visual changes before committing them

## Check yourself

Toggle the theme and confirm the page changes immediately, without a reload. Then reload:
the theme should stay, and it should be correct in the very first frame the browser paints.
If you see a flash of light theme before it goes dark, the theme is being applied on the
client and the cookie is not doing its job.

Check all three pages, not just the one you were working on. Then view the page source
(not the inspector, the actual HTML the server sent) and confirm the theme is already in
there.

A good final check: search the codebase for hardcoded colors like `text-[#0f0f0f]` and
`bg-white`. The ones that remain should be ones you can justify.

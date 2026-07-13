# Exercise: Design and implement a watch page

Repeat the workflow from [EXERCISE-0020](EXERCISE-0020-figma-home-page.md), this time for the video watch page:

1. Generate a watch page mock with Codex — video player with controls, title, channel row with subscribe button, like/share actions, description, comments, and an "Up next" sidebar with related videos and shorts.
2. Convert it to a real Figma design with the Figma agent and fix any obvious issues.
3. Ask Agent to implement the design from Figma, on a route like `/watch`.

Verify the same points as in EXERCISE-0020: assets downloaded locally, icons from an icon library, sensible component structure, lint/type checks pass.

**Check yourself:** open [http://localhost:3000/watch](http://localhost:3000/watch) next to the Figma frame and compare. Bonus: link the two pages together — clicking a video card on the home page should navigate to the watch page.

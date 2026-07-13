# Exercise: Design and implement a channel page

Repeat the workflow from [EXERCISE-0020](EXERCISE-0020-figma-home-page.md), this time for a channel page:

1. Generate a channel page mock with Codex — banner, channel avatar with name/handle/subscriber count, subscribe button, tab bar (Home, Videos, Shorts, ...), a featured video, an "Uploads" row, and a shorts shelf.
2. Convert it to a real Figma design with the Figma agent and fix any obvious issues.
3. Ask Agent to implement the design from Figma, on a route like `/channel`.

Verify the same points as in EXERCISE-0020: assets downloaded locally, icons from an icon library, sensible component structure (reuse shared pieces like the header where the design allows), lint/type checks pass.

**Check yourself:** open [http://localhost:3000/channel](http://localhost:3000/channel) next to the Figma frame and compare. Bonus: clicking the channel name on the watch page should navigate to the channel page.

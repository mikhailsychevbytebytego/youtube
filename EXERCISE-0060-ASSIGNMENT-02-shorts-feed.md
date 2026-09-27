# Assignment 2: Build a scrollable Shorts feed

Continue from [EXERCISE-0050](EXERCISE-0050-ASSIGNMENT-01-dark-mode.md): MewTube shows Cat
Shorts as a row of small thumbnails on the home page and the channel page. There is nowhere
to actually browse them.

## The goal

Add a vertical Shorts feed at `/shorts` that shows one short per screen and snaps to the
next one as you scroll.

## Constraints

- **Snapping is CSS, not JavaScript.** CSS scroll snap does this natively. If your agent
  reaches for a scroll listener and `scrollTo`, push back and ask for the CSS approach.
- **One per screen means exactly one.** The item height has to match the scroll container's
  height, which means the container needs a real height to measure against. A page that grows
  with its content has nothing to snap to. This is the part that usually takes two attempts.
- **These are images, not video.** MewTube has no video files until much later in the course,
  so each short is a still image in a 9:16 frame. Build the feed as though it were video, so
  it is ready when real video arrives.
- **It has to work in both themes**, which you just built.

## What you'll practice

- Breaking an interactive feature into agent-sized tasks
- Making scroll and snap behavior feel natural
- Reusing the page patterns from the session

## Check yourself

Scroll the feed. A small nudge should fall back to the short you started on; a larger one
should advance exactly one short and stop cleanly. You should never come to rest halfway
between two.

Resize the window and scroll again. If "one per screen" was hardcoded to a pixel height
rather than measured from the container, this is where it breaks.

Confirm the feed is reachable from the sidebar, that the Shorts entry is highlighted while
you are on it, and that the whole thing still looks right in both light and dark mode.

Reusable data beats duplicated data: the shorts you render here should come from the same
place the home page gets its Cat Shorts row.

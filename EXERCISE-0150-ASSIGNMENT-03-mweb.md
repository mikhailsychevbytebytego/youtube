# Assignment 3: Add a mobile web (mweb) mode

Continue from [EXERCISE-0140](EXERCISE-0140-cloudflare-media.md): MewTube looks like YouTube
on a desktop browser. Open it on a phone and the layout falls apart — a four-column grid,
a 720px search bar, a 402px right rail sitting off to the side, and controls that are too
small to tap.

## The goal

Make MewTube work well on a phone. The layout should read in a single column, controls
should be easy to tap, and the watch page should behave properly on a small screen.

## Constraints

- **Presentation only.** The data and the database stay the same. Do not change queries,
  schemas, seed data, or API routes to make the layout work. If a page looks wrong on a
  phone, the CSS and the component tree are what you fix.
- **Desktop still has to look like desktop.** A visitor with a wide window should still
  see the sidebar, the multi-column grid, and the watch-page right rail. Responsive
  breakpoints are enough; you do not need a separate mobile app or a separate set of
  pages.
- **Admin can stay desktop.** The public watch experience is the assignment. The `/admin`
  tools are used at a desk.

## What you'll practice

- Taking a layout that was designed at one width and making it honest at another
- Choosing what to hide, stack, or overlay instead of shrinking everything
- Verifying a visual change at more than one viewport before calling it done

## Check yourself

Resize the browser to a phone width (around 390px) and walk the public pages: home,
watch, channel, and Shorts. You should not have to scroll sideways to read the page.
Tappable controls should be large enough to hit with a thumb.

On the watch page the player should use the full width, and related videos should sit
underneath it rather than hanging off the right edge. Open the same page on a wide
window and confirm the desktop layout is still there.

A good final check: rotate or resize through the breakpoint a few times. If something
only looks right at exactly 390px, the layout is still hardcoded.

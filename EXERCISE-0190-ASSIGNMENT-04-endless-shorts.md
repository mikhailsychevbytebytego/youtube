# Assignment 4: Build an endless Shorts feed

> **These are assignments, not walkthroughs.** The exercises so far told you roughly what
> the agent should produce. These two don't. You get the goal and the constraints; the
> planning is yours. Build them the way you practiced in the session: plan the task, let
> the agent implement it, review the diff, verify in the browser, then commit.

Continue from [EXERCISE-0180](EXERCISE-0180-related-videos.md): the watch page's Up Next
rail ranks regular videos by CLIP similarity, but `/shorts` is still a fixed list of
twelve stills ordered by view count. Most of those shorts were seeded without embeddings
at all.

## The goal

Create embeddings for your catalog and use them to power an endless Shorts feed. For each
next video, pick at random from the N best recommendations. The randomness keeps the feed
fresh while the recommendations keep it relevant.

## Constraints

- **Reuse the CLIP vectors you already store.** Title, description, and thumbnail
  embeddings are on the `videos` row. Do not add a second model. Seed shorts (and any
  other row still missing vectors) need to be embedded before the feed can recommend
  anything.
- **Next is not rank 1, and it is not the whole catalog.** Rank similar shorts the way
  related videos already ranks neighbors, then pick uniformly at random from the top N.
  Always-greedy feels repetitive; uniform-from-everything ignores the embeddings.
- **Keep the snap feed.** One short per screen, CSS scroll snap, still images in a 9:16
  frame. The assignment is the *next* short, not a new player.
- **Endless on a small catalog.** Once the session has seen every short, it is fine to
  repeat earlier ones so scrolling never hits a wall.

## What you'll practice

- Generating and storing embeddings across your whole catalog
- Turning nearest-neighbor results into a product feature
- Balancing relevance and variety in a feed

## Check yourself

Run whatever backfill you added so every short has a title embedding, then open `/shorts`.
The first screen can still be a server-rendered starter. Scroll: a new short should appear,
and it should be related to the one you just left — not a random jump across the whole
catalog, and not the same neighbor every time.

Scroll the same starting short a few times (reload between tries). If the second item is
always identical, you are picking rank 1. If it is uncorrelated with the starter, you are
not using the neighbors.

A good final check: after you have seen every short once, keep scrolling. The feed should
not stop.

# Assignment 5: Use likes as a recommendation signal

> **These are assignments, not walkthroughs.** The exercises so far told you roughly what
> the agent should produce. These two don't. You get the goal and the constraints; the
> planning is yours. Build them the way you practiced in the session: plan the task, let
> the agent implement it, review the diff, verify in the browser, then commit.

Continue from [EXERCISE-0190](EXERCISE-0190-ASSIGNMENT-04-endless-shorts.md): the Shorts
feed already picks the next still from nearby CLIP neighbors. The thumbs-up buttons on
watch and Shorts are still decoration, and `like_count` is just a number on the video row.
Nothing about *you* shapes what comes next.

## The goal

Add the ability to like videos, then use those likes to shape what gets recommended.
Combine the embeddings of a user's liked videos, by averaging or clustering them, and
surface the videos closest to the result.

## Constraints

- **Likes belong to a user.** Persist a real row per (user, video). Bumping `like_count`
  alone is not enough — you cannot build a taste profile from a denormalized counter.
  Signed-out visitors should be sent to sign-in rather than silently failing.
- **The profile is embedding math, not a tag list.** Average (or cluster) the stored CLIP
  vectors of liked videos and retrieve nearest neighbors of that result. Do not invent a
  new model.
- **Cold start stays assignment 4.** No likes, or signed out, means the Shorts feed keeps
  recommending from the current short. Personalization starts after the first like.
- **Dislike can stay decorative.** One signal is enough.

## What you'll practice

- Capturing a user signal and storing it in your schema
- Building a simple taste profile from embedding math
- Taking a first step from similar videos toward real personalization

## Check yourself

Sign in, like a watch video and a short, reload, and confirm both likes stick and the
counts match. Open home: a recommended shelf should appear and reflect what you liked,
not just recency.

Open Shorts and scroll. The next items should drift toward the videos you liked. Sign out
(or use a user with no likes) and the feed should fall back to neighbor-of-current.

Unlike everything: the recommended shelf should disappear and Shorts should feel like
assignment 4 again.

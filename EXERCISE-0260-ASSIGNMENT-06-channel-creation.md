# Assignment 6: Add a channel creation flow

> **These are assignments, not walkthroughs.** The exercises so far told you roughly what
> the agent should produce. These two don't. You get the goal and the constraints; the
> planning is yours. Build them the way you practiced in the session: plan the task, let
> the agent implement it, review the diff, verify in the browser, then commit.

Continue from [EXERCISE-0250](EXERCISE-0250-ai-visual-testing.md): the catalog already has
a `users` table and a `channels` table, and `/channel` is a public creator page. Signing
up still only creates an account. There is no way for that account to become a creator,
and the mobile "You" tab is just a shortcut to someone else's channel.

## The goal

On YouTube, a user and a channel are two different things. Bring that distinction into
MewTube. Add a flow for creating a channel, and implement both the personal page and the
channel page.

## Constraints

- **Keep the rows separate.** An account must not silently become a channel on sign-up.
  The user row is how you sign in; the channel row is what you publish as. One signed-in
  user gets at most one channel.
- **The create flow has several steps.** Name, handle, picture/bio, then confirm. Do not
  dump every field onto a single screen.
- **Personal and public are different pages.** `/you` is the signed-in account surface
  (who you are, whether you own a channel, your uploads). `/channel` stays the public
  creator page visitors subscribe to. Do not replace one with the other.
- **Signed-out visitors sign in first.** Creating a channel or opening You should send
  them to sign-in rather than failing quietly.

## What you'll practice

- Extending your schema as the product model grows richer
- Building a flow with several steps rather than a single screen
- Keeping the user identity separate from the channel it owns

## Check yourself

Sign up a fresh user (not a seeded catalog owner). Open You from the account menu or the
phone tab: you should see the account, and you should not already have a channel.

Walk the create flow. After confirm, You shows that channel, and
`/channel?handle=@yourhandle` is the public page with that name. On your own channel the
Subscribe button should give way to owner chrome; on anyone else's it still subscribes.

Try to create a second channel as the same user — that should be refused. Seeded channels
such as Daily Purr should look as they did before.

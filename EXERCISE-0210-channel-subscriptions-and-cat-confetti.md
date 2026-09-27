# Exercise: Channel subscriptions, subscription feed, and cat confetti

Continue from [EXERCISE-0200](EXERCISE-0200-video-generation-caching-and-cleanup.md): Users on MewTube can view channels and videos, but cannot subscribe to creators, filter their home sidebar to subscribed channels, or view a dedicated feed of subscription uploads. Have Agent implement database-backed channel subscriptions with authentication gating, a custom subscription hook with local caching for instant UI feedback, a dynamic sidebar rail, a dedicated `/subscriptions` feed, and a festive full-page floating cat confetti animation when subscribing.

Ask Agent:

> Let's add the ability to subscribe to channels on MewTube. Make channel subscriptions login-gated for signed-in users, display real subscriptions in the sidebar, and provide a dedicated subscription video feed at `/subscriptions`. When a user subscribes to a channel, launch a full-page animation of happy cat faces floating up from the bottom corners and fading away like confetti!

The agent should end up doing roughly the following — verify each point when it's done:

1. **Database Schema & Migrations (`src/db/schema.ts`):**
   - Define a `subscriptions` table with `id`, `userId` (references `users.id` with cascade delete), `channelId` (references `channels.id` with cascade delete), and `createdAt`. Add indexing on `userId` and `channelId`, along with Drizzle relations.
   - Run `npm run db:push` to apply the schema to Postgres.

2. **Subscription API Routes (`src/app/api/subscriptions/route.ts`, `src/app/api/subscriptions/videos/route.ts`):**
   - Create GET, POST, and DELETE handlers under `/api/subscriptions` to retrieve, add, and remove user subscriptions using Better Auth session headers.
   - Update `subscriberCount` on `channels` table upon subscribe/unsubscribe events.
   - Create POST handler at `/api/subscriptions/videos` to fetch published videos strictly from user's subscribed channels sorted by `publishedAt`.

3. **Subscription State & Login Gating (`src/hooks/use-subscriptions.ts`, `src/components/subscribe-button.tsx`):**
   - Create `useSubscriptions` hook with optimistic UI state, `localStorage` caching (`mewtube_sub_ids`), and cross-tab window event syncing (`mewtube-subscriptions-changed`).
   - Create `SubscribeButton` component supporting different sizes (`sm`, `md`, `lg`) and pre-hydrated `initialSubscribed` props for 0ms render flickering. Require user sign-in before toggling subscription state, redirecting unauthenticated users to `/signin`.

4. **Sidebar & Subscriptions Feed Page (`src/components/sidebar-subscriptions.tsx`, `src/app/subscriptions/page.tsx`):**
   - Build `SidebarSubscriptions` component embedded in `Sidebar`, displaying the current user's subscribed channels or a sign-in prompt.
   - Build `/subscriptions` page and `SubscriptionsFeed` component displaying video uploads from subscribed channels, or recommended channels with quick subscribe buttons when no channels are followed.
   - Update `UserMenu` in header to support user session state, sign-in link, and sign-out action.

5. **Happy Cat Confetti (`src/components/cat-confetti.tsx`):**
   - Build `CatConfetti` global component in root layout (`src/app/layout.tsx`).
   - Listen for custom `"trigger-cat-confetti"` events. On subscribe, spawn floating cat face particles (🐱, 😸, 😻, 😹, 😺, 😽) launching gently upwards from bottom screen corners with soft physics (gravity, rotation, opacity fade) staying visible for ~5-6 seconds.

6. **Verify its own work:** `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass cleanly with zero errors.

**Check yourself:**
1. Open any video or channel page while signed out and click "Purrscribe". Verify you are redirected to `/signin`.
2. Sign in and click "Purrscribe" on a channel. Verify the button instantly changes to "Purrscribed" without flicker and happy cat emojis float up from the bottom corners in a confetti animation.
3. Check the left sidebar under "Subscriptions" to verify the newly subscribed channel appears immediately.
4. Navigate to `/subscriptions` to view the personalized video feed containing uploads strictly from your subscribed creators.
5. Click "Purrscribed" again to unsubscribe, and confirm the channel is removed from both the sidebar and the feed.

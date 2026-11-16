# Prompt for Antigravity: rebuild the Devora Activity Center

Paste everything below the line into Antigravity with the Devora repo open
(`~/Projects/My-Coding-Portfolio/Devora/devora`). Put this whole folder
(`devora-activity-center-antigravity/`) in the repo root first so Antigravity can read it.

## What's in this zip

| Path | What it is |
|------|------------|
| `reference/activity-center-reference.html` | The finished design. Double-click to open it in a browser and click around. |
| `screenshots/desktop-*.png`, `screenshots/phone-*.png` | Every tab at 1440px and 390px wide, plus the Create group modal. |
| `source/activity-center-artifact.html` | The exact source of the design (one file). |
| `source/styles.css` | All of its CSS: Design Law tokens at the top, then each section. |
| `source/app.js` | All of its JavaScript: sample data, rendering, and every GSAP animation. |
| `source/markup.html` | The static page skeleton (header, hero, tiles, ticker, tab bar). |
| `source/take-screenshots.mjs` | Playwright script that made the screenshots (uses Devora's Playwright). |

---

## Context

I'm building **Devora**, a Next.js 14 App Router app (TypeScript, Tailwind CSS, Firebase Auth,
Firestore) for CECS students at UM-Dearborn. It's my ENGR 492 capstone, due **December 9, 2026**.
Most of our survey respondents are commuters (12 of 15), so everything has to work async and on a phone.

I have a finished, interactive design for the **Activity Center** in
`devora-activity-center-antigravity/reference/activity-center-reference.html`. **Open it in a browser
and click through every tab before writing any code.** The `screenshots/` folder shows every tab at
desktop and phone width, and `source/` has the design's code split into `styles.css` (exact sizes,
colors, borders, shadows), `app.js` (sample data and every GSAP animation with its timings and eases)
and `markup.html`. Use those as the source of truth for spacing, type sizes and motion. Your job is
to rebuild that page inside the real app so it looks and moves the same, using the repo's own
structure and conventions (React components + Tailwind, not a copy of the vanilla JS).

## What to build

Route: **`/activity-center`**, with one route per tab and a shared layout:

```
src/app/activity-center/
  layout.tsx            ← hero + "your week" tiles + ticker + sticky tab bar (client TabNav)
  page.tsx              ← redirect("/activity-center/events")  (replaces today's redirect to /messages-page)
  events/page.tsx
  study-groups/page.tsx
  connections/page.tsx
  messaging/page.tsx
```

UI components go in **`src/ui/activity-center/`** (this repo keeps components in `src/ui/`, and
Tailwind only scans `src/app`, `src/ui` and `src/pages`; don't create `src/components/`):

```
src/ui/activity-center/
  layout/   Hero.tsx  WeekTiles.tsx  EventTicker.tsx  TabNav.tsx
  events/   EventFeed.tsx  EventFilter.tsx  EventTicket.tsx
  study-groups/  GroupFeed.tsx  GroupCard.tsx  CreateGroupModal.tsx
  connections/   RequestDeck.tsx  ConnectionCard.tsx  ConnectionSearch.tsx
  messaging/     ConversationList.tsx  ChatThread.tsx  MessageInput.tsx  QuickReplies.tsx
  shared/   Avatar.tsx  Tag.tsx  EmptyState.tsx  Toast.tsx
  placeholder-data.ts     ← all sample rows from the reference, typed
src/types/activity-center.ts   ← shared TypeScript types (below)
```

Every component gets typed props. Use the sample data from the reference so every tab looks
complete on first load. No "coming soon" boxes.

### The four tabs (match the reference exactly)

1. **Events:** filter chips (All / Academic / Social / Workshop / Club), events grouped by week
   ("This week", "Next week", "Finals push") as **ticket cards** (gradient date block | details |
   perforated stub with tag chips + "Save to my week" toggle). Empty state when a filter has nothing.
2. **Study Groups:** "+ New group" button, course filter chips, card grid where the group with the
   most members gets a wide **featured** card with a rotated "Most active" sticker. Cards: course tag,
   meeting-preference tag, topic, description, coordination method, member avatar stack, Join/Leave.
   The create modal: course, topic, meeting preference (Async / In person / Both), coordination, description.
3. **Connections:** left: incoming requests as a **card deck** (top card has Accept/Decline; ghost cards
   behind it). Right: search box + grid of accepted connections with a Message button that opens
   that person's chat in the Messaging tab. Empty states for both.
4. **Messaging:** inbox list + chat thread (inbox becomes a horizontal scroll row above the thread on
   phones), unread badges, quick-reply chips, input + Send. Empty state links to the Connections tab.

The **tiles** in the hero (Next up, Requests, Unread, Your groups, Saved) are buttons that jump to
their tab, and their numbers stay in sync with what the user does.

## Design: Coach Connect "Design Law" (match the reference)

- Black-and-white chrome: paper background `#F2F2F0`, white cards, **3px `#0A0A0A` borders**,
  **hard offset shadows with zero blur** (`5px 5px 0 #0A0A0A` on cards, `4px` on buttons; pressed =
  translate 2px and shrink to `2px 2px`), 10px radius.
- Primary buttons are solid ink with white text; secondary are white with an ink border.
- **Gradients only as small accents** (active tab pill, date blocks, tags, avatars, the title strip),
  never as card or page fills. Text on a gradient is always ink.
- Fonts via `next/font/google`: **Archivo Black** (big uppercase display title), **Space Grotesk**
  (body and headings), **Space Mono** (small uppercase labels).
- Muted text `#575757`, soft fill `#E3E3DF`.
- **Use the Tailwind tokens already in `tailwind.config.ts`** instead of hardcoding hex in
  components: colors `nb-ink`, `nb-paper`, `nb-white`, `nb-soft`, `nb-muted`, `nb-pink`, `nb-orange`;
  `border-nb` (3px); `rounded-nb` (10px); shadows `shadow-nb-sm`, `shadow-nb`, `shadow-nb-card`,
  `shadow-nb-lg`; gradients `bg-nb-brand`, `bg-nb-orchid`, `bg-nb-sky`, `bg-nb-blush`, `bg-nb-accent`.
  Add a token there if you need one; don't put new hex values in components.

## Motion: GSAP (already installed: `gsap` and `@gsap/react`)

Recreate every animation from the reference with **`useGSAP`** from `@gsap/react`:

- Intro: title letters rise in with a stagger, the gradient strip wipes in, tiles drop in with a slight
  rotation, tabs fade up, numbers count up.
- Infinite event ticker band.
- Sticky tab bar: the gradient pill **slides** to the active tab (`back.out` ease); content cascades in
  on every tab change.
- Pops (elastic) on Save/Join and on tile numbers when they change; a toast springs up from the bottom.
- Request Accept flings the card right, Decline flings it left, then the next card settles in and the
  accepted person pops into the connections grid with a brief gradient flash.
- New messages spring in; a typing indicator (bouncing dots) shows before the sample reply.
- Create-group modal scales in with `back.out`.
- **Respect `prefers-reduced-motion`** (`gsap.matchMedia()`): no motion, page fully readable.
  Everything must be visible at rest: animate *from* hidden states, never leave content at opacity 0.
- Clean up tweens on unmount; register `useGSAP` with a scope ref per component.

## Data model (Firestore): stub it now, keep these shapes

Put these types in `src/types/activity-center.ts` and make the placeholder data use them, so swapping
in Firestore later doesn't change props. Mark each read/write spot with `// TODO(firestore): …`.

```
/events/{eventId}            title, description, date (timestamp), location, organizer,
                             tags: ("academic"|"social"|"workshop"|"club")[], link?
/studyGroups/{groupId}       course, topic, creatorUid, members: uid[],
                             meetingPreference: "async"|"in-person"|"both",
                             coordinationMethod, description, createdAt
/users/{uid}/connections/{targetUid}   status: "pending"|"accepted"   (already exists)
/conversations/{conversationId}        participants: [uid, uid], lastMessage, lastUpdated
/conversations/{conversationId}/messages/{messageId}   senderId, text, timestamp
```

Messaging will use `onSnapshot` later; for now, local state plus the canned sample replies from the
reference.

## Repo rules (important)

- **Auth:** follow the existing gate pattern (see `src/ui/account/AccountPageContent.tsx` or
  `src/ui/discovery/DiscoveryGridContent.tsx`): `onAuthStateChanged(auth, …)`; signed out →
  `router.replace("/auth/login")`; `getUserProfile(uid)` without `onboardingComplete` →
  `router.replace("/onboarding")`. Imports come from `@/backend/firebase`. Show a skeleton while it resolves.
- Path alias `@/` = `src/`. Keep route files thin; logic and UI live in `src/ui/activity-center/`.
- Follow `src/docs/comment-style.md` and `src/docs/naming-and-structure.md`: a 2–4 line summary at the
  top of each file, `// ===== SECTION =====` headers, `// vocab:` notes on unfamiliar APIs,
  plain-English names (no abbreviations).
- **NavBar** (`src/ui/shared/navbar/NavBar.tsx`): point "Activity Center" at `/activity-center`.
  Ask me before removing the "Messages" / "Connections" links or deleting the older experiments
  (`src/app/activity`, `src/app/messages`, `src/app/connections`, `src/ui/activity-tabs`, `src/ui/messages`,
  `src/ui/connections`, `src/ui/activity`, `src/app/messages-page`). Don't touch other pages.
- Don't rename existing routes, Firestore paths, env var names or exported function names.
- No new UI libraries. Tailwind + GSAP only.
- Don't commit or push unless I ask.

## Done when

- `npm run lint`, `npx tsc --noEmit` and `npm run build` all pass.
- `/activity-center` redirects to `/activity-center/events`; all four tabs render, navigate, and every
  interaction from the reference works with placeholder data.
- It matches the reference side by side at desktop width and at 375px (tabs scroll sideways, no
  horizontal page scroll, messaging stacks).
- Reduced motion shows a still, complete page.
- Give me a short list of files created/changed and anything you couldn't match.

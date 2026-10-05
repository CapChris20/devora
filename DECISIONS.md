# Architecture Decision Records — Devora

Devora is a discovery and networking hub for University of Michigan CECS students. Students find collaborators by major, skills, career niche and interests, then message each other asynchronously. It's a Next.js 14 (App Router) + TypeScript + Tailwind web app backed by Firebase, built as an ENGR 492 capstone in Fall 2026.

These records were reconstructed from the code and docs in this repo (`devora/src/backend/firebase/`, `firestore.rules`, `storage.rules`, `src/docs/firestore-schema.md`, `src/docs/mobile-app-roadmap.md`). Things that haven't been measured yet are marked with the metric to collect.

---

# ADR-001: Firebase (Auth + Firestore + Storage) instead of Postgres/Supabase

## Context
A solo student developer has one semester (weeks 4–13) to ship auth, profiles, filtered discovery and messaging, with a hard final submission on Dec 9, 2026. The budget is $0.

## Alternatives Considered
- **Supabase (Postgres + RLS + Auth + Realtime)**: SQL would make multi-facet filtering (major + niche + interests) far easier, and RLS can protect individual columns. It lost because Firebase was already familiar from earlier projects, and the planned mobile path (Capacitor + FCM push) is Firebase-native.
- **Postgres + Prisma on Vercel**: Full relational power, but it means building auth, file storage and real-time messaging by hand, which is too much for a semester.
- **MongoDB Atlas**: A document model like Firestore, but no built-in auth or security rules.

## Decision
Use **Firebase** for everything server-side: Auth (Google), Firestore (`users`, `conversations/{id}/messages`, `users/{uid}/projects|notifications`), Storage (`users/{uid}/avatar.{ext}`), Analytics, and Cloud Functions (TypeScript, Node 20) for privileged work.

## Rationale
No server to run, a generous free tier, real-time listeners for messaging, and one SDK that also covers FCM push for the mobile roadmap.

## Tradeoffs
- **Gained:** speed to a working auth + profile flow in the first two weeks (see `docs/check-in-1.md`).
- **Cost:** discovery filters are multi-valued (`careerNiche[]`, `casualInterests[]`). Firestore allows only **one `array-contains-any` per query** and needs composite indexes per filter combination, so complex filters will need client-side filtering or a search index.

## What I'd Change
Plan for Algolia/Typesense (or the Firebase "Search with Algolia" extension) from the start for the Discovery Grid. Otherwise, prototype the filter queries before committing to the schema.

## Measurement
Not measured yet. Track Firestore reads per Discovery Grid page load and the number of composite indexes in `firestore.indexes.json`.

---

# ADR-002: Google-only sign-in restricted to UMich domains

## Context
Devora is meant only for UMich students. Trust (everyone is a real classmate) is the core value, and there's no time to build verification flows.

## Alternatives Considered
- **Email/password + "verify your .edu" link**: Works, but means building password resets and verification UX. Helpers exist in `auth.ts` for future use, but the UI doesn't expose them.
- **University SSO (Shibboleth/SAML)**: The strongest verification, but needs IT approval and Firebase Identity Platform (paid).
- **Open sign-up with manual moderation**: Doesn't scale and weakens trust.

## Decision
**Google sign-in only** (`signInWithPopup`). The `hd` hosted-domain hint is set for `umich.edu` or `umd.umich.edu`. The client rejects non-UMich emails (`isUmichEmail`), and **Firestore rules enforce it again on the server** with `request.auth.token.email.matches('.*@umich\\.edu$' | '.*@umd\\.umich\\.edu$')`.

## Rationale
UMich accounts are Google Workspace accounts, so Google proves the user controls a school mailbox with no extra UX. Checking the domain in rules means a modified client still can't read or write data with a personal Gmail.

## Tradeoffs
- **Gained:** verified, school-only identity with a one-click login.
- **Cost:** alumni lose access when their school account expires. A non-UMich Google user can still create a Firebase Auth user; the rules just stop them from reading data.

## What I'd Change
Add a Cloud Functions `beforeUserCreated` blocking function (Identity Platform) that rejects non-UMich emails at sign-up, so no stray Auth users are created.

## Measurement
Not measured yet. Track rejected sign-in attempts per week and the signup → onboarding completion rate.

---

# ADR-003: Single `users/{uid}` document with privacy tiers (data isolation)

## Context
Profiles mix fields that should appear on discovery cards (name, major, niche, bio), profile-only fields (links, age, gender) and private fields (email, religion, signup reason). Students also need to be able to hide or delete themselves.

## Alternatives Considered
- **Split documents (`publicProfiles/{uid}` + `privateProfiles/{uid}`)**: Firestore rules apply to whole documents, so this is the only way to truly hide fields. It costs an extra write per profile save.
- **Cloud Function API that projects public fields**: Secure, but discovery would lose the real-time and offline benefits of direct SDK access.

## Decision
Use a **single `users/{uid}` document**. Privacy tiers are documented in `firestore-schema.md` and applied **in the UI and in query selection**. `isPublic: false` (also forced by `isDeactivated`) removes a user from Discovery queries. Rules allow **read by any signed-in UMich user** and **writes by the owner only** (with the UMich email check on the written data). Delete-account wipes Storage, the `projects` and `notifications` subcollections, the user doc and the Auth user, after Google re-auth.

## Rationale
One document per user keeps onboarding and the account editor simple: one read and one write.

## Tradeoffs
- **Gained:** simple code and a single source of truth.
- **Cost:** **the privacy tiers aren't enforced by the database.** Any signed-in UMich student can `getDoc(users/{anyUid})` and see `email`, `religion`, `gender`, `age` and `signupReason`, even for profiles with `isPublic: false`. Storage avatars are readable by any signed-in user, including non-UMich accounts.

## What I'd Change
Before launch, split the profile into `publicProfiles/{uid}` (card fields only, readable by UMich users when `isPublic == true`) and `users/{uid}` (owner-only). Keep `publicProfiles` in sync with a Cloud Function. Tighten Storage reads to UMich users as well.

## Measurement
Not measured yet. Add rules unit tests (`@firebase/rules-unit-testing`) that check a non-owner can't read private fields.

---

# ADR-004: Async messaging on Firestore conversations

## Context
The product promise is "async vetting before meeting in person", not live chat or swiping. Messages need to arrive promptly and be private to the two participants.

## Alternatives Considered
- **Stream / Sendbird chat SDK**: Typing indicators, read receipts and moderation out of the box, but a per-MAU cost and another identity system.
- **Email relay**: Zero infrastructure, but bad UX, and it exposes addresses.

## Decision
Use `conversations/{conversationId}` with a `participantIds` array and a `messages` subcollection. Rules allow access only to UMich users listed in `participantIds`. Messages are checked with a `get()` on the parent conversation. FCM push for new messages is planned for week 12.

## Rationale
It reuses the same SDK, rules and real-time listeners, and needs no extra vendor.

## Tradeoffs
- **Gained:** real-time delivery for free.
- **Cost:** every message read or write also pays for a `get()` on the parent doc in rules. As written, the conversation rule checks `resource.data.participantIds`, which is **null on create**, so creating a conversation will be rejected until a `request.resource` branch is added for `create`.

## What I'd Change
Split the conversation rules into `create` (check `request.resource.data.participantIds` contains the caller and has exactly 2 entries) and `read/update` (check `resource.data`). Use deterministic IDs (`{uidA}_{uidB}` sorted) to stop duplicate threads.

## Measurement
Not measured yet (messaging UI is still a shell). Track the number of active listeners per session and message delivery latency.

---

# ADR-005: Next.js 14 App Router + TypeScript + Tailwind on Vercel

## Context
The product needs a polished, SEO-friendly landing page with heavy visual identity (Three.js logo, Lottie, a WebGL cursor, synthwave backgrounds) plus authenticated app pages.

## Alternatives Considered
- **Vite + React SPA**: Simpler, but you'd have to set up routing, SEO and image optimization yourself.
- **React Native / Expo**: A mobile-first rewrite. Rejected because the web is the primary product (see ADR-006).

## Decision
Use **Next.js 14 App Router**, **TypeScript**, **Tailwind**, `@react-three/fiber`, `framer-motion`, `lenis` and `lottie-react`, deployed to **Vercel**. Firebase runs **client-side only** (`"use client"`; Analytics guards against SSR), so the server renders the shell and data loads in the browser.

## Rationale
Server-rendered marketing pages help SEO and first paint. TypeScript catches schema mistakes in the profile shape. Vercel gives free preview deploys for each push.

## Tradeoffs
- **Gained:** fast landing pages and a typed codebase.
- **Cost:** because Firebase is client-only, authenticated pages can't be server-rendered with user data, so they show a loading state on first paint. The heavy WebGL/Lottie bundle needs care on low-end phones.

## What I'd Change
Use the Firebase Admin SDK in server components or route handlers with session cookies if authenticated pages need SSR. Lazy-load the 3D and Lottie assets per route.

## Measurement
- `public/logo/LogoModel-optimized.glb` is an optimized variant of the 3D logo, created to reduce payload.
- **Not yet tracked:** Lighthouse performance score and LCP on `/home`.

---

# ADR-006: Mobile via Capacitor wrapper (remote URL) + FCM, not a native rewrite

## Context
Students want a home-screen app and push notifications, but the semester can't absorb a second codebase.

## Alternatives Considered
- **React Native rewrite**: The best native feel, but it throws away the Next.js, Tailwind and WebGL work.
- **PWA only**: Cheapest, but iOS web push and install UX are weaker, and there's no App Store presence.
- **Capacitor bundled static export (`output: 'export'`)**: Works offline, but it's hard with the App Router and every UI fix needs an App Store update.

## Decision
Ship a **PWA first** (week 10), then a **Capacitor iOS shell loading the production URL** (week 11, "Option A"), with **FCM + APNs** push (week 12) and App Store submission in week 13.

## Rationale
One codebase, and web fixes ship without App Store review. FCM fits the existing Firebase project.

## Tradeoffs
- **Gained:** an App Store presence for a few days of work.
- **Cost:** no offline support, and Apple may push back on "thin wrapper" apps (guideline 4.2).

## What I'd Change
Add at least one native capability (push, share sheet, haptics) before App Store review, to reduce the 4.2 risk.

## Measurement
Not measured yet. Track PWA installs vs. App Store installs and push opt-in rate.

---

# ADR-007: No payments

## Context
Devora is a free student community and a capstone project.

## Alternatives Considered
- **Stripe for premium features (e.g. boosted profiles)**: Adds compliance work and goes against the community-first goal.

## Decision
No payment integration.

## Rationale
It keeps the scope focused on discovery and messaging within the semester.

## Tradeoffs
No revenue. Hosting has to stay inside the free tiers (Firebase Spark/Blaze free quotas, Vercel Hobby).

## What I'd Change
Nothing for the capstone. If it outlives the course, university or club sponsorship fits better than charging students.

## Measurement
$0 infrastructure cost is the target. Watch Firebase usage against free-tier quotas.

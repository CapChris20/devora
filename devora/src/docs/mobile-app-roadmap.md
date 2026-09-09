# Devora Mobile App Roadmap (Weeks 10–13+)

> **Strategy:** Web app stays the **primary product**. Mobile is a **wrapper + distribution layer** so students get a home-screen icon and push notifications — **not** a React Native rewrite.

**Last updated:** Aug 31, 2026

---

## Why mobile (goals)

| Goal | How we solve it |
|------|-----------------|
| App on the phone (no Safari every time) | PWA “Add to Home Screen” → Capacitor App Store app |
| Push notifications (messages, connections, etc.) | Firebase Cloud Messaging (FCM) + Capacitor Push plugin |
| One codebase | Same Next.js app + Firebase backend |
| Promote web **and** app | Web = full experience; app = install + notifications |

**What we are NOT doing:** Rebuilding Devora in React Native. That would discard Next.js, Tailwind, WebGL cursor, and months of web work.

---

## Recommended stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Web app | Next.js 14 (current) | Source of truth |
| Hosted URL | Vercel (or Firebase Hosting) | Required for Capacitor Option A |
| iOS shell | **Capacitor** | Wraps web app in native WebView |
| Push | **Firebase Cloud Messaging** | Already using Firebase; add FCM + APNs for iOS |
| Android (optional later) | Same Capacitor project | `npx cap add android` when ready |

---

## Capacitor approaches (pick one)

### Option A — Remote URL (recommended for capstone v1)

The iOS app loads the **production** site, e.g. `https://devora.vercel.app`.

| Pros | Cons |
|------|------|
| Fastest setup (days) | Requires internet |
| Web updates ship instantly — no App Store resubmit for UI fixes | Apple may review “thin wrappers” (usually OK if app is substantive) |
| Matches “web-first” strategy | |

### Option B — Bundled static build (optional later)

Ship HTML/JS inside the IPA via `output: 'export'` in `next.config.mjs`.

| Pros | Cons |
|------|------|
| Works offline for shell UI | Harder with Next.js App Router; must validate all routes |
| Feels more “native” to Apple | App Store update for bundled changes |

**Decision for Devora:** Start with **Option A** in Week 11. Consider Option B only if App Store review or offline requirements demand it.

---

## Prerequisites (before Week 10 mobile work)

- [ ] **Web app deployed** to a stable HTTPS URL (not `localhost`)
- [ ] **Core web features** usable on mobile Safari (responsive nav, auth, account, settings)
- [ ] **Firebase project** production-ready (`devora-303f4` or prod alias)
- [ ] **Apple Developer Program** — $99/year ([developer.apple.com](https://developer.apple.com))
- [ ] **Mac with Xcode** installed (required to build/sign iOS)
- [ ] **Privacy policy URL** (required for App Store; can be a simple page on the site)

---

## Week-by-week plan

### Weeks 1–9 (current focus — web)

Core web only. No Capacitor yet.

- Auth (Google, `@umich.edu`), onboarding, Firestore profiles
- Account page, settings (persisted to Firestore)
- Discovery Grid, Activity Center / messaging (as scoped in [DESIGN_SCOPE.md](./DESIGN_SCOPE.md))
- Deploy to production URL

Mobile prep that can happen **alongside** web (low effort):

- Test every page on iPhone Safari (375px–430px width)
- Ensure tap targets ≥ 44px (nav already targets 48px+)
- Consider disabling heavy effects on mobile (fluid cursor WebGL) for battery

---

### Week 10 — Mobile-ready web + PWA foundation

**Theme:** Make the web app feel installable before App Store work.

| Task | Owner / notes | Done |
|------|----------------|------|
| Audit mobile layout on all live routes | Home, auth, onboarding, account, settings, shells | ☐ |
| Fix any overflow, tiny buttons, broken modals on iOS Safari | | ☐ |
| Add **Web App Manifest** (`public/manifest.json`) | `name`, `short_name`, `theme_color`, `background_color`, `display: standalone` | ☐ |
| Add **app icons** (192, 512, 180 for Apple) | Use Devora logo assets | ☐ |
| Add manifest + Apple meta tags in `src/app/layout.tsx` | `apple-mobile-web-app-capable`, etc. | ☐ |
| Document “Add to Home Screen” for beta testers | 1-page or FAQ blurb | ☐ |
| **Optional:** Service worker for offline shell only | Not required for Week 11 Capacitor | ☐ |
| Confirm production deploy URL is final (or staging URL documented) | Needed for Capacitor `server.url` | ☐ |

**Deliverable:** Students can add Devora to their iPhone home screen from Safari; site is usable on phone.

**Effort:** ~2–4 days if web is already responsive.

---

### Week 11 — Capacitor iOS shell + TestFlight

**Theme:** Real iOS app binary, internal testing.

| Task | Notes | Done |
|------|-------|------|
| `npm install @capacitor/core @capacitor/cli @capacitor/ios` | In `devora/` | ☐ |
| `npx cap init "Devora" "edu.umich.devora"` | Bundle ID — confirm with advisor / App Store Connect | ☐ |
| Configure `capacitor.config.ts` | `server.url` → production HTTPS URL (Option A) | ☐ |
| `npx cap add ios` | Creates `ios/` folder — **commit to repo** or document in `.gitignore` policy | ☐ |
| App icon + splash in Xcode / Capacitor assets | Match brand ([DESIGN_SCOPE.md](./DESIGN_SCOPE.md)) | ☐ |
| **Firebase Auth — iOS** | Add iOS app in Firebase Console; download `GoogleService-Info.plist`; add URL schemes in Xcode | ☐ |
| Test Google sign-in inside Capacitor WebView | Common gotcha — plan extra time | ☐ |
| Disable or simplify fluid cursor on `capacitor` / mobile UA | Performance + battery | ☐ |
| Build in Xcode → run on simulator + physical iPhone | | ☐ |
| **TestFlight** upload | App Store Connect → Internal testing group (classmates) | ☐ |

**Deliverable:** TestFlight build classmates can install; app opens Devora full-screen.

**Effort:** ~5–7 days (first time includes Apple/Firebase config learning curve).

#### Capacitor quick reference (Week 11)

```bash
cd devora
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "Devora" "edu.umich.devora" --web-dir=out   # or omit web-dir if using server.url only
# Edit capacitor.config.ts — set server.url to production
npx cap add ios
npx cap sync ios
npx cap open ios
```

Example `capacitor.config.ts` (Option A — remote):

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "edu.umich.devora",
  appName: "Devora",
  webDir: "out", // unused when server.url is set
  server: {
    url: "https://YOUR-PRODUCTION-URL.com",
    cleartext: false,
  },
};

export default config;
```

---

### Week 12 — Push notifications (FCM)

**Theme:** The main reason for native mobile — notify users on their phone.

| Task | Notes | Done |
|------|-------|------|
| Enable **Cloud Messaging** in Firebase Console | | ☐ |
| Apple: create **APNs key** (.p8) in Apple Developer → upload to Firebase | Required for iOS push | ☐ |
| `npm install @capacitor/push-notifications` | | ☐ |
| Request notification permission on first launch (or settings) | Respect user choice; tie to [settings toggles](../ui/settings/SettingsPageContent.tsx) later | ☐ |
| Store FCM device token in Firestore | e.g. `users/{uid}/fcmTokens/{token}` | ☐ |
| Cloud Function or backend trigger to send push on new message / connection request | See [firestore-schema.md](./firestore-schema.md) notifications section | ☐ |
| Handle notification tap → deep link to `/messages-page` or thread | | ☐ |
| Wire settings `notifyMessages`, `notifyConnectionRequests`, etc. | Today they save to Firestore only — Week 12 makes them **enforce** sends | ☐ |
| Test on physical iPhone (push does not work in simulator) | | ☐ |

**Deliverable:** User receives a push when someone messages them (or connection request — pick one event for v1).

**Effort:** ~7–10 days; hardest mobile week. Budget slippage into Week 13 if needed.

#### Push architecture (high level)

```
Event (new message in Firestore)
  → Cloud Function
  → FCM
  → APNs (iOS)
  → Capacitor app shows notification
  → User taps → open Activity Center / thread
```

---

### Week 13 — App Store submission + capstone wrap-up

**Theme:** Public listing (or ready to submit) + documentation for advisor.

| Task | Notes | Done |
|------|-------|------|
| App Store Connect listing | Name, subtitle, description, keywords, category (Social Networking or Education) | ☐ |
| Screenshots (6.7", 6.5", iPad if required) | Capture from simulator or device | ☐ |
| Privacy policy URL + **App Privacy** questionnaire | Email, profile data, identifiers | ☐ |
| Age rating questionnaire | Likely 12+ or 17+ depending on UGC | ☐ |
| Submit for **App Review** | Review often 1–7 days | ☐ |
| Final capstone docs update | Link this file + demo script (web + TestFlight + push) | ☐ |
| Regression test web + iOS | Auth, profile, one notification flow | ☐ |

**Deliverable:** App submitted or approved on App Store; capstone docs complete.

**Fallback if review slips past Dec 9:** TestFlight + PWA still demoable for final presentation.

---

## Post-capstone (Winter 2027 / ENGR 493)

- Android (`npx cap add android`) + Play Store
- Richer notification types (profile views, events, weekly digest)
- Optional: bundle static assets (Capacitor Option B) for offline shell
- Native polish: haptics, share sheet, biometric re-auth

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Apple rejects “thin” web wrapper | App must be useful standalone; avoid generic shell; complete auth + core flows in-app |
| Google Sign-In breaks in WebView | Firebase iOS app + URL schemes; test early Week 11 |
| Push setup complexity | Start FCM in Week 12 only after TestFlight works; one notification type for v1 |
| Capstone deadline (Dec 9) | PWA + TestFlight counts as mobile progress even if App Store pending |
| WebGL cursor hurts mobile performance | Disable on mobile / Capacitor UA |
| No Mac for Xcode | Need access to lab Mac or borrow hardware — blocker for iOS build |

---

## What stays web-only vs mobile-enhanced

| Feature | Web | Mobile app |
|---------|-----|------------|
| Discovery, profiles, messaging UI | Primary | Same UI (WebView) |
| Google auth | ✅ | ✅ (extra Firebase iOS config) |
| Settings toggles | Saves to Firestore | Same; push toggles **enforce** in Week 12 |
| Fluid cursor | ✅ | Disable or reduce on mobile |
| Push notifications | Limited (web push on iOS PWA) | **Full** via FCM + Capacitor |
| App Store presence | — | Week 13 |

---

## Related docs

- [DESIGN_SCOPE.md](./DESIGN_SCOPE.md) — UI specs (reuse for app screenshots)
- [firestore-schema.md](./firestore-schema.md) — User profile, messages, notifications data model
- [naming-and-structure.md](./naming-and-structure.md) — Repo layout; `ios/` will appear after Capacitor
- [README.md](./README.md) — Docs index

---

## Decision log

| Date | Decision | Rationale |
|------|----------|-----------|
| Aug 31, 2026 | **Capacitor**, not React Native | Reuse Next.js + Firebase; avoid full rewrite |
| Aug 31, 2026 | **Web-first**; mobile Weeks 10–13 | Core product is web; mobile = install + push |
| Aug 31, 2026 | Capacitor **Option A** (remote URL) first | Fastest path to TestFlight |
| Aug 31, 2026 | **No cursor splash sounds** | Removed; visual cursor only |

---

*Christian Shina — ENGR 492 Capstone, UM-Dearborn CECS*

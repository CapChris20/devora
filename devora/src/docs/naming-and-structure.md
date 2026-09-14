# Devora Naming & Folder Structure

Chris prefers **plain English** names a non-dev could guess. **No jargon.** **Ask before bulk renames** — user approves yes/no per item.

Also read [DESIGN_SCOPE.md](./DESIGN_SCOPE.md) for visual/UI specs (colors, gradients, page shells).

---

## Mental model

```
src/app/              → URLs only (thin page files)
src/ui/               → React components + globals.css
src/backend/firebase/ → Firebase client (auth, db, sign-in)
src/docs/             → Project documentation
```

---

## Naming rules (non-negotiable)

1. **Plain English** — name what you *see*, not dev slang.
   - ❌ Marquee, CTA, Shell, Reveal, RetroPageShell, SiteNavBar, LandingMarquee
   - ✅ ScrollingTextStrip, JoinNowSection, PageLayout, NavBar, TopSection

2. **Folder = context** — do **not** repeat the folder name in every file.
   - ❌ `homepage-sections/HomepageScrollingText.tsx`
   - ✅ `homepage-sections/ScrollingTextStrip.tsx`

3. **No "Site" prefix** on shared chrome — `NavBar.tsx`, `Footer.tsx` (not SiteNavBar / SiteFooter).

4. **Stable folder names** — do not rename top-level `ui/` folders without explicit approval.
   - Exception already made: `landing/` → `homepage-sections/`

5. **Copy/text lives in `*-text.ts`** next to the component (e.g. `hero/top-section-text.ts`).

6. **Delete dead code** — do not add new `_archive/` dumps; remove unused files.

7. **Renames change imports everywhere** — run build after; update nav hrefs and docs in `src/docs/`.

---

## Current routes (`src/app/`)

| URL | Folder | Notes |
|-----|--------|-------|
| `/home` | `home/` | Full homepage (redirect from `/`) |
| `/find-students` | `find-students/` | Discovery Grid shell |
| `/settings` | `settings/` | Settings shell |
| `/faqs-page` | `faqs-page/` | **Kept** `-page` suffix (user choice) |
| `/messages-page` | `messages-page/` | Activity Center shell; nav label **Activity Center** |
| `/account-page` | `account-page/` | Account shell |
| `/auth/login` | `auth/login/` | Google sign-in |
| `/auth/signup` | `auth/signup/` | First/last name + Google |
| `/onboarding` | `onboarding/` | 5-step profile setup |
| `/onboarding/welcome` | `onboarding/welcome/` | Post-onboarding welcome |

Do not rename these routes without asking.

---

## `src/ui/` layout (current)

| Folder | Purpose | Key files |
|--------|---------|-----------|
| `hero/` | Top of homepage only | `TopSection.tsx`, `top-section-text.ts`, `Credits.tsx`, `Logo.tsx`, other `Hero*` pieces user kept |
| `homepage-sections/` | Homepage sections below hero | `ScrollingTextStrip`, `WhatIsDevora`, `FeatureCards`, `BestUseCases`, `WhyNot`, `GoodReasons`, `JoinNowSection`, `FadeInWhenScrolling`, `MouseGridBackground`, `MovingAnimation` |
| `auth/` | Sign-in + onboarding UI | `SignInPageLayout`, `LoginCard`, `SignupCard`, `GoogleButton`, `OnboardingForm`, `WelcomeScreen` |
| `navbar/` | Top menu | `NavBar.tsx` |
| `footer/` | Bottom links | `Footer.tsx` |
| `backgrounds/` | App-page synthwave scenes | `PageLayout.tsx`, `BackgroundPicture.tsx`, `mountains.tsx`, `city.tsx`, `pyramids.tsx`, `background-helpers.tsx` |
| `theme/` | Dark/light mode | `DarkLightMode.tsx`, `AppWrapper.tsx`, `DarkLightButton.tsx` |
| `cursor/` | Fluid cursor | `SplashCursor.jsx`, `SplashCursorClient.tsx` |
| `logo/` | Logo component | `DevoraLogo.tsx` |
| `lottie-animations/` | Lottie JSON | kebab-case filenames |
| `small-assets/` | PNG/SVG icons | keep unless user renames |
| `globals.css` | All styles | do not split without asking |

**Do not recreate** `ui/background/` (singular) or `ui/pages/` concept layouts unless user asks.

---

## `src/backend/firebase/`

| File | Purpose |
|------|---------|
| `start-firebase.ts` | Init app, auth, db, storage |
| `env-keys.ts` | `NEXT_PUBLIC_FIREBASE_*` from env |
| `auth.ts` | **Keep this name** — sign-in, sign-up, Google, `@umich.edu` |
| `usage-tracking.ts` | Analytics (optional) |
| `index.ts` | Barrel exports |

Folder stays `backend/`, not `lib/`.

---

## Component naming patterns

- **Homepage hero main block:** `TopSection` (not LandingHero)
- **App page wrapper:** `PageLayout` (not RetroPageShell)
- **Background renderer:** `BackgroundPicture`
- **Scroll animation helper:** `FadeIn` / `SectionNumber` exported from `FadeInWhenScrolling.tsx`
- **Why Devora section:** `WhyNot.tsx` (short, not WhyNotLinkedIn)

When adding hero subcomponents, prefer **short obvious names** inside `hero/` (`Slogan`, `Blurb`) only if user approves — several `Hero*` files were intentionally kept.

---

## UI behavior (from past feedback)

- Nav links: text **directly on `<Link>`**, large hit targets, no nested clickable spans
- Devora gradients **sparingly** — see DESIGN_SCOPE.md
- `npm run dev` uses **port 3000** (`next dev -p 3000`)
- Firebase authorized domain is **`localhost`** (hostname only, no port in console)

---

## Before creating new files

1. Pick the right folder from the table above
2. Use a plain-English filename (say it out loud — would a friend understand?)
3. If renaming >3 files or changing URLs, **list current → proposed and wait for approval**

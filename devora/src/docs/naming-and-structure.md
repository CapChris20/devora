# Devora Naming & Folder Structure

Chris prefers **plain English** names a non-dev could guess. **No jargon.** **Ask before bulk renames** — user approves yes/no per item.

Also read [DESIGN_SCOPE.md](./DESIGN_SCOPE.md) for visual/UI specs (colors, gradients, page shells).

---

## Mental model

```
src/app/              → URLs only (thin page files)
src/ui/               → React screens + globals.css
src/backend/firebase/ → Firebase client (auth, db, sign-in)
src/docs/             → Project documentation
```

`src/app/` is the URL map. `src/ui/` is nested **screen → part → file**.

---

## Naming rules (non-negotiable)

1. **Plain English** — name what you *see*, not dev slang.
   - ❌ Marquee, CTA, Shell, Reveal, RetroPageShell, SiteNavBar, LandingMarquee
   - ✅ ScrollingTextStrip, JoinNowSection, PageLayout, NavBar, TopSection

2. **Folder names what it is for**
   - **Top folder** = the screen / feature (`home`, `account`, `auth`, `settings`, `faqs`, `shared`)
   - **Subfolder** = what that part does (`hero`, `sections`, `onboarding`, `login`, `editor`)
   - **File name** = the component
   - Do **not** repeat the folder name in every file (`home/sections/ScrollingTextStrip.tsx`, not `HomepageScrollingText.tsx`)

3. **No "Site" prefix** on shared chrome — `NavBar.tsx`, `Footer.tsx` (not SiteNavBar / SiteFooter).

4. **Do not rename `src/app/` route folders** without asking — URLs stay `/home`, `/faqs-page`, `/account-page`, `/onboarding`, etc.

5. **Copy/text lives in `*-text.ts`** next to the component (e.g. `home/hero/top-section-text.ts`).

6. **Delete dead code** — do not add `_archive/` dumps; remove unused files.

7. **Renames change imports everywhere** — run a TypeScript/Next check after; update docs in `src/docs/`.

---

## Current routes (`src/app/`)

| URL | Folder | Notes |
|-----|--------|-------|
| `/home` | `home/` | Full homepage (redirect from `/`) |
| `/find-students` | `find-students/` | **Discovery Grid** (nav + title). Do not rename the URL. |
| `/settings` | `settings/` | Settings shell |
| `/faqs-page` | `faqs-page/` | **Kept** `-page` suffix (user choice) |
| `/messages-page` | `messages-page/` | Activity Center shell; nav label **Activity Center** |
| `/account-page` | `account-page/` | Account shell |
| `/auth/login` | `auth/login/` | Google sign-in |
| `/auth/signup` | `auth/signup/` | First/last name + Google |
| `/onboarding` | `onboarding/` | 5-step profile setup |
| `/onboarding/welcome` | `onboarding/welcome/` | Post-onboarding welcome |

Do not rename these routes without asking. Discovery Grid UI lives in `src/ui/discovery/` (route stays `/find-students`). Messages is still a thin `PageLayout` shell.

---

## `src/ui/` layout (screen → part)

```
ui/
  home/
    hero/                      TopSection, title stack, credits, CTAs
    sections/                  landing blocks below the hero
  account/
    AccountPageContent.tsx     orchestrator
    profile/                   view, info cards, discovery preview, helpers
    editor/                    AccountProfileEditor
    onboarding/                OnboardingForm, WelcomeScreen, options
  auth/
    login/ signup/ google/ layout/ deactivated/
    sign-in-actions.ts
  settings/
    page/                      SettingsPageContent
    toggles/                   GradientToggle
  faqs/
    FAQAccordion.tsx
  discovery/
    DiscoveryGridContent.tsx   Discovery Grid shell (filters live; cards deferred)
    cards/ filters/            peek, avatars, overlay filters
  shared/
    pills/ navbar/ footer/ logo/ theme/
    backgrounds/               PageLayout + Voronoi only
    assets/small-assets/
    assets/lottie-animations/
  globals.css
```

| Folder | Purpose |
|--------|---------|
| `home/hero/` | Homepage first viewport |
| `home/sections/` | Homepage sections below hero (`WhatIsDevora`, `WhyDevora`, `CardCycle`, …) |
| `account/` | Account screen; onboarding lives here even though the URL is `/onboarding` |
| `auth/` | Sign-in / signup / deactivated chrome |
| `settings/` | Settings screen |
| `faqs/` | FAQ accordion |
| `shared/` | Chrome and assets used by more than one screen |
| `globals.css` | All styles — do not split without asking |

Import examples: `@/ui/home/hero/TopSection`, `@/ui/account/onboarding/OnboardingForm`, `@/ui/shared/backgrounds/PageLayout`.

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
- **Background renderer:** `BackgroundPicture` (Voronoi via `VoronoiShaderBackgroundClient`)
- **Scroll animation helper:** `FadeIn` / `SectionNumber` exported from `FadeInWhenScrolling.tsx`
- **Why Devora section:** `WhyDevora.tsx`

---

## UI behavior (from past feedback)

- Nav links: text **directly on `<Link>`**, large hit targets, no nested clickable spans
- Devora gradients **sparingly** — see DESIGN_SCOPE.md
- `npm run dev` uses **port 3000** (`next dev -p 3000`)
- Firebase authorized domain is **`localhost`** (hostname only, no port in console)

---

## Before creating new files

1. Pick the right **screen** folder, then the **part** subfolder
2. Use a plain-English filename (say it out loud — would a friend understand?)
3. If renaming >3 files or changing URLs, **list current → proposed and wait for approval**

# Devora Design Scope

> **📌 PINNED REFERENCE** — This is the source of truth for Devora's UI design.  
> Concept layouts were removed from the codebase (Aug 2026, validated twice) after visual testing. **Rebuild from this doc**, not from memory.  
> A Cursor rule (`.cursor/rules/devora-design-scope.mdc`) points agents here automatically.  
> All docs: **`src/docs/README.md`**

---

## Current Live State

| What | Status |
|------|--------|
| Homepage (`/home`) | **Live** — full landing |
| Retro backgrounds | **Live** — Peaks, City, Pyramids via `PageLayout` |
| Nav + theme toggle | **Live** — right-aligned glass pill, full-link hit targets |
| Discovery Grid, Settings, FAQs, Activity Center | **Shell only** — gradient title + retro background + coming-soon copy |
| Account (`/account-page`) | **Live** — view + edit own profile from Firestore |
| Firebase / auth / real data | **Live** — Google sign-in (`@umich.edu`), onboarding, Firestore profiles |

### Nav links (current)

| Label | Route | Background |
|-------|-------|------------|
| Home | `/home` | Inline synthwave sky |
| Account | `/account-page` | Pyramids |
| Discovery Grid | `/find-students` | Peaks |
| Settings | `/settings` | City |
| FAQs | `/faqs-page` | Peaks |
| Activity Center | `/messages-page` | Pyramids |

### Auth routes

| Page | Route |
|------|-------|
| Login | `/auth/login` |
| Sign up | `/auth/signup` |
| Onboarding | `/onboarding` |
| Welcome (post-onboarding) | `/onboarding/welcome` |

Sign-in is **Google only** with `@umich.edu` emails. Profile data shape: [firestore-schema.md](firestore-schema.md).

### Shell page titles (per-route gradient)

`PageLayout` accepts `titleClassName` (default `pink-grad`). Use one gradient per app page:

| Page | `titleClassName` |
|------|------------------|
| Discovery Grid | `logo-gradient` |
| Settings | `devora-gradient-text` |
| FAQs | `pink-grad` |
| Activity Center | `headline-grad` |

---

## Design Language

Match the **homepage synthwave glass aesthetic**. Do **not** make everything pink.

### Core principle

**No flat cyan (`#22d3ee`) or basic single-color pink (`#ff5ca8`) for account page accents, settings toggles, or primary CTAs.** Those read cheap and generic — not Devora.

Use the **four Devora gradient classes** (`.logo-gradient`, `.devora-gradient-text`, `.pink-grad`, `.headline-grad`) and **warm neon stops** (gold `#ffd76f`, orange `#ff9a3d`, magenta `#ff2bd6`, purple `#a855f7`) — each UI element type gets its **own** mapped gradient, not one accent color everywhere.

Pink is still a **gradient accent** on the homepage — marquee, hero glow, titles. Day-to-day UI elsewhere may use purple, gold, and neutral glass borders; **account + settings lean on multi-stop gradients per section**, not cyan outlines.

### Devora gradient text (four variants)

Use these classes from `globals.css` — same as landing / How It Works:

| Class | Stops | Best for |
|-------|-------|----------|
| `.logo-gradient` | `#ffd76f → #ff9a3d → #ff2bd6` | Discovery Grid title, gold CTAs, event tags |
| `.devora-gradient-text` | `#ff9a2e → #ff5ca8 → #ff006e → #a855f7 → #6b21a8` | Settings title, synthwave accents |
| `.pink-grad` | `#ff5ca8 → #ff2bd6 → #7b2ff7` | FAQs title, unread names, RSVP buttons |
| `.headline-grad` | `#ffffff → #ff5ca8 → #7b2ff7` | Activity Center title, open FAQ questions |

**Validated rule:** gradient text on **section labels, card names, active pills, and outline buttons** — keep body copy, majors, stacks, and hints on `theme-muted` / `theme-faint`.

### Color palette (UI accents)

| Token | Hex / class | Use |
|-------|-------------|-----|
| Gold / orange neon | `#ffd76f`, `#ff9a3d`, `.logo-gradient` | Verified badges, avatar rings, event tags, warm CTAs |
| Magenta / pink neon | `#ff5ca8`, `#ff2bd6`, `.pink-grad` | Public badges, social URLs, interest sections |
| Purple synth | `#a855f7`, `#7b2ff7`, `.devora-gradient-text` | Profile strength, career focus, settings title |
| White→pink→purple | `.headline-grad` | Account page title, bio/social section labels |
| Cyan | `#22d3ee` | **Discovery Grid search icons only** — not account, settings, or profile accents |
| Page bg (dark) | `#08040f` | `--page-bg` |
| Glass panel | `rgba(10, 4, 20, 0.28)` | Sidebars, panels |
| Glass card | `rgba(10, 4, 20, 0.38)` | Floating cards over background |
| Border | `rgba(255, 255, 255, 0.08–0.10)` | Neutral glass borders |

### Account page color rule (required)

**Keep the account page calm.** The retro background already has color — the profile UI should not rainbow every label.

| Element | Treatment |
|---------|-----------|
| Page title (`My Profile`) | One gradient via `titleClassName` on `PageLayout` only |
| Display name, section titles, body | `theme-heading` / `theme-muted` — **no per-section gradients** |
| Eyebrow labels (Major, Profile strength, Discovery preview) | `.account-section-eyebrow` muted uppercase |
| Badges (Verified, Public, Joined) | Neutral glass pills — same family as `.account-meta-chip` |
| Tags | Neutral glass border, no pink/orange fill |
| Profile strength bar | Single pink→purple gradient on the **fill only** |
| Edit profile CTA | `.devora-btn-outline` (one accent button) |
| Sign out | `.page-btn-danger` |

**Never on account:** cycling gradient text on every section title, stat card, and link. Reserve gradients for the page title and primary CTA.

### Typography

- Page titles: `font-display` + per-route gradient via `titleClassName`
- Section labels: `.page-section-label` + one of the four gradient classes (cycle or map by category)
- Body: `theme-body`, `theme-muted`, `theme-faint`, `theme-heading`
- Card names: `.page-card-name` + gradient class

### Surfaces

- **Panels** (`.page-panel`): glass sidebar containers, blur 18px
- **Cards** (`.glass-card`): individual floating cards — **background scene must show between cards**
- **Landing cards** (`.neon-card`): homepage only

### Interactions

- `SplashCursor` on homepage only (`/home`, `z-index: 5`, `pointer-events: none`)
- Lenis smooth scroll on homepage only
- `ThemeProvider` — dark/light, `localStorage` key `devora-theme`
- Nav links: text directly on `<Link>`, no nested clickable spans; min 48px hit height

### Background assignment

| Page | Scene file | Visual |
|------|------------|--------|
| Discovery Grid, FAQs | `peaks-scene.tsx` | Mountain peaks, grid floor |
| Settings | `city-scene.tsx` | City skyline |
| Activity Center, Account | `pyramids-scene.tsx` | Desert pyramids |
| Home | Inline in `TopSection` | Sun, city silhouettes, grid |

---

## CSS Utilities (already in `globals.css`)

Rebuild pages using these — do not reinvent:

| Class | Purpose |
|-------|---------|
| `.page-panel` | Glass sidebar / outer panel |
| `.glass-card` | Profile, setting, FAQ accordion cards |
| `.page-pill` + `.page-pill-cyan/purple/gold/pink` | Filter / category pills |
| `.page-pill-active` | Selected pill border/glow |
| `.page-pill-active-label` | Font weight for active pill label |
| `.page-section-label` | Uppercase section header (pair with gradient class) |
| `.page-card-name` | Profile / connection name styling |
| `.page-tab-active` | Cyan→purple gradient tab background |
| `.page-divider` | Neutral dividers |
| `.page-search-wrap` / `.page-search-input` | Rounded search fields |
| `.page-btn-outline` | Pill button with gradient label + cyan border (`::before`) |
| `.page-btn-grad-logo/devora/pink/headline` | Button label gradient variants |
| `.page-btn-with-icon` + inner gradient span | Icon + gradient text buttons |
| `.page-btn-danger` | Destructive actions |
| `.page-icon-btn` | Circular icon buttons |
| `.page-checkbox` | Cyan accent checkboxes |

### Gradient mapping (validated)

| Context | Mapping |
|---------|---------|
| Filter pill accent → active label gradient | cyan → `logo-gradient`, purple → `devora-gradient-text`, gold → `pink-grad`, pink → `headline-grad` |
| FAQ category | About → `logo`, Platform → `devora`, Privacy → `pink`, Account → `headline` |
| Activity Center tab | Messages → `logo`, Connections → `devora`, Events → `pink`, Feed → `headline` |
| Settings card titles | Cycle four gradients by card index |
| Profile / connection names | Cycle `devoraGradientAt(index)` across cards |

---

## Page Specs (to rebuild)

### 1. Discovery Grid

**Route:** `/find-students` · **Shell:** `PageLayout wide` · **Background:** Peaks · **Title:** `logo-gradient`

#### Layout

```
┌─────────────────────────────────────────────────────┐
│  [Filter sidebar 340–360px]  │  [Profile grid]      │
│  sticky, scrollable pills   │  NO opaque panel     │
│  glass .page-panel          │  only .glass-card    │
└─────────────────────────────────────────────────────┘
Mobile: filter drawer overlay (340px max width)
```

#### Filter sidebar

- Search input at top (cyan search icon)
- 8 scrollable pill sections; section labels use `.page-section-label` + cycling gradients
- **Active pills only** get gradient text; inactive stay neutral white
- "Clear N filters" footer with `.page-btn-outline`

#### Filter sections & options

**CECS Major** (cyan pill / `logo-gradient` when active):
Bioengineering, Computer & Information Science, Computer Engineering, Cybersecurity & Information Assurance, Data Science, Electrical Engineering, Engineering Mathematics, Human-Centered Engineering Design, Industrial & Systems Engineering, Manufacturing Engineering, Mechanical Engineering, Robotics Engineering, Software Engineering

**CIS / CIA Concentration** (purple / `devora-gradient-text`):
Artificial Intelligence, Computer Science, Information Systems, Game Design, Digital Forensics, Cybersecurity & Privacy

**Technical Niche** (gold / `pink-grad`):
Frontend, Backend, Full Stack, Mobile, Embedded Systems, FPGA / Hardware, Cloud & DevOps, UI/UX Design, AI / Machine Learning, Data Engineering, Cybersecurity, Robotics, Game Development, AR / VR, IoT, Systems Programming

**Hobbies & Activities** (pink / `headline-grad`):
Hackathons, Open Source, Photography, Fitness / Gym, Cooking, Hiking, Skateboarding, Basketball, Soccer, Chess, Board Games, Tabletop RPG, Cars & Motorsports, Art & Illustration, Volunteering, Entrepreneurship

**Media & Entertainment** (purple):
Anime, Marvel / DC, Sci-Fi, Horror, K-Drama, Hip-Hop, EDM, Rock, Jazz / Lo-Fi, Gaming — FPS, Gaming — RPG, Gaming — Fighting, Streaming, Podcasts, Reading, Film Photography

**Clubs & Orgs** (cyan):
ACM, IEEE, ISC Robotics, M@uto (Autonomous Vehicles), Dearborn Electric Racing, NSBE, SHPE, Society of Women Engineers, Game Dev Club, Cybersecurity Club, ECO, Circle K, First Gen Student Org, Swing Dearborn, BuildOn, VictorsLink Events

**Looking For** (gold):
Study Partner, Project Teammate, Hackathon Squad, Gym Buddy, Gaming Squad, Mentor, Mentee, Coffee Chat, Lab Partner, Capstone Team

**Class Year** (neutral):
Freshman, Sophomore, Junior, Senior, Graduate

#### Profile card fields

Maps to [firestore-schema.md](firestore-schema.md) — Discovery Grid card:

- Avatar circle with accent border + glow (`photoURL` or initials)
- **Name:** `displayName` — `.page-card-name` + cycling gradient
- **Major · class rank:** muted line (`major`, `classRank`)
- **Tags:** top items from `careerNiche` + `casualInterests` (max 3–4, muted)
- **Bio:** truncated ~80 chars (optional line)
- "View profile": `.page-btn-outline.page-btn-grad-logo`

**Not on card:** `email`, `gender`, `age`, `religion`, `signupReason`, full `experienceDetails`, social links.

#### Sample profiles (mock reference)

| Name | Major | Year | Stack | Interests |
|------|-------|------|-------|-----------|
| Alex Chen | CIS | Junior | React · TS · Python | Hackathons, Anime, ACM |
| Maya Hassan | CompE | Sophomore | C++ · Embedded · MATLAB | IEEE, Robotics, Sci-Fi |
| Jordan Lee | SE | Senior | Node · AWS · Docker | Open Source, Gaming RPG, Capstone |
| (+ 9 more — vary avatar accent hex across cyan/purple/gold/pink) |

#### Firebase TODO

- Firestore compound filters on tags
- Full-text search on name/stack
- Pagination / infinite scroll
- Saved filter presets

---

### 2. Settings

**Route:** `/settings` · **Shell:** `PageLayout wide` · **Background:** City · **Title:** `devora-gradient-text`

#### Layout

2-column grid of `.glass-card` sections on desktop, single column mobile. Each card title uses a cycling Devora gradient.

#### Sections

| Card | Fields |
|------|--------|
| **Profile & Discovery** | Show profile publicly, appear in grid, show skills, show interests, show class year |
| **Messaging & Notifications** | New message, connection request, profile view, event invite, weekly digest; "Allow messages from" dropdown |
| **Appearance** | Dark / Light mode — **wire to `ThemeProvider`**; active mode label gets gradient text |
| **Privacy & Safety** | Online status, read receipts, blocked users, data export |
| **Account & Security** | Change email, reset password, 2FA, GitHub/Google connect, sign out all devices |
| **Danger Zone** | **Deactivate** (`isDeactivated` + hide from Discovery, reversible). **Delete** (Google reauth → wipe Storage + Firestore + Auth). |

Toggle switches: **Devora gradient** when on (`.devora-toggle`) — not cyan. Outline actions use `.devora-btn-outline` with gradient variants.

---

### 3. FAQs

**Route:** `/faqs-page` · **Shell:** `PageLayout` · **Background:** Peaks · **Title:** `pink-grad`

#### Features

- Search bar (filters question + answer text)
- Category pills: All + 4 categories — **active pill** gets mapped gradient text
- Accordion in `.glass-card`; category label above question uses category gradient
- **Open** question text: `headline-grad`; closed: `theme-heading`
- Cyan chevron

#### All 16 FAQ items

**About Devora** (`logo-gradient`)
1. What inspired you to make Devora?
2. How is Devora different from LinkedIn and Discord?
3. How does this compare to meeting someone in person?
4. What's the benefit vs. just approaching someone directly?
5. What's on the roadmap after launch?

**Using the Platform** (`devora-gradient-text`)
6. How does the Discovery Grid work?
7. What should I put on my profile?
8. How does messaging work?
9. Will Devora show CECS events and workshops?
10. Does Devora work on mobile?

**Privacy & Safety** (`pink-grad`)
11. Can I hide my profile from Discovery?
12. What if someone makes me uncomfortable?
13. Can I download or delete my data?

**Account & CECS** (`headline-grad`)
14. Who can join Devora?
15. How does CECS verification work?
16. Is Devora free?

*(Full answer copy was in removed `mock-data.ts` — rewrite when rebuilding or recover from git/session history.)*

---

### 4. Activity Center

**Route:** `/messages-page` · **Nav label:** Activity Center · **Shell:** `PageLayout wide` · **Background:** Pyramids · **Title:** `headline-grad`

#### Layout

Single `.page-panel` with vertical tab sidebar (desktop) / horizontal tabs (mobile). Active tab label uses mapped gradient.

#### Tabs

| Tab | Gradient | Content |
|-----|----------|---------|
| **Messages** | `logo-gradient` | Split pane: conversation list + thread. Selected name `devora-gradient-text`, unread `pink-grad`. Send button `page-btn-grad-headline`. |
| **Connections** | `devora-gradient-text` | Connection cards; names cycle gradients; Message button `page-btn-grad-devora`. |
| **Events** | `pink-grad` | Gold tag pill with `logo-gradient` label; event title `pink-grad`; RSVP `page-btn-grad-pink`. |
| **Activity Feed** | `headline-grad` | Timeline; user names cycle gradients. |

#### Sample mock data

**Conversations:** Alex Chen (2m, unread), Maya Hassan (1h, unread), Jordan Lee, Sam Rivera, Priya Patel, Chris Nguyen

**Events:** ACM Firebase Talk, CECS Hackathon Kickoff, IEEE Resume Review, ISC Robotics Open Lab

**Connections:** 6 cards with mutual connection counts

---

### 5. Account

**Route:** `/account-page` · **Background:** Pyramids · **Title:** `headline-grad` ("My Profile")

#### Layout

50/50 split on desktop (`account-split-layout`), stacked on mobile:

| Column | Content |
|--------|---------|
| **Left** | Avatar (gold/magenta ring), display name (`headline-grad`), subtitle, school, verified + joined badges, **Edit profile** (`devora-btn-outline`), profile strength bar (if &lt;100%), discovery preview card, stat grid (Major, Class rank, Age, Gender — each label uses a different gradient) |
| **Right** | Glass details card: Bio, Looking for, Experience & projects, Career focus, Interests (with "+N more"), Social links — each section title uses its mapped gradient + Public badge. Collapsible **Private details** (email, school). |

Sign out sits below the split (`page-btn-danger`). Edit mode replaces view with `AccountProfileEditor`.

#### Color

Follow **Account page color rule** above — calm neutrals; gradient only on page title + primary CTA.

#### Data source

All fields from Firestore `users/{uid}` — same as onboarding. No mock data.

| UI section | Schema fields |
|------------|---------------|
| Avatar | `photoURL` or initials from `firstName`/`lastName` |
| Quick facts | `major`, `classRank`, `age`, `gender` |
| Profile strength | Derived via `getProfileCompleteness()` |
| Discovery preview | `getDiscoveryTags()` + truncated bio |
| Looking for | `aboutYou` |
| Career focus | `careerNiche`, `careerNicheOther` |
| Interests | `casualInterests` |
| Socials | `links.github`, `links.linkedin`, `links.instagram` |
| Bio | `bio` |
| Experience | `experienceDetails` when `hasExperience` |
| Private | `email`, `school` |

**Deferred:** skills/tech stack, `users/{uid}/projects` subcollection, clubs.

#### Edit profile

- Toggle via **Edit profile** → full editor with onboarding pill options
- Saves via `updateAccountProfile()` — merge write, `updatedAt` only
- Photo upload reuses Storage `users/{uid}/avatar.{ext}`
- Bio rule: 20–150 characters (same as onboarding)

#### Components

```
src/ui/account/
  AccountPageContent.tsx
  AccountProfileView.tsx
  AccountDiscoveryPreview.tsx
  AccountProfileEditor.tsx
  AccountInfoCard.tsx
  account-helpers.ts
```

Reuse `PillGroup` from `src/ui/shared/PillGroup.tsx` and options from `onboarding-options.ts`.

---

## Component Architecture (when rebuilding)

```
src/ui/pages/
  shared/
    mock-data.ts          ← filter options, FAQ copy, mock profiles, gradient maps
  discovery-grid/
    DiscoveryGridLayout.tsx
  settings/
    SettingsLayout.tsx
  faqs/
    FaqsLayout.tsx
  messages/
    MessagesLayout.tsx    ← Activity Center inner UI

src/app/
  discovery-grid-page/page.tsx   ← RetroPageShell + titleClassName + Layout
  settings-page/page.tsx
  faqs-page/page.tsx
  messages-page/page.tsx         ← activeItem="Activity Center"
```

---

## Data Model (Firebase phase)

```
users/{uid}
  profile: { name, major, classYear, stack[], interests[], lookingFor[], clubs[], accentColor, avatarUrl }
  settings: { visibility, notifications, messagingPolicy, ... }

connections/{id}  →  users[], status: pending|accepted

conversations/{id}/messages/{msgId}  →  text, senderId, createdAt, read

events/{id}  →  title, date, location, tag, hostOrg

users/{uid}/blocked/{blockedUid}
```

### Auth

- `@umich.edu` email verification
- Onboarding: major, class year, initial tags
- Protected: Discovery Grid, Activity Center, Settings, Account
- Public: Home, FAQs

---

## UM-Dearborn Reference

- Majors: [CECS catalog](https://www.catalog.umd.umich.edu/undergraduate/college-engineering-computer-science/)
- Clubs: [VictorsLink](https://umdearborn.campuslabs.com/engage/) (150+ orgs)

---

## Anti-patterns (learned from concept passes)

- ❌ Flat cyan (`#22d3ee`) on account page — borders, badges, links, strength bar, avatar ring
- ❌ Flat basic pink (`#ff5ca8`) as the only accent on account/settings — use full gradient classes instead
- ❌ One accent color on every account element (all cyan or all pink)
- ❌ All-pink borders, icons, pills, toggles, chevrons
- ❌ Gradient text on every line of body copy, majors, or stack strings
- ❌ Opaque black panel behind entire profile grid (hides retro background)
- ❌ Nested `<span>` inside nav links (breaks click targets)
- ❌ `overflow-x-auto` on desktop nav pill
- ❌ 200px filter sidebar with 4 options
- ❌ Sparse settings (4 items total)
- ❌ 4 FAQs only
- ❌ Empty Activity Center tabs

---

## How to pin this doc

1. **Keep docs in `src/docs/`** — `DESIGN_SCOPE.md` is the UI source of truth
2. **Cursor rule** at `.cursor/rules/devora-design-scope.mdc`
3. **Git** — `git log src/docs/DESIGN_SCOPE.md` tracks design evolution
4. Mention `@src/docs/DESIGN_SCOPE.md` when starting a build task

---

*Last updated: Aug 31, 2026 — account page uses per-element Devora gradients (no flat cyan/pink). Settings toggles use devora gradient. Shell pages keep per-route title gradients.*

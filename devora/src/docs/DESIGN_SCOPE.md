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
| Voronoi shader backgrounds | **Live** — `PageLayout` + home hero |
| Nav + theme toggle | **Live** — right-aligned glass pill, full-link hit targets |
| Discovery Grid (`/find-students`) | **Shell** — Filters overlay live; student cards / peek deferred until Firestore browse ([discovery-grid.md](./discovery-grid.md)) |
| Settings, FAQs | **Live** — real Settings + FAQ accordion |
| Activity Center | **Shell** — coming-soon messaging |
| Account (`/account-page`) | **Live** — view + edit own profile from Firestore |
| Firebase / auth / real data | **Live** — Google sign-in (`@umich.edu`), onboarding, Firestore profiles |

### Nav links (current)

| Label | Route | Background |
|-------|-------|------------|
| Home | `/home` | Inline synthwave sky |
| Account | `/account-page` | Pyramids |
| Discovery Grid | `/find-students` | Voronoi via `PageLayout` |
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
| Discovery Grid | `page-title-grad` |
| Settings | `devora-gradient-text` |
| FAQs | `pink-grad` |
| Activity Center | `headline-grad` |

---

## Design Language

Match the **homepage synthwave glass aesthetic**. Do **not** make everything pink.

### Core principle

**Product:** Devora is for finding your people — friends, colleagues, career-niche networking. Not a “find a builder / ship projects / teammates” product. Copy, looking-for pills, and mock bios must say that.

**Color:** No flat cyan (`#22d3ee`) or basic single-color pink (`#ff5ca8`) as the only accent on cards, CTAs, search, or rings. Those read cheap.

Use **short 2–3 stop gradients** drawn from the existing Devora family (shader + wordmark): gold `#ffd76f`, orange `#ff9a3d`, magenta `#ff2bd6` / `#ff5ca8`, violet `#a855f7`. Orange→pink is one good pair, not the only pair — also gold→orange, magenta→violet, peach→magenta.

**Do not overdo gradients.** Names, page titles, and primary buttons can wear a pair. Body, majors, chip labels, and chrome stay glass / `theme-muted`. Never a busy 5-stop rainbow on buttons (avoid stacking orange + pink + magenta + purple + indigo on one control).

Pink is still a **gradient accent** on the homepage — marquee, hero glow, titles. Day-to-day UI uses those restrained pairs + glass, **not cyan outlines**.

### Devora gradient text (four variants)

Use these classes from `globals.css` — same as landing / How It Works:

| Class | Stops | Best for |
|-------|-------|----------|
| `.logo-gradient` | `#ffd76f → #ff9a3d → #ff2bd6` | Gold CTAs, People warm-family names, event tags |
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
| Cyan | `#22d3ee` | **Do not use as a solid People/search/ring accent.** Shader + wordmark palette instead. |
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
| Eyebrow labels (Major, Profile strength, How you appear) | `.account-section-eyebrow` muted uppercase |
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
- **Footer** (`.site-footer-bar`): one row — DEVORA wordmark, Privacy/Terms/FAQs/Contact, `© year Devora · Chris Shina · UM-Dearborn CECS`. `py-2.5`, small type, no stacked credit block and no 3D extrude stack that inflates height.

### Interactions

- Lenis smooth scroll on homepage only
- `ThemeProvider` — dark/light, `localStorage` key `devora-theme`
- Nav links: text directly on `<Link>`, no nested clickable spans; min 48px hit height

### Background assignment

| Page | File | Visual |
|------|------|--------|
| Account, Settings, FAQs, Discovery, Messages | `shared/backgrounds/PageLayout.tsx` | Voronoi shader via `BackgroundPicture` |
| Home hero | `home/hero/TopSection.tsx` | Voronoi shader (`VoronoiShaderBackgroundClient`) |
| Auth / onboarding chrome | `auth/layout/SignInPageLayout.tsx` | Voronoi shader |

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
| `.page-btn-outline` | Pill button with gradient label; People CTAs override the old cyan `::before` border |
| `.page-btn-grad-logo/devora/pink/headline` | Button label gradient variants — prefer short pairs; People uses `.discovery-btn-ember` / `.discovery-btn-violet` |
| `.page-btn-with-icon` + inner gradient span | Icon + gradient text buttons |
| `.page-btn-danger` | Destructive actions |
| `.page-icon-btn` | Circular icon buttons |
| `.page-checkbox` | Checkboxes (do not restyle as flat cyan on People) |
| `.site-footer-bar` | **Slim one-row footer** — wordmark + links + one credit line (`py-2.5`, not a stacked `py-8` block) |

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

**Route:** `/find-students` (do not rename) · **Nav / title:** Discovery Grid · **Shell:** `PageLayout wide` · **Title class:** `page-title-grad`  
**Copy:** Find friends, colleagues, and people in your career niche across CECS.  
**UI:** `src/ui/discovery/` — `DiscoveryGridContent.tsx` (filters live). Cards + peek are **not mounted**; rebuild from [discovery-grid.md](./discovery-grid.md).

Call this **Discovery Grid** in nav, page title, welcome, and settings. Do not relabel it “People”.

#### Layout (live today)

Title + description + **Filters** overlay. No student cards. Drawer is a left glass panel; the page behind it stays unblurred (no `backdrop-filter` on `.discovery-drawer-backdrop`).

#### Layout (when Firestore browse is wired)

Not a 2-column sticky sidebar. Full-width 4-up portrait cards. Filters stay a **left overlay drawer**. Profile peek is a **viewport overlay portaled to `document.body`** (z-index 240, above navbar 200) so the slim footer cannot paint over it.

```
┌─────────────────────────────────────────────────────┐
│  [Filters]  N students                              │
│  [ card ] [ card ] [ card ] [ card ]                │
│  [ card ] [ card ] [ card ] [ card ]                │
└─────────────────────────────────────────────────────┘
Filters button → glass drawer overlay
View profile → peek sheet (Connect / Connect with a message)
```

#### Filter overlay

- Search at top — **gold search icon**, not cyan
- 8 scrollable pill sections; section labels use `.page-section-label` + cycling gradients
- Active pills: short Devora pair fills (gold→orange, magenta→violet, orange→magenta) — not flat cyan/pink
- Inactive pills stay glass
- “Clear N filters” with `.page-btn-outline`

#### Filter sections & options

**CECS Major** (warm gold pair / `logo-gradient` when active):
Bioengineering, Computer & Information Science, Computer Engineering, Cybersecurity & Information Assurance, Data Science, Electrical Engineering, Engineering Mathematics, Human-Centered Engineering Design, Industrial & Systems Engineering, Manufacturing Engineering, Mechanical Engineering, Robotics Engineering, Software Engineering

**CIS / CIA Concentration** (magenta→violet / `devora-gradient-text`):
Artificial Intelligence, Computer Science, Information Systems, Game Design, Digital Forensics, Cybersecurity & Privacy

**Technical Niche** (gold / `pink-grad`):
Frontend, Backend, Full Stack, Mobile, Embedded Systems, FPGA / Hardware, Cloud & DevOps, UI/UX Design, AI / Machine Learning, Data Engineering, Cybersecurity, Robotics, Game Development, AR / VR, IoT, Systems Programming

**Hobbies & Activities** (orange→magenta / `headline-grad`):
Hackathons, Open Source, Photography, Fitness / Gym, Cooking, Hiking, Skateboarding, Basketball, Soccer, Chess, Board Games, Tabletop RPG, Cars & Motorsports, Art & Illustration, Volunteering, Entrepreneurship

**Media & Entertainment** (magenta→violet):
Anime, Marvel / DC, Sci-Fi, Horror, K-Drama, Hip-Hop, EDM, Rock, Jazz / Lo-Fi, Gaming — FPS, Gaming — RPG, Gaming — Fighting, Streaming, Podcasts, Reading, Film Photography

**Clubs & Orgs** (warm gold pair / `logo-gradient`):
ACM, IEEE, ISC Robotics, M@uto (Autonomous Vehicles), Dearborn Electric Racing, NSBE, SHPE, Society of Women Engineers, Game Dev Club, Cybersecurity Club, ECO, Circle K, First Gen Student Org, Swing Dearborn, BuildOn, VictorsLink Events

**Looking For** (gold — **people, not project teammates**):
Friend, Study Partner, Coffee Chat, Colleague, Mentor, Mentee, Gym Buddy, Gaming Squad, Lab Partner, Campus Events

**Class Year** (neutral):
Freshman, Sophomore, Junior, Senior, Graduate

#### Profile card (portrait)

Hierarchy: **PFP (large, centered) → Name → Major and class rank → Social links → career path + interests → View profile**

- Gradient **border** on the PFP (not a solid cyan/pink ring). Four families:
  - `cyan` key in data → **gold → orange** visually
  - `purple` → **magenta → violet**
  - `gold` → **gold → orange**
  - `pink` → **orange → magenta**
- **Name:** `.discovery-card-name` + that family’s 2–3 stop text gradient
- **Major · class rank:** muted (no gradient)
- **Socials:** GitHub / LinkedIn / Instagram icons when URLs exist
- **Tags:** glass chips with a short pair wash (not flat cyan fill)
- **Not a dump of looking-for / clubs / bio on the card face** — those belong in the peek
- “View profile”: `.page-btn-outline.page-btn-grad-logo`

**Not on card:** `email`, `gender`, `age`, `religion`, `signupReason`, full `experienceDetails`

#### Full-profile peek

- Glass sheet, grain, family wash matching the card accent
- Close (X), hero PFP + name + major + rank + socials
- Bio, then 2-col chips: Career path, Interests, Looking for, Clubs & orgs
- **Connect** (wordmark gold→orange→magenta) and **Connect with a message** (orange→magenta). Message is optional (`#discovery-connect-note`). After send: **Requested** (session-only until Firestore connections exist)
- Overlay must cover navbar + slim footer (`createPortal` to `document.body`)

#### Sample profiles (mock reference)

| Name | Major | Year | Looking for |
|------|-------|------|-------------|
| Alex Chen | CIS | Junior | Friend, Campus Events |
| Maya Hassan | CompE | Sophomore | Lab Partner, Study Partner |
| Jordan Lee | SE | Senior | Colleague, Mentor |
| (+ 9 more — cycle accent keys cyan/purple/gold/pink; paint them as the four pairs above) |

Bios talk about people, coffee, classes, career — **not** “shipping,” “looking for a teammate,” or “finding a builder.”

#### Firebase TODO

See [discovery-grid.md](./discovery-grid.md) for query gates, mapping, and conditional render. Do not remount `MOCK_PROFILES` as the live grid.

- Firestore compound filters on tags
- Full-text search on name
- Pagination / infinite scroll
- Saved filter presets
- Persist Connect / optional first message

---

### 2. Settings

**Route:** `/settings` · **Shell:** `PageLayout wide` · **Background:** City · **Title:** `devora-gradient-text`

#### Layout

2-column grid of `.glass-card` sections on desktop, single column mobile. Each card title uses a cycling Devora gradient.

#### Sections

| Card | Fields |
|------|--------|
| **Profile & Discovery** | Show profile to other students, show interests, show class year |
| **Messaging & Notifications** | New message, connection request, profile view, event invite, weekly digest; "Allow messages from" dropdown |
| **Appearance** | Dark / Light mode — **wire to `ThemeProvider`**; active mode label gets gradient text |
| **Privacy & Safety** | Online status, read receipts, blocked users, data export |
| **Account & Security** | Change email, reset password, 2FA, GitHub/Google connect, sign out all devices |
| **Danger Zone** | **Deactivate** (`isDeactivated` + hide from People, reversible). **Delete** (Google reauth → wipe Storage + Firestore + Auth). |

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
6. How does People work?
7. What should I put on my profile?
8. How does messaging work?
9. Will Devora show CECS events and workshops?
10. Does Devora work on mobile?

**Privacy & Safety** (`pink-grad`)
11. Can I hide my profile from other students?
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
| **Left** | Avatar (gold/magenta ring), display name (`headline-grad`), subtitle, school, verified + joined badges, **Edit profile**, profile strength bar (if &lt;100%), “How you appear” preview, info grid (Major, Class rank, Age, Gender), Sign out under the info grid |
| **Right** | Glass details: Bio, Looking for, Experience, Career focus, Interests, Social links. |

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
| Discovery preview | `getDiscoveryTags()` + truncated bio (“How you appear” / Public to students) |
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
src/ui/discovery/
  DiscoveryGridContent.tsx   ← filters overlay + card grid + peek portal
  filter-options.ts
  mock-profiles.ts
  cards/                     DiscoveryProfileCard, Peek, Avatar, social SVGs
  filters/                   DiscoveryFilterSidebar

src/app/find-students/page.tsx   ← PageLayout wide + title Discovery Grid
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
- Protected: People, Activity Center, Settings, Account
- Public: Home, FAQs

---

## UM-Dearborn Reference

- Majors: [CECS catalog](https://www.catalog.umd.umich.edu/undergraduate/college-engineering-computer-science/)
- Clubs: [VictorsLink](https://umdearborn.campuslabs.com/engage/) (150+ orgs)

---

## Anti-patterns (learned from concept passes)

- ❌ Flat cyan (`#22d3ee`) on People cards, search, avatar rings, or peek buttons
- ❌ Flat basic pink (`#ff5ca8`) as the only accent — use a short pair instead
- ❌ One accent color on every account element (all cyan or all pink)
- ❌ Busy rainbow button gradients (5+ stops)
- ❌ Relabeling Discovery Grid as “People” in nav, titles, or welcome copy
- ❌ Mock student grid on `/find-students` before Firestore browse exists
- ❌ `backdrop-filter` blur on the Filters overlay (page behind the drawer must stay sharp)
- ❌ “View Grid” / “find a builder” / “ship together” in live UI copy
- ❌ Left vertical accent rails on cards, peek, FAQ, or settings
- ❌ Peek trapped in the page column (footer paints over it) — portal to `document.body`
- ❌ Tall stacked footer (`py-8` + wordmark + links + two credit blocks) — keep the slim bar
- ❌ All-pink borders, icons, pills, toggles, chevrons
- ❌ Gradient text on every line of body copy, majors, or stack strings
- ❌ Opaque black panel behind the whole People grid (hides the shader)
- ❌ Nested `<span>` inside nav links (breaks click targets)
- ❌ Persistent 2-column filter sidebar on People (filters are an overlay)
- ❌ Dumping looking-for / clubs / full bio on the card face
- ❌ Empty Activity Center tabs

---

## How to pin this doc

1. **Keep docs in `src/docs/`** — `DESIGN_SCOPE.md` is the UI source of truth
2. **Cursor rule** at `.cursor/rules/devora-design-scope.mdc`
3. **Git** — `git log src/docs/DESIGN_SCOPE.md` tracks design evolution
4. Mention `@src/docs/DESIGN_SCOPE.md` when starting a build task

---

*Last updated: Sep 16, 2026 — Discovery Grid filters-only shell; card grid deferred to discovery-grid.md; filter overlay does not blur the page.*

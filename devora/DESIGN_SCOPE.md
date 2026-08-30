# Devora Design Scope

> **📌 PINNED REFERENCE** — This is the source of truth for Devora's UI design.  
> Concept layouts were removed from the codebase (Aug 2026) after visual testing. **Rebuild from this doc**, not from memory.  
> A Cursor rule (`.cursor/rules/devora-design-scope.mdc`) points agents here automatically.

---

## Current Live State

| What | Status |
|------|--------|
| Homepage (`/hero-page`) | **Live** — full landing |
| Retro backgrounds | **Live** — Peaks, City, Pyramids via `RetroPageShell` |
| Nav + theme toggle | **Live** |
| Discovery Grid, Settings, FAQs, Activity Center | **Shell only** — title + retro background, no inner UI |
| Account | **Shell only** |
| Firebase / auth / real data | **Not started** |

### Nav links (current)

| Label | Route | Background |
|-------|-------|------------|
| Home | `/hero-page` | Inline synthwave sky |
| Account | `/account-page` | Pyramids |
| Discovery Grid | `/discovery-grid-page` | Peaks |
| Settings | `/settings-page` | City |
| FAQs | `/faqs-page` | Peaks |
| Activity Center | `/messages-page` | Pyramids |

---

## Design Language

Match the **homepage synthwave glass aesthetic**. Do **not** make everything pink.

### Core principle

Pink (`#ff5ca8`) is a **gradient accent** — used in titles, marquee, hero glow. Day-to-day UI uses **cyan, purple, gold**, and neutral glass borders.

### Color palette

| Token | Hex | Use |
|-------|-----|-----|
| Cyan | `#22d3ee` | Primary UI accent — search icons, active tabs, toggles, buttons, chapter labels |
| Purple | `#a855f7` | Secondary accent — pills, unread badges, gradients |
| Gold | `#ffd76f` | Tertiary accent — event tags, niche pills |
| Pink | `#ff5ca8` | Gradient titles (`pink-grad`), marquee, hero — **not** every border |
| Page bg (dark) | `#08040f` | `--page-bg` |
| Glass panel | `rgba(10, 4, 20, 0.28)` | Sidebars, panels |
| Glass card | `rgba(10, 4, 20, 0.38)` | Individual cards floating over background |
| Border | `rgba(255, 255, 255, 0.08–0.10)` | Neutral glass borders |

### Typography

- Headings: `font-display`, page titles use `pink-grad` (in `RetroPageShell`)
- Body: `theme-body`, `theme-muted`, `theme-faint`, `theme-heading`
- Section labels: `.page-chapter-label` — cyan, uppercase, wide tracking (matches landing `01 — THE PLATFORM` style)

### Surfaces

- **Panels** (`.page-panel`): glass sidebar containers, blur 18px, subtle white inset highlight
- **Cards** (`.glass-card`): individual floating cards — **background scene must show between cards**, never one opaque black slab behind the whole grid
- **Landing cards** (`.neon-card`): homepage feature cards — slightly more opaque, pink hover glow OK on landing only

### Interactions

- `SplashCursor` on all pages
- Lenis smooth scroll on homepage only
- `ThemeProvider` — dark/light, persisted to `localStorage` key `devora-theme`

### Background assignment

| Page | Scene file | Visual |
|------|------------|--------|
| Discovery Grid, FAQs | `peaks-scene.tsx` | Mountain peaks, grid floor |
| Settings | `city-scene.tsx` | City skyline |
| Activity Center, Account | `pyramids-scene.tsx` | Desert pyramids |
| Home | Inline in `LandingHero` | Sun, city silhouettes, grid |

---

## CSS Utilities (already in `globals.css`)

Rebuild pages using these — do not reinvent:

| Class | Purpose |
|-------|---------|
| `.page-panel` | Glass sidebar / outer panel |
| `.glass-card` | Profile, setting, FAQ accordion cards |
| `.page-pill` + `.page-pill-cyan/purple/gold/pink` | Filter / category pills |
| `.page-pill-active` | Selected pill glow |
| `.page-tab-active` | Cyan→purple gradient tab |
| `.page-chapter-label` | Cyan section header |
| `.page-divider` | Neutral `border-white/8` dividers |
| `.page-search-wrap` / `.page-search-input` | Rounded search fields |
| `.page-btn-outline` | Cyan-bordered pill buttons |
| `.page-btn-danger` | Red destructive actions |
| `.page-icon-btn` | Circular icon buttons |
| `.page-checkbox` | Cyan accent checkboxes |

---

## Page Specs (to rebuild)

### 1. Discovery Grid

**Route:** `/discovery-grid-page` · **Shell:** `RetroPageShell wide` · **Background:** Peaks

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
- 8 scrollable pill sections with color-coded accents
- Pills toggle active state + "Clear N filters" footer
- Section label uses `.page-chapter-label`

#### Filter sections & options

**CECS Major** (cyan):
Bioengineering, Computer & Information Science, Computer Engineering, Cybersecurity & Information Assurance, Data Science, Electrical Engineering, Engineering Mathematics, Human-Centered Engineering Design, Industrial & Systems Engineering, Manufacturing Engineering, Mechanical Engineering, Robotics Engineering, Software Engineering

**CIS / CIA Concentration** (purple):
Artificial Intelligence, Computer Science, Information Systems, Game Design, Digital Forensics, Cybersecurity & Privacy

**Technical Niche** (gold):
Frontend, Backend, Full Stack, Mobile, Embedded Systems, FPGA / Hardware, Cloud & DevOps, UI/UX Design, AI / Machine Learning, Data Engineering, Cybersecurity, Robotics, Game Development, AR / VR, IoT, Systems Programming

**Hobbies & Activities** (pink):
Hackathons, Open Source, Photography, Fitness / Gym, Cooking, Hiking, Skateboarding, Basketball, Soccer, Chess, Board Games, Tabletop RPG, Cars & Motorsports, Art & Illustration, Volunteering, Entrepreneurship

**Media & Entertainment** (purple):
Anime, Marvel / DC, Sci-Fi, Horror, K-Drama, Hip-Hop, EDM, Rock, Jazz / Lo-Fi, Gaming — FPS, Gaming — RPG, Gaming — Fighting, Streaming, Podcasts, Reading, Film Photography

**Clubs & Orgs** (cyan):
ACM, IEEE, ISC Robotics, M@uto (Autonomous Vehicles), Dearborn Electric Racing, NSBE, SHPE, Society of Women Engineers, Game Dev Club, Cybersecurity Club, ECO, Circle K, First Gen Student Org, Swing Dearborn, BuildOn, VictorsLink Events

**Looking For** (gold) — *not career/job goals*:
Study Partner, Project Teammate, Hackathon Squad, Gym Buddy, Gaming Squad, Mentor, Mentee, Coffee Chat, Lab Partner, Capstone Team

**Class Year** (neutral):
Freshman, Sophomore, Junior, Senior, Graduate

#### Profile card fields

- Avatar circle with accent border + glow (initials until photo upload)
- Name, major, class year
- Stack string (e.g. `React · TypeScript · Python`)
- 2–3 interest tag chips
- "View profile" outline button

#### Sample profiles (mock reference)

| Name | Major | Year | Stack | Interests |
|------|-------|------|-------|-----------|
| Alex Chen | CIS | Junior | React · TS · Python | Hackathons, Anime, ACM |
| Maya Hassan | CompE | Sophomore | C++ · Embedded · MATLAB | IEEE, Robotics, Sci-Fi |
| Jordan Lee | SE | Senior | Node · AWS · Docker | Open Source, Gaming RPG, Capstone |
| (+ 9 more in original mock — vary accents across cyan/purple/gold/pink) |

#### Firebase TODO

- Firestore compound filters on tags
- Full-text search on name/stack
- Pagination / infinite scroll
- Saved filter presets

---

### 2. Settings

**Route:** `/settings-page` · **Shell:** `RetroPageShell wide` · **Background:** City

#### Layout

2-column grid of `.glass-card` sections on desktop, single column mobile.

#### Sections

| Card | Fields |
|------|--------|
| **Profile & Discovery** | Show profile publicly, appear in grid, show skills, show interests, show class year |
| **Messaging & Notifications** | New message, connection request, profile view, event invite, weekly digest; "Allow messages from" dropdown (Everyone / Connections only / No one) |
| **Appearance** | Dark / Light mode toggle — **wire to existing `ThemeProvider`** |
| **Privacy & Safety** | Online status, read receipts, blocked users list, data export |
| **Account & Security** | Change email, reset password, 2FA, GitHub/Google connect, sign out all devices |
| **Danger Zone** | Deactivate account, delete account (`.page-btn-danger`) |

Toggle switches: cyan when on (purple variant OK for privacy toggles).

---

### 3. FAQs

**Route:** `/faqs-page` · **Shell:** `RetroPageShell` · **Background:** Peaks

#### Features

- Search bar (filters question + answer text)
- Category pills: All, About Devora, Using the Platform, Privacy & Safety, Account & CECS
- Accordion items in `.glass-card`, cyan chevron, category label above question

#### All 16 FAQ items

**About Devora**
1. What inspired you to make Devora?
2. How is Devora different from LinkedIn and Discord?
3. How does this compare to meeting someone in person?
4. What's the benefit vs. just approaching someone directly?
5. What's on the roadmap after launch?

**Using the Platform**
6. How does the Discovery Grid work?
7. What should I put on my profile?
8. How does messaging work?
9. Will Devora show CECS events and workshops?
10. Does Devora work on mobile?

**Privacy & Safety**
11. Can I hide my profile from Discovery?
12. What if someone makes me uncomfortable?
13. Can I download or delete my data?

**Account & CECS**
14. Who can join Devora?
15. How does CECS verification work?
16. Is Devora free?

*(Full answer copy was in removed `mock-data.ts` — restore from git history or rewrite when rebuilding.)*

---

### 4. Activity Center

**Route:** `/messages-page` · **Nav label:** Activity Center · **Shell:** `RetroPageShell wide` · **Background:** Pyramids

#### Layout

Single `.page-panel` container with vertical tab sidebar (desktop) / horizontal scroll tabs (mobile).

#### Tabs

| Tab | Content |
|-----|---------|
| **Messages** | Split pane: conversation list (300–340px) + thread preview with compose input. Unread badges (purple), online dot (cyan). |
| **Connections** | Grid of connection cards — avatar, name, major, mutual count, Message button |
| **Events** | Event cards — gold tag pill, title, date, location, RSVP button |
| **Activity Feed** | Timeline of connection activity ("Alex joined a capstone team…") |

#### Sample mock data

**Conversations:** Alex Chen (2m, unread), Maya Hassan (1h, unread), Jordan Lee, Sam Rivera, Priya Patel, Chris Nguyen

**Events:** ACM Firebase Talk, CECS Hackathon Kickoff, IEEE Resume Review, ISC Robotics Open Lab

**Connections:** 6 cards with mutual connection counts

---

### 5. Account (not yet designed)

**Route:** `/account-page` · **Background:** Pyramids

Full profile editor: avatar, bio, stack tags, interest tags, projects, clubs, looking-for tags. Reuse Discovery Grid pill components.

---

## Component Architecture (when rebuilding)

```
src/ui/pages/
  shared/
    mock-data.ts          ← filter options, FAQ copy, mock profiles
  discovery-grid/
    DiscoveryGridLayout.tsx
  settings/
    SettingsLayout.tsx
  faqs/
    FaqsLayout.tsx
  messages/
    MessagesLayout.tsx    ← Activity Center inner UI

src/app/
  discovery-grid-page/page.tsx   ← RetroPageShell + Layout
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

## Anti-patterns (learned from concept pass)

- ❌ All-pink borders, icons, pills, toggles, chevrons
- ❌ Opaque black panel behind entire profile grid (hides retro background)
- ❌ 200px filter sidebar with 4 options
- ❌ Sparse settings (4 items total)
- ❌ 4 FAQs only
- ❌ Empty Activity Center tabs

---

## How to pin this doc

1. **Keep `DESIGN_SCOPE.md` in repo root** — do not delete
2. **Cursor rule** at `.cursor/rules/devora-design-scope.mdc` — agents read this before building app pages
3. **Git** — this file is versioned; `git log DESIGN_SCOPE.md` tracks design evolution
4. **Optional:** bookmark the file in your editor; mention "@DESIGN_SCOPE.md" in chat when starting a build task

---

*Last updated: concept layouts removed, design archived here. Rebuild when Firebase phase begins.*

# Discovery Grid — rebuild when Firestore browse exists

> Design + data-flow notes for `/find-students`.  
> **Live today:** page chrome + Filters overlay (no page blur).  
> **Not live:** student cards, peek, Connect. Do not remount `MOCK_PROFILES` as the product grid.  
> Visual bible: [DESIGN_SCOPE.md](./DESIGN_SCOPE.md) §1. Schema: [firestore-schema.md](./firestore-schema.md).

---

## Why the grid is off

The mock 12-card grid was a visual stand-in. Real browse needs `users/{uid}` queries, `isPublic` / `onboardingComplete` / `isDeactivated` gates, and empty/loading/error UI. Until that data flow exists, `/find-students` is a **shell**: title + Filters drawer. Card CSS and components stay in the repo so you can mount them against real documents instead of inventing the look again.

---

## Live vs deferred

| Piece | Status | Where |
|-------|--------|--------|
| Nav / title **Discovery Grid** | Live | `NavBar`, `src/app/find-students/page.tsx` |
| Filters overlay (search + 8 pill sections) | Live | `DiscoveryGridContent` + `filters/DiscoveryFilterSidebar.tsx` |
| Filter selection state | Live (local) | `query` + `selected` in `DiscoveryGridContent` |
| 4-up card grid | Deferred | `cards/DiscoveryProfileCard.tsx` + `.discovery-grid` |
| Profile peek + Connect | Deferred | `cards/DiscoveryProfilePeek.tsx` |
| Mock students | Reference only | `mock-profiles.ts` — **do not import into the live page** |

---

## Layout to remount

```
┌─────────────────────────────────────────────────────┐
│  [Filters]  N students                              │
│  [ card ] [ card ] [ card ] [ card ]                │
│  [ card ] [ card ] [ card ] [ card ]                │
└─────────────────────────────────────────────────────┘
Filters button → left glass drawer (no backdrop blur)
View profile → peek portaled to document.body (z-index 240)
```

- Not a persistent 2-column sidebar.
- Desktop: 4 columns (`.discovery-grid`). Collapse at the existing breakpoints in `globals.css`.
- Toolbar: Filters pill + live count (`N student(s)`). Count comes from the **filtered query result**, not mock length.

---

## Conditional rendering (the actual grid)

Mount cards only after auth + query settle. Suggested tree inside `DiscoveryGridContent`:

```
signed out            → router.replace("/auth/login")  (if this route is protected)
auth still resolving  → spinner (same language as Account)
query loading         → skeleton or spinner in .discovery-grid
query error           → short retry message (no fake cards)
0 public students     → .discovery-empty “No students to show yet.”
0 after filters       → .discovery-empty “No students match these filters…”
N results             → .discovery-grid of DiscoveryProfileCard
```

**Hide a user from browse when any of these is true:**

- `onboardingComplete !== true`
- `isPublic !== true` (Settings: “Show profile to other students”)
- `isDeactivated === true` (Danger Zone; also forces `isPublic: false`)
- The viewer’s own uid (optional: skip self, or show “That’s you” — pick one and stick to it)

**Peek:** only if a card exists in the current result list. Close on Escape / backdrop / X. Do not open peek from a stale id after filters change.

**Connect:** session-local `requestedIds` is fine until a `connections` write exists. Then: pending vs accepted vs none.

---

## Data flow

1. `onAuthStateChanged` — wait for a user if the page is protected (DESIGN_SCOPE lists this route as protected).
2. Query `users` where `isPublic == true` && `onboardingComplete == true`.  
   Deactivated docs should already have `isPublic: false`; still skip `isDeactivated` if it can drift.
3. Map each `UserProfile` → card props (see below). Use `photoURL` for PFP; fall back to initials in `DiscoveryAvatar`.
4. Apply **client** filters for v1 multi-section OR-within / AND-across (same logic as `profileMatchesFilters` in `mock-profiles.ts`). Firestore cannot AND every pill combination without a combinatorial index explosion.
5. Name search: client substring on `displayName` / major / tags for v1; Algolia later.
6. Pagination / infinite scroll is a later TODO — start with one page of public profiles.

### Map Firestore → card

| Card / peek UI | `users/{uid}` field |
|----------------|---------------------|
| Name | `displayName` |
| PFP | `photoURL` |
| Major line | `major` (shorten on the card if you want CIS / CompE) |
| Class rank | `classRank` |
| Career path chips | `careerNiche` (card: first 3; peek: all) |
| Interest chips | `casualInterests` (same) |
| Socials | `links.github` / `linkedin` / `instagram` — omit icon if empty |
| Bio snippet | `bio` (card clamp 2 lines; peek full) |
| Looking for | `aboutYou` — **peek only** |
| Clubs | not in onboarding v1 — peek only when the field exists |
| Accent | cycle `cyan` / `purple` / `gold` / `pink` by index (data key stays those four names; CSS paints shader-family pairs) |

**Never on card or peek:** `email`, `gender`, `age`, `religion`, `signupReason`.

Filter pill strings must match onboarding options / `filter-options.ts` exactly.

---

## Components to mount (already in repo)

```
src/ui/discovery/
  DiscoveryGridContent.tsx     live shell — add grid + peek here
  filter-options.ts            pill copy + emptyFilterSelection + countActiveFilters
  mock-profiles.ts             DiscoveryProfile type + profileMatchesFilters (reference)
  filters/DiscoveryFilterSidebar.tsx
  cards/DiscoveryProfileCard.tsx
  cards/DiscoveryProfilePeek.tsx
  cards/DiscoveryAvatar.tsx
  cards/DiscoverySocialIcons.tsx
```

Peek and the filter drawer use `createPortal(..., document.body)` so the slim footer cannot cover them. Keep that.

---

## CSS (do not reinvent)

All under `/* Discovery Grid */` in `src/ui/globals.css`:

| Class | Role |
|-------|------|
| `.discovery-root` / `.discovery-toolbar` | Page body + Filters row |
| `.discovery-menu-btn` / `.discovery-menu-badge` / `.discovery-count` | Open filters + active count + result count |
| `.discovery-grid` | 4-up portrait grid |
| `.discovery-card` + `[data-accent]` | Card chrome |
| `.discovery-empty` | Zero-result copy |
| `.discovery-drawer` / `.discovery-drawer-backdrop` | Overlay; **backdrop must stay unblurred** |
| `.discovery-peek` / `.discovery-peek-backdrop` | Peek sheet; dim+blur on peek only is OK |
| `.discovery-tag` / `.discovery-chip-*` / `.discovery-social-*` | Pills + icons |

Peek backdrop may dim. **Filter backdrop must not use `backdrop-filter`** — the Voronoi page stays sharp.

---

## Filters (already live)

Eight sections — copy and gradients: DESIGN_SCOPE §1 “Filter sections & options”.

AND across sections, OR within a section (see `profileMatchesFilters`). Search is case-insensitive across name, major, concentration, niches, interests, looking-for, clubs.

---

## Card hierarchy (when mounted)

**PFP (large, centered) → Name → Major and class rank → Socials → career path + interests → View profile**

- Gradient **border** on the PFP, not a flat cyan/pink ring
- Name: `.discovery-card-name` + accent family gradient
- Major · rank: muted
- Not a dump of looking-for / clubs / full bio on the card face

## Peek (when mounted)

Glass sheet, grain, matching accent wash. Close, hero, bio, 2-col chips (Career path, Interests, Looking for, Clubs). **Connect** (gold→orange→magenta) and **Connect with a message** (optional `#discovery-connect-note`, max 200). After send: **Requested**.

---

## Firebase TODO (grid)

- Compound indexes: `isPublic + major`, `isPublic + classRank`, array niches/interests
- Pagination
- Persist Connect / optional first message on `connections`
- Saved filter presets

---

## Anti-patterns for this page

- Remounting `MOCK_PROFILES` on `/find-students` once real users exist
- Blurring the whole page behind Filters (`backdrop-filter` on `.discovery-drawer-backdrop`)
- Persistent 2-column filter sidebar
- Flat cyan on search icon, avatar rings, or peek buttons
- Calling this page **People** in nav or title
- Peek stuck inside `PageLayout` (footer overlap)

*Last updated: Sep 16, 2026*

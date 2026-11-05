# Discovery Grid — live Firestore browse

> Design + data-flow notes for `/find-students`.  
> **Live today:** page chrome + Filters overlay + conditional card grid + peek.  
> **Not mounted:** `MOCK_PROFILES` — reference only for types / filter helpers.  
> Visual bible: [DESIGN_SCOPE.md](./DESIGN_SCOPE.md) §1. Schema: [firestore-schema.md](./firestore-schema.md).

---

## Live vs deferred

| Piece | Status | Where |
|-------|--------|--------|
| Nav / title **Discovery Grid** | Live | `NavBar`, `src/app/find-students/page.tsx` |
| Filters overlay (search + 8 pill sections) | Live | `DiscoveryGridContent` + `filters/DiscoveryFilterSidebar.tsx` |
| Filter selection state | Live (local) | `query` + `selected` in `DiscoveryGridContent` |
| 4-up card grid | Live (Firestore) | `cards/DiscoveryProfileCard.tsx` + `.discovery-grid` |
| Profile peek + Connect | Live (Connect session-local) | `cards/DiscoveryProfilePeek.tsx` |
| Mock students | Reference only | `mock-profiles.ts` — **do not import into the live page** |

---

## Layout

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
- Toolbar: Filters pill + live count (`N student(s)`). Count comes from the **filtered query result**.

---

## Conditional rendering (signed-up users)

Mount cards only after auth + query settle. Tree inside `DiscoveryGridContent`:

```
signed out            → router.replace("/auth/login")
unfinished onboarding → router.replace("/onboarding")
auth / query loading  → spinner (same language as Account)
query error           → short retry message (no fake cards)
0 public students     → .discovery-empty “seats still open”
0 after filters       → .discovery-empty + Clear filters
N results             → .discovery-grid of DiscoveryProfileCard
```

**Hide a user from browse when any of these is true:**

- `onboardingComplete !== true`
- `isPublic !== true` (Settings: “Show profile to other students”)
- `isDeactivated === true` (Danger Zone; also forces `isPublic: false`)
- The viewer’s own uid (skip self)

**Peek:** only if a card exists in the current result list. Close on Escape / backdrop / X. Do not open peek from a stale id after filters change.

**Connect:** session-local `requestedIds` until a `connections` write exists.

---

## Data flow

1. `onAuthStateChanged` — wait for a signed-in user (protected route).
2. Confirm `onboardingComplete`; otherwise send them back to the wizard.
3. Query `users` where `isPublic == true`.  
   Client also skips unfinished / deactivated / self (`buildDiscoveryBrowseList`).
4. Map each `UserProfile` → card props. Use `photoURL` for PFP; fall back to initials in `DiscoveryAvatar`.
5. Apply **client** filters (OR within a section, AND across sections — `profileMatchesFilters`).
6. Name search: client substring on name / major / tags for v1.
7. Pagination / infinite scroll is a later TODO — one page of public profiles for now.

### Map Firestore → card

| Card / peek UI | `users/{uid}` field |
|----------------|---------------------|
| Name | `displayName` |
| PFP | `photoURL` |
| Major line | `major` |
| Class rank | `classRank` (honors `showClassYear`) |
| Career path chips | `careerNiche` (honors `showSkills`) |
| Interest chips | `casualInterests` (honors `showInterests`) |
| Socials | `links.github` / `linkedin` / `instagram` |
| Bio snippet | `bio` |
| Looking for | `aboutYou` — peek only |
| Accent | cycle `cyan` / `purple` / `gold` / `pink` by index |

**Never on card or peek:** `email`, `gender`, `age`, `religion`, `signupReason`.

---

## Components

```
src/ui/discovery/
  DiscoveryGridContent.tsx     auth gates + browse states + peek
  filter-options.ts
  mock-profiles.ts             DiscoveryProfile type + profileMatchesFilters (reference)
  map-discovery-profile.ts     Firestore → card props
  filters/DiscoveryFilterSidebar.tsx
  cards/DiscoveryProfileCard.tsx
  cards/DiscoveryProfilePeek.tsx
  cards/DiscoveryAvatar.tsx
  DiscoveryEmptyState.tsx
```

---

## Anti-patterns for this page

- Remounting `MOCK_PROFILES` on `/find-students` as the product grid
- Blurring the whole page behind Filters (`backdrop-filter` on `.discovery-drawer-backdrop`)
- Persistent 2-column filter sidebar
- Flat cyan on search icon, avatar rings, or peek buttons
- Calling this page **People** in nav or title
- Peek stuck inside `PageLayout` (footer overlap)

*Last updated: Oct 26, 2026*

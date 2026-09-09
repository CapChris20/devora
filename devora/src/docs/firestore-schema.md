# Firestore Schema: Devora

> **Source of truth** for user profiles, onboarding data, and Discovery Grid profile cards.  
> Auth is **Google only** with `@umich.edu` emails.

---

## Overview

- **Top-level `users`** — profiles, onboarding answers, browse/filter data
- **Subcollections** — projects, notifications (unchanged from v1 plan)
- **Firebase Storage** — `users/{uid}/avatar.{ext}` for optional profile photos

---

## Auth + signup fields

Collected on `/auth/signup` before Google sign-in:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `firstName` | string | yes | Signup form |
| `lastName` | string | yes | Signup form |
| `email` | string | yes | From Google; `@umich.edu` only |
| `displayName` | string | yes | `{firstName} {lastName}` |
| `onboardingComplete` | boolean | yes | `false` until step 5 finishes |
| `school` | string | yes | `"University of Michigan-Dearborn"` |
| `isPublic` | boolean | yes | `false` until onboarding done; then `true` |
| `createdAt` | timestamp | yes | |
| `updatedAt` | timestamp | yes | |

Login (`/auth/login`) uses Google only — no extra fields. If no profile exists, names fall back from Google `displayName`.

---

## Onboarding field map (5 steps)

### Step 1 — Who you are

| Field | Type | Required | On card? | Filterable? |
|-------|------|----------|----------|-------------|
| `classRank` | string | yes | yes (with major) | yes |
| `gender` | string | yes | no | no |
| `age` | string | yes | no | no |

### Step 2 — Career path & major

| Field | Type | Required | On card? | Filterable? |
|-------|------|----------|----------|-------------|
| `major` | string | yes | yes | yes |
| `careerNiche` | string[] | yes | yes (top 1–2 tags) | yes |
| `careerNicheOther` | string | no | no | no |
| `hasExperience` | boolean | yes | no | no |
| `experienceDetails` | string | if `hasExperience` | profile only | no |

### Step 3 — About you & interests

| Field | Type | Required | On card? | Filterable? |
|-------|------|----------|----------|-------------|
| `casualInterests` | string[] | yes | yes (2–3 tags) | yes |
| `aboutYou` | string[] | yes | no | yes (v1) |
| `religion` | string | no | **never** | **never** |

**Religion disclaimer (UI):** Optional — shared only to help classmates connect personally. Never used for discrimination or judgment.

### Step 4 — Why Devora

| Field | Type | Required | On card? | Filterable? |
|-------|------|----------|----------|-------------|
| `signupReason` | string[] | yes | no | no (internal/analytics) |

### Step 5 — Bio & socials

| Field | Type | Required | On card? | Filterable? |
|-------|------|----------|----------|-------------|
| `bio` | string | yes (20–150 chars) | yes (truncated ~80 chars) | no |
| `photoURL` | string | no | yes (avatar) | no |
| `links` | map | no | profile only | no |
| `links.github` | string | no | profile only | no |
| `links.linkedin` | string | no | profile only | no |
| `links.instagram` | string | no | profile only | no |

On completion: `onboardingComplete: true`, `isPublic: true`.

---

## Discovery Grid profile card

What renders on each `.glass-card` in `/find-students`:

```
┌─────────────────────────────┐
│  [avatar]  Alex Chen        │  photoURL or initials; displayName (gradient)
│            CIS · Junior     │  major · classRank (muted)
│  Frontend · Hackathons      │  careerNiche + casualInterests (max 3–4, muted)
│  "Building a capstone..."   │  bio truncated ~80 chars
│  [ View profile ]           │
└─────────────────────────────┘
```

### Privacy tiers

| Tier | Fields | Where shown |
|------|--------|-------------|
| **Public (card + browse)** | `displayName`, `photoURL`, `major`, `classRank`, `careerNiche`, `casualInterests`, `bio` (snippet) | Discovery Grid |
| **Profile only** | `experienceDetails`, `links`, `gender`, `age`, `careerNicheOther` | Account page + future View profile |
| **Private** | `email`, `religion`, `signupReason` | Never on cards; not in browse queries |

`isPublic: false` excludes user from Discovery Grid queries (Settings toggle).

`isDeactivated: true` (Settings → Danger zone) also forces `isPublic: false`. Profile data stays. Login sends them to `/auth/deactivated` until they reactivate. Delete account removes Storage files, `users/{uid}` (plus `projects` / `notifications` subcollections), and the Firebase Auth user.

### Account page (`/account-page`)

Signed-in user views and edits their own `users/{uid}` document.

| Shown on Account | Fields |
|------------------|--------|
| Sidebar + details | `displayName`, `photoURL`, `school`, `email`, `createdAt`, `major`, `classRank`, `age`, `casualInterests`, `careerNiche`, `careerNicheOther`, `aboutYou`, `links`, `bio`, `experienceDetails` |
| Editable in editor | Same as above except `email` and `createdAt` (read-only) |
| Hidden on Account | `religion`, `signupReason`, `gender` (editable but not in sidebar summary) |

Updates use `updateAccountProfile()` — partial merge, does not reset `onboardingComplete` or `isPublic`.

---

## Full `users/{uid}` document

**Document ID:** Firebase Auth UID

```ts
{
  // Auth + signup
  email: string,
  firstName: string,
  lastName: string,
  displayName: string,

  // Step 1
  classRank: string,
  gender: string,
  age: string,

  // Step 2
  major: string,
  careerNiche: string[],
  careerNicheOther?: string,
  hasExperience: boolean,
  experienceDetails?: string,

  // Step 3
  casualInterests: string[],
  aboutYou: string[],
  religion?: string,

  // Step 4
  signupReason: string[],

  // Step 5
  bio: string,
  photoURL?: string,
  links?: {
    github?: string,
    linkedin?: string,
    instagram?: string,
  },

  // Meta
  school: "University of Michigan-Dearborn",
  isPublic: boolean,
  isDeactivated?: boolean,
  deactivatedAt?: timestamp | null,
  onboardingComplete: boolean,
  lastActiveAt?: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

---

## Example documents

### Alex Chen (Discovery card)

```json
{
  "displayName": "Alex Chen",
  "firstName": "Alex",
  "lastName": "Chen",
  "major": "Computer & Information Science",
  "classRank": "Junior",
  "careerNiche": ["Frontend", "Full Stack"],
  "casualInterests": ["Hackathons", "Anime", "Open Source"],
  "bio": "Building a capstone app with React and looking for a backend partner.",
  "isPublic": true,
  "onboardingComplete": true
}
```

### Maya Hassan

```json
{
  "displayName": "Maya Hassan",
  "major": "Computer Engineering",
  "classRank": "Sophomore",
  "careerNiche": ["Embedded Systems", "Robotics"],
  "casualInterests": ["IEEE", "Robotics", "Sci-Fi"],
  "bio": "Interested in embedded systems and robotics club projects.",
  "isPublic": true,
  "onboardingComplete": true
}
```

---

## Filter alignment (Discovery Grid v1)

| DESIGN_SCOPE filter section | Schema field | v1 onboarding? |
|----------------------------|--------------|----------------|
| CECS Major | `major` | yes |
| Class Year | `classRank` | yes |
| Technical Niche | `careerNiche` | yes |
| Hobbies & Activities | `casualInterests` | yes |
| Looking For | `aboutYou` | yes |
| CIS Concentration | — | future |
| Clubs & Orgs | — | future |
| Media & Entertainment | — | future |

---

## Query patterns

| Feature | Query |
|---------|-------|
| Discovery Grid browse | `users` where `isPublic == true` && `onboardingComplete == true` |
| Filter by major | `where("major", "==", value)` + `isPublic` |
| Filter by class rank | `where("classRank", "==", value)` |
| Filter by niche | `where("careerNiche", "array-contains", value)` |
| Filter by interests | `where("casualInterests", "array-contains-any", [...])` |
| Search by name | Client filter or Algolia later; v1: prefix on `displayName` |
| View full profile | `users/{uid}` + `users/{uid}/projects` |

**Composite indexes** needed for: `isPublic + major`, `isPublic + classRank`, `isPublic + careerNiche` (array), `isPublic + casualInterests` (array).

---

## Storage

| Path | Purpose |
|------|---------|
| `users/{uid}/avatar.{ext}` | Optional profile photo from onboarding step 5 |

Rules: user can write only their own `users/{uid}/*`; any signed-in user can read.

---

## Other collections (unchanged)

| Collection | Purpose |
|------------|---------|
| `users/{userId}/projects` | Portfolio projects |
| `conversations` | DM threads |
| `conversations/{id}/messages` | Messages |
| `users/{userId}/notifications` | Alerts |

See original relationship diagrams in git history if needed.

---

## Redirect flow

```
/auth/signup → Google → /onboarding (steps 1–5) → /onboarding/welcome → /find-students
/auth/login  → Google → /onboarding (if incomplete) OR /auth/deactivated (if isDeactivated) OR /find-students
```

---

*Last updated: Aug 31, 2026 — aligned with Google-only auth and 5-step onboarding.*

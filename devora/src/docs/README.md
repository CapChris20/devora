# Devora Documentation

All project docs live in **`src/docs/`**. Start here.

---

## Docs index

| File | What it's for |
|------|----------------|
| [DESIGN_SCOPE.md](./DESIGN_SCOPE.md) | **UI design bible** — colors, gradients, page layouts, what’s live vs shell |
| [landing-sections-spec.md](./landing-sections-spec.md) | Homepage copy below the hero (features, steps, benefits, join text) |
| [firestore-schema.md](./firestore-schema.md) | Database plan — users, projects, chats, messages, notifications |
| [naming-and-structure.md](./naming-and-structure.md) | Folder layout, routes, plain-English file naming |

---

## Quick reference

### Run locally

```bash
cd devora
npm install
npm run dev
```

Open **http://localhost:3000/home** (homepage). Port is fixed at **3000**.

### Environment

Copy `.env.example` → `.env.local` and fill in Firebase keys (`NEXT_PUBLIC_FIREBASE_*`).

### Routes (current)

| Page | URL |
|------|-----|
| Home | `/home` |
| Discovery Grid | `/find-students` |
| Settings | `/settings` |
| FAQs | `/faqs-page` |
| Activity Center | `/messages-page` |
| Account | `/account-page` |
| Login (planned) | `/auth` |

### Code layout

```
src/app/              → URLs (thin page files)
src/ui/               → React components + globals.css
src/backend/firebase/ → Firebase client
src/docs/             → You are here
```

### Firebase

- Config: `firebase.json`, `firestore.rules`, `functions/` (run CLI from **`devora/`** folder)
- Client code: `src/backend/firebase/` (`auth.ts`, `start-firebase.ts`, `env-keys.ts`)
- Auth: `@umich.edu` only; not wired to UI yet

### Cursor rules

Agents also read `.cursor/rules/devora-design-scope.mdc` and `devora-naming-structure.mdc` — they point back to this folder.

---

## Capstone / project info

High-level overview, advisor info, and timeline: **`devora/README.md`** (repo root has a copy).

---

*Last updated: Aug 31, 2026*

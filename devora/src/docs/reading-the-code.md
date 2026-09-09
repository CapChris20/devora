# Reading Devora Code

> Glossary for symbols and words that show up in many files.
> Individual files explain confusing lines inline; look here when you forget a symbol.

---

## Symbols (punctuation / syntax)

| Symbol | Plain English |
|--------|----------------|
| `??` | If the left side is null or undefined, use the right side instead. |
| `?.` | Safe access — don't crash if the thing before `?.` is missing. |
| `\|\|` | If the left side is empty/falsy, use the right side. |
| `&&` | Both sides must be true to continue. |
| `await` | Pause here until the async work finishes (Google, Firestore, etc.). |
| `async` | This function does work that takes time; you can `await` inside it. |
| `...` (spread) | Copy all properties from one object into another. |
| `\|` in types | "This value can be A **or** B" — e.g. `"login" \| "signup"`. |
| `?.` on types | Optional — field might be missing. |
| `[]` on `useEffect` | Run once when the page loads, not on every re-render. |
| `[router]` deps | Re-run when `router` changes. |
| `as Type` | Tell TypeScript "trust me, this data has this shape." |
| `as const` | Freeze a list so TypeScript treats values as exact literals. |
| `typeof X[number]` | "Any one item from the X array." |
| `Pick` / `Partial` | TypeScript helpers to build smaller/patch-style types. |
| `void` | Fire-and-forget async — we start the save but don't wait in the UI. |
| `return () => { ... }` | Cleanup — runs when the user leaves the page or component unmounts. |
| `declare global` | TypeScript only — tells the editor a custom `window` property may exist. |
| `/\s+/` | Regex pattern: "one or more spaces" (used with `.split()`). |

---

## String / array methods (confusing lines)

| Method | Plain English |
|--------|----------------|
| `.trim()` | Remove spaces at start and end of a string. |
| `.split(x)` | Cut a string into an **array** at each separator. |
| `.slice(n)` | From index `n` to the end (skip earlier items). |
| `.join(" ")` | Glue an array into one string, with spaces between. |
| `[0]` | First item in an array. |
| `.flatMap()` | Run a function on each group and flatten into one array. |
| `.filter()` | Keep only items that pass a test. |
| `.map()` | Transform each item into something new. |

---

## Words (Devora / Firebase / React)

| Word | Plain English |
|------|----------------|
| **uid** | User's unique Firebase ID — used as the Firestore document key. |
| **Firestore** | Google's online database; profiles live at `users/{uid}`. |
| **merge write** | Update only the fields you send; leave other fields on the doc alone. |
| **token** | Login ticket Firebase gives after sign-in; rules check it for access. |
| **router.push / replace** | Navigate to another page (`push` = history, `replace` = no back). |
| **onAuthStateChanged** | Firebase listener — fires when user signs in or out. |
| **onboardingComplete** | Boolean on profile — false until 5-step form is done. |
| **isPublic** | Boolean — false hides user from Discovery Grid queries. |
| **use client** | This file runs in the browser (hooks, clicks, Firebase). |
| **useEffect** | Run setup/cleanup after the component appears. |
| **useState** | Hold a value that can change and re-render the UI. |
| **useMemo** | Cache a calculated value; only recalc when deps change. |
| **useCallback** | Cache a function so it doesn't get recreated every render. |
| **props** | Data a parent component passes into a child. |

---

## Libraries (this project only)

| Name | Plain English |
|------|----------------|
| **Lenis** | npm package that animates scroll on the homepage. Stored on `window.smoothScroller` for NavBar. |
| **Next.js App Router** | File-based routing; `app/**/page.tsx` = a URL. |
| **Firebase Auth** | Google sign-in + user session. |
| **Firebase Storage** | File storage for profile photos at `users/{uid}/avatar.*`. |

---

## How comments work in this repo

See [comment-style.md](./comment-style.md) for the rules. This doc is only the symbol glossary.

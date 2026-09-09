# Comment Style (Devora)

Chris already knows basics (`if`, loops, functions). Comments teach the **confusing layer** so he can change the app without asking: WebGL, React APIs, Firebase words, opaque one-liners, “why this order,” “what to tweak.”

Teaching lives **in the code file** — not a separate explanations doc.

---

## The bar (copy this depth)

```ts
// This function is the heartbeat of the background animation.
// The browser keeps calling it; we decide whether to actually repaint.
const frame = (now: number) => {
  // vocab: now = timestamp in milliseconds from requestAnimationFrame

  // Stop forever after cleanup ran (user left the page / component unmounted)
  // vocab: disposed = our flag meaning “tear down already happened — don’t touch WebGL”
  if (disposed) return;

  // Queue the NEXT call to `frame` before we paint.
  // vocab: raf = id of that scheduled call — keep it so we can cancel later
  // vocab: requestAnimationFrame(frame) = “call frame again right before the next screen refresh”
  // Why call itself? That’s the loop — each run schedules the next run.
  raf = window.requestAnimationFrame(frame);

  // Accessibility: OS “reduce motion” on → keep the loop scheduled but don’t animate
  if (reduceMotion) return;

  // FPS cap: if it’s been less than FRAME_MS (≈33ms ≈ 30fps) since last paint, skip this tick
  // Manipulate here: lower FRAME_MS = smoother but heavier; raise = calmer on laptops
  if (now - lastDraw < FRAME_MS) return;

  lastDraw = now;

  // Convert ms since start → seconds, then hand to draw (shader uses uTime in seconds)
  // vocab: (now - start) / 1000 = elapsed seconds; draw pushes that into the GPU as uTime
  draw((now - start) / 1000);
};
```

**Test:** Would Chris know what each *weird* line is for and how to manipulate it, from comments alone? If no, add more.

---

## File top

2–4 plain `//` lines — what the file does + the flow.

Barrels (`backend/index.ts`): one line max.

---

## What to comment

- Every logic block (handlers, hooks, if/else with app meaning, try/catch, maps with logic, major JSX/shader sections)
- Every unfamiliar name/API/symbol on first use in that file (`// vocab: ...`)
- “Manipulate here” when a constant/branch controls look, speed, or behavior

## What NOT to comment

- Obvious `import` lines
- Pure “this is an if” / “this is a loop” with no app meaning
- `throw` that only repeats the error string
- Lone `router.push` under an already-explained `if`

---

## Tiny files

Short route wrappers can stay shorter (file top + one note). Dense teaching goes on files with real logic (Firebase, auth, account, shaders, NavBar, homepage sections, etc.).

---

## Gold examples

- Depth target: the `frame` block above
- File: `src/ui/backgrounds/VoronoiShaderBackground.tsx`
- Auth flow: `src/ui/auth/sign-in-actions.ts`

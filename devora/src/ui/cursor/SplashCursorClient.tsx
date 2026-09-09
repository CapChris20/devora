// Lazy-loads the fluid WebGL cursor only in the browser (no SSR).
// Keeps the heavy SplashCursor.jsx out of the server HTML pass.
// layout (or homepage) imports this file — never import SplashCursor.jsx directly from a server component.

"use client";

import dynamic from "next/dynamic";

// vocab: dynamic() = Next.js lazy import — code-splits SplashCursor into its own chunk
// vocab: ssr: false = WebGL only runs in the real browser, not during server HTML render
//   (canvas / WebGL APIs don't exist on the Node server)
const SplashCursor = dynamic(() => import("./SplashCursor.jsx"), { ssr: false });

// Re-export so layout can `import SplashCursor from ".../SplashCursorClient"`
export default SplashCursor;

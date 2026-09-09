// Lazy-loads the Voronoi WebGL background (no SSR).
// dynamic(..., { ssr: false }) keeps WebGL out of the server HTML pass.
// Callers (BackgroundPicture, TopSection) import THIS file, not VoronoiShaderBackground.tsx.

"use client";

import dynamic from "next/dynamic";

// Load the heavy shader component only in the browser.
// vocab: dynamic() = Next.js lazy import; ssr:false = skip server render (WebGL needs a real browser)
const VoronoiShaderBackground = dynamic(() => import("./VoronoiShaderBackground"), {
  ssr: false,
});

type VoronoiShaderBackgroundClientProps = {
  className?: string;
  // true = stick to the whole browser window (inner pages). false = fill the parent box (hero).
  // Passed straight through to VoronoiShaderBackground.
  fixed?: boolean;
};

export default function VoronoiShaderBackgroundClient({
  className,
  fixed,
}: VoronoiShaderBackgroundClientProps) {
  // Pass className + fixed straight through to the real shader component
  return <VoronoiShaderBackground className={className} fixed={fixed} />;
}

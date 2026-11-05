// Lazy-loads the Voronoi WebGL background so the server HTML pass never touches the GPU.
// Flow: Next dynamic import with ssr off → render VoronoiShaderBackground in the browser.
// Callers (BackgroundPicture, the homepage hero) import this file, not the shader file.

"use client";

// ===== IMPORTS =====

import dynamic from "next/dynamic";

// ===== TYPES =====

type VoronoiShaderBackgroundClientProps = {
  className?: string;
  // true = stick to the whole browser window (inner pages). false = fill the parent box (hero).
  fixed?: boolean;
};

// ===== HELPER FUNCTIONS =====

// vocab: dynamic() = Next.js lazy import. WebGL needs a real browser, so the server pass is skipped.
// ssr stays a written false. Next only accepts that flag as a literal in this call.
const VoronoiShaderBackground = dynamic(() => import("./VoronoiShaderBackground"), {
  ssr: false,
});

// ===== MAIN COMPONENT =====

/**
 * Browser-only wrapper around the crystal-cell shader.
 * @param props.className - Extra classes passed through to the canvas
 * @param props.fixed - When true, the canvas sticks to the window instead of the parent box
 * @returns The lazy Voronoi shader
 */
export default function VoronoiShaderBackgroundClient({
  className,
  fixed,
}: VoronoiShaderBackgroundClientProps) {
  return <VoronoiShaderBackground className={className} fixed={fixed} />;
}

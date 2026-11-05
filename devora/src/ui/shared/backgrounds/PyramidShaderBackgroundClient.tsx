// Lazy-loads the pyramid WebGL background so the server HTML pass never touches the GPU.
// Flow: Next dynamic import with ssr off → render PyramidShaderBackground in the browser.
// BackgroundPicture imports this file, not the shader file itself.

"use client";

// ===== IMPORTS =====

import dynamic from "next/dynamic";

// ===== TYPES =====

type PyramidShaderBackgroundClientProps = {
  className?: string;
  // true = stick to the whole browser window. Passed through to the real component.
  fixed?: boolean;
};

// ===== HELPER FUNCTIONS =====

// vocab: dynamic() = Next.js lazy import
// ssr stays a written false. Next only accepts that flag as a literal in this call.
const PyramidShaderBackground = dynamic(() => import("./PyramidShaderBackground"), {
  ssr: false,
});

// ===== MAIN COMPONENT =====

/**
 * Browser-only wrapper around the pyramid shader.
 * @param props.className - Extra classes passed through to the canvas
 * @param props.fixed - When true, the canvas sticks to the window instead of the parent box
 * @returns The lazy pyramid shader
 */
export default function PyramidShaderBackgroundClient({
  className,
  fixed,
}: PyramidShaderBackgroundClientProps) {
  return <PyramidShaderBackground className={className} fixed={fixed} />;
}

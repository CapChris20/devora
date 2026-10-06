// Lazy-loads the pyramid WebGL background (no SSR).
// Same idea as VoronoiShaderBackgroundClient: dynamic(..., { ssr: false }) so the
// server HTML pass never touches WebGL. BackgroundPicture imports this file.

"use client";

import dynamic from "next/dynamic";

// vocab: dynamic() = Next.js lazy import; ssr:false = skip server render
const PyramidShaderBackground = dynamic(() => import("./PyramidShaderBackground"), {
  ssr: false,
});

type PyramidShaderBackgroundClientProps = {
  className?: string;
  // true = stick to the whole browser window. Passed through to the real component.
  fixed?: boolean;
};

export default function PyramidShaderBackgroundClient({
  className,
  fixed,
}: PyramidShaderBackgroundClientProps) {
  return <PyramidShaderBackground className={className} fixed={fixed} />;
}

// Full-screen page background — pyramid scales by default so the palette test is everywhere.
// Fixed layer behind content; pointer-events none so clicks reach the page.
// Used by PageLayout on inner pages. Homepage hero and sign-in mount the same shader themselves.

"use client";

import PyramidShaderBackgroundClient from "./PyramidShaderBackgroundClient";
import VoronoiShaderBackgroundClient from "./VoronoiShaderBackgroundClient";

export type PageBackgroundVariant = "voronoi" | "pyramid";

type BackgroundPictureProps = {
  // Which shader paints behind the page.
  // Manipulate here: pass "voronoi" to put the crystal field back on one page
  variant?: PageBackgroundVariant;
};

export default function BackgroundPicture({ variant = "pyramid" }: BackgroundPictureProps) {
  return (
    // Fixed full-viewport wrapper — decorative, ignored by screen readers.
    // vocab: fixed inset-0 = pin to the whole viewport; pointer-events-none = clicks pass through
    // z-0 = sit behind page content (PageLayout content uses z-10)
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* fixed prop = stick to the window, not just the parent box */}
      {variant === "pyramid" ? (
        <PyramidShaderBackgroundClient fixed className="z-0" />
      ) : (
        <VoronoiShaderBackgroundClient fixed className="z-0" />
      )}
    </div>
  );
}

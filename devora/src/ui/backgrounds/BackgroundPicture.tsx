// Full-screen page background — Voronoi shader only (no sun / mountains / grid art).
// Fixed layer behind content; pointer-events none so clicks reach the page.
// Used by PageLayout on inner pages. Homepage hero mounts the shader itself in TopSection.

"use client";

import VoronoiShaderBackgroundClient from "./VoronoiShaderBackgroundClient";

export default function BackgroundPicture() {
  return (
    // Fixed full-viewport wrapper — decorative, ignored by screen readers.
    // vocab: fixed inset-0 = pin to the whole viewport; pointer-events-none = clicks pass through
    // z-0 = sit behind page content (PageLayout content uses z-10)
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* fixed prop = stick to the window, not just the parent box
          (see VoronoiShaderBackground — skipped for comments here; already gold-depth) */}
      <VoronoiShaderBackgroundClient fixed className="z-0" />
    </div>
  );
}

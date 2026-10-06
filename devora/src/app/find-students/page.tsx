// Discovery Grid page — title chrome + Filters overlay. Student cards are not mounted yet.
// Flow: route mounts → PageLayout → DiscoveryGridContent (filters only).
// Grid / peek rebuild: src/docs/discovery-grid.md (Firestore browse + conditional render).

"use client";

import PageLayout from "@/ui/shared/backgrounds/PageLayout";
import DiscoveryGridContent from "@/ui/discovery/DiscoveryGridContent";

// Thin route: wide layout + Discovery Grid filters. Card grid is deferred.
export default function DiscoveryGridPage() {
  return (
    <PageLayout
      // vocab: wide = 1400px max so four profile cards fit on one row
      wide
      activeItem="Discovery Grid"
      title="Discovery Grid"
      titleClassName="page-title-grad"
      description="Find friends, colleagues, and people in your career niche across CECS."
    >
      <DiscoveryGridContent />
    </PageLayout>
  );
}

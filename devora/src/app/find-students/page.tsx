// Discovery Grid page placeholder — browse students by major, interests, and skills.
// Flow: route mounts → PageLayout with title/description → grid UI comes later.

"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";

// Placeholder shell until the student browse grid is built.
// vocab: "use client" = browser component (matches other app shells using PageLayout)
// Manipulate here: title/description = what students see before the grid ships
export default function DiscoveryGridPage() {
  return (
    <PageLayout
      // vocab: wide = give the future grid more horizontal room
      wide
      activeItem="Discovery Grid"
      title="Discovery Grid"
      titleClassName="logo-gradient"
      description="Browse CECS students by major, interests, and skills — coming soon."
    />
  );
}

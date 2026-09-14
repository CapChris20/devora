// Placeholder for messages, connections, and activity — same layout as other app pages.
// Flow: route mounts → PageLayout with title/description → Activity Center comes later.

"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";

// Placeholder shell until Activity Center (DMs, requests) is built.
// vocab: "use client" = browser component (matches other app shells using PageLayout)
// Manipulate here: title/description = placeholder copy until messaging ships
export default function MessagesPage() {
  return (
    <PageLayout
      // vocab: wide = give the future activity UI more horizontal room
      wide
      activeItem="Activity Center"
      title="Activity Center"
      titleClassName="page-title-grad"
      description="Messages, connections, events, and activity — coming soon."
    />
  );
}

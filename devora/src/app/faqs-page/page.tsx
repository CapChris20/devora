// FAQs page placeholder — will hold common questions about Devora.
// Flow: route mounts → PageLayout with title/description → FAQ content comes later.

"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";

// Placeholder shell until FAQ content is written.
// vocab: "use client" = browser component (matches other app shells using PageLayout)
// Manipulate here: titleClassName / description = FAQ page header look + teaser copy
export default function FaqsPage() {
  return (
    <PageLayout
      activeItem="FAQs"
      title="FAQs"
      titleClassName="pink-grad"
      description="Common questions about Devora — coming soon."
    />
  );
}

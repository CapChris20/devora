// FAQs page — shared PageLayout chrome + searchable FAQ grid (answers open as popups).
// Flow: route mounts → PageLayout title → FAQAccordion (search + question cards → dialog).

"use client";

import PageLayout from "@/ui/shared/backgrounds/PageLayout";
import FAQAccordion from "@/ui/faqs/FAQAccordion";

// Thin route shell — grid + FAQ copy live in FAQAccordion.tsx.
// vocab: "use client" = browser component (search + popup state need client JS)
// Manipulate here: titleClassName / description = FAQ page header look + teaser copy
export default function FaqsPage() {
  return (
    <PageLayout
      activeItem="FAQs"
      title="FAQs"
      titleClassName="page-title-grad"
      description="Answers about Devora, networking, privacy, and how the CECS hub works."
      wide
    >
      <FAQAccordion />
    </PageLayout>
  );
}

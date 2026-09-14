// FAQs page — shared PageLayout chrome + searchable accordion of common Devora questions.
// Flow: route mounts → PageLayout title → FAQAccordion (search + one-open panels).

"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";
import FAQAccordion from "@/ui/FAQAccordion";

// Thin route shell — accordion + FAQ copy live in FAQAccordion.tsx.
// vocab: "use client" = browser component (accordion state + search need client JS)
// Manipulate here: titleClassName / description = FAQ page header look + teaser copy
export default function FaqsPage() {
  return (
    <PageLayout
      activeItem="FAQs"
      title="FAQs"
      titleClassName="page-title-grad"
      description="Answers about Devora, networking, privacy, and how the CECS hub works."
    >
      {/* Manipulate here: pass allowMultiple to let several answers stay open at once */}
      <FAQAccordion />
    </PageLayout>
  );
}

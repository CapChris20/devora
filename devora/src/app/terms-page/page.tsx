// Terms of Service page — rules for using Devora.
// Flow: route mounts → PageLayout chrome → LegalDocumentView with terms copy.
// Linked from the site footer and signup consent row.

"use client";

// ===== IMPORTS =====

import PageLayout from "@/ui/shared/backgrounds/PageLayout";
import LegalDocumentView from "@/ui/legal/LegalDocumentView";
import { TERMS_OF_SERVICE_DOCUMENT } from "@/ui/legal/legal-document-copy";

// ===== NAMED CONSTANTS =====

const PAGE_NAV_LABEL = "FAQs";
const PAGE_TITLE = TERMS_OF_SERVICE_DOCUMENT.title;
const PAGE_TITLE_CLASS = "page-title-grad";
const PAGE_DESCRIPTION =
  "The ground rules for using Devora as a UM-Dearborn student.";

// ===== MAIN COMPONENT =====

/**
 * Public Terms of Service route.
 * @returns The terms page
 */
export default function TermsPage() {
  return (
    <PageLayout
      activeItem={PAGE_NAV_LABEL}
      title={PAGE_TITLE}
      titleClassName={PAGE_TITLE_CLASS}
      description={PAGE_DESCRIPTION}
      wide
    >
      <LegalDocumentView document={TERMS_OF_SERVICE_DOCUMENT} />
    </PageLayout>
  );
}

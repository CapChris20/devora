// Cookie Policy page — browser storage, consent, and analytics gating.
// Flow: route mounts → PageLayout chrome → LegalDocumentView with cookie copy.
// Linked from the footer and the cookie consent banner.

"use client";

// ===== IMPORTS =====

import PageLayout from "@/ui/shared/backgrounds/PageLayout";
import LegalDocumentView from "@/ui/legal/LegalDocumentView";
import { COOKIE_POLICY_DOCUMENT } from "@/ui/legal/legal-document-copy";

// ===== NAMED CONSTANTS =====

const PAGE_NAV_LABEL = "FAQs";
const PAGE_TITLE = COOKIE_POLICY_DOCUMENT.title;
const PAGE_TITLE_CLASS = "page-title-grad";
const PAGE_DESCRIPTION =
  "What we store in your browser, and when we ask first.";

// ===== MAIN COMPONENT =====

/**
 * Public Cookie Policy route.
 * @returns The cookie policy page
 */
export default function CookiesPage() {
  return (
    <PageLayout
      activeItem={PAGE_NAV_LABEL}
      title={PAGE_TITLE}
      titleClassName={PAGE_TITLE_CLASS}
      description={PAGE_DESCRIPTION}
      wide
    >
      <LegalDocumentView document={COOKIE_POLICY_DOCUMENT} />
    </PageLayout>
  );
}

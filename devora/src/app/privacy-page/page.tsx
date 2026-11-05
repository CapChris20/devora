// Privacy Policy page — how Devora handles student data.
// Flow: route mounts → PageLayout chrome → LegalDocumentView with privacy copy.
// Linked from the site footer and signup consent row.

"use client";

// ===== IMPORTS =====

import PageLayout from "@/ui/shared/backgrounds/PageLayout";
import LegalDocumentView from "@/ui/legal/LegalDocumentView";
import { PRIVACY_POLICY_DOCUMENT } from "@/ui/legal/legal-document-copy";

// ===== NAMED CONSTANTS =====

const PAGE_NAV_LABEL = "FAQs";
const PAGE_TITLE = PRIVACY_POLICY_DOCUMENT.title;
const PAGE_TITLE_CLASS = "page-title-grad";
const PAGE_DESCRIPTION =
  "How Devora handles student data for this CECS capstone.";

// ===== MAIN COMPONENT =====

/**
 * Public Privacy Policy route.
 * @returns The privacy policy page
 */
export default function PrivacyPage() {
  return (
    <PageLayout
      activeItem={PAGE_NAV_LABEL}
      title={PAGE_TITLE}
      titleClassName={PAGE_TITLE_CLASS}
      description={PAGE_DESCRIPTION}
      wide
    >
      <LegalDocumentView document={PRIVACY_POLICY_DOCUMENT} />
    </PageLayout>
  );
}

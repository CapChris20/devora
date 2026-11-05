// Shared body for Privacy, Terms, and Cookie policy pages.
// Flow: intro glass card → numbered section cards with readable prose.
// Matches FAQ glass / pink border language so legal pages feel like the rest of Devora.

// ===== IMPORTS =====

import type { LegalDocument } from "./legal-document-copy";
import { LEGAL_LAST_UPDATED } from "./legal-document-copy";

// ===== NAMED CONSTANTS =====

const LAST_UPDATED_LABEL = "Last updated";
const SECTION_CODE_PAD_LENGTH = 2;

// ===== TYPES =====

type LegalDocumentViewProps = {
  document: LegalDocument;
};

// ===== HELPER FUNCTIONS =====

function formatSectionCode(sectionIndex: number): string {
  // vocab: padStart = "1" → "01" so the index matches the FAQ pixel codes
  return String(sectionIndex + 1).padStart(SECTION_CODE_PAD_LENGTH, "0");
}

// ===== MAIN COMPONENT =====

/**
 * Render one legal document as glass intro + numbered section cards.
 * @param props.document - Title, summary, and section copy from legal-document-copy
 * @returns The styled policy body
 */
export default function LegalDocumentView({ document }: LegalDocumentViewProps) {
  return (
    <article className="legal-document">
      {/* Intro — summary + date chip, same glass family as FAQ search / cards */}
      <header className="legal-intro">
        <p className="legal-intro-summary">{document.summary}</p>
        <p className="legal-intro-meta">
          <span className="legal-meta-label">{LAST_UPDATED_LABEL}</span>
          <span className="legal-meta-date">{LEGAL_LAST_UPDATED}</span>
        </p>
      </header>

      <div className="legal-section-list">
        {document.sections.map((section, sectionIndex) => (
          <section key={section.heading} className="legal-section-card">
            <div className="legal-section-header">
              <span className="legal-section-code font-pixel" aria-hidden="true">
                {formatSectionCode(sectionIndex)}
              </span>
              <h2 className="legal-section-title">{section.heading}</h2>
            </div>
            <div className="legal-section-body">
              {section.paragraphs.map((paragraph) => (
                <p key={`${section.heading}-${paragraph.slice(0, 40)}`} className="legal-section-copy">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

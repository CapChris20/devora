// Shown when someone visits a URL that does not exist.
// Flow: no matching route → Next renders this file → a simple "page missing" panel.

// ===== NAMED CONSTANTS =====

const MISSING_PAGE_CODE = "404";
const MISSING_PAGE_MESSAGE = "This page could not be found.";

// Manipulate here: this color is the look of every unknown URL.
const MISSING_PAGE_BACKGROUND_CLASS =
  "flex min-h-screen flex-col items-center justify-center gap-2 bg-[#1a0a2e] p-8 text-white";

// ===== MAIN COMPONENT =====

/**
 * The missing-page screen. It has no nav, only a short message.
 */
export default function NotFound() {
  // vocab: not-found.tsx = Next.js special file for routes that do not exist
  return (
    <div className={MISSING_PAGE_BACKGROUND_CLASS}>
      <div className="surface-panel flex flex-col items-center gap-2">
        <h2 className="text-2xl font-semibold">{MISSING_PAGE_CODE}</h2>
        <p className="text-sm text-white/60">{MISSING_PAGE_MESSAGE}</p>
      </div>
    </div>
  );
}

// Shown when someone visits a URL that does not exist (HTTP 404).
// Flow: no matching route → Next renders this file → simple “page missing” panel.

// Simple 404 panel — no nav; just tell them the page is missing.
// vocab: not-found.tsx = Next.js App Router special file for missing routes
export default function NotFound() {
  return (
    // Manipulate here: bg / copy below = look of every unknown URL
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#1a0a2e] p-8 text-white">
      <div className="surface-panel flex flex-col items-center gap-2">
        <h2 className="text-2xl font-semibold">404</h2>
        <p className="text-sm text-white/60">This page could not be found.</p>
      </div>
    </div>
  );
}

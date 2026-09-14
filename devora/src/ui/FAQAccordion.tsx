// FAQ accordion for `/faqs-page` — glass search + one-open (or multi) expand panels.
// Flow: type in search → filter FAQs live → click a question → slide answer open (chevron rotates).
// Styles live under .faq-* in globals.css (theme-aware dark + light). Used by faqs-page.

"use client";

// vocab: ReactNode = anything React can render (strings, JSX, bold spans, links…)
import { useMemo, useState, type ReactNode } from "react";

// One FAQ row — id stays stable so open state survives filtering.
type FaqItem = {
  id: string;
  question: string;
  // vocab: ReactNode lets answers use <strong>, <a>, etc. without forcing plain strings
  answer: ReactNode;
};

type FAQAccordionProps = {
  // true = several panels can stay open; false = opening one closes the others
  // Manipulate here: pass allowMultiple on the page if you want multi-open behavior
  allowMultiple?: boolean;
};

// Default FAQ copy for Devora — edit answers here; ids must stay unique.
// Manipulate here: add/remove/reorder FAQs; keep questions searchable (plain strings)
const FAQS: FaqItem[] = [
  {
    id: "origin",
    question: "How did the idea of Devora come about?",
    answer: (
      <>
        Devora started from a simple campus problem: CECS students at{" "}
        <strong>UM-Dearborn</strong> were sitting in the same labs and Discord
        servers, but still struggled to find collaborators who matched their
        skills, courses, and goals. LinkedIn felt like recruiter noise. Discord
        was fragmented. So Devora was built as a{" "}
        <strong>verified, CECS-only hub</strong> — discovery, events, and
        connection in one place, for people who actually share your building.
      </>
    ),
  },
  {
    id: "nothing-comes",
    question: "What if I use Devora and nothing comes of it? What's the point?",
    answer: (
      <>
        Networking is not a lottery ticket — it compounds. Even if one
        conversation does not turn into a project tomorrow, you still leave with{" "}
        <strong>clearer visibility into who is around you</strong>: majors,
        interests, and people working on the same problems. The point is to
        lower the cost of a warm intro. Showing up once can still put you on
        someone&apos;s radar for the next hackathon, study group, or referral.
      </>
    ),
  },
  {
    id: "not-tinder",
    question: 'Is Devora more than just a "University Tinder" for meeting people?',
    answer: (
      <>
        Yes. Devora is built around <strong>collaboration and career context</strong>,
        not swipe-based matching. Profiles highlight majors, skills, interests,
        and what you are looking for — so you can find a DSA study partner, a
        React + Unity teammate, or a CECS peer for a side project. It is a
        campus network for engineers who want to{" "}
        <strong>ship together</strong>, not a dating app with a university skin.
      </>
    ),
  },
  {
    id: "other-schools",
    question:
      "How do I know this will be helpful? Have other schools done something similar?",
    answer: (
      <>
        Campus directories and peer networks are a proven pattern — schools and
        student orgs have long used them to cut isolation and speed up team
        formation. Devora focuses that idea on{" "}
        <strong>CECS @ UM-Dearborn</strong> with verified identities and
        discovery that LinkedIn / Discord do not give you on this campus. You
        will know it is helpful the first time you find someone who is already
        taking the same course or building in the same stack.
      </>
    ),
  },
  {
    id: "landing-role",
    question:
      "How can this help me with networking and landing a role I want/need?",
    answer: (
      <>
        Roles often come from <strong>people who already trust your work</strong> —
        classmates, project partners, and alumni who remember you shipped
        something real. Devora helps you find those peers earlier: collaborate on
        projects, show up at CECS events, and build a network that can later turn
        into referrals, interview tips, and warm intros. It will not replace
        applying — it strengthens the relationships that make applications land.
      </>
    ),
  },
  {
    id: "no-swipe",
    question: "Why isn't there a swipe/match system?",
    answer: (
      <>
        Swipe UX rewards snap judgments and gamifies people. Devora is about{" "}
        <strong>intentional discovery</strong> — browse verified CECS profiles,
        filter by what matters (major, interests, goals), then connect when there
        is a real reason. That keeps the focus on collaboration quality over
        match counts, and avoids turning campus networking into a dating loop.
      </>
    ),
  },
  {
    id: "deactivate",
    question:
      "Do I have to use Devora constantly? Can I deactivate my profile anytime?",
    answer: (
      <>
        No constant use required. When you need a break, open{" "}
        <strong>Settings</strong> and deactivate — that hides you from Discovery
        while keeping your account data until you reactivate or delete. You can
        come back when a hackathon, class project, or internship search makes
        the network useful again.
      </>
    ),
  },
  {
    id: "messaging",
    question: "Can I message anyone or only people I've connected with?",
    answer: (
      <>
        Messaging is meant for <strong>people you have a connection with</strong>{" "}
        — so outreach stays intentional instead of cold spam across the whole
        college. Use Discovery to find the right peers, connect when there is a
        shared goal, then continue the conversation in the Activity Center.
        Preference controls in Settings also let you tune who can reach you.
      </>
    ),
  },
];

// Magnifying-glass SVG — currentColor follows .faq-search-icon (theme-aware).
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      // vocab: viewBox = SVG’s internal coordinate box (0..24 here maps cleanly to 20px display)
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20L16.5 16.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Chevron in the glass pill — rotates 180° when open.
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      // Manipulate here: duration-300 = rotate timing; keep in sync with answer slide
      className={`faq-chevron ${open ? "faq-chevron-open" : ""}`}
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FAQAccordion({ allowMultiple = false }: FAQAccordionProps) {
  // Live search string — filters as the user types (case-insensitive).
  // vocab: useState = React memory; setQuery re-renders with the new input value
  const [query, setQuery] = useState("");
  // Which panel ids are expanded. Set keeps lookups fast and supports multi-open.
  // vocab: Set = collection of unique values (here: open FAQ ids)
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // Recompute the visible list whenever the query changes.
  // vocab: useMemo = only recalculate when query (dependency) changes
  const filtered = useMemo(() => {
    // vocab: trim = strip leading/trailing spaces so "  foo  " still matches
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;

    // Match against the question only.
    // vocab: includes = true if the question string contains the query substring
    return FAQS.filter((item) => item.question.toLowerCase().includes(q));
  }, [query]);

  // Toggle one panel. Single-open mode replaces the Set; multi mode adds/removes.
  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const isOpen = prev.has(id);

      if (isOpen) {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }

      if (allowMultiple) {
        const next = new Set(prev);
        next.add(id);
        return next;
      }

      return new Set([id]);
    });
  };

  return (
    // faq-root / faq-* chrome lives in globals.css (theme tokens, not hard-coded dark).
    // Manipulate here: gap between search + list via .faq-root gap
    <div className="faq-root">
      {/* Glass search field — pink accent border, theme fill */}
      <label className="faq-search">
        <span className="sr-only">Search FAQs</span>
        <span className="faq-search-icon" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQs..."
          className="faq-search-input"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="faq-empty">No results found</p>
      ) : (
        <ul className="faq-list" role="list">
          {filtered.map((item, i) => {
            const open = openIds.has(item.id);
            // vocab: padStart = "1" → "01" for the index badge
            const code = String(i + 1).padStart(2, "0");

            return (
              <li
                key={item.id}
                className={`faq-item ${open ? "faq-item-open" : ""}`}
              >
                <button
                  type="button"
                  // vocab: aria-expanded = tells assistive tech whether the answer is visible
                  aria-expanded={open}
                  aria-controls={`faq-panel-${item.id}`}
                  id={`faq-trigger-${item.id}`}
                  onClick={() => toggle(item.id)}
                  className="faq-trigger"
                >
                  <span className="faq-trigger-main">
                    <span className="faq-code font-pixel">{code}</span>
                    <span className={`faq-question ${open ? "soft-headline" : ""}`}>
                      {item.question}
                    </span>
                  </span>
                  <span className="faq-chevron-wrap" aria-hidden="true">
                    <ChevronIcon open={open} />
                  </span>
                </button>

                {/* Slide panel — CSS grid 0fr→1fr animates height without measuring pixels.
                    Manipulate here: duration on .faq-panel transition */}
                <div
                  id={`faq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${item.id}`}
                  className={`faq-panel ${open ? "faq-panel-open" : ""}`}
                >
                  <div className="faq-panel-inner">
                    {/* Nested answer card — inset glass so answers feel distinct from the question row */}
                    <div className="faq-answer-shell">
                      <p className="faq-answer-label font-pixel">ANSWER</p>
                      <div className="faq-answer">{item.answer}</div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

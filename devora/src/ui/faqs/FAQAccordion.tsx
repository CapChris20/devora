// FAQ grid for `/faqs-page` — glass search + 2-col question cards; answers open in a popup.
// Flow: type in search → filter FAQs live → click a question → answer dialog on body (portal).
// Desktop: two questions per row; phones stack to one. Styles live under .faq-* in globals.css.

"use client";

// vocab: ReactNode = anything React can render (strings, JSX, bold spans, links…)
import { useEffect, useMemo, useState, type ReactNode } from "react";
// vocab: createPortal = React still owns the tree, DOM node goes on document.body
import { createPortal } from "react-dom";

// One FAQ card — id stays stable so open state survives filtering.
type FaqItem = {
  id: string;
  question: string;
  // vocab: ReactNode lets answers use <strong>, <a>, etc. without forcing plain strings
  answer: ReactNode;
};

// Default FAQ copy for Devora — Chris’s answers, polished for the page.
// Manipulate here: rewrite answers; keep ids unique; keep questions searchable (plain strings)
const FAQS: FaqItem[] = [
  {
    id: "origin",
    question: "How did the idea for Devora come about?",
    answer: (
      <>
        It came from my own transfer experience at{" "}
        <strong>UM-Dearborn</strong>. When I first got here, I was not putting
        real effort into approaching people, making friends, or networking — not
        because I wanted to stay alone, but because I did not feel confident
        enough. I did not feel like I had the capability to meet people at
        scale or build a network the hard way. Living that for a while made
        something obvious: a lot of CECS students here — including the version
        of me who just showed up — could use a better on-ramp. Devora started
        from that personal gap: a place where showing who you are and finding
        peers does not require forcing confidence you have not built yet.
      </>
    ),
  },
  {
    id: "nothing-comes",
    question: "What if I use Devora and nothing comes of it? What's the point?",
    answer: (
      <>
        Your presence still matters. A profile shows{" "}
        <strong>who you are as a student</strong> — interests, path, what you
        want next in your career — so the right people can find you even on a quiet week.
        You do not have to be the one initiating every time; peers can reach out
        on Devora or take the conversation offline once there is a real reason.
        And the point is bigger than “meeting people”: career fairs, job events,
        clubs, and department opportunities live here too. Showing up puts you
        in that lane — even if one week does not produce a new friend tomorrow.
      </>
    ),
  },
  {
    id: "not-tinder",
    question: 'Is Devora more than just a "University Tinder" for meeting people?',
    answer: (
      <>
        Yes. The whole point of Devora is to be the{" "}
        <strong>official hub for the CECS department</strong> — not a swipe app
        with a campus skin. That means advertising clubs and events, surfacing
        career and job opportunities, and giving you a real directory for
        networking with verified peers. Meeting people is part of it. Finding
        friends, showing up at CECS things, and meeting people in your career
        niche is the product.
      </>
    ),
  },
  {
    id: "other-schools",
    question:
      "How do I know this will be helpful? Have other schools done something similar?",
    answer: (
      <>
        Verified campus networks are already a pattern elsewhere — apps like{" "}
        <strong>CircleU</strong>, <strong>Clstr</strong>, and{" "}
        <strong>Butterfly</strong> help students discover peers by school,
        major, and intent, and campuses have long used directories / peer lists
        for the same reason. Research on university ties also shows former
        classmates influence early hiring: people are more likely to land at
        firms where peers already work, and those matches often come with better
        stability. Career guidance commonly cites that a large share of roles
        never get a public posting and that many hires still move through
        networks and referrals (employee referrals are often cited as several
        times more likely to convert). Devora applies that same idea locally for{" "}
        <strong>CECS @ UM-Dearborn</strong> — so helpfulness looks like finding
        someone in your stack, your course, or your next event faster than Discord
        or LinkedIn will.
      </>
    ),
  },
  {
    id: "landing-role",
    question:
      "How can this help me with networking and landing a role I want/need?",
    answer: (
      <>
        You can find people by <strong>niche and direction</strong> — same
        interests, same path, same kind of work you want to do — and build a
        real connection from there. When someone is already at a company you
        care about, that relationship is how referrals, interview help, and
        honest advice usually happen. Devora will not replace applying, but it
        makes it easier to know people who can open doors, prep you, and vouch
        for you because they actually know you — not because you cold-messaged
        a stranger.
      </>
    ),
  },
  {
    id: "no-swipe",
    question: "Why isn't there a swipe/match system?",
    answer: (
      <>
        On purpose. I do not want Devora to feel like a{" "}
        <strong>Tinder for students</strong>. The model is closer to Instagram
        follows: you can connect with someone, they can connect back, and then
        you talk — or not, if they are not interested. Swipe-and-match turns
        people into a game. Devora is meant to be a connecting platform for
        friendship, events, and career context — more than chats from a
        match queue.
      </>
    ),
  },
  {
    id: "deactivate",
    question:
      "Do I have to use Devora constantly? Can I deactivate my profile anytime?",
    answer: (
      <>
        No, you do not have to use it constantly — and{" "}
        <strong>yes, you can deactivate anytime</strong> in Settings. Nobody is
        forcing you on here. Using it is recommended because it makes networking
        and CECS discovery easier, but if you want to do your own thing offline,
        that is fine. The goal is to lower the friction, not add another
        obligation. Come back when a class project, hackathon, or job search
        makes the network useful again.
      </>
    ),
  },
  {
    id: "messaging",
    question: "Can I message anyone or only people I've connected with?",
    answer: (
      <>
        You message <strong>people you have connected with</strong>. Find peers
        in Discovery, connect when there is a shared reason, then continue the
        conversation from there. That keeps outreach intentional instead of
        turning the whole college into a cold-DM list — and Settings still let
        you tune who can reach you.
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

// Small chevron in the glass pill — points right = “opens a dialog”, not an in-place expand.
function ChevronIcon() {
  return (
    <svg
      className="faq-chevron"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.5 5L12.5 10L7.5 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Paint the answer dialog on <body> so PageLayout z-index can't trap it.
function FaqPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // vocab: useEffect = run after paint (document.body exists only in the browser)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}

// Medium glass answer dialog — same overlay idea as Edit profile.
function FaqAnswerDialog({
  item,
  code,
  onClose,
}: {
  item: FaqItem;
  code: string;
  onClose: () => void;
}) {
  // Escape closes; freeze page scroll while the dialog is open.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <FaqPortal>
      {/* Click the dim area (not the card) to close */}
      <div className="faq-backdrop" onClick={onClose}>
        <div
          className="faq-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-dialog-title"
          // vocab: stopPropagation = clicking the panel must not count as a backdrop click
          onClick={(event) => event.stopPropagation()}
        >
          <div className="faq-dialog-header">
            <div className="faq-dialog-heading">
              <span className="faq-code font-pixel">{code}</span>
              <h2 id="faq-dialog-title" className="faq-dialog-title font-display">
                {item.question}
              </h2>
            </div>
            <button
              type="button"
              className="faq-dialog-close"
              aria-label="Close answer"
              onClick={onClose}
            >
              {/* Simple X mark — no icon pack needed */}
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="faq-dialog-body">
            <p className="faq-answer-label font-pixel">ANSWER</p>
            <div className="faq-answer">{item.answer}</div>
          </div>
        </div>
      </div>
    </FaqPortal>
  );
}

export default function FAQAccordion() {
  // Live search string — filters as the user types (case-insensitive).
  // vocab: useState = React memory; setQuery re-renders with the new input value
  const [query, setQuery] = useState("");
  // Which FAQ is open in the popup (null = closed).
  // Manipulate here: setActiveId(null) closes; setActiveId(id) opens that answer
  const [activeId, setActiveId] = useState<string | null>(null);

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

  // If search hides the open FAQ, close the dialog so it doesn't snap back later.
  useEffect(() => {
    if (activeId && !filtered.some((item) => item.id === activeId)) {
      setActiveId(null);
    }
  }, [activeId, filtered]);

  // Active FAQ + its display index (01 / 02…) for the dialog chrome.
  // vocab: findIndex = position in filtered list, or -1 if missing
  const activeIndex = activeId
    ? filtered.findIndex((item) => item.id === activeId)
    : -1;
  const activeItem = activeIndex >= 0 ? filtered[activeIndex] : null;
  // vocab: padStart = "1" → "01" for the index badge
  const activeCode =
    activeIndex >= 0 ? String(activeIndex + 1).padStart(2, "0") : "00";

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
          {/* 2-col grid on desktop — CSS in .faq-list. Each li is one question card. */}
          {filtered.map((item, i) => {
            const open = activeId === item.id;
            const code = String(i + 1).padStart(2, "0");

            return (
              <li
                key={item.id}
                className={`faq-item ${open ? "faq-item-open" : ""}`}
              >
                <button
                  type="button"
                  // vocab: aria-haspopup = tells assistive tech this opens a dialog
                  aria-haspopup="dialog"
                  aria-expanded={open}
                  id={`faq-trigger-${item.id}`}
                  onClick={() => setActiveId(item.id)}
                  className="faq-trigger"
                >
                  <span className="faq-trigger-main">
                    <span className="faq-code font-pixel">{code}</span>
                    <span className={`faq-question ${open ? "soft-headline" : ""}`}>
                      {item.question}
                    </span>
                  </span>
                  <span className="faq-chevron-wrap" aria-hidden="true">
                    <ChevronIcon />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Answer popup — only mounted while a question is active */}
      {activeItem ? (
        <FaqAnswerDialog
          item={activeItem}
          code={activeCode}
          onClose={() => setActiveId(null)}
        />
      ) : null}
    </div>
  );
}

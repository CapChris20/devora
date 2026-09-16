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
        real effort into approaching people, collaborating, or networking — not
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
        want to work on — so the right people can find you even on a quiet week.
        You do not have to be the one initiating every time; peers can reach out
        on Devora or take the conversation offline once there is a real reason.
        And the point is bigger than “meeting people”: career fairs, job events,
        clubs, and department opportunities live here too. Showing up puts you
        in that lane — even if one week does not produce a project tomorrow.
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
        networking with verified peers. Meeting people is part of it. Shipping
        together, showing up at CECS things, and finding collaborators by skill
        and goal is the product.
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
        collaboration, events, and career context — more than chats from a
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

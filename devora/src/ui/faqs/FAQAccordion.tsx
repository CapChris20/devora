// Redesigned FAQ accordion — DESIGN.md § 5.4.
// Inline accordion on night field. Search bar, category pills with counts,
// meta row (count + expand-all), and hard-shadow poster rows with pink open state.
// First question starts open. Answer text matches existing copy word-for-word.
// No popup dialogs, no purple, no gradient fills.

"use client";

// ===== IMPORTS =====

import { useState, useMemo, useId, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

// ===== TYPES =====

type FaqCategory = "all" | "about" | "networking" | "features";

type FaqItem = {
  id: string;
  category: FaqCategory;
  /** Short dashed stamp label shown beside each question. */
  stamp: string;
  question: string;
  answer: ReactNode;
};

// ===== DESIGN TOKENS (inline — mirrors DESIGN.md § 1) =====

const T = {
  night:     "#08040f",
  surface:   "#0e0918",
  surface2:  "#160e24",
  edge:      "#2a183d",
  paper:     "#f4eef0",
  paper2:    "#e8dde2",
  orange:    "#ff9a3d",
  pink:      "#ff5ca8",
  magenta:   "#ff2bd6",
  gold:      "#ffeb99",
  grad:      "linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%)",
  text:      "#ffffff",
  textBody:  "#f4eefc",
  textMuted: "rgba(244, 238, 252, 0.65)",
  ink:       "#08040f",
  inkBody:   "#2a2226",
  inkMuted:  "#574a50",
  shadow:    "5px 5px 0 0 #000000",
  gradShadow:"5px 5px 0 0 #000000, 6px 6px 0 0 #ff5ca8",
  display:   "var(--font-display, 'Arial Black', sans-serif)",
  mono:      "var(--font-mono, monospace)",
};

// ===== CATEGORY DATA =====

const CATEGORIES: { id: FaqCategory; label: string; count: number }[] = [
  { id: "all",        label: "All questions",        count: 8 },
  { id: "about",      label: "About Devora",         count: 2 },
  { id: "networking", label: "Networking & Career",  count: 3 },
  { id: "features",   label: "Features & Privacy",   count: 3 },
];

// ===== FAQ DATA =====
// Copy kept word-for-word from the original; em dashes changed to commas per DESIGN.md § 5.4.

const FAQS: FaqItem[] = [
  {
    id: "origin",
    category: "about",
    stamp: "About",
    question: "How did the idea for Devora come about?",
    answer: (
      <>
        It came from my own transfer experience at{" "}
        <strong style={{ color: T.text }}>UM&#8209;Dearborn</strong>. When I
        first got here, I was not putting real effort into approaching people,
        making friends, or networking, not because I wanted to stay alone, but
        because I did not feel confident enough. I did not feel like I had the
        capability to meet people at scale or build a network the hard way.
        Living that for a while made something obvious: a lot of CECS students
        here, including the version of me who just showed up, could use a better
        on-ramp. Devora started from that personal gap: a place where showing
        who you are and finding peers does not require forcing confidence you
        have not built yet.
      </>
    ),
  },
  {
    id: "nothing-comes",
    category: "about",
    stamp: "About",
    question: "What if I use Devora and nothing comes of it? What's the point?",
    answer: (
      <>
        Your presence still matters. A profile shows{" "}
        <strong style={{ color: T.text }}>who you are as a student</strong>,
        interests, path, what you want next in your career, so the right people
        can find you even on a quiet week. You do not have to be the one
        initiating every time; peers can reach out on Devora or take the
        conversation offline once there is a real reason. And the point is bigger
        than &ldquo;meeting people&rdquo;: career fairs, job events, clubs, and
        department opportunities live here too. Showing up puts you in that lane,
        even if one week does not produce a new friend tomorrow.
      </>
    ),
  },
  {
    id: "not-tinder",
    category: "networking",
    stamp: "Career",
    question: 'Is Devora more than just a "University Tinder" for meeting people?',
    answer: (
      <>
        Yes. The whole point of Devora is to be the{" "}
        <strong style={{ color: T.text }}>official hub for the CECS department</strong>,
        not a swipe app with a campus skin. That means advertising clubs and
        events, surfacing career and job opportunities, and giving you a real
        directory for networking with verified peers. Meeting people is part of
        it. Finding friends, showing up at CECS things, and meeting people in
        your career niche is the product.
      </>
    ),
  },
  {
    id: "other-schools",
    category: "networking",
    stamp: "Career",
    question:
      "How do I know this will be helpful? Have other schools done something similar?",
    answer: (
      <>
        Campus peer directories are a familiar pattern. Other school-based apps
        and class lists try to help students find people by major and intent.
        Hiring often still moves through people you know: classmates, clubs, and
        warm intros can matter as much as a cold application. Devora applies that
        idea locally for{" "}
        <strong style={{ color: T.text }}>CECS @ UM&#8209;Dearborn</strong>,
        helpfulness looks like finding someone in your stack, your course, or
        your next event with less friction than a giant public network. We do not
        promise job offers or referral rates.
      </>
    ),
  },
  {
    id: "landing-role",
    category: "networking",
    stamp: "Career",
    question:
      "How can this help me with networking and landing a role I want or need?",
    answer: (
      <>
        You can find people by{" "}
        <strong style={{ color: T.text }}>niche and direction</strong>, same
        interests, same path, same kind of work you want to do, and build a real
        connection from there. When someone is already at a company you care
        about, that relationship is how referrals, interview help, and honest
        advice usually happen. Devora will not replace applying, but it makes it
        easier to know people who can open doors, prep you, and vouch for you
        because they actually know you, not because you cold-messaged a stranger.
      </>
    ),
  },
  {
    id: "no-swipe",
    category: "features",
    stamp: "Privacy",
    question: "Why isn't there a swipe/match system?",
    answer: (
      <>
        On purpose. I do not want Devora to feel like a Tinder for students. The
        model is closer to{" "}
        <strong style={{ color: T.text }}>mutual connection</strong>: you can
        connect with someone, they can connect back, and then you talk, or not,
        if they are not interested. Swipe-and-match turns people into a game.
        Devora is meant to be a connecting platform for friendship, events, and
        career context, more than chats from a match queue.
      </>
    ),
  },
  {
    id: "deactivate",
    category: "features",
    stamp: "Privacy",
    question:
      "Do I have to use Devora constantly? Can I deactivate my profile anytime?",
    answer: (
      <>
        No, you do not have to use it constantly, and{" "}
        <strong style={{ color: T.text }}>yes, you can deactivate anytime</strong>{" "}
        in Settings. Nobody is forcing you on here. Using it is recommended
        because it makes networking and CECS discovery easier, but if you want to
        do your own thing offline, that is fine. The goal is to lower the
        friction, not add another obligation. Come back when a class project,
        hackathon, or job search makes the network useful again.
      </>
    ),
  },
  {
    id: "messaging",
    category: "features",
    stamp: "Privacy",
    question: "Can I message anyone or only people I've connected with?",
    answer: (
      <>
        You message{" "}
        <strong style={{ color: T.text }}>people you have connected with</strong>.
        Find peers in Discovery, connect when there is a shared reason, then
        continue the conversation from there. That keeps outreach intentional
        instead of turning the whole college into a cold-DM list, and Settings
        still let you tune who can reach you.
      </>
    ),
  },
];

// ===== SUB-COMPONENTS =====

/** Dashed stamp chip for the category label. */
function Stamp({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        height: 28,
        lineHeight: "24px",
        padding: "0 12px",
        border: "1.5px solid #ff9a3d",
        borderRadius: 4,
        fontFamily: T.mono,
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#ffeb99",
        background: "#1e1028",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

/** Single accordion row — Neo-Brutalist Devora Card. */
function AccordionRow({
  faq,
  isOpen,
  onToggle,
  panelId,
}: {
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  return (
    <div
      style={{
        background: isOpen ? "#160e24" : "#0e0918",
        borderRadius: 6,
        border: isOpen ? "2.5px solid #ff5ca8" : "2px solid #2a183d",
        boxShadow: isOpen
          ? "5px 5px 0 0 #000000, 6px 6px 0 0 #ff5ca8"
          : "5px 5px 0 0 #000000, 6px 6px 0 0 #2a183d",
        overflow: "hidden",
        transition: "border-color 220ms ease, box-shadow 220ms ease, background 220ms ease",
      }}
    >
      {/* Trigger */}
      <h2 style={{ margin: 0 }}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr auto 44px",
            alignItems: "center",
            gap: 16,
            minHeight: 80,
            padding: "18px 20px 18px 24px",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.outlineOffset = "-4px";
            e.currentTarget.style.outline = "3px solid #ff5ca8";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          {/* Question text */}
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.4,
              maxWidth: "58ch",
              color: "#ffffff",
            }}
          >
            {faq.question}
          </span>

          {/* Stamp */}
          <span className="faq-stamp-col">
            <Stamp>{faq.stamp}</Stamp>
          </span>

          {/* Chevron */}
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isOpen ? "#ff5ca8" : "#1a1028",
              border: isOpen ? "2px solid #ffffff" : "2px solid #2a183d",
              color: isOpen ? "#08040f" : "#ff5ca8",
              transition:
                "background 220ms ease, border-color 220ms ease, color 220ms ease, transform 260ms cubic-bezier(.23,1,.32,1)",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              flexShrink: 0,
              boxShadow: "2px 2px 0 0 #000000",
            }}
          >
            <ChevronDown size={20} strokeWidth={2.5} />
          </span>
        </button>
      </h2>

      {/* Answer panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            id={panelId}
            role="region"
            initial={{ gridTemplateRows: "0fr", opacity: 0 }}
            animate={{ gridTemplateRows: "1fr", opacity: 1 }}
            exit={{ gridTemplateRows: "0fr", opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            style={{ display: "grid", overflow: "hidden" }}
          >
            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  margin: 0,
                  padding: "0 24px 26px",
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: "#f4eefc",
                  maxWidth: "68ch",
                }}
              >
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== MAIN COMPONENT =====

/**
 * Redesigned FAQ accordion. Night field, poster rows, inline expansion.
 * DESIGN.md § 5.4.
 */
export default function FAQAccordion() {
  const uid = useId();

  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // First question starts open per spec.
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set([FAQS[0].id])
  );

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQS.filter((faq) => {
      const catMatch =
        selectedCategory === "all" || faq.category === selectedCategory;
      const textMatch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.stamp.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [selectedCategory, searchQuery]);

  const allExpanded =
    filteredFaqs.length > 0 &&
    filteredFaqs.every((f) => openIds.has(f.id));

  function toggleRow(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExpandCollapse() {
    if (allExpanded) {
      setOpenIds(new Set());
    } else {
      setOpenIds(new Set(filteredFaqs.map((f) => f.id)));
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setSelectedCategory("all");
  }

  return (
    <>
      {/* Stamp responsive CSS */}
      <style jsx>{`
        .faq-stamp-col {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 600px) {
          .faq-stamp-col {
            display: none;
          }
        }
        .faq-pill-btn:hover {
          translate: 0 -2px;
        }
        .faq-pill-btn:active {
          translate: 2px 2px;
        }
        button:focus-visible {
          outline: 3px solid currentColor;
          outline-offset: 3px;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

        {/* ── Search bar ── */}
        <div style={{ position: "relative" }}>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#ff5ca8",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search size={22} strokeWidth={2.5} />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, topic or question"
            aria-label="Search FAQ questions"
            style={{
              width: "100%",
              height: 60,
              paddingLeft: 56,
              paddingRight: searchQuery ? 52 : 20,
              borderRadius: 6,
              background: "#0e0918",
              border: "2.5px solid #ff5ca8",
              color: "#ffffff",
              fontSize: 16,
              fontFamily: T.mono,
              fontWeight: 600,
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "4px 4px 0 0 #000000",
              transition: "border-color 180ms ease, box-shadow 180ms ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#ff2bd6";
              e.currentTarget.style.boxShadow = "4px 4px 0 0 #000000, 5px 5px 0 0 #ff2bd6";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#ff5ca8";
              e.currentTarget.style.boxShadow = "4px 4px 0 0 #000000";
            }}
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#1e1028",
                border: "1.5px solid #ff5ca8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ff5ca8",
              }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* ── Category pills ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className="faq-pill-btn"
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={isSelected}
                style={{
                  height: 44,
                  paddingInline: 20,
                  borderRadius: 6,
                  border: isSelected ? "2.5px solid #000000" : "2px solid #2a183d",
                  background: isSelected ? "#ff9a3d" : "#0e0918",
                  color: isSelected ? "#08040f" : "#ffffff",
                  fontFamily: T.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: isSelected
                    ? "4px 4px 0 0 #000000"
                    : "3px 3px 0 0 #000000",
                  transition:
                    "background 200ms cubic-bezier(.34,1.56,.64,1), box-shadow 200ms cubic-bezier(.34,1.56,.64,1), border-color 200ms ease",
                }}
              >
                {cat.label}
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.85em",
                    opacity: isSelected ? 0.9 : 0.75,
                    fontWeight: 700,
                  }}
                >
                  ({cat.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Meta row ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            aria-live="polite"
            style={{
              fontFamily: T.mono,
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#f4eefc",
              background: "#0e0918",
              border: "1.5px solid #2a183d",
              borderRadius: 6,
              padding: "8px 18px",
              boxShadow: "3px 3px 0 0 #000000",
            }}
          >
            Showing {filteredFaqs.length} of {FAQS.length} questions
          </span>

          {filteredFaqs.length > 0 && (
            <button
              type="button"
              onClick={handleExpandCollapse}
              style={{
                background: "#0e0918",
                border: "1.5px solid #ff5ca8",
                borderRadius: 6,
                padding: "8px 18px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: T.mono,
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#ff5ca8",
                fontWeight: 700,
                boxShadow: "3px 3px 0 0 #000000",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ff2bd6";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.background = "#ff2bd6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#ff5ca8";
                e.currentTarget.style.color = "#ff5ca8";
                e.currentTarget.style.background = "#0e0918";
              }}
            >
              <ChevronsUpDown size={15} strokeWidth={2.5} />
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          )}
        </div>

        {/* ── Accordion rows ── */}
        {filteredFaqs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredFaqs.map((faq) => (
              <AccordionRow
                key={faq.id}
                faq={faq}
                isOpen={openIds.has(faq.id)}
                onToggle={() => toggleRow(faq.id)}
                panelId={`${uid}-panel-${faq.id}`}
              />
            ))}
          </div>
        ) : (
          /* No results */
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              borderRadius: 6,
              border: "2.5px solid #ff5ca8",
              background: T.surface,
              boxShadow: "5px 5px 0 0 #000000, 6px 6px 0 0 #ff5ca8",
            }}
          >
            <p
              style={{
                fontFamily: T.mono,
                fontSize: 16,
                color: T.textMuted,
                margin: "0 0 16px",
              }}
            >
              No questions match that search.
            </p>
            <button
              type="button"
              onClick={clearSearch}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: T.mono,
                fontSize: 14,
                fontWeight: 700,
                color: T.orange,
                textDecoration: "underline",
                textUnderlineOffset: 3,
                padding: 0,
              }}
            >
              Clear the search
            </button>
          </div>
        )}
      </div>
    </>
  );
}

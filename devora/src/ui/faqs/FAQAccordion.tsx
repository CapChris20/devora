// Redesigned FAQ accordion — Neo-Brutalist Synthwave theme law.
// High contrast and complete visibility across both light and dark modes.
// Search bar, category filter pills, count tracker, expand/collapse all,
// and hard-shadow question cards with smooth Framer Motion disclosure.
// Strictly zero emojis.

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
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

// ===== TYPES =====

type FaqCategory = "all" | "about" | "networking" | "features";

type FaqItem = {
  id: string;
  category: FaqCategory;
  /** Short badge label shown beside each question. */
  stamp: string;
  question: string;
  getAnswer: (isLight: boolean) => ReactNode;
};

// ===== CATEGORY DATA =====

const CATEGORIES: { id: FaqCategory; label: string; count: number }[] = [
  { id: "all", label: "All questions", count: 8 },
  { id: "about", label: "About Devora", count: 2 },
  { id: "networking", label: "Networking & Career", count: 3 },
  { id: "features", label: "Features & Privacy", count: 3 },
];

// ===== FAQ DATA =====

const FAQS: FaqItem[] = [
  {
    id: "origin",
    category: "about",
    stamp: "About",
    question: "How did the idea for Devora come about?",
    getAnswer: (isLight: boolean) => (
      <>
        It came from my own transfer experience at{" "}
        <strong
          className={
            isLight
              ? "text-[#0a0a0a] font-black underline decoration-[#ff5ca8] underline-offset-2"
              : "text-[#ffd76f] font-bold"
          }
        >
          UM&#8209;Dearborn
        </strong>
        . When I first got here, I was not putting real effort into approaching people,
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
    getAnswer: (isLight: boolean) => (
      <>
        Your presence still matters. A profile shows{" "}
        <strong
          className={
            isLight
              ? "text-[#0a0a0a] font-black underline decoration-[#ff5ca8] underline-offset-2"
              : "text-[#ffd76f] font-bold"
          }
        >
          who you are as a student
        </strong>
        , interests, path, what you want next in your career, so the right people
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
    getAnswer: (isLight: boolean) => (
      <>
        Yes. The whole point of Devora is to be the{" "}
        <strong
          className={
            isLight
              ? "text-[#0a0a0a] font-black underline decoration-[#ff5ca8] underline-offset-2"
              : "text-[#ffd76f] font-bold"
          }
        >
          official hub for the CECS department
        </strong>
        , not a swipe app with a campus skin. That means advertising clubs and
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
    getAnswer: (isLight: boolean) => (
      <>
        Campus peer directories are a familiar pattern. Other school-based apps
        and class lists try to help students find people by major and intent.
        Hiring often still moves through people you know: classmates, clubs, and
        warm intros can matter as much as a cold application. Devora applies that
        idea locally for{" "}
        <strong
          className={
            isLight
              ? "text-[#0a0a0a] font-black underline decoration-[#ff5ca8] underline-offset-2"
              : "text-[#ffd76f] font-bold"
          }
        >
          CECS @ UM&#8209;Dearborn
        </strong>
        , helpfulness looks like finding someone in your stack, your course, or
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
    getAnswer: (isLight: boolean) => (
      <>
        You can find people by{" "}
        <strong
          className={
            isLight
              ? "text-[#0a0a0a] font-black underline decoration-[#ff5ca8] underline-offset-2"
              : "text-[#ffd76f] font-bold"
          }
        >
          niche and direction
        </strong>
        , same interests, same path, same kind of work you want to do, and build a real
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
    getAnswer: (isLight: boolean) => (
      <>
        On purpose. I do not want Devora to feel like a Tinder for students. The
        model is closer to{" "}
        <strong
          className={
            isLight
              ? "text-[#0a0a0a] font-black underline decoration-[#ff5ca8] underline-offset-2"
              : "text-[#ffd76f] font-bold"
          }
        >
          mutual connection
        </strong>
        : you can connect with someone, they can connect back, and then you talk, or not,
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
    getAnswer: (isLight: boolean) => (
      <>
        No, you do not have to use it constantly, and{" "}
        <strong
          className={
            isLight
              ? "text-[#0a0a0a] font-black underline decoration-[#ff5ca8] underline-offset-2"
              : "text-[#ffd76f] font-bold"
          }
        >
          yes, you can deactivate anytime
        </strong>{" "}
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
    getAnswer: (isLight: boolean) => (
      <>
        You message{" "}
        <strong
          className={
            isLight
              ? "text-[#0a0a0a] font-black underline decoration-[#ff5ca8] underline-offset-2"
              : "text-[#ffd76f] font-bold"
          }
        >
          people you have connected with
        </strong>
        . Find peers in Discovery, connect when there is a shared reason, then
        continue the conversation from there. That keeps outreach intentional
        instead of turning the whole college into a cold-DM list, and Settings
        still let you tune who can reach you.
      </>
    ),
  },
];

// ===== SUB-COMPONENTS =====

/** Category badge shown beside question. */
function Stamp({
  children,
  isLight,
}: {
  children: ReactNode;
  isLight: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center h-7 px-3 rounded font-mono text-xs font-bold uppercase tracking-[0.08em] shrink-0 select-none transition-colors duration-200 ${
        isLight
          ? "border-2 border-[#0a0a0a] bg-[#ffeb99] text-[#0a0a0a] shadow-[1.5px_1.5px_0px_#0a0a0a]"
          : "border-[1.5px] border-[#ff9a3d] bg-[#1e1028] text-[#ffeb99]"
      }`}
    >
      {children}
    </span>
  );
}

/** Single accordion row — Neo-Brutalist card. */
function AccordionRow({
  faq,
  isOpen,
  onToggle,
  panelId,
  isLight,
}: {
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
  isLight: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl transition-all duration-200 ${
        isLight
          ? isOpen
            ? "bg-[#fff7fa] border-[3px] border-[#0a0a0a] shadow-[5px_5px_0px_#0a0a0a]"
            : "bg-white border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#0a0a0a]"
          : isOpen
          ? "bg-[#160c22] border-[2.5px] border-[#ff5ca8] shadow-[5px_5px_0px_#000000,6px_6px_0px_#ff5ca8]"
          : "bg-[#0e0817] border-2 border-[#2a183d] shadow-[4px_4px_0px_#000000] hover:border-[#ff5ca8]/60"
      }`}
    >
      {/* Trigger */}
      <h2 className="m-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full grid grid-cols-[1fr_auto_44px] items-center gap-4 min-h-[76px] px-5 sm:px-7 py-4.5 bg-transparent border-none cursor-pointer text-left outline-none"
        >
          {/* Question text */}
          <span
            className={`font-mono text-base sm:text-lg font-bold leading-snug tracking-tight max-w-[58ch] ${
              isLight ? "text-[#0a0a0a]" : "text-white"
            }`}
          >
            {faq.question}
          </span>

          {/* Category Stamp (hidden on very small mobile) */}
          <span className="hidden sm:flex items-center justify-center">
            <Stamp isLight={isLight}>{faq.stamp}</Stamp>
          </span>

          {/* Chevron circle */}
          <span
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform duration-260 ease-[cubic-bezier(.23,1,.32,1)] ${
              isLight
                ? isOpen
                  ? "bg-[#ff6b9d] border-2 border-[#0a0a0a] text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] rotate-180"
                  : "bg-white border-2 border-[#0a0a0a] text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] rotate-0"
                : isOpen
                ? "bg-[#ff5ca8] border-2 border-white text-[#08040f] shadow-[2px_2px_0px_#000000] rotate-180"
                : "bg-[#1a1028] border-2 border-[#2a183d] text-[#ff5ca8] shadow-[2px_2px_0px_#000000] rotate-0"
            }`}
          >
            <ChevronDown size={20} strokeWidth={2.6} />
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div
              className={`border-t px-5 sm:px-7 pt-4 pb-6 ${
                isLight ? "border-[#0a0a0a]/15" : "border-[#2a183d]"
              }`}
            >
              <p
                className={`m-0 font-body text-[16px] sm:text-[17px] leading-relaxed max-w-[68ch] ${
                  isLight ? "text-[#222222]" : "text-[#f4eefc]"
                }`}
              >
                {faq.getAnswer(isLight)}
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
 * Redesigned FAQ accordion.
 * High contrast, visible text in light and dark mode, zero emojis.
 */
export default function FAQAccordion() {
  const uid = useId();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // First question starts open
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
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* ── Search bar ── */}
      <div className="relative">
        <span
          aria-hidden="true"
          className={`absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none ${
            isLight ? "text-[#0a0a0a]" : "text-[#ff5ca8]"
          }`}
        >
          <Search size={22} strokeWidth={2.6} />
        </span>

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by topic, question or keyword..."
          aria-label="Search FAQ questions"
          className={`w-full h-15 pl-14 pr-12 rounded-xl font-mono text-base font-bold outline-none transition-all duration-200 ${
            isLight
              ? "bg-white border-[3px] border-[#0a0a0a] text-[#0a0a0a] placeholder:text-[#666666] shadow-[4px_4px_0px_#0a0a0a] focus:shadow-[6px_6px_0px_#0a0a0a] focus:translate-x-[-1px] focus:translate-y-[-1px]"
              : "bg-[#0e0817] border-[2.5px] border-[#ff5ca8] text-white placeholder:text-white/45 shadow-[4px_4px_0px_#000000] focus:border-[#ff2bd6] focus:shadow-[5px_5px_0px_#000000,6px_6px_0px_#ff2bd6]"
          }`}
        />

        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearchQuery("")}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
              isLight
                ? "bg-[#0a0a0a] text-white border-none"
                : "bg-[#1e1028] border border-[#ff5ca8] text-[#ff5ca8]"
            }`}
          >
            <X size={16} strokeWidth={2.8} />
          </button>
        )}
      </div>

      {/* ── Category pills ── */}
      <div className="flex flex-wrap gap-2.5 items-center">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={isSelected}
              className={`h-11 px-4.5 rounded-lg font-mono text-[14.5px] font-bold cursor-pointer inline-flex items-center gap-2 transition-all duration-200 select-none ${
                isSelected
                  ? "bg-gradient-to-r from-[#ff9a3d] to-[#ff5ca8] text-[#0a0a0a] border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] translate-x-[-1px] translate-y-[-1px]"
                  : isLight
                  ? "bg-white text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:bg-[#f4eef0] hover:translate-y-[-1px]"
                  : "bg-[#0e0817] text-white border-2 border-[#2a183d] shadow-[3px_3px_0px_#000000] hover:border-[#ff5ca8] hover:translate-y-[-1px]"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`font-mono text-xs font-bold ${
                  isSelected
                    ? "text-[#0a0a0a]/80"
                    : isLight
                    ? "text-[#555555]"
                    : "text-white/60"
                }`}
              >
                ({cat.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Meta row: count + expand/collapse all ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span
          aria-live="polite"
          className={`font-mono text-xs font-bold tracking-[0.08em] uppercase px-4 py-2 rounded-lg ${
            isLight
              ? "bg-white border-2 border-[#0a0a0a] text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
              : "bg-[#0e0817] border-[1.5px] border-[#2a183d] text-[#f4eefc] shadow-[2px_2px_0px_#000000]"
          }`}
        >
          Showing {filteredFaqs.length} of {FAQS.length} questions
        </span>

        {filteredFaqs.length > 0 && (
          <button
            type="button"
            onClick={handleExpandCollapse}
            className={`font-mono text-xs font-bold tracking-[0.08em] uppercase px-4 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2 transition-all duration-200 select-none ${
              isLight
                ? "bg-white border-2 border-[#0a0a0a] text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:bg-[#ff5ca8] active:translate-x-0.5 active:translate-y-0.5"
                : "bg-[#0e0817] border-[1.5px] border-[#ff5ca8] text-[#ff5ca8] shadow-[2px_2px_0px_#000000] hover:bg-[#ff5ca8] hover:text-[#08040f] active:translate-x-0.5 active:translate-y-0.5"
            }`}
          >
            <ChevronsUpDown size={15} strokeWidth={2.6} />
            <span>{allExpanded ? "Collapse all" : "Expand all"}</span>
          </button>
        )}
      </div>

      {/* ── Accordion rows ── */}
      {filteredFaqs.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {filteredFaqs.map((faq) => (
            <AccordionRow
              key={faq.id}
              faq={faq}
              isOpen={openIds.has(faq.id)}
              onToggle={() => toggleRow(faq.id)}
              panelId={`${uid}-panel-${faq.id}`}
              isLight={isLight}
            />
          ))}
        </div>
      ) : (
        /* Empty search state — Neo-Brutalist, strictly no emojis */
        <div
          className={`relative overflow-hidden text-center py-12 px-6 rounded-2xl ${
            isLight
              ? "bg-white border-[3px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a]"
              : "bg-[#0e0817] border-[2.5px] border-[#ff5ca8] shadow-[5px_5px_0px_#000000,6px_6px_0px_#ff5ca8]"
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none select-none absolute top-3 right-4 font-mono text-[10px] font-bold tracking-[0.2em] uppercase ${
              isLight ? "text-[#0a0a0a]/30" : "text-[#ff5ca8]/40"
            }`}
          >
            FAQS // 0_MATCHES
          </span>

          {/* Geometric glyph container */}
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-xl border-[2.5px] border-[#0a0a0a] bg-gradient-to-r from-[#ff9a3d] to-[#ff5ca8] shadow-[4px_4px_0px_#000000] -rotate-2">
            <svg
              aria-hidden="true"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>

          <h3
            className={`m-0 font-mono text-xl font-bold ${
              isLight ? "text-[#0a0a0a]" : "text-white"
            }`}
          >
            No matching questions found
          </h3>

          <p
            className={`mt-2 mb-6 font-mono text-sm max-w-[42ch] mx-auto ${
              isLight ? "text-[#555555]" : "text-white/60"
            }`}
          >
            We couldn&apos;t find any answers matching &ldquo;{searchQuery}&rdquo;.
            Try another keyword or reset the search filter.
          </p>

          <button
            type="button"
            onClick={clearSearch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-[#0a0a0a] bg-gradient-to-r from-[#ff9a3d] to-[#ff5ca8] text-[#0a0a0a] font-mono text-sm font-bold shadow-[3px_3px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <X size={16} strokeWidth={2.8} />
            <span>Clear search filter</span>
          </button>
        </div>
      )}
    </div>
  );
}

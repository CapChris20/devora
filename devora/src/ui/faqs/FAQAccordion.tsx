// FAQ accordion for Devora — Coach Connect "Design Law" (faqs.html).
// Left: numbered question index (q-list).
// Right: one large answer card (sticky, spacious, big outlined number, Next/Prev navigation).
// Stacks on mobile with smooth scroll to answer.
// Search bar (max 80 chars) + category filter chips.
// Zero emojis, zero pink borders, zero monochrome AI slop.

"use client";

import { useState, useMemo, useRef } from "react";
import gsap from "gsap";
import { Search, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

type FaqCategory = "all" | "about" | "networking" | "features";

type FaqItem = {
  id: string;
  category: FaqCategory;
  categoryLabel: string;
  question: string;
  answer: string;
};

const CATEGORIES: { id: FaqCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "about", label: "About Devora" },
  { id: "networking", label: "Networking & Career" },
  { id: "features", label: "Features & Privacy" },
];

const FAQS: FaqItem[] = [
  {
    id: "origin",
    category: "about",
    categoryLabel: "About Devora",
    question: "How did the idea for Devora come about?",
    answer:
      "It came from a real transfer experience at UM-Dearborn. When arriving as a transfer, reaching out to people, forming study groups, or networking can feel intimidating without an established network. Devora was built to eliminate that barrier: providing a direct, verified on-ramp where CECS students can showcase who they are, discover classmates in their exact courses, and connect with peers without having to force confidence they haven't built yet.",
  },
  {
    id: "nothing-comes",
    category: "about",
    categoryLabel: "About Devora",
    question: "What if I use Devora and nothing comes of it? What's the point?",
    answer:
      "Your presence on Devora works for you passively. Your profile highlights your major, technical niche, courses, and what you're seeking (hackathon partners, project teammates, or study buddies). Classmates and club leaders browse the directory daily. Beyond direct messaging, Devora surfaces official CECS clubs, workshops, and department events all in one place.",
  },
  {
    id: "not-tinder",
    category: "networking",
    categoryLabel: "Networking & Career",
    question: "Is Devora more than just a social matching tool for meeting people?",
    answer:
      "Yes, completely. Devora is the dedicated departmental ecosystem for UM-Dearborn CECS. It unites student organizations (ACM, GDSC, IEEE, Hack Dearborn), technical study groups, hackathon team formation, and direct peer networking. It replaces fragmented Discord servers and cold LinkedIn outreach with a school-verified directory built specifically for engineering and computing students.",
  },
  {
    id: "reach-out",
    category: "networking",
    categoryLabel: "Networking & Career",
    question: "How do I reach out to someone without feeling awkward?",
    answer:
      "Because everyone on Devora is a verified CECS student at UM-Dearborn, the context is already shared. Every profile displays current courses, technical interests, and what peers are looking for. Reaching out with a specific shared point ('Hey, noticed you're also taking CIS 350' or 'Saw you're into React and looking for a Hack Dearborn team') makes warm intros natural and zero-pressure.",
  },
  {
    id: "bad-social-skills",
    category: "networking",
    categoryLabel: "Networking & Career",
    question: "What if I'm introverted or don't have great networking skills?",
    answer:
      "Devora was purposefully built for you. You don't have to pitch yourself or send cold DMs if you don't want to. Setting up your profile allows classmates who need your exact skills or are in your classes to find you. You can browse clubs, view study groups, and connect at your own comfortable pace.",
  },
  {
    id: "safety-privacy",
    category: "features",
    categoryLabel: "Features & Privacy",
    question: "How does Devora protect my safety and privacy?",
    answer:
      "Devora requires authenticated university credentials (@umich.edu or @umd.umich.edu). No outside recruiters, bots, or anonymous lurkers can access student profiles. In your Settings, you have total granular control over which sections appear publicly (skills, interests, class rank) and can deactivate or delete your account with one click anytime.",
  },
  {
    id: "unique-features",
    category: "features",
    categoryLabel: "Features & Privacy",
    question: "What features make Devora different from LinkedIn or Discord?",
    answer:
      "Unlike LinkedIn, there is zero recruiter spam, algorithmic feed noise, or corporate posturing. Unlike Discord, conversations and identities aren't buried inside 40 different disconnected servers. Devora provides a single searchable directory of verified students, an Activity Center with real campus clubs and study groups, and clear profiles that answer 'do we click?' before you message.",
  },
  {
    id: "messaging-system",
    category: "features",
    categoryLabel: "Features & Privacy",
    question: "How does messaging and connecting with classmates work?",
    answer:
      "When you find a peer on the Discovery Grid or in a Club feed, you can view their full profile and send a connection request or direct message. All messaging takes place in high-contrast, real-time chat threads with read receipts and quick coordination replies for study sessions.",
  },
];

function getCategoryTagStyle(category: FaqCategory): string {
  switch (category) {
    case "about":
      return "bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a]";
    case "networking":
      return "bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-[#0a0a0a]";
    case "features":
      return "bg-gradient-to-r from-[#a78bfa] to-[#e879f9] text-[#0a0a0a]";
    default:
      return "bg-white text-[#0a0a0a]";
  }
}

export default function FAQAccordion() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("all");
  const [selectedFaqId, setSelectedFaqId] = useState<string>(FAQS[0].id);

  const answerRef = useRef<HTMLElement>(null);
  const answerContentRef = useRef<HTMLDivElement>(null);

  // Filter list
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      if (activeCategory !== "all" && faq.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().slice(0, 80);
        return (
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q) ||
          faq.categoryLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  // Ensure selected FAQ is visible in filtered list
  const activeIndex = useMemo(() => {
    const idx = filteredFaqs.findIndex((f) => f.id === selectedFaqId);
    return idx >= 0 ? idx : 0;
  }, [filteredFaqs, selectedFaqId]);

  const currentFaq = filteredFaqs[activeIndex] || filteredFaqs[0];

  const handleSelectFaq = (faq: FaqItem) => {
    setSelectedFaqId(faq.id);

    if (answerContentRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        answerContentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }

    // Scroll into view on mobile
    if (window.innerWidth < 900 && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      handleSelectFaq(filteredFaqs[activeIndex - 1]);
    }
  };

  const handleNext = () => {
    if (activeIndex < filteredFaqs.length - 1) {
      handleSelectFaq(filteredFaqs[activeIndex + 1]);
    }
  };

  return (
    <div className="w-full">
      {/* ── Page Header per Design Law (faqs.html) ── */}
      <header className="mb-8">
        <span className={`font-mono text-xs font-bold uppercase tracking-[0.14em] ${
          isLight ? "text-[#575757]" : "text-neutral-400"
        }`}>
          CECS knowledge base
        </span>
        <h1 className={`mt-2 font-display uppercase font-normal text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.92] ${
          isLight ? "text-[#0a0a0a]" : "text-white"
        }`}>
          Frequently asked
          <br />
          questions
        </h1>
        <div className="w-[130px] h-3 mt-4 rounded-full border-[3px] border-[#0a0a0a] dark:border-white/30 bg-gradient-to-r from-[#6206f1] via-[#eb2d85] to-[#ff6a1f]" />
      </header>

      {/* ── Controls Row: Search + Category Chips ── */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
        {/* Search input */}
        <label
          htmlFor="faq-search"
          className={`flex-1 min-w-[260px] h-12 flex items-center gap-2.5 px-3.5 rounded-[10px] border-[3px] transition-colors ${
            isLight
              ? "bg-white border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a]"
              : "bg-[#161022] border-white/30 shadow-[4px_4px_0px_#000000]"
          }`}
        >
          <Search size={18} className="text-[#575757] dark:text-neutral-400 shrink-0" />
          <input
            id="faq-search"
            type="search"
            maxLength={80}
            placeholder="Search questions, like privacy or clubs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-none outline-none font-body text-sm sm:text-base text-[#0a0a0a] dark:text-white placeholder:text-[#575757] dark:placeholder:text-neutral-500"
          />
        </label>

        {/* Category filter chips */}
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveCategory(cat.id)}
                className={`min-h-[40px] px-4 rounded-full border-2 border-[#0a0a0a] dark:border-white/30 font-mono text-xs font-bold uppercase tracking-[0.08em] transition-all duration-120 cursor-pointer select-none active:translate-x-0.5 active:translate-y-0.5 ${
                  isSelected
                    ? "bg-[#0a0a0a] text-white shadow-[2px_2px_0px_#0a0a0a] dark:bg-white dark:text-[#0a0a0a] dark:border-white"
                    : isLight
                    ? "bg-white text-[#0a0a0a] hover:shadow-[2px_2px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
                    : "bg-[#181124] text-neutral-300 hover:text-white hover:border-white/70"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Two-Column FAQ Grid ── */}
      {filteredFaqs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-6 items-start">
          {/* 1. Left Question Index (q-list) */}
          <ol
            className={`list-none m-0 p-0 rounded-[10px] overflow-hidden border-[3px] transition-all ${
              isLight
                ? "bg-white border-[#0a0a0a] shadow-[5px_5px_0px_#0a0a0a]"
                : "bg-[#120c1c] border-2 border-white/25 shadow-[6px_6px_0px_#000000]"
            }`}
          >
            {filteredFaqs.map((faq, idx) => {
              const isCurrent = currentFaq?.id === faq.id;
              const formattedNumber = String(idx + 1).padStart(2, "0");
              return (
                <li
                  key={faq.id}
                  className={`border-t-[3px] first:border-t-0 ${
                    isLight ? "border-[#0a0a0a]" : "border-white/20"
                  }`}
                >
                  <button
                    type="button"
                    aria-current={isCurrent}
                    onClick={() => handleSelectFaq(faq)}
                    className={`w-full grid grid-cols-[40px_minmax(0,1fr)_18px] items-center gap-3 p-3.5 sm:p-4 text-left transition-colors cursor-pointer select-none ${
                      isCurrent
                        ? isLight
                          ? "bg-[#0a0a0a] text-white"
                          : "bg-white text-[#0a0a0a]"
                        : isLight
                        ? "bg-white text-[#0a0a0a] hover:bg-[#f2f2f0]"
                        : "bg-[#120c1c] text-neutral-200 hover:bg-[#1c142b]"
                    }`}
                  >
                    {/* Number Box */}
                    <span
                      className={`h-[30px] flex items-center justify-center rounded-[8px] font-mono text-xs font-bold border-2 transition-colors ${
                        isCurrent
                          ? "bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a] border-white dark:border-[#0a0a0a]"
                          : isLight
                          ? "bg-white text-[#0a0a0a] border-[#0a0a0a]"
                          : "bg-[#1f1630] text-neutral-300 border-white/30"
                      }`}
                    >
                      {formattedNumber}
                    </span>

                    {/* Question Title */}
                    <span className="font-semibold text-[15px] leading-[1.35] line-clamp-2">
                      {faq.question}
                    </span>

                    {/* Arrow */}
                    <ArrowRight
                      size={16}
                      className={`transition-transform shrink-0 ${
                        isCurrent ? "translate-x-1" : "opacity-60"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ol>

          {/* 2. Right Large Sticky Answer Card */}
          {currentFaq && (
            <article
              ref={answerRef}
              aria-live="polite"
              className={`lg:sticky lg:top-24 rounded-[10px] p-6 sm:p-8 min-h-[340px] flex flex-col border-[3px] transition-all ${
                isLight
                  ? "bg-white border-[#0a0a0a] shadow-[7px_7px_0px_#0a0a0a]"
                  : "bg-[#120c1c] border-2 border-white/25 shadow-[8px_8px_0px_#000000]"
              }`}
            >
              <div ref={answerContentRef} className="flex-1 flex flex-col">
                {/* Tag & Big Outlined Number Row */}
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full border-2 border-[#0a0a0a] font-mono text-[10px] font-bold uppercase tracking-[0.08em] shadow-[2px_2px_0px_#0a0a0a] ${getCategoryTagStyle(
                      currentFaq.category
                    )}`}
                  >
                    {currentFaq.categoryLabel}
                  </span>

                  <span
                    aria-hidden="true"
                    className="font-display font-normal text-5xl sm:text-6xl text-[#e3e3df] dark:text-[#251d33] [-webkit-text-stroke:2.5px_#0a0a0a] dark:[-webkit-text-stroke:2px_rgba(255,255,255,0.4)] select-none leading-none"
                  >
                    {String(activeIndex + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Question Heading */}
                <h2 className={`mt-4 sm:mt-5 font-bold text-xl sm:text-2xl lg:text-[28px] leading-[1.18] tracking-tight ${
                  isLight ? "text-[#0a0a0a]" : "text-white"
                }`}>
                  {currentFaq.question}
                </h2>

                {/* Answer Paragraph */}
                <p className={`mt-4 font-body text-base sm:text-[17px] leading-[1.68] ${
                  isLight ? "text-[#262626]" : "text-neutral-200"
                }`}>
                  {currentFaq.answer}
                </p>

                {/* Prev / Next Navigation Row */}
                <div
                  className={`mt-auto pt-6 flex items-center justify-between gap-3 border-t-2 ${
                    isLight ? "border-[#e3e3df]" : "border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={activeIndex <= 0}
                    className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[8px] font-bold text-xs uppercase tracking-wider border-2 border-[#0a0a0a] dark:border-white/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isLight
                        ? "bg-white text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:bg-[#f2f2f0]"
                        : "bg-[#181124] text-white shadow-[2px_2px_0px_#000000]"
                    }`}
                  >
                    <ArrowLeft size={14} />
                    <span>Previous</span>
                  </button>

                  <span className="font-mono text-xs font-bold text-[#575757] dark:text-neutral-400">
                    {activeIndex + 1} of {filteredFaqs.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={activeIndex >= filteredFaqs.length - 1}
                    className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[8px] font-bold text-xs uppercase tracking-wider border-2 border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-[2px_2px_0px_#0a0a0a] dark:bg-white dark:text-[#0a0a0a] dark:border-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800"
                  >
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>
      ) : (
        /* Empty Search State */
        <div
          className={`p-10 text-center rounded-[10px] border-[3px] border-dashed ${
            isLight
              ? "bg-white border-[#0a0a0a]"
              : "bg-[#120c1c] border-white/30 text-white"
          }`}
        >
          <b className="block font-display text-xl uppercase mb-1 text-[#0a0a0a] dark:text-white">
            No questions match
          </b>
          <p className="font-body text-sm text-[#575757] dark:text-neutral-400">
            Try another word or pick &ldquo;All&rdquo; above.
          </p>
        </div>
      )}

      {/* ── Help Banner Below Grid per Design Law ── */}
      <div
        className={`mt-10 p-6 sm:p-7 rounded-[10px] border-[3px] border-[#0a0a0a] bg-[#0a0a0a] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          isLight ? "shadow-[5px_5px_0px_#0a0a0a]" : "shadow-[6px_6px_0px_#000000]"
        }`}
      >
        <div>
          <b className="font-display text-lg uppercase tracking-tight block">
            Have a question not answered here?
          </b>
          <p className="mt-1 text-sm text-[#cfcfcf] font-body">
            Drop a message in the Activity Center or connect directly with our student community.
          </p>
        </div>

        <Link
          href="/activity-center"
          className="inline-flex items-center justify-center shrink-0 min-h-[44px] px-5 rounded-[8px] border-2 border-white bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#ffffff] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
        >
          Explore Activity Center &rarr;
        </Link>
      </div>
    </div>
  );
}

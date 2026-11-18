// FAQ deck for /faqs (DESIGN_SCOPE.md anti-patterns, DESIGN.md NOT list).
// Search + category filters, then a 2-column deck of solid cards with neutral borders and hard shadows.
// Open questions get .headline-grad; answers use the readable body sans (font-body), never monospace.
// No colored accent rails, no emojis, no pink borders.

"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  ChevronDown,
  ChevronsUpDown,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
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
  { id: "all", label: "All Questions" },
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

// ===== CLASS NAME HELPERS =====
// Each helper names one visual decision so the JSX below never needs nested ternaries.

function getCategoryButtonClassName(isSelected: boolean, isLight: boolean): string {
  if (isSelected && isLight) return "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-[3px_3px_0px_#FB923C]";
  if (isSelected) return "bg-gradient-to-r from-[#ffd76f] via-[#ff9a3d] to-[#ff5ca8] text-[#0a0a0a] border-2 border-white shadow-[3px_3px_0px_#000000] font-black";
  if (isLight) return "bg-white text-[#0a0a0a] border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]";
  return "bg-[#161022] text-neutral-200 border-white/20 shadow-[3px_3px_0px_#000000] hover:border-white/45";
}

function getCategoryCountClassName(isSelected: boolean, isLight: boolean): string {
  if (isSelected) return "bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a]";
  if (isLight) return "bg-neutral-100 text-neutral-700";
  return "bg-white/10 text-neutral-300";
}

function getChevronClassName(isExpanded: boolean, isLight: boolean): string {
  const rotation = isExpanded ? "rotate-180" : "rotate-0";
  if (isExpanded && isLight) return `${rotation} bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-[2px_2px_0px_#fb923c]`;
  if (isExpanded) return `${rotation} bg-gradient-to-r from-[#ffd76f] via-[#ff9a3d] to-[#ff5ca8] border-white text-[#0a0a0a] shadow-[2px_2px_0px_#000000]`;
  if (isLight) return `${rotation} bg-white border-[#0a0a0a] text-[#0a0a0a]`;
  return `${rotation} bg-white/5 border-white/25 text-white group-hover:border-white/50`;
}

function getQuestionClassName(isExpanded: boolean, isLight: boolean): string {
  if (isExpanded && !isLight) return "bg-gradient-to-r from-[#ffd76f] via-[#ff9a3d] to-[#ff5ca8] bg-clip-text text-transparent font-black";
  if (isLight) return "text-[#0a0a0a]";
  return "text-white group-hover:text-[#ffd76f] transition-colors";
}

// ===== MAIN =====

export default function FAQAccordion() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(["origin", "not-tinder"])
  );

  // Toggle single item
  const toggleItem = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand / collapse all
  const areAllExpanded = expandedIds.size === FAQS.length;
  const toggleAll = () => {
    if (areAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(FAQS.map((f) => f.id)));
    }
  };

  // Filtered list
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      if (activeCategory !== "all" && faq.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ = faq.question.toLowerCase().includes(q);
        const matchA = faq.answer.toLowerCase().includes(q);
        const matchCat = faq.categoryLabel.toLowerCase().includes(q);
        return matchQ || matchA || matchCat;
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="w-full space-y-8">
      {/* ── Wide Spacious Search Bar ── */}
      <div
        className={`relative flex items-center w-full rounded-2xl border-2 transition-all duration-200 ${
          isLight
            ? "bg-white border-[#0a0a0a] shadow-[5px_5px_0px_#0a0a0a]"
            : "bg-[#0f0918] border-white/20 shadow-[5px_5px_0px_#000000]"
        }`}
      >
        <Search
          size={20}
          className={`ml-5 mr-3 shrink-0 ${
            isLight ? "text-neutral-500" : "text-neutral-400"
          }`}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by topic, question, or keyword (e.g. clubs, transfer, privacy)…"
          className={`w-full py-4 pr-12 text-base font-body bg-transparent outline-none ${
            isLight
              ? "text-[#0a0a0a] placeholder:text-neutral-400"
              : "text-white placeholder:text-neutral-500"
          }`}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className={`absolute right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors ${
              isLight ? "text-neutral-700" : "text-neutral-300"
            }`}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Category Filter Bar & Global Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        {/* Category Pills */}
        <div
          role="group"
          aria-label="Filter FAQ categories"
          className="flex flex-wrap gap-3"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const categoryCount =
              cat.id === "all"
                ? FAQS.length
                : FAQS.filter((f) => f.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2.5 h-11 px-5 sm:px-6 rounded-xl border-2 font-mono text-xs font-bold uppercase tracking-wider transition-[transform,box-shadow] duration-150 hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer select-none ${getCategoryButtonClassName(isSelected, isLight)}`}
              >
                <span>{cat.label}</span>
                <span
                  className={`min-w-[22px] text-center text-[11px] px-1.5 py-0.5 rounded-md font-bold ${getCategoryCountClassName(isSelected, isLight)}`}
                >
                  {categoryCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expand / Collapse All Button */}
        <button
          type="button"
          onClick={toggleAll}
          className={`inline-flex items-center gap-2 self-start sm:self-auto h-11 px-5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border-2 transition-[transform,box-shadow] duration-150 hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer select-none ${
            isLight
              ? "bg-white border-[#0a0a0a] text-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
              : "bg-[#1b1428] border-white/25 text-neutral-200 hover:text-white shadow-[3px_3px_0px_#000000]"
          }`}
        >
          <ChevronsUpDown size={14} />
          <span>{areAllExpanded ? "Collapse All" : "Expand All"}</span>
        </button>
      </div>

      {/* ── FAQ Cards Grid: 2-Column Responsive Deck ── */}
      {filteredFaqs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 lg:gap-7 pt-2">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);

            return (
              <div
                key={faq.id}
                className={`flex flex-col rounded-2xl overflow-hidden transition-[border-color] duration-200 ${
                  isLight
                    ? "bg-white border-[2.5px] border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a]"
                    : "bg-[#120c1c] border-2 border-white/20 shadow-[6px_6px_0px_#000000] hover:border-white/35"
                }`}
              >
                {/* Header clickable question area */}
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left p-6 sm:p-8 flex flex-col gap-4 cursor-pointer group select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-current"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider ${
                        isLight
                          ? "bg-neutral-100 text-neutral-700 border border-neutral-300"
                          : "bg-white/5 text-neutral-300 border border-white/10"
                      }`}
                    >
                      {faq.categoryLabel}
                    </span>

                    <span
                      aria-hidden="true"
                      className={`w-9 h-9 shrink-0 rounded-full border-2 flex items-center justify-center transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${getChevronClassName(isExpanded, isLight)}`}
                    >
                      <ChevronDown size={17} strokeWidth={2.5} />
                    </span>
                  </div>

                  <h3
                    className={`font-display text-lg sm:text-[22px] font-extrabold leading-[1.2] tracking-tight ${getQuestionClassName(isExpanded, isLight)}`}
                  >
                    {faq.question}
                  </h3>
                </button>

                {/* Collapsible Answer Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`mx-6 sm:mx-8 pb-7 sm:pb-8 pt-5 border-t-2 ${
                          isLight ? "border-[#0a0a0a]/10 text-neutral-700" : "border-white/10 text-neutral-200"
                        }`}
                      >
                        <p className="font-body text-base sm:text-[17px] leading-[1.65] max-w-[62ch]">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty search state */
        <div
          className={`rounded-xl border-2 border-dashed p-12 text-center ${
            isLight
              ? "bg-white border-[#0a0a0a] text-[#0a0a0a]"
              : "bg-[#140e20] border-white/20 text-white"
          }`}
        >
          <HelpCircle size={36} className="mx-auto mb-3 opacity-60" />
          <h3 className="font-display text-lg font-bold">No questions matched</h3>
          <p className="mt-2 font-body text-base opacity-80">
            Try adjusting your search terms or picking another category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="mt-5 h-11 px-5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── Footer CTA Banner ── */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
          isLight
            ? "bg-white border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] text-[#0a0a0a]"
            : "bg-[#120c1c] border-2 border-white/20 shadow-[6px_6px_0px_#000000] text-white"
        }`}
      >
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] opacity-70">
            Need more help?
          </span>
          <h4 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight">
            Have a question not answered here?
          </h4>
          <p
            className={`font-body text-base leading-[1.6] ${
              isLight ? "text-neutral-600" : "text-neutral-300"
            }`}
          >
            Reach out directly to CECS leadership or connect with club leaders in the Activity Center.
          </p>
        </div>

        <Link
          href="/activity-center"
          className="inline-flex items-center justify-center gap-2 shrink-0 h-12 px-6 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <span>Explore Activity Center</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

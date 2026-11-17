// Redesigned FAQ Module per DESIGN_SCOPE.md and DESIGN.md.
// Clean neo-brutalist 2-column deck with neutral borders, spacious layout,
// headline-grad on open questions, and zero colored accent rails.
// Strictly ZERO emojis.

"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  ChevronDown,
  ChevronsUpDown,
  HelpCircle,
  Sparkles,
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
          className={`w-full py-4 pr-12 text-sm sm:text-base font-mono bg-transparent outline-none ${
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
          className="flex flex-wrap gap-2.5"
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
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all duration-150 active:translate-x-px active:translate-y-px cursor-pointer select-none ${
                  isSelected
                    ? "bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]"
                    : isLight
                    ? "bg-white text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:bg-neutral-50"
                    : "bg-[#140e20] text-neutral-200 border-2 border-white/20 shadow-[2px_2px_0px_#000000] hover:border-white/40"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? "bg-[#0a0a0a] text-white"
                      : isLight
                      ? "bg-neutral-100 text-neutral-800"
                      : "bg-[#251a34] text-neutral-300"
                  }`}
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
          className={`inline-flex items-center gap-1.5 self-start sm:self-auto px-4 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer ${
            isLight
              ? "bg-white border-[#0a0a0a] text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:bg-neutral-50"
              : "bg-[#140e20] border-white/20 text-neutral-300 hover:text-white shadow-[2px_2px_0px_#000000]"
          }`}
        >
          <ChevronsUpDown size={14} />
          <span>{areAllExpanded ? "Collapse All" : "Expand All"}</span>
        </button>
      </div>

      {/* ── FAQ Cards Grid: 2-Column Responsive Deck ── */}
      {filteredFaqs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);

            return (
              <div
                key={faq.id}
                className={`flex flex-col justify-between rounded-xl border-2 transition-all duration-200 ${
                  isLight
                    ? "bg-white border-[#0a0a0a] shadow-[5px_5px_0px_#0a0a0a]"
                    : "bg-[#0f0918] border-white/20 shadow-[5px_5px_0px_#000000] hover:border-white/35"
                }`}
              >
                {/* Header clickable question area */}
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left p-6 sm:p-7 flex flex-col gap-3.5 cursor-pointer group select-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded font-mono text-[11px] font-bold uppercase tracking-wider ${
                        isLight
                          ? "bg-neutral-100 text-neutral-700 border border-neutral-300"
                          : "bg-white/5 text-neutral-300 border border-white/10"
                      }`}
                    >
                      {faq.categoryLabel}
                    </span>

                    <div
                      className={`p-1.5 rounded-lg border transition-all duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      } ${
                        isLight
                          ? "bg-neutral-100 border-[#0a0a0a] text-[#0a0a0a]"
                          : "bg-white/5 border-white/20 text-white"
                      }`}
                    >
                      <ChevronDown size={15} />
                    </div>
                  </div>

                  <h3
                    className={`font-display text-lg sm:text-xl font-bold leading-snug tracking-tight transition-all ${
                      isExpanded
                        ? isLight
                          ? "text-[#0a0a0a] font-extrabold"
                          : "headline-grad font-extrabold"
                        : isLight
                        ? "text-[#0a0a0a] group-hover:text-neutral-700"
                        : "text-white group-hover:text-amber-200"
                    }`}
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
                        className={`px-6 sm:px-7 pb-6 sm:pb-7 pt-3.5 border-t text-sm sm:text-base leading-relaxed ${
                          isLight
                            ? "border-neutral-200 text-neutral-700 bg-neutral-50/50"
                            : "border-white/10 text-neutral-200 bg-black/20"
                        }`}
                      >
                        <p className="font-sans leading-relaxed">{faq.answer}</p>
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
          <p className="mt-1 font-mono text-xs opacity-75">
            Try adjusting your search terms or picking another category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="mt-4 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase bg-gradient-to-r from-[#FF6B9D] to-[#FB923C] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]"
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
            : "bg-[#0e0918] border-2 border-white/20 shadow-[6px_6px_0px_#000000] text-white"
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#fb923c]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-80">
              Need More Help?
            </span>
          </div>
          <h4 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight">
            Have a question not answered here?
          </h4>
          <p
            className={`font-sans text-sm ${
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

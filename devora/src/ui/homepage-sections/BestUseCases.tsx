// Section 03 — eight “best use cases” (formerly FourSteps), shown four at a time.
// Flow: MouseGridBackground → chapter label → headline → one vertical panel.
//       Dots + a filling progress bar auto-cycle 01–04 ↔ 05–08.
// Manipulate here: edit STEPS for copy/icons; CARD_CYCLE_MS in CardCycle.tsx for speed.

"use client";

import { AnimatePresence, motion } from "framer-motion";
// vocab: AnimatePresence = keeps the old page mounted until its exit animation finishes
// vocab: StaticImageData = typed import of a local PNG used by next/image
import Image, { type StaticImageData } from "next/image";
import MouseGridBackground from "./MouseGridBackground";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";
import { CARD_CYCLE_MS, CardCycleBar, useCardCycle } from "./CardCycle";

// Custom use-case icons (one PNG per stop — filenames match the theme of each card).
// Manipulate here: swap any import path to change which artwork sits on a stop
import peersIcon from "@/ui/small-assets/use-case-peers.png";
import studyIcon from "@/ui/small-assets/use-case-study.png";
import eventsIcon from "@/ui/small-assets/use-case-events.png";
import networkIcon from "@/ui/small-assets/use-case-network.png";
import anxietyIcon from "@/ui/small-assets/use-case-anxiety.png";
import feedbackIcon from "@/ui/small-assets/use-case-feedback.png";
import decisionsIcon from "@/ui/small-assets/use-case-decisions.png";
import helpIcon from "@/ui/small-assets/use-case-help.png";

// Ordered list of use-case stops (icon, copy, and which accent color to use).
// accent keys must match STEP_GRADIENT_CLASS below.
// titleCompact = slightly smaller title font for long labels that wrap awkwardly.
// Icon mapping (easy to remember):
//   peers balance → Finding a Friend/Peer
//   study laptop → Searching for Study Groups
//   trophy envelope → Looking for Events/Opportunities
//   globe network → Building a Professional Network
//   anxiety figure → Reduce Anxiety for Commuter Students
//   thumbs-up bubble → Request Feedback on Experiences
//   yes/no bubbles → Navigating Academic Decisions
//   help laptop → Getting Help on Tech Projects
// Manipulate here: reorder, rewrite titles/descs, swap icon imports, or change accent.
const STEPS: {
  icon: StaticImageData;
  title: string;
  desc: string;
  accent: "logo" | "devora" | "pink" | "headline";
  // Manipulate here: set true on long titles so they fit the card without overflowing
  titleCompact?: boolean;
}[] = [
  {
    icon: peersIcon,
    title: "Finding a Friend/Peer",
    desc: "Find someone who shares your interests, goals, or experiences. This can be a friend, a study partner, or a mentor.",
    accent: "logo",
  },
  {
    icon: studyIcon,
    title: "Searching for Study Groups",
    desc: "Find a study group that meets your needs. This can be a study group for a specific course, a study group for a specific project, or a study group for a specific interest.",
    accent: "devora",
  },
  {
    icon: eventsIcon,
    title: "Looking for Events/Opportunities",
    desc: "This can be a job fair, a workshop, a hackathon, a study session, or a social event. This is a great way to meet new people and get involved in the community.",
    accent: "pink",
    titleCompact: true,
  },
  {
    icon: networkIcon,
    title: "Building a Professional Network ",
    desc: "Build a professional network by connecting with people who share your interests, goals, or experiences. Whether it be a mentor, a colleague, or a friend.",
    accent: "headline",
  },
  {
    icon: anxietyIcon,
    title: "Reduce Anxiety for Commuter Students",
    desc: "However you may feel, its always important to know who you align with emotionally and professionally. Another reason to join Devora is to reduce anxiety and feel more connected to the community.",
    accent: "logo",
  },
  {
    icon: feedbackIcon,
    title: "Request Feedback on Experiences",
    desc: "Not everyone is confident in what they do, and with Devora, it's an efficient method to get the best feedback as humanly possible..",
    accent: "devora",
  },
  {
    icon: decisionsIcon,
    title: "Navigating Academic Decisions",
    desc: "This can be asking upperclassmen which classes are worth it, finding certain reviews on professors, etc.",
    accent: "pink",
  },
  {
    icon: helpIcon,
    title: "Getting Help on Tech Projects",
    desc: "Ask your peers for help on a project you're working on. This can be a project for a specific course, a project for a specific project, or a project for a specific interest.",
    accent: "headline",
  },
];

// Soft brand fills for titles (card chrome still uses step-accent-* borders).
// Manipulate here: soft-peach / soft-pink / soft-violet / soft-headline
const STEP_GRADIENT_CLASS = {
  logo: "soft-peach",
  devora: "soft-pink",
  pink: "soft-violet",
  headline: "soft-headline",
} as const;

// How many use cases show in the panel at once. Dots = remaining groups.
// Manipulate here: 4 = two pages of eight; 8 would show everything with no pager
const PAGE_SIZE = 4;
const PAGE_COUNT = Math.ceil(STEPS.length / PAGE_SIZE);

export default function BestUseCases() {
  // Auto-advances first four ↔ last four. Dots still jump immediately.
  // vocab: useCardCycle = shared hook — index, pause-on-hover, restart-on-dot
  const cycle = useCardCycle(PAGE_COUNT);
  const page = cycle.index;

  // Slice the full list down to the four stops for this page.
  // vocab: slice(start, end) = copy from start up to (not including) end
  const visible = STEPS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    // landing-section-alt = alternating section background tint from globals.css
    <MouseGridBackground className="landing-section-alt">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        {/* Chapter label: “03 · How It Works” — FadeIn animates when scrolled into view */}
        <FadeIn>
          <SectionNumber num="03" title="How It Works" />
        </FadeIn>
        {/* vocab: delay={0.1} = wait 0.1s after entering view before fading in */}
        <FadeIn delay={0.1}>
          <h2 className="font-display soft-headline mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.65rem]">
            Best Use Cases for Devora!
          </h2>
        </FadeIn>

        {/* One vertical glass panel — four stops, then dots swap in the other four */}
        <FadeIn delay={0.12}>
          <article
            className="use-cases-panel mt-6 lg:mt-7"
            onMouseEnter={() => cycle.setPaused(true)}
            onMouseLeave={() => cycle.setPaused(false)}
          >
            <CardCycleBar
              count={PAGE_COUNT}
              activeIndex={cycle.index}
              durationMs={CARD_CYCLE_MS}
              paused={cycle.paused}
              cycleKey={cycle.cycleKey}
              reduceMotion={cycle.reduceMotion}
              onComplete={cycle.onComplete}
            />
            {/*
              vocab: mode="wait" = finish the outgoing fade before the incoming one starts
              vocab: key={page} = tells React this is a NEW list when the page changes
            */}
            <AnimatePresence mode="wait">
              <motion.ol
                key={page}
                className="use-cases-track"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                // Manipulate here: duration = how fast the four-pack crossfades
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {visible.map((s, i) => {
                  // Global index so numbers stay 01–08 across pages (not restarting at 01).
                  const globalIndex = page * PAGE_SIZE + i;

                  return (
                    <li
                      key={s.title}
                      className={`step-stop step-accent-${s.accent}`}
                    >
                      {/* Number + icon “beacon” sitting on the circuit node */}
                      <div className="step-beacon-wrap">
                        <span
                          className={`step-beacon-num font-pixel ${STEP_GRADIENT_CLASS[s.accent]}`}
                        >
                          {/* vocab: padStart(2,"0") = turn 1 into "01", 2 into "02", etc. */}
                          {String(globalIndex + 1).padStart(2, "0")}
                        </span>
                        <div className="step-beacon">
                          {/* Custom PNG icon — counter-rotated so it reads upright inside the diamond beacon.
                              vocab: next/image = optimized <img> with sizing + lazy loading */}
                          <Image
                            src={s.icon}
                            alt=""
                            className="step-beacon-icon-img"
                            width={40}
                            height={40}
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      {/* Title + description card for this use case */}
                      <div className="step-stop-card landing-surface-card">
                        <h3
                          className={`step-stop-title landing-card-title font-pixel ${STEP_GRADIENT_CLASS[s.accent]}${
                            s.titleCompact ? " step-stop-title-compact" : ""
                          }`}
                        >
                          {s.title}
                        </h3>
                        <p className="step-stop-desc">{s.desc}</p>
                      </div>
                    </li>
                  );
                })}
              </motion.ol>
            </AnimatePresence>

            {/* Pager dots — bottom-right. Click to change which four are showing.
                Manipulate here: PAGE_COUNT grows if you add more STEPS */}
            <div className="use-cases-pager" role="tablist" aria-label="Use case pages">
              {Array.from({ length: PAGE_COUNT }, (_, i) => {
                const selected = i === page;
                const from = i * PAGE_SIZE + 1;
                const to = Math.min((i + 1) * PAGE_SIZE, STEPS.length);

                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    // vocab: aria-selected = tells assistive tech which page is showing
                    aria-selected={selected}
                    aria-label={`Show use cases ${from} to ${to}`}
                    className={`use-cases-dot ${selected ? "use-cases-dot-active" : ""}`}
                    onClick={() => cycle.goTo(i)}
                  />
                );
              })}
            </div>
          </article>
        </FadeIn>
      </div>
    </MouseGridBackground>
  );
}

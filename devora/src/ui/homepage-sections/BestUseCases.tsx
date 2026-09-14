// Section 03 — eight “best use cases” cards (formerly FourSteps).
// Flow: MouseGridBackground → chapter label → headline → ordered list of stops.
// CSS (steps-circuit-cell-N) places each stop in the zigzag layout (no connecting wire).
// Manipulate here: edit STEPS to change copy/icons/accents.

"use client";

// vocab: StaticImageData = typed import of a local PNG used by next/image
import Image, { type StaticImageData } from "next/image";
import MouseGridBackground from "./MouseGridBackground";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";

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

export default function BestUseCases() {
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
          <h2 className="font-display soft-headline mt-12 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
           Best Use Cases for Devora!
          </h2>
        </FadeIn>

        {/* Use-case cards in a zigzag layout (CSS places each cell). No connecting path lines. */}
        <div className="steps-circuit mt-16 lg:mt-24">
          {/* One list item per step; CSS positions each cell.
              vocab: class steps-circuit-cell-N = CSS places this stop (1-indexed)
              Manipulate here: if you add/remove STEPS, also add/remove matching CSS cell rules */}
          <ol className="steps-circuit-track">
            {STEPS.map((s, i) => (
              // Stagger each stop’s entrance: 0s, 0.08s, 0.16s, …
              // Manipulate here: change 0.08 to tighten/loosen the cascade
              <FadeIn key={s.title} delay={0.08 * i} className={`steps-circuit-cell steps-circuit-cell-${i + 1}`}>
                {/* step-accent-* drives per-stop color accents in CSS */}
                <li className={`step-stop step-stop-${i + 1} step-accent-${s.accent}`}>
                  {/* Number + icon “beacon” sitting on the circuit node */}
                  <div className="step-beacon-wrap">
                    <span className={`step-beacon-num font-pixel ${STEP_GRADIENT_CLASS[s.accent]}`}>
                      {/* vocab: padStart(2,"0") = turn 1 into "01", 2 into "02", etc. */}
                      {String(i + 1).padStart(2, "0")}
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
              </FadeIn>
            ))}
          </ol>
        </div>
      </div>
    </MouseGridBackground>
  );
}

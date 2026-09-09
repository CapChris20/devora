// Section 03 — eight “best use cases” stops on a zigzag circuit path.
// Flow: MouseGridBackground → chapter label → headline → SVG circuit path →
// ordered list of stops. CSS (steps-circuit-cell-N) places each stop on the track.
// Manipulate here: edit STEPS to change copy/icons/accents; edit CIRCUIT_PATH to reshape the wire.

import {
  CalendarDays,
  MessageSquare,
  Network,
  Radar,
  Rocket,
  Sparkles,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import MouseGridBackground from "./MouseGridBackground";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";

// Ordered list of use-case stops (icon, copy, and which accent color to use).
// accent keys must match STEP_GRADIENT_CLASS below.
// Manipulate here: reorder, rewrite titles/descs, swap Lucide icons, or change accent.
const STEPS = [
  {
    icon: UserRoundPlus,
    title: "Finding a Friend/Peer",
    desc: "Find someone who shares your interests, goals, or experiences. This can be a friend, a study partner, or a mentor.",
    accent: "logo" as const,
  },
  {
    icon: Radar,
    title: "Searching for Study Groups",
    desc: "Find a study group that meets your needs. This can be a study group for a specific course, a study group for a specific project, or a study group for a specific interest.",
    accent: "devora" as const,
  },
  {
    icon: Network,
    title: "Looking for Events/Opportunities",
    desc: "This can be a job fair, a workshop, a hackathon, a study session, or a social event. This is a great way to meet new people and get involved in the community.",
    accent: "pink" as const,
  },
  {
    icon: Sparkles,
    title: "Building a Professional Network ",
    desc: "Build a professional network by connecting with people who share your interests, goals, or experiences. Whether it be a mentor, a colleague, or a friend.",
    accent: "headline" as const,
  },
  {
    icon: MessageSquare,
    title: "Reduce Anxiety for Commuter Students",
    desc: "However you may feel, its always important to know who you align with emotionally and professionally. Another reason to join Devora is to reduce anxiety and feel more connected to the community.",
    accent: "logo" as const,
  },
  {
    icon: UsersRound,
    title: "Request Feedback on Experiences",
    desc: "Not everyone is confident in what they do, and with Devora, it's an efficient method to get the best feedback as humanly possible..",
    accent: "devora" as const,
  },
  {
    icon: CalendarDays,
    title: "Navigating Academic Decisions",
    desc: "This can be asking upperclassmen which classes are worth it, finding certain reviews on professors, etc.",
    accent: "pink" as const,
  },
  {
    icon: Rocket,
    title: "Getting Help on Tech Projects",
    desc: "Ask your peers for help on a project you're working on. This can be a project for a specific course, a project for a specific project, or a project for a specific interest.",
    accent: "headline" as const,
  },
] as const;
// vocab: as const = lock STEPS accent strings as exact literals ("logo" | "devora" | …)
// so TypeScript can autocomplete and catch typos

// Map accent names from STEPS to the CSS gradient class strings in globals.css.
// Manipulate here: point an accent at a different gradient class to recolor titles/numbers.
const STEP_GRADIENT_CLASS = {
  logo: "logo-gradient",
  devora: "devora-gradient-text",
  pink: "pink-grad",
  headline: "headline-grad",
} as const;

// SVG path coordinates: descend L→R, then climb back R→L (the zigzag “circuit”).
// viewBox is 0 0 1000 760 — these numbers are in that coordinate space, not CSS pixels.
// vocab: SVG path M = Move to; L = Line to (absolute coords)
// Manipulate here: change X/Y pairs to reshape the wire; keep in sync with steps-circuit-cell-N CSS
const CIRCUIT_PATH =
  "M 52 72 L 52 148 L 298 148 L 298 224 L 544 224 L 544 300 L 790 300 L 790 376 L 790 460 L 544 460 L 544 536 L 298 536 L 298 612 L 52 612 L 52 688";

export default function FourSteps() {
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
          <h2 className="font-display headline-grad mt-12 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
           Best Use Cases for Devora!
          </h2>
        </FadeIn>

        {/* Circuit board: glowing path SVG underneath + ordered list of step stops on top.
            CSS grid/absolute rules on .steps-circuit-* pin each cell to a corner of the path. */}
        <div className="steps-circuit mt-16 lg:mt-24">
          {/* Decorative path only — hidden from screen readers (the <ol> carries the meaning).
              vocab: preserveAspectRatio="none" = stretch the path to fill the box (may look non-uniform)
              Manipulate here: change viewBox if you redraw CIRCUIT_PATH in a different coordinate space */}
          <svg
            className="steps-circuit-path"
            viewBox="0 0 1000 760"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Gold → pink → purple stroke used by both path layers via url(#stepsPathGrad).
                Manipulate here: edit stopColor / offset to restyle the wire gradient. */}
            <defs>
              <linearGradient id="stepsPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd76f" stopOpacity="0.95" />
                <stop offset="22%" stopColor="#ff9a3d" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#ff5ca8" stopOpacity="0.9" />
                <stop offset="68%" stopColor="#ff2bd6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7b2ff7" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            {/* Soft wide glow under the dashed core line.
                vocab: stroke="url(#id)" = use the gradient defined above as the stroke paint
                vocab: strokeLinecap / strokeLinejoin = how corners and ends of the stroke look */}
            <path
              className="steps-circuit-path-glow"
              d={CIRCUIT_PATH}
              fill="none"
              stroke="url(#stepsPathGrad)"
              strokeWidth="10"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            {/* Thin dashed “wire” on top of the glow.
                vocab: strokeDasharray="10 14" = 10px dash, 14px gap (repeat)
                Manipulate here: change dasharray for denser/sparser dashes */}
            <path
              className="steps-circuit-path-core"
              d={CIRCUIT_PATH}
              fill="none"
              stroke="url(#stepsPathGrad)"
              strokeWidth="2"
              strokeDasharray="10 14"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>

          {/* One list item per step; CSS positions each cell on the path.
              vocab: class steps-circuit-cell-N = CSS places this stop on the path (1-indexed)
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
                      {/* vocab: <s.icon /> = render the Lucide component stored on this step */}
                      <s.icon className="step-beacon-icon" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Title + description card for this use case */}
                  <div className="step-stop-card landing-surface-card">
                    <h3 className={`step-stop-title landing-card-title font-pixel ${STEP_GRADIENT_CLASS[s.accent]}`}>
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

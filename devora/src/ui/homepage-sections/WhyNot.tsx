// Section 04 — “Why Devora” matchup vs GitHub, LinkedIn, and Discord.
// Flow: mouse-grid → chapter label → signal header → ONE matchup card.
//       Dots + a filling progress bar auto-cycle GitHub → LinkedIn → Discord.
// Manipulate here: edit COMPARISONS for rivals/copy; CARD_CYCLE_MS in CardCycle.tsx for speed.

"use client";

// vocab: AnimatePresence = keeps the old panel mounted until its exit animation finishes
import { AnimatePresence, motion } from "framer-motion";
import githubAnimation from "@/ui/lottie-animations/why-devora-github.json";
import linkedinAnimation from "@/ui/lottie-animations/why-devora-linkedin.json";
import discordAnimation from "@/ui/lottie-animations/why-devora-discord.json";
import type { DevoraLottiePreset } from "@/ui/lottie-animations/recolor-lottie";
import MouseGridBackground from "./MouseGridBackground";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";
import WhyMatchupLottie from "./WhyMatchupLottie";
import { CARD_CYCLE_MS, CardCycleBar, useCardCycle } from "./CardCycle";

// One comparison object per rival platform.
// preset picks which Devora palette recolorLottie applies to the Lottie JSON.
// Manipulate here: rewrite any bullet / punchline (alt) — keep 4–5 punchy lines per rival
const COMPARISONS: Array<{
  vs: string;
  preset: DevoraLottiePreset;
  animation: object;
  alt: string;
  devora: string[];
}> = [
  {
    vs: "GitHub",
    preset: "github",
    animation: githubAnimation,
    alt: "Great for hosting code. Terrible for finding the junior who knows Unity and sits two rows behind you in CIS 350.",
    // Manipulate here: keep bullets concrete (course / skill / scenario) — avoid vague “better networking”
    devora: [
      "Find React + Unity classmates for a hackathon in seconds — not by stalking commit histories",
      "Profiles built for teaming up (skills, courses, projects), not just green contribution squares",
      "Ask “who’s taking DSA this semester?” and get real people — not silent repos and READMEs",
      "Warm intros between verified CECS peers — no cold DMs to random GitHub usernames",
      "Side projects, study crews, and collabs start here; GitHub stays where the code lives",
    ],
  },
  {
    vs: "LinkedIn",
    preset: "linkedin",
    animation: linkedinAnimation,
    alt: "A sea of recruiters, strangers, and “open to work” banners. Nobody there cares about your ECE 270 study group.",
    devora: [
      "Everyone here is CECS @ UM-Dearborn — zero recruiter spam, zero out-of-school noise",
      "Find React devs taking DSA this semester in seconds — not scrolling LinkedIn for hours",
      "Build actual projects with verified peers, not collect endorsements from randos",
      "Student-first discovery for hackathons, study groups, and side projects — not job-hunt theater",
      "Message people who share your major and goals — not “Hi, I saw your profile” templates",
    ],
  },
  {
    vs: "Discord / Slack",
    preset: "discord",
    animation: discordAnimation,
    alt: "Forty fragmented servers, dead #general channels, and no way to know who actually knows React.",
    devora: [
      "One searchable directory for the whole school — not 40 half-dead Discord servers",
      "Verified UM-Dearborn identities — no anonymous lurkers or “who is this?” moments",
      "Filter by skill, course, or interest — not scrolling chat history hoping someone replies",
      "Profiles answer “can they help on my project?” before you even open a DM",
      "Built for finding teammates fast; Discord stays for the group chat once you’ve found them",
    ],
  },
];

// Soft brand accents for rival names — cool color without neon overload.
const COMPARISON_NAME_GRAD = [
  "soft-peach",
  "soft-pink",
  "soft-violet",
] as const;

export default function WhyNot() {
  // Auto-advances GitHub → LinkedIn → Discord. Dots still jump immediately.
  // vocab: useCardCycle = shared hook — index, pause-on-hover, restart-on-dot
  const cycle = useCardCycle(COMPARISONS.length);
  const c = COMPARISONS[cycle.index];
  const accent = COMPARISON_NAME_GRAD[cycle.index % COMPARISON_NAME_GRAD.length];
  // vocab: padStart(2,"0") = turn 1 into "01"
  const code = String(cycle.index + 1).padStart(2, "0");

  return (
    <MouseGridBackground className="landing-section">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        {/* Chapter label */}
        <FadeIn>
          <SectionNumber num="04" title="Why Devora" />
        </FadeIn>

        {/* Signal header — matches What is Devora / Key Info energy */}
        <FadeIn delay={0.08}>
          <div className="why-header mt-6 lg:mt-7">
            <p className="why-eyebrow font-pixel">
              <span className="soft-pink">MATCHUP</span>
              <span className="why-eyebrow-sep" aria-hidden="true">
                /
              </span>
              <span className="theme-faint">THREE KOs</span>
            </p>
            <h2 className="why-title font-display soft-headline">
              Not another platform.
              <br />
              The platform.
            </h2>
            <p className="why-lead">
              GitHub hosts code. LinkedIn hosts résumés. Discord hosts chaos. Devora hosts the
              CECS people you actually need to ship with.
            </p>
          </div>
        </FadeIn>

        {/* One matchup card — dots + auto-cycle bar swap GitHub / LinkedIn / Discord */}
        <FadeIn delay={0.12}>
          <article
            className="why-matchup mt-6 lg:mt-7"
            // Hover pauses the fill so the card does not switch mid-read.
            onMouseEnter={() => cycle.setPaused(true)}
            onMouseLeave={() => cycle.setPaused(false)}
          >
            <CardCycleBar
              count={COMPARISONS.length}
              activeIndex={cycle.index}
              durationMs={CARD_CYCLE_MS}
              paused={cycle.paused}
              cycleKey={cycle.cycleKey}
              reduceMotion={cycle.reduceMotion}
              onComplete={cycle.onComplete}
            />
            {/*
              vocab: mode="wait" = finish the outgoing fade before the incoming one starts
              vocab: key={c.vs} = tells React this is a NEW panel when the rival changes
            */}
            <AnimatePresence mode="wait">
              <motion.div
                key={c.vs}
                className="why-matchup-inner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                // Manipulate here: duration = how fast the card content crossfades
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Copy column — KO header, win rails, punchline */}
                <div className="why-matchup-copy">
                  <div className="why-matchup-top">
                    <span className={`why-matchup-code font-pixel ${accent}`}>{code}</span>
                    <span className="why-matchup-ko font-pixel">KO</span>
                    <span className="why-matchup-vs">
                      vs{" "}
                      <span className={`why-matchup-name font-display ${accent}`}>{c.vs}</span>
                    </span>
                  </div>

                  <div className="why-matchup-winner">
                    <span className="why-matchup-devora font-pixel soft-peach">DEVORA</span>
                    <ul className="why-matchup-wins">
                      {c.devora.map((d) => (
                        <li key={d} className="why-matchup-win">
                          {/* Fake “code comment” marker — {"//"} so JSX doesn’t treat // as a comment */}
                          <span className="why-matchup-marker font-pixel" aria-hidden="true">
                            {"//"}
                          </span>
                          <span className="why-matchup-win-text">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="why-matchup-footer">
                    <div className="glow-line h-px w-full" aria-hidden="true" />
                    <p className="why-matchup-punchline">{c.alt}</p>
                  </div>
                </div>

                {/* Lottie sits in a glass frame — not a tiny floating watermark */}
                <div className="why-matchup-media">
                  <div className="why-matchup-lottie-frame">
                    <div className="why-matchup-lottie-glow" aria-hidden="true" />
                    <WhyMatchupLottie
                      animationData={c.animation}
                      preset={c.preset}
                      ariaLabel={`${c.vs} animation`}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pager dots — bottom-right of the card. Click to change activeIndex.
                Manipulate here: order matches COMPARISONS; add a 4th rival = add a 4th button */}
            <div className="why-matchup-pager" role="tablist" aria-label="Why Devora matchups">
              {COMPARISONS.map((rival, i) => {
                const selected = i === cycle.index;
                return (
                  <button
                    key={rival.vs}
                    type="button"
                    role="tab"
                    // vocab: aria-selected = tells assistive tech which rival is showing
                    aria-selected={selected}
                    aria-label={`Show Devora vs ${rival.vs}`}
                    className={`why-matchup-dot ${selected ? "why-matchup-dot-active" : ""}`}
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

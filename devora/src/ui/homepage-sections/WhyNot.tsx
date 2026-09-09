// Section 04 — “Why Devora” matchups vs GitHub, LinkedIn, and Discord.
// Each card: recolored Lottie, KO header, win bullets, punchline footer.
// Manipulate here: edit COMPARISONS for rivals/copy; presets drive recolor-lottie palettes.

import githubAnimation from "@/ui/lottie-animations/why-devora-github.json";
import linkedinAnimation from "@/ui/lottie-animations/why-devora-linkedin.json";
import discordAnimation from "@/ui/lottie-animations/why-devora-discord.json";
import type { DevoraLottiePreset } from "@/ui/lottie-animations/recolor-lottie";
import MouseGridBackground from "./MouseGridBackground";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";
import WhyMatchupLottie from "./WhyMatchupLottie";

// One comparison object per rival platform.
// preset picks which Devora palette recolorLottie applies to the Lottie JSON.
// Manipulate here: add another rival object (and a matching Lottie + preset) to grow the list
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
    alt: "Great for hosting code. Terrible for finding the junior who knows Unity and sits two rows behind you.",
    devora: [
      "Find classmates by skill, course, or interest",
      "Profiles designed for teaming up, not just commits",
      "Warm intros — no cold DMs to strangers",
    ],
  },
  {
    vs: "LinkedIn",
    preset: "linkedin",
    animation: linkedinAnimation,
    alt: "A sea of recruiters and strangers. Nobody there cares about your ECE 270 study group.",
    devora: [
      "Everyone here is CECS @ UM-Dearborn — zero noise",
      "Student-first, not recruiter-first",
      "Real collaboration, not performative posting",
    ],
  },
  {
    vs: "Discord / Slack",
    preset: "discord",
    animation: discordAnimation,
    alt: "Forty fragmented servers, dead channels, and no way to know who actually knows React.",
    devora: [
      "One directory for the whole school, not 40 dead servers",
      "Verified identities — no anonymous lurkers",
      "Search by skill, not by scrolling chat history",
    ],
  },
];

// Gradient class for each rival name in the “vs …” line.
const COMPARISON_NAME_GRAD = [
  "logo-gradient",
  "devora-gradient-text",
  "pink-grad",
] as const;

export default function WhyNot() {
  return (
    <MouseGridBackground className="landing-section">
      <div className="mx-auto max-w-6xl px-6">
        {/* Chapter label + section headline */}
        <FadeIn>
          <SectionNumber num="04" title="Why Devora" />
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="font-display headline-grad mt-12 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Not another platform. The platform.
          </h2>
        </FadeIn>

        {/* Stack of matchup cards — one per COMPARISONS entry */}
        <div className="why-matchups mt-16 lg:mt-20">
          {/* vocab: one FadeIn card per rival platform in COMPARISONS */}
          {COMPARISONS.map((c, i) => (
            <FadeIn key={c.vs} delay={0.08 * i}>
              <article className="why-matchup landing-surface-card">
                {/* Lottie recolored to match this rival’s Devora palette via WhyMatchupLottie */}
                <WhyMatchupLottie
                  animationData={c.animation}
                  preset={c.preset}
                  ariaLabel={`${c.vs} animation`}
                />

                {/* “KO” badge + “vs GitHub” (etc.) header */}
                <div className="why-matchup-top">
                  <span className="why-matchup-ko font-pixel logo-gradient">KO</span>
                  <span className="why-matchup-vs theme-faint">
                    vs{" "}
                    {/* vocab/symbol: % wraps the gradient index so we never go past the list */}
                    <span className={`why-matchup-name font-pixel ${COMPARISON_NAME_GRAD[i % COMPARISON_NAME_GRAD.length]}`}>
                      {c.vs}
                    </span>
                  </span>
                </div>

                {/* Devora win list for this matchup — each bullet is a string in c.devora */}
                <div className="why-matchup-winner">
                  <span className="why-matchup-devora font-pixel logo-gradient">DEVORA</span>
                  <ul className="why-matchup-wins">
                    {c.devora.map((d) => (
                      <li key={d} className="why-matchup-win">
                        {/* Fake “code comment” marker — {"//"} so JSX doesn’t treat // as a comment */}
                        <span className="why-matchup-marker font-pixel" aria-hidden="true">
                          {"//"}
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Glow divider + punchline about the rival platform */}
                <div className="why-matchup-footer">
                  <div className="glow-line h-px w-full" aria-hidden="true" />
                  <p className="why-matchup-punchline">{c.alt}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </MouseGridBackground>
  );
}

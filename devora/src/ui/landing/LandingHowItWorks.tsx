import { Network, Radar, Sparkles, UserRoundPlus } from "lucide-react";
import LandingGridSection from "./LandingGridSection";
import { LandingChapter, LandingReveal } from "./LandingReveal";

const STEPS = [
  {
    icon: UserRoundPlus,
    title: "Claim Your Profile",
    desc: "Sign up with your UMich email and get instantly verified as CECS.",
  },
  {
    icon: Radar,
    title: "Discover Your People",
    desc: "Search by skill, course, or vibe. The network maps itself around you.",
  },
  {
    icon: Network,
    title: "Join or Launch",
    desc: "Drop into an existing project hub or start your own and recruit in minutes.",
  },
  {
    icon: Sparkles,
    title: "Collaborate & Meet",
    desc: "Chat, build, and meet up on campus. Online connections, real-world output.",
  },
];

export default function LandingHowItWorks() {
  return (
    <LandingGridSection className="landing-section-alt">
      <div className="mx-auto max-w-6xl px-6">
        <LandingReveal>
          <LandingChapter num="03" title="How It Works" />
        </LandingReveal>
        <LandingReveal delay={0.1}>
          <h2 className="font-display pink-grad mt-12 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Four steps to your crew.
          </h2>
        </LandingReveal>

        <div className="relative mt-16">
          <div
            className="step-connector absolute left-0 right-0 top-7 hidden h-0.5 lg:block"
            aria-hidden="true"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const last = i === STEPS.length - 1;
              return (
                <LandingReveal key={s.title} delay={0.12 * i}>
                  <div
                    className={`neon-card group relative h-full rounded-2xl p-7 ${last ? "neon-card-cyan" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-pixel text-xs ${
                          last
                            ? "step-num-cyan text-[#22d3ee] [text-shadow:0_0_14px_rgba(34,211,238,0.9)]"
                            : "step-num-pink text-[#ff5ca8] [text-shadow:0_0_14px_rgba(255,92,168,0.9)]"
                        }`}
                      >
                        0{i + 1}
                      </span>
                      <s.icon
                        className={`h-8 w-8 transition-transform duration-500 group-hover:scale-110 ${
                          last
                            ? "text-[#22d3ee] [filter:drop-shadow(0_0_10px_rgba(34,211,238,0.7))]"
                            : "icon-glow"
                        }`}
                      />
                    </div>
                    <h3 className="theme-heading font-display mt-6 text-base font-semibold">
                      {s.title}
                    </h3>
                    <p className="theme-muted mt-3 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </LandingReveal>
              );
            })}
          </div>
        </div>
      </div>
    </LandingGridSection>
  );
}

import { Network, Radar, Sparkles, UserRoundPlus } from "lucide-react";
import MouseGridBackground from "./MouseGridBackground";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";

const STEPS = [
  {
    icon: UserRoundPlus,
    title: "Claim Your Profile",
    desc: "Sign up with your UMich email and get instantly verified as CECS.",
    accent: "logo" as const,
  },
  {
    icon: Radar,
    title: "Discover Your People",
    desc: "Search by skill, course, or vibe. The network maps itself around you.",
    accent: "devora" as const,
  },
  {
    icon: Network,
    title: "Join or Launch",
    desc: "Drop into an existing project hub or start your own and recruit in minutes.",
    accent: "pink" as const,
  },
  {
    icon: Sparkles,
    title: "Collaborate & Meet",
    desc: "Chat, build, and meet up on campus. Online connections, real-world output.",
    accent: "headline" as const,
  },
] as const;

const STEP_GRADIENT_CLASS = {
  logo: "logo-gradient",
  devora: "devora-gradient-text",
  pink: "pink-grad",
  headline: "headline-grad",
} as const;

export default function FourSteps() {
  return (
    <MouseGridBackground className="landing-section-alt">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionNumber num="03" title="How It Works" />
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="font-display headline-grad mt-12 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Four steps to your crew.
          </h2>
        </FadeIn>

        <div className="steps-circuit mt-16 lg:mt-24">
          <svg
            className="steps-circuit-path"
            viewBox="0 0 1000 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="stepsPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffd76f" stopOpacity="0.95" />
                <stop offset="22%" stopColor="#ff9a3d" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#ff5ca8" stopOpacity="0.9" />
                <stop offset="68%" stopColor="#ff2bd6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7b2ff7" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <path
              className="steps-circuit-path-glow"
              d="M 52 72 L 52 148 L 298 148 L 298 224 L 544 224 L 544 300 L 790 300 L 790 376"
              fill="none"
              stroke="url(#stepsPathGrad)"
              strokeWidth="10"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            <path
              className="steps-circuit-path-core"
              d="M 52 72 L 52 148 L 298 148 L 298 224 L 544 224 L 544 300 L 790 300 L 790 376"
              fill="none"
              stroke="url(#stepsPathGrad)"
              strokeWidth="2"
              strokeDasharray="10 14"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>

          <ol className="steps-circuit-track">
            {STEPS.map((s, i) => (
                <FadeIn key={s.title} delay={0.12 * i} className="steps-circuit-cell">
                  <li className={`step-stop step-stop-${i + 1} step-accent-${s.accent}`}>
                    <div className="step-beacon-wrap">
                      <span className={`step-beacon-num font-pixel ${STEP_GRADIENT_CLASS[s.accent]}`}>
                        0{i + 1}
                      </span>
                      <div className="step-beacon">
                        <s.icon className="step-beacon-icon" aria-hidden="true" />
                      </div>
                    </div>

                    <div className="step-stop-card landing-surface-card">
                      <h3 className="theme-heading font-display text-base font-semibold sm:text-lg">
                        {s.title}
                      </h3>
                      <p className="theme-muted mt-2 text-sm leading-relaxed">{s.desc}</p>
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

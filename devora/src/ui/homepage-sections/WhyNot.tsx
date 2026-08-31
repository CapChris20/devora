import MouseGridBackground from "./MouseGridBackground";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";

const COMPARISONS = [
  {
    vs: "GitHub",
    alt: "Great for hosting code. Terrible for finding the junior who knows Unity and sits two rows behind you.",
    devora: [
      "Find classmates by skill, course, or interest",
      "Profiles designed for teaming up, not just commits",
      "Warm intros — no cold DMs to strangers",
    ],
  },
  {
    vs: "LinkedIn",
    alt: "A sea of recruiters and strangers. Nobody there cares about your ECE 270 study group.",
    devora: [
      "Everyone here is CECS @ UM-Dearborn — zero noise",
      "Student-first, not recruiter-first",
      "Real collaboration, not performative posting",
    ],
  },
  {
    vs: "Discord / Slack",
    alt: "Forty fragmented servers, dead channels, and no way to know who actually knows React.",
    devora: [
      "One directory for the whole school, not 40 dead servers",
      "Verified identities — no anonymous lurkers",
      "Search by skill, not by scrolling chat history",
    ],
  },
];

export default function WhyNot() {
  return (
    <MouseGridBackground className="landing-section">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionNumber num="04" title="Why Devora" />
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="font-display headline-grad mt-12 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Not another platform. The platform.
          </h2>
        </FadeIn>

        <div className="why-matchups mt-16 lg:mt-20">
          {COMPARISONS.map((c, i) => (
            <FadeIn key={c.vs} delay={0.08 * i}>
              <article className="why-matchup landing-surface-card">
                <span className="why-matchup-ghost font-display" aria-hidden="true">
                  {c.vs}
                </span>

                <div className="why-matchup-top">
                  <span className="why-matchup-ko font-pixel">KO</span>
                  <span className="why-matchup-vs theme-faint">
                    vs <span className="why-matchup-name">{c.vs}</span>
                  </span>
                </div>

                <div className="why-matchup-winner">
                  <span className="why-matchup-devora font-pixel logo-gradient">DEVORA</span>
                  <ul className="why-matchup-wins">
                    {c.devora.map((d) => (
                      <li key={d} className="why-matchup-win">
                        <span className="why-matchup-marker font-pixel" aria-hidden="true">
                          {"//"}
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

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

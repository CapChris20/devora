import { Check, X } from "lucide-react";
import LandingGridSection from "./LandingGridSection";
import { LandingChapter, LandingReveal } from "./LandingReveal";

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

export default function LandingWhyDevora() {
  return (
    <LandingGridSection className="landing-section">
      <div className="mx-auto max-w-6xl px-6">
        <LandingReveal>
          <LandingChapter num="04" title="Why Devora" />
        </LandingReveal>
        <LandingReveal delay={0.1}>
          <h2 className="font-display pink-grad mt-12 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Not another platform. The platform.
          </h2>
        </LandingReveal>

        <div className="mt-16 space-y-8">
          {COMPARISONS.map((c, i) => (
            <LandingReveal key={c.vs} delay={0.08 * i}>
              <div className="neon-card overflow-hidden rounded-2xl">
                <div className="border-b border-[#ff5ca8]/15 px-8 py-5">
                  <span className="theme-heading font-display text-sm font-semibold uppercase tracking-[0.25em]">
                    Devora <span className="text-[#ff5ca8]">vs</span>{" "}
                    <span className="theme-faint">{c.vs}</span>
                  </span>
                </div>
                <div className="grid md:grid-cols-2">
                  <div className="border-b border-[#ff5ca8]/15 p-8 md:border-b-0 md:border-r">
                    <ul className="space-y-4">
                      {c.devora.map((d) => (
                        <li key={d} className="theme-body flex items-start gap-3 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5ca8] [filter:drop-shadow(0_0_6px_rgba(255,92,168,0.8))]" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="theme-panel-alt p-8">
                    <div className="theme-faint flex items-start gap-3 text-sm leading-relaxed">
                      <X className="theme-faint mt-0.5 h-4 w-4 shrink-0" />
                      {c.alt}
                    </div>
                  </div>
                </div>
              </div>
            </LandingReveal>
          ))}
        </div>
      </div>
    </LandingGridSection>
  );
}

import { BadgeCheck, BookOpen, Code2, Rocket, Share2, Star } from "lucide-react";
import MouseGridBackground from "./MouseGridBackground";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";

const BENEFITS = [
  {
    icon: Code2,
    title: "Ship Real Work",
    desc: "Turn class projects into portfolio pieces with teammates who actually show up.",
    featured: true,
    accent: "logo" as const,
  },
  {
    icon: BookOpen,
    title: "Learn Together",
    desc: "Study groups, peer mentoring, and upperclassmen who've taken your exact courses.",
    featured: false,
    accent: "headline" as const,
  },
  {
    icon: BadgeCheck,
    title: "Verified & Exclusive",
    desc: "Every member is a confirmed CECS student. Your network, your campus, no randos.",
    featured: false,
    accent: "logo" as const,
  },
  {
    icon: Share2,
    title: "Showcase Everything",
    desc: "One profile for your projects, skills, and wins — shareable with a single link.",
    featured: false,
    accent: "headline" as const,
  },
  {
    icon: Rocket,
    title: "Launch Your Career",
    desc: "Alumni connections, internship referrals, and teams that turn into startups.",
    featured: true,
    accent: "logo" as const,
  },
  {
    icon: Star,
    title: "Stand Out",
    desc: "Get discovered for what you build, not buried under a generic resume.",
    featured: false,
    accent: "headline" as const,
  },
];

export default function GoodReasons() {
  return (
    <MouseGridBackground className="landing-section-alt">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionNumber num="05" title="Benefits" />
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="font-display headline-grad mt-12 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            What you get out of it.
          </h2>
        </FadeIn>

        <div className="benefits-bento mt-16 lg:mt-20">
          {BENEFITS.map((b, i) => {
            const logo = b.accent === "logo";

            return (
              <FadeIn
                key={b.title}
                delay={0.07 * i}
                className={`benefits-bento-cell benefits-bento-cell-${i + 1}`}
              >
                <article
                  className={`benefit-card landing-surface-card group ${b.featured ? "benefit-card-featured" : ""} ${logo ? "benefit-card-logo" : "benefit-card-headline"}`}
                >
                  <div className={`benefit-icon-wrap ${logo ? "benefit-icon-wrap-logo" : "benefit-icon-wrap-headline"}`}>
                    <b.icon className="benefit-icon" aria-hidden="true" />
                  </div>
                  <h3 className="theme-heading font-display mt-5 text-lg font-semibold sm:text-xl">
                    {b.title}
                  </h3>
                  <p className="theme-muted mt-2.5 text-sm leading-relaxed">{b.desc}</p>
                  <span className="benefit-card-accent" aria-hidden="true" />
                </article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </MouseGridBackground>
  );
}

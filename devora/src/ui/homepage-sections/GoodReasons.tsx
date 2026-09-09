// Section 05 — bento grid of six benefit cards (“what you get out of it”).
// Intro label + headline, then uneven-sized cards from BENEFITS.
// Manipulate here: edit BENEFITS (featured/accent/copy); CSS benefits-bento-cell-N places each cell.

import { BadgeCheck, BookOpen, Code2, Rocket, Share2, Star } from "lucide-react";
import MouseGridBackground from "./MouseGridBackground";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";

// Card data: Lucide icon, copy, whether it’s a large “featured” cell, and accent family.
// featured: true → benefit-card-featured (bigger / highlighted in the bento CSS).
// Manipulate here: flip featured, swap icons, rewrite titles/descs
const BENEFITS = [
  {
    icon: Code2,
    title: "Decrease in Possible Social Anxiety",
    desc: "Having a place to go to that is not a cold approach, but a warm approach is a great way to reduce anxiety and feel more connected to the community.",
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
    desc: "One profile for your projects, skills, niches, socials, goals, and interests. All in one place.",
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
] as const;

// Cycle title gradient classes so neighboring cards feel different.
const BENEFIT_TITLE_GRAD = [
  "logo-gradient",
  "devora-gradient-text",
  "pink-grad",
  "headline-grad",
  "logo-gradient",
  "pink-grad",
] as const;

export default function GoodReasons() {
  return (
    <MouseGridBackground className="landing-section-alt">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section intro: chapter number + main headline */}
        <div className="benefits-section-intro">
          <FadeIn>
            <SectionNumber num="05" title="Benefits" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-display headline-grad mt-12 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              What you get out of it.
            </h2>
          </FadeIn>
        </div>

        {/* Bento layout — CSS places each cell by benefits-bento-cell-N.
            If you add/remove BENEFITS, also update those CSS cell rules. */}
        <div className="benefits-bento mt-16 lg:mt-20">
          {/* vocab: benefits-bento-cell-N classes place each card in the CSS bento grid */}
          {BENEFITS.map((b, i) => {
            // logo accent vs headline accent drives icon wrap + card tint classes
            const logo = b.accent === "logo";

            return (
              <FadeIn
                key={b.title}
                delay={0.07 * i}
                className={`benefits-bento-cell benefits-bento-cell-${i + 1}`}
              >
                {/* Featured cards get an extra class for larger / highlighted styling */}
                <article
                  className={`benefit-card landing-surface-card group h-full rounded-2xl ${b.featured ? "benefit-card-featured" : ""} ${logo ? "benefit-card-logo" : "benefit-card-headline"}`}
                >
                  <div className={`benefit-icon-wrap ${logo ? "benefit-icon-wrap-logo" : "benefit-icon-wrap-headline"}`}>
                    {/* vocab: <b.icon /> = render the Lucide icon component stored on this benefit */}
                    <b.icon className="benefit-icon" aria-hidden="true" />
                  </div>
                  {/* vocab/symbol: % wraps the index so we never go past the gradient list */}
                  <h3 className={`landing-card-title font-pixel mt-5 ${BENEFIT_TITLE_GRAD[i % BENEFIT_TITLE_GRAD.length]}`}>
                    {b.title}
                  </h3>
                  <p className="theme-muted mt-2.5 text-sm leading-relaxed">{b.desc}</p>
                  {/* Decorative accent bar — pure visual, hidden from screen readers */}
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

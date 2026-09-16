// Section 05 — bento grid of six benefit cards (“what you get out of it”).
// Flow: mouse-grid → chapter label → signal header → uneven bento cards (PNG icons + Gemini star).
// Manipulate here: edit BENEFITS (featured/accent/copy); CSS benefits-bento-cell-N places each cell.

"use client";

// vocab: StaticImageData = typed import of a local PNG used by next/image
import Image, { type StaticImageData } from "next/image";
import MouseGridBackground from "./MouseGridBackground";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";

import anxietyIcon from "@/ui/small-assets/benefit-anxiety.png";
import learningIcon from "@/ui/small-assets/benefit-learning.png";
import verifiedIcon from "@/ui/small-assets/benefit-verified.png";
import portfolioIcon from "@/ui/small-assets/benefit-portfolio.png";
import launchIcon from "@/ui/small-assets/benefit-launch.png";

// Card data: PNG (or “gemini” for the standout star), copy, featured flag, accent family.
// featured: true → benefit-card-featured (bigger / highlighted in the bento CSS).
// Manipulate here: flip featured, swap icon imports, rewrite titles/descs
const BENEFITS: {
  icon: StaticImageData | "gemini";
  title: string;
  desc: string;
  featured: boolean;
  accent: "logo" | "headline";
}[] = [
  {
    icon: anxietyIcon,
    title: "Less Social Anxiety",
    desc: "Skip the cold approach. Warm intros to people who already share your courses, skills, and goals — so reaching out feels human, not scary.",
    featured: true,
    accent: "logo",
  },
  {
    icon: learningIcon,
    title: "Learn Together",
    desc: "Study groups, peer mentoring, and upperclassmen who've survived the exact classes you're about to take.",
    featured: false,
    accent: "headline",
  },
  {
    icon: verifiedIcon,
    title: "Verified & Exclusive",
    desc: "Every member is a confirmed CECS @ UM-Dearborn student. Your campus network — no bots, no randos.",
    featured: false,
    accent: "logo",
  },
  {
    icon: portfolioIcon,
    title: "Showcase Everything",
    desc: "One profile for projects, skills, niches, socials, goals, and interests. Stop scattering yourself across five apps.",
    featured: false,
    accent: "headline",
  },
  {
    icon: launchIcon,
    title: "Launch Your Career",
    desc: "Alumni connections, internship referrals, and teams that turn into real startups — not just another résumé line.",
    featured: true,
    accent: "logo",
  },
  {
    // Stand Out — Gemini-style 4-point star (dark pink → orange). No @lobehub/icons (React 19 peer conflict).
    icon: "gemini",
    title: "Stand Out",
    desc: "Get discovered for what you build — not buried under a generic résumé in a recruiter feed.",
    featured: false,
    accent: "headline",
  },
];

// Soft brand accents — cool color without loud neon multi-hues.
const BENEFIT_TITLE_GRAD = [
  "soft-peach",
  "soft-pink",
  "soft-violet",
  "soft-headline",
  "soft-peach",
  "soft-pink",
] as const;

// Gemini-style 4-point star with dark pink → orange fill.
// Manipulate here: change stopColor values to recolor the standout star
function StandoutGeminiStar({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="benefit-gemini-star"
      aria-hidden="true"
    >
      <defs>
        {/* vocab: linearGradient = SVG paint that blends two colors across the star */}
        <linearGradient id="benefitGeminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#be185d" />
          <stop offset="55%" stopColor="#ff5ca8" />
          <stop offset="100%" stopColor="#ff9a3d" />
        </linearGradient>
      </defs>
      <path
        fill="url(#benefitGeminiGrad)"
        d="M12 2C12.4 7.2 16.8 11.6 22 12C16.8 12.4 12.4 16.8 12 22C11.6 16.8 7.2 12.4 2 12C7.2 11.6 11.6 7.2 12 2Z"
      />
    </svg>
  );
}

export default function GoodReasons() {
  return (
    <MouseGridBackground className="landing-section-alt">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionNumber num="05" title="Benefits" />
        </FadeIn>

        {/* Signal header — same energy as Key Info / Why Devora */}
        <FadeIn delay={0.08}>
          <div className="benefits-header mt-6 lg:mt-7">
            <p className="benefits-eyebrow font-pixel">
              <span className="soft-pink">PAYOFF</span>
              <span className="benefits-eyebrow-sep" aria-hidden="true">
                /
              </span>
              <span className="theme-faint">SIX REASONS</span>
            </p>
            <h2 className="benefits-title font-display soft-headline">
              What you get
              <br />
              out of it.
            </h2>
            <p className="benefits-lead">
              Not vibes. Concrete wins for CECS students who want collaborators, clarity, and a
              network that actually helps you ship.
            </p>
          </div>
        </FadeIn>

        {/* Bento layout — CSS places each cell by benefits-bento-cell-N */}
        <div className="benefits-bento mt-6 lg:mt-7">
          {BENEFITS.map((b, i) => {
            const logo = b.accent === "logo";
            const accent = BENEFIT_TITLE_GRAD[i % BENEFIT_TITLE_GRAD.length];
            // vocab: padStart(2,"0") = turn 1 into "01"
            const code = String(i + 1).padStart(2, "0");

            return (
              <FadeIn
                key={b.title}
                delay={0.07 * i}
                className={`benefits-bento-cell benefits-bento-cell-${i + 1}`}
              >
                <article
                  className={`benefit-card group h-full ${b.featured ? "benefit-card-featured" : ""} ${logo ? "benefit-card-logo" : "benefit-card-headline"}`}
                >
                  <div className="benefit-card-top">
                    <div
                      className={`benefit-icon-wrap ${logo ? "benefit-icon-wrap-logo" : "benefit-icon-wrap-headline"}`}
                    >
                      {b.icon === "gemini" ? (
                        <StandoutGeminiStar size={40} />
                      ) : (
                        <Image
                          src={b.icon}
                          alt=""
                          width={40}
                          height={40}
                          className="benefit-icon-img"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <span className={`benefit-code font-pixel ${accent}`}>{code}</span>
                  </div>

                  {/* Display titles — soft brand fills */}
                  <h3 className={`benefit-card-title font-display ${accent}`}>{b.title}</h3>
                  <p className="benefit-card-desc">{b.desc}</p>
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

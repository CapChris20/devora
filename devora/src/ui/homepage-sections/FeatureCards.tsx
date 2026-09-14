// Section 02 — six “Key Info” feature cards (icon + title + blurb).
// Flow: mouse-grid → chapter label → header (headline + Lottie frame) → 3-col card grid.
// Manipulate here: edit FEATURES for copy/icons; FEATURE_ACCENT rotates title gradient colors.

"use client";

// vocab: StaticImageData = typed import of a local PNG/JPG used by next/image
import Image, { type StaticImageData } from "next/image";
import everythingBuilderNeedsAnimation from "@/ui/lottie-animations/everything-a-builder-needs.json";
import fileManagerIcon from "@/ui/small-assets/file-manager.png";
import increaseIcon from "@/ui/small-assets/increase.png";
import partyCardIcon from "@/ui/small-assets/party-card.png";
import searchIcon from "@/ui/small-assets/search.png";
import shareIcon from "@/ui/small-assets/share.png";
import userIcon from "@/ui/small-assets/user.png";
import MouseGridBackground from "./MouseGridBackground";
import MovingAnimation from "./MovingAnimation";
import { SectionNumber, FadeIn } from "./FadeInWhenScrolling";

// Data for each card: PNG icon, title, and short description.
// Same six icons as before — only chrome/copy density changed.
// Manipulate here: reorder / rewrite / swap icon imports to change the grid
const FEATURES: {
  icon: StaticImageData;
  title: string;
  desc: string;
}[] = [
  {
    icon: searchIcon,
    title: "Finding your People",
    desc: "Skip the awkward cold approach. Browse peers by interest, niche, field, projects, and goals — then reach out knowing you already line up.",
  },
  {
    icon: fileManagerIcon,
    title: "Potential Opportunities",
    desc: "Study groups, hackathon partners, mentors, and collaborators — the openings that actually matter for CECS students, in one place.",
  },
  {
    icon: partyCardIcon,
    title: "Events & CECS Intel",
    desc: "The hub for department networking: events, opportunities, job discovery, career advice, and the stuff that usually dies in Discord.",
  },
  {
    icon: userIcon,
    title: "Real Profiles",
    desc: "Verified UM-Dearborn students only — major, experience, interests, and a real reason to be here. No bots. No fake accounts.",
  },
  {
    icon: increaseIcon,
    title: "Skill Graph",
    desc: "See who shares your stack and ambitions at a glance. Match on skills, not vibes from a random group chat.",
  },
  {
    icon: shareIcon,
    title: "Direct Chat",
    desc: "Message peers on-platform, or jump to the socials they share. No more cold LinkedIn templates into the void.",
  },
];

// Soft brand accents — cool color without loud neon multi-hues.
const FEATURE_ACCENT = [
  "soft-peach",
  "soft-pink",
  "soft-violet",
  "soft-headline",
  "soft-peach",
  "soft-pink",
] as const;

export default function FeatureCards() {
  return (
    <MouseGridBackground className="landing-section">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        {/* Chapter label: “02 · Key Info About Devora” */}
        <FadeIn>
          <SectionNumber num="02" title="Key Info About Devora" />
        </FadeIn>

        {/* Header band — big headline + Lottie in a HUD frame (matches What is Devora energy) */}
        <FadeIn delay={0.08}>
          <div className="key-info-header mt-12 sm:mt-14">
            <div className="key-info-header-copy">
              <p className="key-info-eyebrow font-pixel">
                <span className="soft-pink">BUILD</span>
                <span className="key-info-eyebrow-sep" aria-hidden="true">
                  /
                </span>
                <span className="theme-faint">SIX SIGNALS</span>
              </p>
              <h2 className="key-info-title font-display soft-headline">
                Everything a
                <br />
                builder needs.
              </h2>
              <p className="key-info-lead">
                The pieces that make Devora feel like a real CECS network — not another feed
                you forget about after onboarding.
              </p>
            </div>

            <div className="key-info-lottie-frame">
              <div className="key-info-lottie-glow" aria-hidden="true" />
              <MovingAnimation
                animationData={everythingBuilderNeedsAnimation}
                ariaLabel="What to know about Devora!"
                className="landing-lottie-builder key-info-lottie"
              />
            </div>
          </div>
        </FadeIn>

        {/* One card per FEATURES entry; stagger fade-in by index.
            sm: 2 cols, lg: 3 cols */}
        <div className="key-info-grid mt-12 sm:mt-14">
          {/* vocab: delay={0.08 * i} = stagger each card's fade-in by index
              Manipulate here: change 0.08 to tighten/loosen the cascade */}
          {FEATURES.map((f, i) => {
            const accent = FEATURE_ACCENT[i % FEATURE_ACCENT.length];
            // vocab: padStart(2,"0") = turn 1 into "01", 2 into "02", etc.
            const code = String(i + 1).padStart(2, "0");

            return (
              <FadeIn key={f.title} delay={0.08 * i}>
                {/* group = enables group-hover: scale/rotate on the icon */}
                <article className="key-info-card group">
                  <div className="key-info-card-top">
                    {/* Icon sits in a glass well so it reads as a beacon, not a tiny orphan PNG */}
                    <div className="key-info-icon-well">
                      <Image
                        src={f.icon}
                        alt=""
                        width={56}
                        height={56}
                        className="key-info-icon transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                      />
                    </div>
                    <span className={`key-info-code font-pixel ${accent}`}>{code}</span>
                  </div>

                  {/* Display titles — soft brand fills (peach / pink / violet) */}
                  <h3 className={`key-info-card-title font-display ${accent}`}>{f.title}</h3>
                  <p className="key-info-card-desc">{f.desc}</p>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </MouseGridBackground>
  );
}

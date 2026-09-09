// Section 02 — six feature cards (icon + title + blurb).
// Chapter label → headline + Lottie → 3-column card grid.
// Manipulate here: edit FEATURES for copy/icons; FEATURE_TITLE_GRAD rotates title colors.

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
// Manipulate here: reorder / rewrite / swap icon imports to change the grid
const FEATURES: {
  icon: StaticImageData;
  title: string;
  desc: string;
}[] = [
  {
    icon: searchIcon,
    title: "Finding your People!",
    desc: "Avoid the awkward moments and cold approaches by simply finding your peers knowing their interests, their niche, their field, their projects, their goals, etc..",
  },
  {
    icon: fileManagerIcon,
    title: "Potential Opportunities",
    desc: "These opportunities include, but are not limited to meeting new peers and collaborators, finding a study group, finding hackathon partners, better networking, and so on.",
  },
  {
    icon: partyCardIcon,
    title: "Discovering Events and Addtional CECS Info",
    desc: "Devora Was created for the sole purpose of being the official hub for the CES department in terms of networking, showcasing events/opportunities , job discovery, career advice, and so on. ",
  },
  {
    icon: userIcon,
    title: "Real Profiles",
    desc: "These profiles are not people pretending to be students or bots. These profiles consist of verified U of M Dearborn students with interests, major/experience, a goal in mind, and a reason to be on this platform.",
  },
  {
    icon: increaseIcon,
    title: "Skill Graph",
    desc: "The goal for this platform is to create a network of people who are interested in the same things as you are. This is achieved by the skill graph, which is a graph of the skills of the people on the platform.",
  },
  {
    icon: shareIcon,
    title: "Direct Chat",
    desc: "Instead of cold LinkedIn DMs, Not only do you have the opportunity to find the socials of said user if they provide them, but you can also have the ability to message them on the platform.",
  },
];

// Rotate gradient classes so card titles don’t all look the same.
// Index i picks FEATURE_TITLE_GRAD[i % length] — wraps if you add more cards.
const FEATURE_TITLE_GRAD = [
  "logo-gradient",
  "devora-gradient-text",
  "pink-grad",
  "headline-grad",
  "logo-gradient",
  "pink-grad",
] as const;

export default function FeatureCards() {
  return (
    <MouseGridBackground className="landing-section">
      <div className="mx-auto max-w-6xl px-6">
        {/* Chapter label: “02 · Key Info About Devora” */}
        <FadeIn>
          <SectionNumber num="02" title="Key Info About Devora" />
        </FadeIn>

        {/* Headline beside the “everything a builder needs” Lottie */}
        <FadeIn delay={0.1}>
          <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
            <h2 className="font-display headline-grad max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Everything a builder needs.
            </h2>
            <MovingAnimation
              animationData={everythingBuilderNeedsAnimation}
              ariaLabel="What to know about Devora!"
              className="landing-lottie-builder w-full max-w-[380px] shrink-0 sm:max-w-[420px]"
            />
          </div>
        </FadeIn>

        {/* One card per FEATURES entry; stagger fade-in by index.
            sm: 2 cols, lg: 3 cols */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* vocab: delay={0.08 * i} = stagger each card's fade-in by index
              Manipulate here: change 0.08 to tighten/loosen the cascade */}
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={0.08 * i}>
              {/* group = enables group-hover: scale/rotate on the icon */}
              <div className="landing-surface-card group h-full rounded-2xl p-8">
                <Image
                  src={f.icon}
                  alt=""
                  width={48}
                  height={48}
                  className="feature-card-icon h-12 w-12 object-contain transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                />
                {/* Pick a gradient by card index (wraps with %).
                    vocab/symbol: % means remainder — index 6 would reuse gradient 0 */}
                <h3
                  className={`landing-card-title font-pixel mt-6 ${FEATURE_TITLE_GRAD[i % FEATURE_TITLE_GRAD.length]}`}
                >
                  {f.title}
                </h3>
                <p className="theme-muted mt-3 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </MouseGridBackground>
  );
}

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

const FEATURES: {
  icon: StaticImageData;
  title: string;
  desc: string;
}[] = [
  {
    icon: searchIcon,
    title: "Skill Search",
    desc: "Find CECS students by language, framework, class, or interest in seconds.",
  },
  {
    icon: fileManagerIcon,
    title: "Project Hubs",
    desc: "Spin up a team for your capstone, hackathon, or side project — all in one place.",
  },
  {
    icon: partyCardIcon,
    title: "Events & Meetups",
    desc: "Never miss a CECS workshop, career fair, or late-night build session again.",
  },
  {
    icon: userIcon,
    title: "Real Profiles",
    desc: "Student-verified profiles that show what you build, not just where you work.",
  },
  {
    icon: increaseIcon,
    title: "Skill Graph",
    desc: "Watch your stack grow and see exactly where you fit in the network.",
  },
  {
    icon: shareIcon,
    title: "Direct Chat",
    desc: "No cold LinkedIn DMs. Message classmates where they already are.",
  },
];

export default function FeatureCards() {
  return (
    <MouseGridBackground className="landing-section">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <SectionNumber num="02" title="Key Features" />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
            <h2 className="font-display headline-grad max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Everything a builder needs.
            </h2>
            <MovingAnimation
              animationData={everythingBuilderNeedsAnimation}
              ariaLabel="Everything a builder needs animation"
              className="landing-lottie-builder w-full max-w-[380px] shrink-0 sm:max-w-[420px]"
            />
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={0.08 * i}>
              <div className="landing-surface-card group h-full rounded-2xl p-8">
                <Image
                  src={f.icon}
                  alt=""
                  width={48}
                  height={48}
                  className="feature-card-icon h-12 w-12 object-contain transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                />
                <h3 className="theme-heading font-display mt-6 text-lg font-semibold">{f.title}</h3>
                <p className="theme-muted mt-3 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </MouseGridBackground>
  );
}

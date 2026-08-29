import {
  BarChart3,
  Building2,
  Calendar,
  MessagesSquare,
  Search,
  Users,
} from "lucide-react";
import everythingBuilderNeedsAnimation from "@/ui/lottie-animations/Everything a Builder Needs.json";
import LandingLottie from "./LandingLottie";
import { LandingChapter, LandingReveal } from "./LandingReveal";

const FEATURES = [
  {
    icon: Search,
    title: "Skill Search",
    desc: "Find CECS students by language, framework, class, or interest in seconds.",
  },
  {
    icon: Building2,
    title: "Project Hubs",
    desc: "Spin up a team for your capstone, hackathon, or side project — all in one place.",
  },
  {
    icon: Calendar,
    title: "Events & Meetups",
    desc: "Never miss a CECS workshop, career fair, or late-night build session again.",
  },
  {
    icon: Users,
    title: "Real Profiles",
    desc: "Student-verified profiles that show what you build, not just where you work.",
  },
  {
    icon: BarChart3,
    title: "Skill Graph",
    desc: "Watch your stack grow and see exactly where you fit in the network.",
  },
  {
    icon: MessagesSquare,
    title: "Direct Chat",
    desc: "No cold LinkedIn DMs. Message classmates where they already are.",
  },
];

export default function LandingFeatures() {
  return (
    <section className="relative bg-[#08040f] py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <LandingReveal>
          <LandingChapter num="02" title="Key Features" />
        </LandingReveal>

        <LandingReveal delay={0.1}>
          <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
            <h2 className="font-display pink-grad max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Everything a builder needs.
            </h2>
            <LandingLottie
              animationData={everythingBuilderNeedsAnimation}
              ariaLabel="Everything a builder needs animation"
              className="landing-lottie-builder w-full max-w-[380px] shrink-0 sm:max-w-[420px]"
            />
          </div>
        </LandingReveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <LandingReveal key={f.title} delay={0.08 * i}>
              <div className="neon-card group h-full rounded-2xl p-8">
                <f.icon className="icon-glow h-10 w-10 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                <h3 className="font-display mt-6 text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{f.desc}</p>
              </div>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

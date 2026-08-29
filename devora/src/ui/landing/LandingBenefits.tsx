import { BadgeCheck, BookOpen, Code2, Rocket, Share2, Star } from "lucide-react";
import { LandingChapter, LandingReveal } from "./LandingReveal";

const BENEFITS = [
  {
    icon: Code2,
    title: "Ship Real Work",
    desc: "Turn class projects into portfolio pieces with teammates who actually show up.",
  },
  {
    icon: BookOpen,
    title: "Learn Together",
    desc: "Study groups, peer mentoring, and upperclassmen who've taken your exact courses.",
  },
  {
    icon: BadgeCheck,
    title: "Verified & Exclusive",
    desc: "Every member is a confirmed CECS student. Your network, your campus, no randos.",
  },
  {
    icon: Share2,
    title: "Showcase Everything",
    desc: "One profile for your projects, skills, and wins — shareable with a single link.",
  },
  {
    icon: Rocket,
    title: "Launch Your Career",
    desc: "Alumni connections, internship referrals, and teams that turn into startups.",
  },
  {
    icon: Star,
    title: "Stand Out",
    desc: "Get discovered for what you build, not buried under a generic resume.",
  },
];

export default function LandingBenefits() {
  return (
    <section className="grid-bg relative bg-[#0a0512] py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <LandingReveal>
          <LandingChapter num="05" title="Benefits" />
        </LandingReveal>
        <LandingReveal delay={0.1}>
          <h2 className="font-display pink-grad mt-12 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            What you get out of it.
          </h2>
        </LandingReveal>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <LandingReveal key={b.title} delay={0.08 * i}>
              <div className="neon-card group h-full rounded-2xl p-8">
                <b.icon className="icon-glow h-9 w-9 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" />
                <h3 className="font-display mt-6 text-lg font-semibold text-white">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{b.desc}</p>
              </div>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

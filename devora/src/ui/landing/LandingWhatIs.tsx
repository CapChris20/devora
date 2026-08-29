import whatIsDevoraAnimation from "@/ui/lottie-animations/What is Devora.json";
import LandingLottie from "./LandingLottie";
import { LandingChapter, LandingReveal } from "./LandingReveal";

const STATS = ["100% CECS Verified", "Every Major & Track", "Zero Recruiter Noise"];

export default function LandingWhatIs() {
  return (
    <section className="landing-section-alt grid-bg relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <LandingReveal>
          <LandingChapter num="01" title="The Platform" />
        </LandingReveal>
        <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-6">
            <LandingReveal delay={0.1}>
              <h2 className="font-display pink-grad text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                What is Devora?
              </h2>
            </LandingReveal>
            <LandingReveal delay={0.15}>
              <LandingLottie
                animationData={whatIsDevoraAnimation}
                ariaLabel="What is Devora animation"
                className="landing-lottie-what-is mx-auto w-full max-w-[560px] lg:mx-0"
              />
            </LandingReveal>
          </div>
          <LandingReveal delay={0.2} className="space-y-6">
            <p className="theme-body text-base leading-relaxed md:text-lg">
              Devora is the private network built exclusively for Computer Engineering &amp;
              Computer Science students at the University of Michigan–Dearborn. It&apos;s where
              classmates become collaborators — find teammates by skill, join project hubs, and
              turn hallway conversations into shipped work.
            </p>
            <p className="theme-muted text-base leading-relaxed">
              No recruiters. No noise. Just the people building the future of CECS, one
              connection at a time.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {STATS.map((s) => (
                <span
                  key={s}
                  className="landing-stat-badge rounded-full border border-[#ff5ca8]/40 px-5 py-2 text-xs uppercase tracking-[0.18em] text-[#ff5ca8] [text-shadow:0_0_10px_rgba(255,92,168,0.5)]"
                >
                  {s}
                </span>
              ))}
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  );
}

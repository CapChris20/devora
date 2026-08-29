import Link from "next/link";
import { LandingReveal } from "./LandingReveal";

export default function LandingFooter() {
  return (
    <footer id="join" className="grid-bg relative overflow-hidden bg-[#08040f] pb-10 pt-32 sm:pt-40">
      <div className="glow-line absolute inset-x-0 top-0 h-px" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#ff2bd6]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <LandingReveal>
          <h2 className="font-display pink-grad text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Ready to Join the CECS Network?
          </h2>
        </LandingReveal>
        <LandingReveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-lg text-base text-white/60 md:text-lg">
            Your next collaborator is already on campus. Come find them.
          </p>
        </LandingReveal>
        <LandingReveal delay={0.25}>
          <Link
            href="/auth"
            className="btn-neon font-display mt-12 inline-block rounded-full px-12 py-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#14051c]"
          >
            Start Networking Now
          </Link>
        </LandingReveal>
      </div>

      <div className="relative mx-auto mt-28 flex max-w-6xl flex-col items-center justify-between gap-5 border-t border-[#ff5ca8]/15 px-6 pt-8 sm:flex-row">
        <span className="logo-gradient font-pixel text-[10px]">DEVORA</span>
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
          CECS · University of Michigan–Dearborn
        </p>
        <p className="text-xs text-white/30">© 2026 Devora</p>
      </div>
    </footer>
  );
}

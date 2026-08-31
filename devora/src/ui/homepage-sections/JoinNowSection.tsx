import Link from "next/link";
import Footer from "@/ui/footer/Footer";
import { FadeIn } from "./FadeInWhenScrolling";

export default function JoinNowSection() {
  return (
    <footer id="join" className="landing-footer grid-bg relative overflow-hidden pb-10 pt-32 sm:pt-40">
      <div className="glow-line absolute inset-x-0 top-0 h-px" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#ff2bd6]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <FadeIn>
          <h2 className="font-display pink-grad text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Ready to Join the CECS Network?
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="theme-muted mx-auto mt-6 max-w-lg text-base md:text-lg">
            Your next collaborator is already on campus. Come find them.
          </p>
        </FadeIn>
        <FadeIn delay={0.25}>
          <Link
            href="/auth"
            className="btn-neon font-display mt-12 inline-block rounded-full px-12 py-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#14051c]"
          >
            Start Networking Now
          </Link>
        </FadeIn>
      </div>

      <div className="relative mt-28">
        <Footer />
      </div>
    </footer>
  );
}

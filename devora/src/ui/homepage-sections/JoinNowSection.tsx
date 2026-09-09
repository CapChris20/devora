// Final homepage CTA — “Ready to Join?” then the site Footer.
// Soft pink glow + neon signup button → /auth/signup.
// id="join" lets deep links / future nav scroll straight here.

import Link from "next/link";
import Footer from "@/ui/footer/Footer";
import { FadeIn } from "./FadeInWhenScrolling";

export default function JoinNowSection() {
  return (
    // Footer landmark with id="join" so nav / deep links can scroll here.
    // landing-footer + grid-bg = section chrome from globals.css
    <footer id="join" className="landing-footer grid-bg relative overflow-hidden pb-10 pt-32 sm:pt-40">
      {/* Top edge glow line */}
      <div className="glow-line absolute inset-x-0 top-0 h-px" />
      {/* Soft blurred blob behind the CTA (decorative only).
          vocab: blur + low-opacity pink = soft glow blob; pointer-events-none = can't block clicks
          Manipulate here: change bg color / blur / size to restyle the ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#ff2bd6]/10 blur-[120px]" />

      {/* Centered headline, supporting line, and signup button — staggered FadeIns */}
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
          {/* vocab: Link href="/auth/signup" = Next.js client navigate to the signup page
              Manipulate here: change href if signup moves; btn-neon look is in globals.css */}
          <Link
            href="/auth/signup"
            className="btn-neon font-display mt-12 inline-block rounded-full px-12 py-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#14051c]"
          >
            Start Networking Now
          </Link>
        </FadeIn>
      </div>

      {/* Shared site footer links / credits under the CTA */}
      <div className="relative mt-28">
        <Footer />
      </div>
    </footer>
  );
}

// Final homepage CTA — “Ready to Join?” then the site Footer.
// Soft pink glow + neon Sign Up button → /auth/signup (hidden once Firebase says you’re signed in).
// id="join" lets deep links / future nav scroll straight here.

"use client";

import Link from "next/link";
// vocab: useEffect = run a side effect after paint (subscribe to auth here)
// vocab: useState = React memory that re-renders when it changes
import { useEffect, useState } from "react";
// vocab: onAuthStateChanged = Firebase listener; fires when user signs in or out
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/backend/firebase";
import Footer from "@/ui/footer/Footer";
import { FadeIn } from "./FadeInWhenScrolling";

export default function JoinNowSection() {
  // null = still waiting for Firebase’s first auth snapshot (don’t flash Sign Up then hide it).
  // true = signed in → hide the CTA; false = signed out → show Sign Up.
  // vocab: boolean | null = three-way gate so we can tell “unknown” from “logged out”
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  // Subscribe once on mount — keep the Sign Up button in sync with the session.
  // vocab: unsubscribe = function Firebase returns; call it on cleanup so we don’t leak listeners
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // vocab/symbol: !!user = turn User | null into a true/false (“are they signed in?”)
      setIsSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    // Footer landmark with id="join" so nav / deep links can scroll here.
    // landing-footer + grid-bg = section chrome from globals.css
    <footer id="join" className="landing-footer grid-bg relative overflow-hidden pb-10 pt-16 sm:pt-20">
      {/* Top edge glow line */}
      <div className="glow-line absolute inset-x-0 top-0 h-px" />
      {/* Soft blurred blob behind the CTA (decorative only).
          vocab: blur + low-opacity pink = soft glow blob; pointer-events-none = can't block clicks
          Manipulate here: change bg color / blur / size to restyle the ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#ff2bd6]/10 blur-[120px]" />

      {/* Centered headline, supporting line, and Sign Up button (guests only) */}
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <FadeIn>
          <h2 className="font-display soft-headline text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Ready to Join the CECS Network?
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="theme-muted mx-auto mt-6 max-w-lg text-base md:text-lg">
            Your next collaborator is already on campus. Come find them.
          </p>
        </FadeIn>
        {/* Only render the CTA after auth resolves AND the visitor is signed out.
            Signed-in students already have an account — no need to push signup again. */}
        {isSignedIn === false && (
          <FadeIn delay={0.25}>
            {/* vocab: Link href="/auth/signup" = Next.js client navigate to the signup page
                Manipulate here: change label/href if signup copy or route moves; btn-neon is in globals.css */}
            <Link
              href="/auth/signup"
              className="btn-neon font-display mt-8 inline-block rounded-full px-12 py-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#14051c]"
            >
              Sign Up
            </Link>
          </FadeIn>
        )}
      </div>

      {/* Shared site footer links / credits under the CTA */}
      <div className="relative mt-16">
        <Footer />
      </div>
    </footer>
  );
}

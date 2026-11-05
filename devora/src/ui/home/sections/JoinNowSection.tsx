// Final homepage CTA — “Ready to Join?” then the site Footer.
// Clean night field per DESIGN.md § 5.1 & § 2 (no blurred purple blobs).
// Torn edge transitions smoothly from the orange Benefits section.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/backend/firebase";
import Footer from "@/ui/shared/footer/Footer";
import TornEdge from "@/ui/shared/TornEdge";

export default function JoinNowSection() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <footer
      id="join"
      className="scene scene-night relative overflow-hidden"
      style={{
        background: "var(--night)",
        color: "var(--text)",
        paddingTop: "clamp(96px, 10vw, 128px)",
        paddingBottom: "40px",
      }}
    >
      {/* Torn seam into night overlapping the orange Benefits section */}
      <TornEdge color="var(--night)" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="t-title text-[var(--text)]">
          Ready to Join the CECS Network?
        </h2>

        <p className="lead text-[var(--text-body)] mx-auto mt-6">
          Your people are already on campus. Come find them.
        </p>

        {isSignedIn === false && (
          <div className="mt-10">
            <Link href="/auth/signup" className="btn-primary">
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>

      <div className="relative mt-24">
        <Footer />
      </div>
    </footer>
  );
}

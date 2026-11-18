// Page frame for Design Law pages (Campus Hub, Messages, Connections).
// Flow: fonts + paper background → NavBar → eyebrow + ink title + accent strip → optional tabs
// → SignedInGate → the page's content.

// ===== IMPORTS =====

import type { ReactNode } from "react";

import NavBar from "@/ui/shared/navbar/NavBar";

import { NB_FONT_CLASS_NAME } from "./nb-fonts";
import { Eyebrow } from "./nb-parts";
import SignedInGate from "./SignedInGate";

// ===== MAIN COMPONENT =====

/**
 * Shared frame. Black-and-white chrome like Coach Connect; the gradient strip is the only accent up top.
 * @param props.navLabel - Which NavBar link to highlight (must match a label in NavBar's navItems)
 * @param props.tabs - Optional tab row under the title (Campus Hub passes TabNav)
 */
export default function DesignLawPage({
  navLabel,
  eyebrow,
  title,
  blurb,
  tabs,
  children,
}: {
  navLabel: string;
  eyebrow: string;
  title: string;
  blurb: string;
  tabs?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`${NB_FONT_CLASS_NAME} relative min-h-screen bg-nb-paper font-nb-body text-nb-ink antialiased`}
    >
      <NavBar activeItem={navLabel} />

      {/* pt clears the fixed NavBar; px-4 = 16px phone gutter */}
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <header className="mb-8 motion-safe:animate-nb-rise">
          <Eyebrow>{eyebrow}</Eyebrow>
          {/* Big ink title (Archivo Black). The only gradient up here is the thin strip underneath. */}
          <h1 className="font-nb-display text-[44px] uppercase leading-[0.92] tracking-[-0.02em] sm:text-7xl">
            {title}
          </h1>
          {/* Accent strip — the brand ramp as a small secondary highlight, ink-outlined like a sticker.
              Manipulate here: w-32 = strip length */}
          <div aria-hidden="true" className="mt-4 h-3 w-32 rounded-full border-2 border-nb-ink bg-nb-accent" />
          <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-nb-muted sm:text-lg">{blurb}</p>
        </header>

        {tabs}

        <main className={tabs ? "mt-8" : ""}>
          <SignedInGate>{children}</SignedInGate>
        </main>
      </div>
    </div>
  );
}

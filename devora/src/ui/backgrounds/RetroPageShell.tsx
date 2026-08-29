"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import RetroBackground from "@/ui/backgrounds/RetroBackground";
import type { RetroScene } from "@/ui/backgrounds/retro-helpers";
import SplashCursor from "@/ui/cursor/SplashCursorClient";
import SiteNavBar from "@/ui/navbar/SiteNavBar";

type RetroPageShellProps = {
  scene: RetroScene;
  activeItem: string;
  title: string;
  description: string;
  children?: ReactNode;
};

function PageReveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function RetroPageShell({
  scene,
  activeItem,
  title,
  description,
  children,
}: RetroPageShellProps) {
  return (
    <main className="page-shell relative min-h-screen">
      <SplashCursor />
      <RetroBackground scene={scene} />
      <div className="noise pointer-events-none fixed inset-0 z-[1] opacity-[0.05]" />
      <SiteNavBar activeItem={activeItem} />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-28">
        <PageReveal>
          <h1 className="font-display pink-grad text-3xl font-bold sm:text-4xl">{title}</h1>
        </PageReveal>
        <PageReveal delay={0.12}>
          <p className="theme-muted mt-4 max-w-xl text-sm leading-relaxed sm:text-base">{description}</p>
        </PageReveal>
        {children ? <PageReveal delay={0.2}>{children}</PageReveal> : null}
      </div>
    </main>
  );
}

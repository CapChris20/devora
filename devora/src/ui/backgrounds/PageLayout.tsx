"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import BackgroundPicture from "@/ui/backgrounds/BackgroundPicture";
import type { RetroScene } from "@/ui/backgrounds/background-helpers";
import SplashCursor from "@/ui/cursor/SplashCursorClient";
import Footer from "@/ui/footer/Footer";
import NavBar from "@/ui/navbar/NavBar";

type PageLayoutProps = {
  scene: RetroScene;
  activeItem: string;
  title: string;
  titleClassName?: string;
  description?: string;
  wide?: boolean;
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

export default function PageLayout({
  scene,
  activeItem,
  title,
  titleClassName = "pink-grad",
  description,
  wide = false,
  children,
}: PageLayoutProps) {
  return (
    <main className="page-shell relative min-h-screen">
      <SplashCursor />
      <BackgroundPicture scene={scene} />
      <div className="noise pointer-events-none fixed inset-0 z-[1] opacity-[0.05]" />
      <NavBar activeItem={activeItem} />
      <div
        className={`relative z-10 mx-auto px-4 pb-24 pt-28 sm:px-6 ${
          wide ? "max-w-[1400px]" : "max-w-6xl"
        }`}
      >
        <PageReveal>
          <h1 className={`font-display text-3xl font-bold sm:text-4xl ${titleClassName}`}>{title}</h1>
        </PageReveal>
        {description ? (
          <PageReveal delay={0.12}>
            <p className="theme-muted mt-4 max-w-xl text-sm leading-relaxed sm:text-base">{description}</p>
          </PageReveal>
        ) : null}
        {children ? <PageReveal delay={description ? 0.2 : 0.12}>{children}</PageReveal> : null}
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}

"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { STARS, type RetroScene } from "./background-helpers";

type BackgroundPictureProps = {
  scene: RetroScene;
};

export default function BackgroundPicture({ scene }: BackgroundPictureProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });

  const sunX = useTransform(sx, [-0.5, 0.5], [-26, 26]);
  const sunY = useTransform(sy, [-0.5, 0.5], [-12, 16]);
  const backX = useTransform(sx, [-0.5, 0.5], [16, -16]);
  const frontX = useTransform(sx, [-0.5, 0.5], [38, -38]);
  const frontY = useTransform(sy, [-0.5, 0.5], [0, 12]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="hero-sky absolute inset-0" />
      <div className="hero-sky-overlay absolute inset-0" />

      <div className="absolute inset-0">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-[8%] right-[6%] z-[2] sm:right-[8%] md:right-[10%] lg:right-[12%]">
        <motion.div style={{ x: sunX, y: sunY }} className="sun opacity-90">
          <div className="sun-top" />
          <div className="sun-bottom" />
        </motion.div>
      </div>

      <motion.div style={{ x: backX }} className="absolute inset-x-0 bottom-0 z-[5]">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="h-[40vh] w-full">
          {scene.back}
        </svg>
      </motion.div>

      <motion.div style={{ x: frontX, y: frontY }} className="absolute inset-x-0 bottom-0 z-[8]">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="h-[38vh] w-full">
          {scene.front}
        </svg>
      </motion.div>

      <div className="grid-floor z-[10]" />
      <div className="scanlines absolute inset-0 z-[12] opacity-30" />
      <div className="vignette absolute inset-0 z-[14]" />
    </div>
  );
}

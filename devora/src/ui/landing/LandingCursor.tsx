"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function LandingCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 24 });
  const ry = useSpring(y, { stiffness: 260, damping: 24 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <>
      <motion.div
        className="cursor-dot pointer-events-none fixed left-0 top-0 z-[70] h-1.5 w-1.5 rounded-full bg-[#ff5ca8]"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          boxShadow: "0 0 12px rgba(255,92,168,0.9)",
        }}
      />
      <motion.div
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[70] h-8 w-8 rounded-full border border-[#ff5ca8]/40"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
      />
    </>
  );
}

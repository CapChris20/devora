// Section wrapper with the mouse-lit grid per DESIGN.md § 5.1A.
// Two grid layers of 56px lines:
// 1. Base layer at 3.5% white
// 2. Lit layer at 45% pink masked by a 280px radial gradient at (--mx, --my).
// Opacity is 0.55 at rest, 1 when hovered.

"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

type MouseGridBackgroundProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
};

export default function MouseGridBackground({
  children,
  className = "",
  id,
  as = "section",
}: MouseGridBackgroundProps) {
  const [hovering, setHovering] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const onPointerMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    setHovering(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    setHovering(false);
  }, []);

  const style = {
    "--mx": "50%",
    "--my": "50%",
  } as CSSProperties;

  const Tag = as;

  return (
    <Tag
      id={id}
      // @ts-expect-error Tag can be section or div
      ref={containerRef}
      className={`mouse-grid-wrap relative ${className}`}
      onMouseMove={onPointerMove}
      onMouseLeave={onPointerLeave}
      style={style}
    >
      {/* Base 56px grid layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / .035) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / .035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Lit orange-to-pink gradient layer with radial mask */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 154 61 / .45) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 92 168 / .45) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(280px circle at var(--mx) var(--my), #000 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(280px circle at var(--mx) var(--my), #000 0%, transparent 72%)",
          opacity: hovering ? 1 : 0.55,
        }}
      />

      <div className="relative z-[1] w-full">{children}</div>
    </Tag>
  );
}

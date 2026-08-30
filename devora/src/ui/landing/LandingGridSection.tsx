"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

type LandingGridSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
};

export default function LandingGridSection({
  children,
  className = "",
  id,
  as = "section",
}: LandingGridSectionProps) {
  const [hovering, setHovering] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const el = sectionRef.current ?? divRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--grid-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--grid-y", `${e.clientY - rect.top}px`);
    setHovering(true);
  }, []);

  const onLeave = useCallback(() => {
    setHovering(false);
  }, []);

  const classNameValue = `interactive-grid-section relative ${hovering ? "is-hovering" : ""} ${className}`;
  const style = {
    "--grid-x": "50%",
    "--grid-y": "50%",
  } as CSSProperties;

  const content = (
    <>
      <div className="interactive-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-[1]">{children}</div>
    </>
  );

  if (as === "div") {
    return (
      <div
        id={id}
        ref={divRef}
        className={classNameValue}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={style}
      >
        {content}
      </div>
    );
  }

  return (
    <section
      id={id}
      ref={sectionRef}
      className={classNameValue}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
    >
      {content}
    </section>
  );
}

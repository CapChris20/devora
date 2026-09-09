// Section wrapper that draws a mouse-following grid glow behind children.
// Flow: mouse moves over the block → convert page coords to local X/Y → write CSS vars
// --grid-x / --grid-y → globals.css paints a radial glow at that point on .interactive-grid-bg.
// Used by most homepage sections via MouseGridBackground.

"use client";

// vocab: useCallback = keep the same function identity across renders (stable event handler)
//   so React doesn't think onMove is a brand-new function every paint
// vocab: useRef = hold a DOM node without re-rendering when it changes
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
  // Extra Tailwind / landing classes merged onto the outer wrapper
  className?: string;
  // Optional DOM id (ScrollingTextStrip uses id="more" for the hero scroll target)
  id?: string;
  // "section" = landmark for homepage chapters; "div" = non-landmark (marquee strip)
  // Manipulate here: pass as="div" when you don't want another <section> in the outline
  as?: "section" | "div";
};

export default function MouseGridBackground({
  children,
  className = "",
  id,
  as = "section",
}: MouseGridBackgroundProps) {
  // True while the pointer is over this block (CSS .is-hovering turns on the stronger glow).
  const [hovering, setHovering] = useState(false);
  // Two refs because we might render as <section> or <div> — only one will be mounted.
  const sectionRef = useRef<HTMLElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  // Track mouse inside the wrapper and store X/Y relative to its top-left corner.
  // Those become --grid-x / --grid-y, which the background layer reads in CSS.
  const onMove = useCallback((e: MouseEvent<HTMLElement>) => {
    // Prefer the section ref; fall back to the div ref if as="div".
    // vocab/symbol: ?? means “use the right side only if the left is null/undefined”
    const el = sectionRef.current ?? divRef.current;
    // Nothing mounted yet — bail out (can happen on the very first event in rare cases)
    if (!el) return;
    // Element’s screen box so we can convert viewport coords → local coords inside the box.
    // vocab: getBoundingClientRect = element's screen box (left/top/width/height in CSS px)
    const rect = el.getBoundingClientRect();
    // clientX/Y are relative to the viewport; subtract rect.left/top → position inside this block.
    // vocab: CSS custom properties (--grid-x) drive the glow position in globals.css
    // Manipulate here: the glow look (size, color, softness) lives on .interactive-grid-bg in CSS —
    //   these two vars only move the center of that glow.
    el.style.setProperty("--grid-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--grid-y", `${e.clientY - rect.top}px`);
    setHovering(true);
  }, []);
  // vocab/symbol: [] = create onMove once; never recreate (empty deps)

  // Pointer left the wrapper — turn off the hover glow class.
  const onLeave = useCallback(() => {
    setHovering(false);
  }, []);

  // Base classes + optional is-hovering when the mouse is inside.
  // Manipulate here: interactive-grid-section / is-hovering styles are in globals.css
  const classNameValue = `interactive-grid-section relative ${hovering ? "is-hovering" : ""} ${className}`;
  // Default glow center until the first mousemove (middle of the section).
  // vocab: as CSSProperties = tell TypeScript custom --vars are allowed on the style object
  const style = {
    "--grid-x": "50%",
    "--grid-y": "50%",
  } as CSSProperties;

  // Shared insides: absolute grid layer (decorative), then content above it at z-[1].
  // vocab: pointer-events-none = the grid never steals clicks from buttons/links in children
  // vocab: aria-hidden = hide the decorative grid from screen readers
  const content = (
    <>
      <div className="interactive-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-[1]">{children}</div>
    </>
  );

  // Some callers need a <div> (e.g. marquee) instead of a landmark <section>.
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

  // Default: semantic <section> for homepage chapter blocks.
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

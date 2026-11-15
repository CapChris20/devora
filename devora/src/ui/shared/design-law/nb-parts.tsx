// Design Law building blocks — the same neo-brutalist look as Coach Connect.
// Flow: Activity Center tabs, Messages and Connections import NbCard / NbButton / TagPill / etc. from here.
// Rules: black/white/gray chrome, 3px ink borders, hard ink shadows. Gradients only on small accents.

// ===== IMPORTS =====

import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

// ===== NAMED CONSTANTS =====

// vocab: tone = how an element is filled.
//   ink / white / soft = the black-and-white chrome (buttons, chips)
//   brand / orchid / sky / blush / accent = secondary gradients (pills, avatars, active tab only)
export type NbTone = "ink" | "white" | "soft" | "brand" | "orchid" | "sky" | "blush" | "accent";

// vocab: Tailwind only ships classes it can see written out in full,
// so each tone maps to a literal class string (no `bg-nb-${tone}` templates).
// Text on every gradient is ink (Coach Connect rule: "text on brand is always nbInk").
// Manipulate here: add a gradient in tailwind.config.ts, then add it to this map.
export const NB_TONE: Record<NbTone, string> = {
  ink: "bg-nb-ink text-nb-white",
  white: "bg-nb-white text-nb-ink",
  soft: "bg-nb-soft text-nb-ink",
  brand: "bg-nb-brand text-nb-ink",
  orchid: "bg-nb-orchid text-nb-ink",
  sky: "bg-nb-sky text-nb-ink",
  blush: "bg-nb-blush text-nb-ink",
  accent: "bg-nb-accent text-nb-white",
};

// Gradients rotated through lists (avatars, club badges, course tags)
export const NB_TONE_CYCLE: NbTone[] = ["brand", "orchid", "sky", "blush"];

// Hover lifts 1px; press sinks 2px into the shadow (Coach Connect's NbButton press nudge).
// vocab: motion-safe: = only animate when the OS "reduce motion" setting is off
// vocab: active: = while the mouse/finger is held down
// Manipulate here: change translate amounts together with the shadow sizes to keep it aligned
export const NB_PRESS =
  "motion-safe:transition-[transform,box-shadow] motion-safe:duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-nb-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-nb-sm";

export const NB_FOCUS =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-nb-pink";

const BUTTON_BASE = `inline-flex min-h-[48px] items-center justify-center gap-2 rounded-nb border-nb border-nb-ink px-5 py-2 text-[15px] font-bold shadow-nb disabled:pointer-events-none disabled:opacity-40 ${NB_FOCUS}`;

// Small mono label style (SEATS, MEETS, CONTACT)
export const NB_LABEL = "font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-nb-muted";

// ===== HELPERS =====

/**
 * Inline style that delays an nb-rise entrance so list items cascade in one after another.
 * @param index - Position in the list (0 = first)
 */
export function staggerStyle(index: number): CSSProperties {
  // Manipulate here: 55ms between items; capped so long lists don't wait forever
  return { animationDelay: `${Math.min(index, 8) * 55}ms` };
}

// ===== MAIN COMPONENTS =====

/**
 * White card, 3px ink outline, hard 5px ink shadow (Coach Connect NbCard).
 * @param props.interactive - adds the hover lift (for cards you can act on)
 */
export function NbCard({
  children,
  className = "",
  style,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  interactive?: boolean;
}) {
  const hoverClass = interactive
    ? "motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 hover:-translate-x-px hover:-translate-y-px hover:shadow-nb-lg"
    : "";
  return (
    <div
      style={style}
      className={`rounded-nb border-nb border-nb-ink bg-nb-white text-nb-ink shadow-nb-card ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}

type NbButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: NbTone;
};

/**
 * Chunky button with the hard shadow + pressed-in effect.
 * @param props.tone - "ink" (primary, default) or "white" (ghost). Gradients are for accents, not buttons.
 */
export function NbButton({ tone = "ink", className = "", type = "button", ...rest }: NbButtonProps) {
  return <button type={type} className={`${BUTTON_BASE} ${NB_TONE[tone]} ${NB_PRESS} ${className}`} {...rest} />;
}

/**
 * Same look as NbButton, but navigates (Next.js Link) instead of running a click handler.
 */
export function NbLinkButton({
  href,
  children,
  tone = "ink",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: NbTone;
  className?: string;
}) {
  return (
    <Link href={href} className={`${BUTTON_BASE} ${NB_TONE[tone]} ${NB_PRESS} ${className}`}>
      {children}
    </Link>
  );
}

/**
 * Small pill tag, e.g. a course code. Gradient accent by default; tone="white" for a plain outlined tag.
 */
export function TagPill({ children, tone = "brand" }: { children: ReactNode; tone?: NbTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 border-nb-ink px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] ${NB_TONE[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * Small monospace label above a heading ("3 OPEN GROUPS"), with a gradient dot.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-nb-muted">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-2 border-nb-ink bg-nb-brand" />
      {children}
    </p>
  );
}

/**
 * Title row at the top of a section: eyebrow, heading, one-line blurb, optional action on the right.
 * @param props.action - Button(s) shown on the right on desktop, under the text on phones
 */
export function SectionHeader({
  eyebrow,
  title,
  blurb,
  action,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[34px]">{title}</h2>
        <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-nb-muted">{blurb}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Gradient icon-chip avatar with initials (Coach Connect NbIconChip / NbAvatar), until photos are wired up.
 * @param props.name - Full display name; first letters of the first two words are shown
 */
export function InitialsAvatar({ name, tone = "brand", size = "md" }: { name: string; tone?: NbTone; size?: "md" | "lg" }) {
  // "Jordan Lee" → "JL"
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  const sizeClass = size === "lg" ? "h-14 w-14 text-base" : "h-11 w-11 text-sm";

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-nb border-2 border-nb-ink font-bold ${sizeClass} ${NB_TONE[tone]}`}
    >
      {initials}
    </span>
  );
}

/**
 * Dashed "STUB" note so placeholder areas are obvious while each feature is being built.
 */
export function StubNote({ children }: { children: ReactNode }) {
  return (
    // vocab: [overflow-wrap:anywhere] = let long Firestore paths wrap instead of poking out on phones
    <p className="mt-10 rounded-nb border-2 border-dashed border-nb-ink/50 px-4 py-3 text-sm text-nb-muted [overflow-wrap:anywhere]">
      <span className="mr-2 rounded-md border-2 border-nb-ink bg-nb-brand px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-nb-ink">
        Stub
      </span>
      {children}
    </p>
  );
}

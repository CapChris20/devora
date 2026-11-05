// Shared pieces: section header (kinetic title), avatar, fit chip, sample tag, ASCII accents.

import type { ReactNode } from "react";

import { FIT_LABEL, type Fit } from "./useAvailability";
import { KineticText } from "./motion";

type SectionHeaderProps = {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
  sample?: boolean;
  aside?: ReactNode;
};

export const SectionHeader = ({ id, kicker, title, children, sample, aside }: SectionHeaderProps) => (
  <div className="nb-section-head">
    <div className="nb-section-copy">
      <p className="nb-kicker font-pixel">
        <span aria-hidden="true" className="nb-kicker-rule">
          +--
        </span>{" "}
        {kicker}
      </p>
      <h2 id={id} className="nb-section-title font-display" data-kinetic="">
        <KineticText text={title} />
      </h2>
      <p className="nb-section-sub">{children}</p>
    </div>
    {sample || aside ? (
      <div className="nb-section-aside">
        {aside}
        {sample ? <SampleTag /> : null}
      </div>
    ) : null}
  </div>
);

export const SampleTag = () => <span className="nb-sample">Sample data</span>;

export const Avatar = ({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) => (
  <span className={`nb-avatar nb-avatar-${size}`} aria-hidden="true">
    {initials}
  </span>
);

export const FitChip = ({ fit }: { fit: Fit }) => (
  <span className="nb-fit" data-fit={fit}>
    {FIT_LABEL[fit]}
  </span>
);

export const Ascii = ({ art, className = "" }: { art: string; className?: string }) => (
  <pre className={`nb-ascii ${className}`} aria-hidden="true">
    {art}
  </pre>
);

export const ASCII_NETWORK = String.raw`   o-----o
  / \   / \
 o---o-o---o
  \ /   \ /
   o-----o`;

export const ASCII_WEEK = String.raw`     M  T  W  T  F
 am  .  #  .  #  .
 pm  #  .  #  .  #
 ev  .  .  .  .  .`;

export const ASCII_CUBE = String.raw`    +------+
   /      /|
  +------+ |
  |      | +
  |      |/
  +------+`;

export const ASCII_DIVIDER = "+--------".repeat(30) + "+";

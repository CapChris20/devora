// Clay isometric week: 7 days x 3 blocks on a tilted floor. Each block that matters
// rises as a soft clay cube. Real CSS 3D (preserve-3d); faces grow with transform-only
// transitions so toggling a block retargets mid-flight instead of restarting.

import { useEffect, useState } from "react";

import { DAYS, TIME_BLOCKS, describeSlot, slotId, type SlotId } from "./config";

export type CubeKind = "free" | "other" | "match";

type IsoWeekProps = {
  cubes: Partial<Record<SlotId, CubeKind>>;
  size?: "lg" | "sm";
  label: string;
  // Stagger the first build on mount (the hero's load moment).
  buildIn?: boolean;
};

const HEIGHT: Record<CubeKind, number> = { free: 1, other: 0.62, match: 1.45 };

export const IsoWeek = ({ cubes, size = "lg", label, buildIn = false }: IsoWeekProps) => {
  const [built, setBuilt] = useState(!buildIn);
  const [hover, setHover] = useState<SlotId | null>(null);

  useEffect(() => {
    if (!buildIn) return;
    const id = window.setTimeout(() => setBuilt(true), 350);
    return () => window.clearTimeout(id);
  }, [buildIn]);

  const hovered = hover ? describeSlot(hover) : null;
  const hoverKind = hover ? cubes[hover] : undefined;

  return (
    <figure className={`iso iso-${size}`} aria-label={label}>
      <div className="iso-stage" aria-hidden="true" onMouseLeave={() => setHover(null)}>
        <div className="iso-plane">
          {DAYS.map((day, col) => (
            <span key={day.id} className="iso-daylabel" style={{ gridColumn: col + 2, gridRow: 1 }}>
              {day.short.slice(0, 2)}
            </span>
          ))}
          {TIME_BLOCKS.map((block, row) => (
            <span key={block.id} className="iso-blocklabel" style={{ gridColumn: 1, gridRow: row + 2 }}>
              {block.label.slice(0, 3)}
            </span>
          ))}
          {TIME_BLOCKS.map((block, row) =>
            DAYS.map((day, col) => {
              const slot = slotId(day.id, block.id);
              const kind = cubes[slot];
              const up = Boolean(kind) && built;
              return (
                <div
                  key={slot}
                  className={`iso-tile ${hover === slot ? "is-hover" : ""}`}
                  style={{ gridColumn: col + 2, gridRow: row + 2 }}
                  onMouseEnter={() => setHover(slot)}
                >
                  <div
                    className={`iso-cube ${up ? "is-up" : ""}`}
                    data-kind={kind ?? "none"}
                    style={{
                      ["--h" as string]: HEIGHT[kind ?? "free"],
                      ["--d" as string]: buildIn && !built ? 0 : `${(col + row * 2) * 45}ms`,
                    }}
                  >
                    <span className="iso-face iso-top" />
                    <span className="iso-face iso-south" />
                    <span className="iso-face iso-west" />
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>
      {size === "lg" ? (
        <figcaption className="iso-tip" aria-hidden="true" data-show={hovered ? "true" : "false"}>
          {hovered ? (
            <>
              <strong>
                {hovered.day} {hovered.block.toLowerCase()}
              </strong>
              <span>{hovered.range}</span>
              <span>{hoverKind === "free" ? "You are free" : hoverKind === "match" ? "Free for both" : hoverKind === "other" ? "Their time" : "Busy"}</span>
            </>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
};

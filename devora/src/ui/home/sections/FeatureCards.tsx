// Section 02 — Key info: "Built to find your people" per DESIGN.md § 5.1C.
// Paper field (--paper), chapter rail ("Key info"), torn seam at entry.
// Head grid: title & lead on left, 320px circle on right holding recoloured Lottie.
// List: 3 x 2 grid of 64px recoloured PNG icons, h3.t-card, and 16px ink-body paragraphs.

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TornEdge from "@/ui/shared/TornEdge";
import ChapterRail from "./ChapterRail";
import MovingAnimation from "./MovingAnimation";
import builderAnimation from "@/ui/shared/assets/lottie-animations/recolored/everything-a-builder-needs.json";

import searchIcon from "@/ui/shared/assets/small-assets/recolored/search.png";
import fileManagerIcon from "@/ui/shared/assets/small-assets/recolored/file-manager.png";
import partyCardIcon from "@/ui/shared/assets/small-assets/recolored/party-card.png";
import userIcon from "@/ui/shared/assets/small-assets/recolored/user.png";
import increaseIcon from "@/ui/shared/assets/small-assets/recolored/increase.png";
import shareIcon from "@/ui/shared/assets/small-assets/recolored/share.png";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: searchIcon,
    title: "Finding your people",
    text: "Skip the awkward cold approach. Browse peers by interest, career niche, major and goals, then reach out knowing you already line up.",
  },
  {
    icon: fileManagerIcon,
    title: "Potential opportunities",
    text: "Study groups, coffee chats, mentors and friends in your field. The openings that actually matter for CECS students, in one place.",
  },
  {
    icon: partyCardIcon,
    title: "Events and CECS intel",
    text: "The hub for department networking: events, opportunities, job discovery, career advice, and the stuff that usually dies in Discord.",
  },
  {
    icon: userIcon,
    title: "Real profiles",
    text: "Verified UM\u2011Dearborn students only, with major, experience, interests and a real reason to be here. No bots. No fake accounts.",
  },
  {
    icon: increaseIcon,
    title: "Skill graph",
    text: "See who shares your stack and ambitions at a glance. Match on skills, not vibes from a random group chat.",
  },
  {
    icon: shareIcon,
    title: "Direct chat",
    text: "Message peers on Devora, or jump to the socials they share. No more cold LinkedIn templates into the void.",
  },
];

export default function FeatureCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!sectionRef.current || !discRef.current) return;

    // Disc rotate & scale scrubbed across section (§ 7.4)
    const tween = gsap.fromTo(
      discRef.current,
      { rotate: -10, scale: 0.85 },
      {
        rotate: 6,
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="scene scene-paper"
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        position: "relative",
      }}
    >
      {/* Torn seam in paper colour overlapping section above */}
      <TornEdge color="var(--paper)" />

      <div className="wrap">
        <div className="chapter-grid">
          <ChapterRail label="Key info" field="paper" />

          <div>
            {/* Header grid: 1.4fr .6fr from 980px */}
            <div className="key-info-header-grid">
              <div>
                <h2 className="t-title text-[var(--ink)]">
                  Built to find your people
                </h2>
                <p className="lead text-[var(--ink-body)] mt-5">
                  The pieces that make Devora feel like a real CECS network, and
                  not another feed you forget about after onboarding.
                </p>
              </div>

              {/* 320px circle in --paper-2 with 2px ink border and --shadow */}
              <div className="disc-wrapper">
                <div ref={discRef} className="key-info-disc">
                  <MovingAnimation
                    animationData={builderAnimation}
                    ariaLabel="Builder animation"
                    className="w-[90%] h-[90%]"
                  />
                </div>
              </div>
            </div>

            {/* Feature List: 3x2 from 1100px, 2x3 from 640px, 1 column below */}
            <ul className="features-list">
              {FEATURES.map((item, idx) => (
                <li key={idx} className="feature-item">
                  <div className="feature-icon-wrapper">
                    <Image
                      src={item.icon}
                      alt=""
                      width={64}
                      height={64}
                      className="feature-icon"
                    />
                  </div>
                  <h3 className="t-card text-[var(--ink)] mt-4">
                    {item.title}
                  </h3>
                  <p className="text-[16px] leading-[1.55] text-[var(--ink-body)] mt-2.5 max-w-[50ch]">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .key-info-header-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          margin-bottom: 64px;
          align-items: center;
        }

        @media (min-width: 980px) {
          .key-info-header-grid {
            grid-template-columns: 1.4fr 0.6fr;
          }
        }

        .disc-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .key-info-disc {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: var(--paper-2);
          border: 2px solid var(--ink);
          box-shadow: var(--shadow);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .key-info-disc {
            width: 320px;
            height: 320px;
          }
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px 36px;
        }

        @media (min-width: 640px) {
          .features-list {
            grid-template-columns: repeat(2, 1fr);
            gap: 48px 40px;
          }
        }

        @media (min-width: 1100px) {
          .features-list {
            grid-template-columns: repeat(3, 1fr);
            gap: 56px 48px;
          }
        }

        .feature-item {
          display: flex;
          flex-direction: column;
        }

        .feature-icon-wrapper {
          width: 64px;
          height: 64px;
        }

        :global(.feature-icon) {
          filter: drop-shadow(3px 3px 0 rgb(13 11 14 / 0.18));
          width: 64px;
          height: 64px;
          object-fit: contain;
        }
      `}</style>
    </section>
  );
}

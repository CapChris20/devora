// Section 05 — Benefits: "What you get out of it" per DESIGN.md § 5.1F.
// Orange field (--orange), chapter rail ("Benefits"), torn seam at entry.
// 6 paper poster cards (3x2 >= 1100px, 2x3 >= 640px, 1-col mobile). Equal heights.
// Each card: 58px icon inline before h3.t-card (gap 16), then 16px ink-body paragraph.

"use client";

import Image from "next/image";
import TornEdge from "@/ui/shared/TornEdge";
import ChapterRail from "./ChapterRail";

import bAnxiety from "@/ui/shared/assets/small-assets/recolored/benefit-anxiety.png";
import bLearning from "@/ui/shared/assets/small-assets/recolored/benefit-learning.png";
import bVerified from "@/ui/shared/assets/small-assets/recolored/benefit-verified.png";
import bPortfolio from "@/ui/shared/assets/small-assets/recolored/benefit-portfolio.png";
import bLaunch from "@/ui/shared/assets/small-assets/recolored/benefit-launch.png";

type BenefitItem = {
  title: string;
  text: string;
  icon?: typeof bAnxiety;
  isStar?: boolean;
};

const BENEFITS: BenefitItem[] = [
  {
    icon: bAnxiety,
    title: "Less social anxiety",
    text: "Skip the cold approach. Warm intros to people who already share your courses, skills and goals, so reaching out feels human, not scary.",
  },
  {
    icon: bLearning,
    title: "Learn together",
    text: "Study groups, peer mentoring, and upperclassmen who've survived the exact classes you're about to take.",
  },
  {
    icon: bVerified,
    title: "Verified and exclusive",
    text: "Every member is a confirmed CECS student at UM\u2011Dearborn. Your campus network, with no bots and no randos.",
  },
  {
    icon: bPortfolio,
    title: "Showcase everything",
    text: "One profile for projects, skills, niches, socials, goals and interests. Stop scattering yourself across five apps.",
  },
  {
    icon: bLaunch,
    title: "Launch your career",
    text: "Alumni connections, internship referrals and people in your career niche, not just another r\u00e9sum\u00e9 line.",
  },
  {
    isStar: true,
    title: "Stand out",
    text: "Get discovered for who you are and where you're headed, not buried under a generic r\u00e9sum\u00e9 in a recruiter feed.",
  },
];

export default function GoodReasons() {
  return (
    <section
      id="benefits"
      className="scene scene-orange"
      style={{
        background: "var(--orange)",
        color: "var(--ink)",
        position: "relative",
      }}
    >
      <TornEdge color="var(--orange)" />

      <div className="wrap">
        <div className="chapter-grid">
          <ChapterRail label="Benefits" field="orange" />

          <div>
            <h2 className="t-title text-[var(--ink)]">What you get out of it</h2>
            <p className="lead text-[var(--ink)] mt-4 mb-12">
              Concrete wins for CECS students who want friends, colleagues and a
              network that actually helps their career.
            </p>

            {/* 6 Paper poster cards */}
            <div className="benefits-grid">
              {BENEFITS.map((item, idx) => (
                <div key={idx} className="poster benefit-card">
                  <div className="benefit-card-header">
                    <div className="benefit-icon-box">
                      {item.isStar ? (
                        <svg
                          width="58"
                          height="58"
                          viewBox="0 0 24 24"
                          className="standout-star"
                          stroke="var(--ink)"
                          strokeWidth="0.8"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient
                              id="starGrad"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#ff9a3d" />
                              <stop offset="52%" stopColor="#ff5ca8" />
                              <stop offset="100%" stopColor="#ff2bd6" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M12 2C12.4 7.2 16.8 11.6 22 12C16.8 12.4 12.4 16.8 12 22C11.6 16.8 7.2 12.4 2 12C7.2 11.6 11.6 7.2 12 2Z"
                            fill="url(#starGrad)"
                          />
                        </svg>
                      ) : (
                        <Image
                          src={item.icon!}
                          alt=""
                          width={58}
                          height={58}
                          className="object-contain"
                        />
                      )}
                    </div>

                    <h3 className="t-card text-[var(--ink)]">{item.title}</h3>
                  </div>

                  <p className="text-[16px] leading-[1.55] text-[var(--ink-body)] mt-2">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .benefits-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          grid-auto-rows: 1fr;
        }

        @media (min-width: 640px) {
          .benefits-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1100px) {
          .benefits-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .benefit-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .benefit-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .benefit-icon-box {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .standout-star {
          filter: drop-shadow(2px 2px 0 rgba(13, 11, 14, 0.25));
        }
      `}</style>
    </section>
  );
}

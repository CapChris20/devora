// Section 04 — Why Devora: "Not another platform. The platform." per DESIGN.md § 5.1E.
// Pink field (--pink), chapter rail ("Why Devora"), torn seam into it.
// 3 tab pills: vs GitHub, vs LinkedIn, vs Discord / Slack.
// 8s auto-advance through one full pass (pauses on hover/focus, stops on manual click).
// Grid: Them (paper poster) -> 72px ink VS disc -> Devora (ink poster with 5 wins).

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Check, Hash } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/ui/discovery/cards/DiscoverySocialIcons";
import TornEdge from "@/ui/shared/TornEdge";
import ChapterRail from "./ChapterRail";
import MovingAnimation from "./MovingAnimation";

import githubLottie from "@/ui/shared/assets/lottie-animations/recolored/why-devora-github.json";
import linkedinLottie from "@/ui/shared/assets/lottie-animations/recolored/why-devora-linkedin.json";
import discordLottie from "@/ui/shared/assets/lottie-animations/recolored/why-devora-discord.json";

type TabData = {
  id: "github" | "linkedin" | "discord";
  label: string;
  renderIcon: () => React.ReactNode;
  lottie: object;
  name: string;
  quote: string;
  stillGoodFor: string;
  wins: string[];
};

const TABS: TabData[] = [
  {
    id: "github",
    label: "vs GitHub",
    renderIcon: () => <GithubIcon size={18} />,
    lottie: githubLottie,
    name: "GitHub",
    quote:
      "Great for hosting code. Terrible for finding the junior who knows Unity and sits two rows behind you in CIS 350.",
    stillGoodFor: "Hosting code",
    wins: [
      "Find React and Unity classmates in seconds, not by stalking commit histories",
      "Profiles built for finding people: skills, courses and interests, not just green squares",
      "Ask who is taking DSA this semester and get real people, not silent repos",
      "Warm intros between verified CECS peers, no cold DMs to random usernames",
      "Friendships, study crews and career chats start here. GitHub stays where the code lives",
    ],
  },
  {
    id: "linkedin",
    label: "vs LinkedIn",
    renderIcon: () => <LinkedinIcon size={18} />,
    lottie: linkedinLottie,
    name: "LinkedIn",
    quote:
      "A sea of recruiters, strangers and \"open to work\" banners. Nobody there cares about your ECE 270 study group.",
    stillGoodFor: "R\u00e9sum\u00e9s and recruiters",
    wins: [
      "Everyone here is CECS at UM\u2011Dearborn, with zero recruiter spam",
      "Find React devs taking DSA this semester in seconds",
      "Meet verified peers in your niche instead of collecting endorsements",
      "Student-first discovery for friends, study groups and people in your field",
      "Message people who share your major and goals, without templates",
    ],
  },
  {
    id: "discord",
    label: "vs Discord / Slack",
    renderIcon: () => <Hash size={18} />,
    lottie: discordLottie,
    name: "Discord / Slack",
    quote:
      "Forty fragmented servers, dead #general channels, and no way to know who actually knows React.",
    stillGoodFor: "Group chat, once you have found them",
    wins: [
      "One searchable directory for the whole school, not 40 half-dead servers",
      "Verified UM\u2011Dearborn identities, no anonymous lurkers",
      "Filter by skill, course or interest instead of scrolling chat history",
      "Profiles answer \"do we actually click?\" before you open a DM",
      "Built for finding your people fast. Discord stays for the group chat",
    ],
  },
];

export default function WhyDevora() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const passesRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTab = TABS[activeTabIdx];

  const handleSelectTab = useCallback(
    (index: number, manual = true) => {
      setActiveTabIdx(index);
      if (manual) {
        setHasInteracted(true);
      }
    },
    []
  );

  // Auto-advance every 8s through one full pass per § 5.1E
  useEffect(() => {
    if (hasInteracted || isPaused) return;

    const timer = setInterval(() => {
      setActiveTabIdx((prev) => {
        const next = prev + 1;
        if (next >= TABS.length) {
          passesRef.current += 1;
          if (passesRef.current >= 1) {
            clearInterval(timer);
            return prev;
          }
          return 0;
        }
        return next;
      });
    }, 8000);

    return () => clearInterval(timer);
  }, [hasInteracted, isPaused]);

  // Arrow key navigation per § 5.1E
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      handleSelectTab((activeTabIdx + 1) % TABS.length, true);
    } else if (e.key === "ArrowLeft") {
      handleSelectTab((activeTabIdx - 1 + TABS.length) % TABS.length, true);
    }
  };

  return (
    <section
      id="why-devora"
      className="scene scene-pink"
      style={{
        background: "var(--grad)",
        color: "var(--ink)",
        position: "relative",
      }}
    >
      <TornEdge color="var(--grad)" />

      <div
        ref={containerRef}
        className="wrap"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <div className="chapter-grid">
          <ChapterRail label="Why Devora" field="pink" />

          <div>
            <h2 className="t-title text-[var(--ink)]">
              Not another platform. The platform.
            </h2>
            <p className="lead text-[var(--ink)] mt-4">
              GitHub hosts code. LinkedIn hosts r&eacute;sum&eacute;s. Discord
              hosts chaos. Devora hosts the CECS people you actually want to
              know.
            </p>

            {/* Tab list */}
            <div
              role="tablist"
              aria-label="Comparison tabs"
              className="why-tab-list"
              onKeyDown={handleKeyDown}
            >
              {TABS.map((tab, idx) => {
                const isSelected = activeTabIdx === idx;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={isSelected}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => handleSelectTab(idx, true)}
                    className="why-pill"
                    style={{
                      background: isSelected ? "var(--orange)" : "transparent",
                      color: "var(--ink)",
                      border: "2px solid var(--ink)",
                      boxShadow: isSelected ? "3px 3px 0 0 var(--ink)" : "none",
                    }}
                  >
                    {tab.renderIcon()}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Comparison Panel */}
            <div
              id={`panel-${activeTab.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab.id}`}
              className="why-panel-grid"
            >
              {/* Them (paper poster) */}
              <div className="poster poster-them">
                <div className="them-header">
                  <div className="them-lottie-circle">
                    <MovingAnimation
                      animationData={activeTab.lottie}
                      ariaLabel={`${activeTab.name} animation`}
                      className="w-[85%] h-[85%]"
                    />
                  </div>
                  <h3 className="t-card text-[clamp(22px,2.2vw,30px)] text-[var(--ink)]">
                    {activeTab.name}
                  </h3>
                </div>

                <p className="them-quote">{activeTab.quote}</p>

                <div className="them-footer">
                  <span className="mono text-[var(--ink-muted)]">
                    Still good for
                  </span>
                  <span className="them-stamp">{activeTab.stillGoodFor}</span>
                </div>
              </div>

              {/* VS disc */}
              <div className="vs-disc-wrapper">
                <div className="vs-disc">VS</div>
              </div>

              {/* Devora (ink poster, white text) */}
              <div className="poster poster-devora">
                <div className="devora-header">
                  <h3 className="t-card text-[clamp(22px,2.2vw,30px)] text-white">
                    Devora
                  </h3>
                  <span className="devora-wins-stamp">5 wins</span>
                </div>

                <div className="devora-wins-list">
                  {activeTab.wins.map((win, i) => (
                    <div key={i} className="devora-win-row">
                      <div className="win-check">
                        <Check size={18} color="#ff9a3d" strokeWidth={3} />
                      </div>
                      <span className="text-[15.5px] leading-[1.45] text-white">
                        {win}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .why-tab-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 40px;
          margin-bottom: 40px;
        }

        .why-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 44px;
          padding-inline: 20px;
          border-radius: 9999px;
          font-family: var(--f-mono);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: translate 0.2s var(--spring), box-shadow 0.2s var(--spring);
        }

        .why-pill:hover {
          translate: 0 -2px;
        }

        .why-pill:active {
          translate: 2px 2px;
          box-shadow: none;
        }

        .why-panel-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: stretch;
        }

        @media (min-width: 980px) {
          .why-panel-grid {
            grid-template-columns: 1fr auto 1.25fr;
            gap: 28px;
          }
        }

        .poster-them {
          background: var(--paper);
          color: var(--ink);
          box-shadow: var(--shadow);
        }

        .them-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .them-lottie-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .them-lottie-circle {
            width: 120px;
            height: 120px;
          }
        }

        .them-quote {
          font-family: var(--f-display);
          font-weight: 700;
          font-size: clamp(19px, 1.6vw, 22px);
          line-height: 1.35;
          color: var(--ink);
          margin-bottom: 28px;
        }

        .them-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 20px;
          border-top: 1px solid var(--paper-2);
        }

        .them-stamp {
          display: inline-block;
          align-self: flex-start;
          padding: 4px 12px;
          border-radius: 4px;
          border: 2px dashed var(--ink);
          font-family: var(--f-mono);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .vs-disc-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 0;
        }

        .vs-disc {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--ink);
          color: var(--paper);
          font-family: var(--f-display);
          font-weight: 800;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-8deg);
          box-shadow: 4px 4px 0 0 rgba(0, 0, 0, 0.25);
          flex-shrink: 0;
        }

        .poster-devora {
          background: var(--ink);
          color: white;
          box-shadow: 7px 7px 0 0 var(--ink);
        }

        .devora-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .devora-wins-stamp {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 4px;
          border: 2px dashed #ff9a3d;
          background: var(--grad);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-family: var(--f-mono);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .devora-wins-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .devora-win-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: var(--surface-2);
          border-radius: 10px;
          padding: 14px 16px;
        }

        .win-check {
          flex-shrink: 0;
          margin-top: 1px;
        }
      `}</style>
    </section>
  );
}

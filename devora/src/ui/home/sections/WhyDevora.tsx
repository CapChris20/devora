// Section 04 — Why Devora: "Not another platform. The platform."
// Follows Coach Connect "Design Law" (why-devora.html):
// - Tabs row with 8s autoplay progress bar (pauses on hover, stops on manual click)
// - Three-column compare grid: Rival card (paper) | VS disc | Devora card (white with brand gradient head + 5 wins)
// - Each win has a 26px gradient check square (cycling brand, orchid, sky, blush) sitting directly on the card surface
// - Zero boxes around individual wins, zero emojis, zero pink borders

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { Check } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/ui/discovery/cards/DiscoverySocialIcons";
import { Hash } from "lucide-react";
import TornEdge from "@/ui/shared/TornEdge";
import ChapterRail from "./ChapterRail";
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

type TabData = {
  id: "github" | "linkedin" | "discord";
  label: string;
  mark: string;
  who: string;
  renderIcon: () => React.ReactNode;
  name: string;
  quote: string;
  stillGoodFor: string;
  wins: string[];
};

const TABS: TabData[] = [
  {
    id: "github",
    label: "vs GitHub",
    mark: "GH",
    who: "For hosting code",
    renderIcon: () => <GithubIcon size={16} />,
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
    mark: "IN",
    who: "For recruiters",
    renderIcon: () => <LinkedinIcon size={16} />,
    name: "LinkedIn",
    quote:
      "A sea of recruiters, strangers and \"open to work\" banners. Nobody there cares about your ECE 270 study group.",
    stillGoodFor: "Job hunting",
    wins: [
      "Everyone here is CECS at UM-Dearborn, with zero recruiter spam",
      "Find React devs taking DSA this semester in seconds",
      "Meet verified peers in your niche instead of collecting endorsements",
      "Student-first discovery for friends, study groups and people in your field",
      "Message people who share your major and goals, without templates",
    ],
  },
  {
    id: "discord",
    label: "vs Discord / Slack",
    mark: "DS",
    who: "For group chat",
    renderIcon: () => <Hash size={16} />,
    name: "Discord / Slack",
    quote:
      "Forty fragmented servers, dead #general channels, and no way to know who actually knows React.",
    stillGoodFor: "Group chat",
    wins: [
      "One directory of every public CECS student, not forty servers",
      "Search by course, skill or club instead of scrolling channels",
      "Real names and majors, verified with a umich.edu account",
      "Clubs, events and study groups in one Activity Center",
      "Start a one-on-one chat from a profile in one click",
    ],
  },
];

// Gradients for the 5 check squares per Design Law
const WIN_CHECK_GRADIENTS = [
  "bg-gradient-to-br from-[#ff6b9d] to-[#fb923c]", // brand
  "bg-gradient-to-br from-[#a78bfa] to-[#e879f9]", // orchid
  "bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa]", // sky
  "bg-gradient-to-br from-[#fda4af] to-[#fb7185]", // blush
  "bg-gradient-to-br from-[#ff6b9d] to-[#fb923c]", // brand
];

const AUTOPLAY_SECONDS = 8;

export default function WhyDevora() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const devoraCardRef = useRef<HTMLElement>(null);
  const vsDiscRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const activeTab = TABS[activeTabIdx];

  // 3D Interactive Tilt on Devora card
  const handleCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = devoraCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(card, {
      rotateY: x * 0.02,
      rotateX: -y * 0.02,
      duration: 0.25,
      ease: "power1.out",
      transformPerspective: 800,
      transformOrigin: "center center",
    });
  };

  const handleCardMouseLeave = () => {
    if (!devoraCardRef.current) return;
    gsap.to(devoraCardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  // Tab switch handler
  const handleSelectTab = useCallback((index: number, manual = true) => {
    setActiveTabIdx(index);
    if (manual) {
      setHasInteracted(true);
    }
  }, []);

  // GSAP animation on tab change
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (vsDiscRef.current) {
      gsap.fromTo(
        vsDiscRef.current,
        { rotate: -368, scale: 0.6 },
        { rotate: -8, scale: 1, duration: 0.85, ease: "back.out(1.7)" }
      );
    }

    gsap.fromTo(
      ".devora-win-item",
      { x: 24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: "power3.out" }
    );

    gsap.fromTo(
      ".devora-check-square",
      { scale: 0, rotate: -140 },
      { scale: 1, rotate: 0, duration: 0.6, stagger: 0.07, delay: 0.1, ease: "back.out(2.4)" }
    );
  }, [activeTabIdx]);

  // Gentle float for VS disc
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!vsDiscRef.current) return;
    const tween = gsap.to(vsDiscRef.current, {
      y: -5,
      duration: 1.5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
    return () => {
      tween.kill();
    };
  }, []);

  // Autoplay timer with progress bar
  useEffect(() => {
    if (hasInteracted) {
      if (progressBarRef.current) progressBarRef.current.style.width = "0%";
      return;
    }

    const bar = progressBarRef.current;
    if (!bar) return;

    let tween: gsap.core.Tween | null = null;
    if (!isPaused && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tween = gsap.fromTo(
        bar,
        { width: "0%" },
        {
          width: "100%",
          duration: AUTOPLAY_SECONDS,
          ease: "none",
          onComplete: () => {
            setActiveTabIdx((prev) => (prev + 1) % TABS.length);
          },
        }
      );
    }

    return () => {
      if (tween) tween.kill();
    };
  }, [activeTabIdx, hasInteracted, isPaused]);

  return (
    <section
      id="why-devora"
      className="scene scene-why-devora relative overflow-hidden py-20 lg:py-28"
      style={{
        background: isLight ? "#faf8f5" : "#0e0817",
        color: isLight ? "#0a0a0a" : "#ffffff",
      }}
    >
      <TornEdge color={isLight ? "#faf8f5" : "#0e0817"} />

      <div
        ref={containerRef}
        className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="chapter-grid">
          <ChapterRail label="Why Devora" field="orange" />

          <div className="w-full">
            {/* ── Section Title ── */}
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-[46px] uppercase tracking-tight leading-[0.95] text-left">
              Not another platform. The platform.
            </h2>
            <p className="mt-3 font-body text-base sm:text-lg text-[#575757] dark:text-neutral-300 max-w-[54ch]">
              GitHub hosts code. LinkedIn hosts résumés. Discord hosts chaos. Devora connects the CECS
              classmates you actually want to meet.
            </p>

            {/* ── Tabs & Autoplay Bar Row ── */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div role="tablist" aria-label="Compare Devora with" className="flex flex-wrap gap-2">
                {TABS.map((tab, idx) => {
                  const isSelected = activeTabIdx === idx;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => handleSelectTab(idx, true)}
                      className={`inline-flex items-center gap-2 min-h-[40px] px-4 rounded-full border-2 border-[#0a0a0a] dark:border-white/40 font-mono text-xs font-bold uppercase tracking-[0.08em] transition-all duration-120 cursor-pointer select-none active:translate-x-0.5 active:translate-y-0.5 ${
                        isSelected
                          ? "bg-[#0a0a0a] text-white shadow-[2px_2px_0px_#0a0a0a] dark:bg-white dark:text-[#0a0a0a] dark:border-white"
                          : isLight
                          ? "bg-white text-[#0a0a0a] hover:shadow-[2px_2px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
                          : "bg-[#181124] text-neutral-300 hover:text-white hover:border-white/70"
                      }`}
                    >
                      {tab.renderIcon()}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 8s Autoplay progress bar */}
              {!hasInteracted && (
                <div
                  aria-hidden="true"
                  className="h-2 w-28 rounded-full border-2 border-[#0a0a0a] dark:border-white/30 bg-white dark:bg-[#181124] overflow-hidden"
                >
                  <div
                    ref={progressBarRef}
                    className="h-full w-0 bg-gradient-to-r from-[#6206f1] via-[#eb2d85] to-[#ff6a1f]"
                  />
                </div>
              )}
            </div>

            {/* ── Three-Column Comparison Grid ── */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.35fr)] gap-6 lg:gap-8 items-start">
              {/* 1. Left Rival Card (Paper / Quieter) */}
              <article
                className={`rounded-[10px] p-6 sm:p-7 flex flex-col gap-4 min-h-[380px] transition-all duration-150 ${
                  isLight
                    ? "bg-[#f2f2f0] border-[3px] border-[#0a0a0a] shadow-[4px_4px_0px_0px_#0a0a0a]"
                    : "bg-[#161022] border-2 border-white/20 shadow-[5px_5px_0px_0px_#000000]"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-[54px] h-[54px] shrink-0 rounded-[12px] border-[3px] flex items-center justify-center font-display text-xl font-normal shadow-[2px_2px_0px_0px_#0a0a0a] ${
                    isLight
                      ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                      : "border-white/30 bg-[#201730] text-white"
                  }`}>
                    {activeTab.mark}
                  </div>
                  <div>
                    <h3 className={`font-display uppercase font-normal text-2xl sm:text-[26px] leading-tight m-0 ${
                      isLight ? "text-[#0a0a0a]" : "text-white"
                    }`}>
                      {activeTab.name}
                    </h3>
                    <small className={`block mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${
                      isLight ? "text-[#575757]" : "text-neutral-400"
                    }`}>
                      {activeTab.who}
                    </small>
                  </div>
                </div>

                <p className={`mt-3 font-body text-lg sm:text-[19px] font-semibold leading-[1.4] ${
                  isLight ? "text-[#0a0a0a]" : "text-neutral-200"
                }`}>
                  {activeTab.quote}
                </p>

                <div
                  className={`mt-auto pt-4 border-t-[3px] flex flex-wrap items-center gap-2.5 ${
                    isLight ? "border-[#0a0a0a]" : "border-white/20"
                  }`}
                >
                  <span className={`font-mono text-[11px] font-bold uppercase tracking-[0.14em] ${
                    isLight ? "text-[#575757]" : "text-neutral-400"
                  }`}>
                    Still good for:
                  </span>
                  <span className={`inline-block px-2.5 py-1 rounded-[6px] border-[2.5px] border-dashed font-mono text-xs font-bold uppercase tracking-wider ${
                    isLight
                      ? "border-[#0a0a0a] bg-white text-[#0a0a0a]"
                      : "border-white/40 bg-[#1e152e] text-white"
                  }`}>
                    {activeTab.stillGoodFor}
                  </span>
                </div>
              </article>

              {/* 2. Center VS Disc */}
              <div className="flex items-center justify-center self-center py-2 lg:py-0">
                <div
                  ref={vsDiscRef}
                  aria-hidden="true"
                  className="w-16 h-16 rounded-full border-[3px] border-[#0a0a0a] bg-[#0a0a0a] text-white flex items-center justify-center font-display text-lg shadow-[3px_3px_0px_0px_#fb923c] -rotate-[8deg] select-none"
                >
                  VS
                </div>
              </div>

              {/* 3. Right Devora Card (White / Louder, with 3D Tilt) */}
              <article
                ref={devoraCardRef}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className={`rounded-[10px] overflow-hidden flex flex-col transition-all duration-150 ${
                  isLight
                    ? "bg-white border-[3px] border-[#0a0a0a] shadow-[7px_7px_0px_0px_#0a0a0a]"
                    : "bg-[#120c1c] border-2 border-white/30 shadow-[8px_8px_0px_0px_#000000]"
                }`}
              >
                {/* Devora Card Header: Brand Gradient + 5 Wins Sticker */}
                <div
                  className={`relative flex items-end justify-between gap-3 p-5 sm:px-6 sm:py-5 bg-gradient-to-r from-[#ff6b9d] to-[#fb923c] border-b-[3px] ${
                    isLight ? "border-[#0a0a0a]" : "border-white/25"
                  }`}
                >
                  <h3 className="m-0 font-display uppercase font-normal text-3xl sm:text-4xl text-[#0a0a0a] leading-none tracking-tight">
                    Devora
                  </h3>
                  <span className="px-2.5 py-1 rounded-[8px] border-[2.5px] border-[#0a0a0a] bg-white text-[#0a0a0a] font-mono text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#0a0a0a] -rotate-[4deg] select-none">
                    5 wins
                  </span>
                </div>

                {/* 5 Wins List: Direct on Card Surface */}
                <ul className="list-none m-0 p-4 sm:px-6 sm:py-3 divide-y-2 divide-[#e3e3df] dark:divide-white/10">
                  {activeTab.wins.map((win, idx) => (
                    <li
                      key={win}
                      className="devora-win-item flex items-start gap-3.5 py-3.5 first:pt-2 last:pb-2"
                    >
                      <span
                        className={`devora-check-square shrink-0 mt-0.5 w-[26px] h-[26px] rounded-[7px] border-[2.5px] border-[#0a0a0a] flex items-center justify-center text-[#0a0a0a] shadow-[1.5px_1.5px_0px_0px_#0a0a0a] ${
                          WIN_CHECK_GRADIENTS[idx % WIN_CHECK_GRADIENTS.length]
                        }`}
                      >
                        <Check size={16} strokeWidth={3} />
                      </span>
                      <span
                        className={`font-body text-[15px] sm:text-base font-medium leading-[1.5] ${
                          isLight ? "text-[#0a0a0a]" : "text-white"
                        }`}
                      >
                        {win}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

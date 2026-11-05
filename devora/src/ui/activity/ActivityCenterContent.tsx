"use client";

import { useCallback, useMemo, useRef } from "react";
import NavBar from "@/ui/shared/navbar/NavBar";
import Footer from "@/ui/shared/footer/Footer";

import { ACTIVITY_CENTER_NAME } from "./config";
import { getActivitySampleData } from "./sample-data";
import { useAvailability } from "./useAvailability";
import { AsciiIsoBackground } from "./AsciiIsoBackground";
import { Hero } from "./sections/Hero";
import { HoursSection } from "./sections/HoursSection";
import { ConnectSection } from "./sections/ConnectSection";
import { StudySection } from "./sections/StudySection";
import { CampusSection } from "./sections/CampusSection";
import { RecentComing } from "./sections/RecentComing";
import { prefersReducedMotion, useScrollReveals, useTitleGradients } from "./motion";
import "./brutal.css";

export default function ActivityCenterContent() {
  const data = useMemo(getActivitySampleData, []);
  const availability = useAvailability(data.myHours);
  const hoursGridRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useScrollReveals(pageRef);
  useTitleGradients(pageRef);

  const jump = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const focusHours = useCallback(() => {
    jump("hours");
    window.setTimeout(
      () =>
        hoursGridRef.current
          ?.querySelector<HTMLButtonElement>(".nb-cell")
          ?.focus({ preventScroll: true }),
      prefersReducedMotion() ? 0 : 500,
    );
  }, [jump]);

  const timed = [...data.groups, ...data.events];
  const fitCount = timed.filter((t) => {
    const fit = availability.getFit(t);
    return fit === "fits" || fit === "any";
  }).length;

  return (
    <main className="page-shell nb-root relative flex min-h-screen flex-col" id="top">
      <AsciiIsoBackground />
      <div className="nb-progress" aria-hidden="true">
        <span className="nb-progress-bar" />
      </div>
      <NavBar activeItem={ACTIVITY_CENTER_NAME} />

      <div
        ref={pageRef}
        className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-4 pb-10 pt-28 sm:px-6"
      >
        <header className="page-header act-rise" style={{ ["--i" as string]: 0 }}>
          <div className="page-header-glow" aria-hidden="true" />
          <div className="page-header-glass">
            <h1 className="page-title-stack font-display">
              <span className="page-title-depth" aria-hidden="true">
                {ACTIVITY_CENTER_NAME}
              </span>
              <span className="page-title-fill page-title-grad">{ACTIVITY_CENTER_NAME}</span>
            </h1>
          </div>
        </header>

        <div className="nb-page">
          <Hero availability={availability} onSetHours={focusHours} onJump={jump} />
          <HoursSection
            ref={hoursGridRef}
            availability={availability}
            fitCount={fitCount}
            totalCount={timed.length}
          />
          <ConnectSection
            availability={availability}
            people={data.people}
            initialConversations={data.conversations}
            initialConnections={data.connections}
            onFocusHours={focusHours}
          />
          <StudySection
            availability={availability}
            people={data.people}
            initialGroups={data.groups}
            courses={data.courses}
            onFocusHours={focusHours}
          />
          <CampusSection availability={availability} events={data.events} />
          <RecentComing recent={data.recent} people={data.people} />
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </main>
  );
}


"use client";

import dynamic from "next/dynamic";

const WaterBackground = dynamic(() => import("./WaterBackground"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 h-full w-full min-h-[100dvh] bg-[#1a0a2e]" />
  ),
});

/** Full-screen page background — currently Devora water shader. */
export default function PageBackground() {
  return (
    <div className="fixed inset-0 z-0 h-[100dvh] w-full">
      <WaterBackground />
    </div>
  );
}

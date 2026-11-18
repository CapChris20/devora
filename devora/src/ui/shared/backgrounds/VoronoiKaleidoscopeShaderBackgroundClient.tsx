"use client";

import dynamic from "next/dynamic";

const VoronoiKaleidoscopeShaderBackground = dynamic(
  () => import("./VoronoiKaleidoscopeShaderBackground"),
  { ssr: false }
);

export default function VoronoiKaleidoscopeShaderBackgroundClient({
  className,
  fixed,
}: {
  className?: string;
  fixed?: boolean;
}) {
  return <VoronoiKaleidoscopeShaderBackground className={className} fixed={fixed} />;
}


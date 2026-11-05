// Lazy-loads the entrance WebGL background so the server HTML pass never touches the GPU.

"use client";

// ===== IMPORTS =====

import dynamic from "next/dynamic";

// ===== TYPES =====

type EntranceShaderBackgroundClientProps = {
  className?: string;
  fixed?: boolean;
};

// ===== HELPER FUNCTIONS =====

const EntranceShaderBackground = dynamic(() => import("./EntranceShaderBackground"), {
  ssr: false,
});

// ===== MAIN COMPONENT =====

export default function EntranceShaderBackgroundClient({
  className,
  fixed,
}: EntranceShaderBackgroundClientProps) {
  return <EntranceShaderBackground className={className} fixed={fixed} />;
}


// Lazy-loads the hexblocks WebGL background so the server HTML pass never touches the GPU.

"use client";

// ===== IMPORTS =====

import dynamic from "next/dynamic";

// ===== TYPES =====

type HexblocksShaderBackgroundClientProps = {
  className?: string;
  fixed?: boolean;
};

// ===== HELPER FUNCTIONS =====

const HexblocksShaderBackground = dynamic(() => import("./HexblocksShaderBackground"), {
  ssr: false,
});

// ===== MAIN COMPONENT =====

export default function HexblocksShaderBackgroundClient({
  className,
  fixed,
}: HexblocksShaderBackgroundClientProps) {
  return <HexblocksShaderBackground className={className} fixed={fixed} />;
}


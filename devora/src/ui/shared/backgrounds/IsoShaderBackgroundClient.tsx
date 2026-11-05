// Lazy-loads the isometric grid WebGL background so the server HTML pass never touches the GPU.

"use client";

// ===== IMPORTS =====

import dynamic from "next/dynamic";

// ===== TYPES =====

type IsoShaderBackgroundClientProps = {
  className?: string;
  fixed?: boolean;
};

// ===== HELPER FUNCTIONS =====

const IsoShaderBackground = dynamic(() => import("./IsoShaderBackground"), {
  ssr: false,
});

// ===== MAIN COMPONENT =====

export default function IsoShaderBackgroundClient({
  className,
  fixed,
}: IsoShaderBackgroundClientProps) {
  return <IsoShaderBackground className={className} fixed={fixed} />;
}


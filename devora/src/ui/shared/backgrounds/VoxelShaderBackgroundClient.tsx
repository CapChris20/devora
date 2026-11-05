// Lazy-loads the voxel WebGL background so the server HTML pass never touches the GPU.

"use client";

// ===== IMPORTS =====

import dynamic from "next/dynamic";

// ===== TYPES =====

type VoxelShaderBackgroundClientProps = {
  className?: string;
  fixed?: boolean;
};

// ===== HELPER FUNCTIONS =====

const VoxelShaderBackground = dynamic(() => import("./VoxelShaderBackground"), {
  ssr: false,
});

// ===== MAIN COMPONENT =====

export default function VoxelShaderBackgroundClient({
  className,
  fixed,
}: VoxelShaderBackgroundClientProps) {
  return <VoxelShaderBackground className={className} fixed={fixed} />;
}


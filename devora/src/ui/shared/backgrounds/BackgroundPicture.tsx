// Full-screen page background — supports dynamic page-specific shaders.
// Variants:
//   - "pyramid": default Devora faceted pyramid scales
//   - "voronoi": crystal-cell field
//   - "voxel" / "account": Dom Mandy 2019 voxel morphing grid (Account Page)
//   - "entrance" / "faqs": bµg Entrance 3 architectural raymarcher (FAQs Page)
//   - "hexblocks" / "discovery": Shane isometric hexagon blocks (Discovery Page)
//   - "iso" / "settings": Cartesian-to-isometric animated grid (Settings Page)

"use client";

// ===== IMPORTS =====

import dynamic from "next/dynamic";

const EntranceShaderBackgroundClient = dynamic(
  () => import("./EntranceShaderBackgroundClient"),
  { ssr: false }
);
const HexblocksShaderBackgroundClient = dynamic(
  () => import("./HexblocksShaderBackgroundClient"),
  { ssr: false }
);
const IsoShaderBackgroundClient = dynamic(
  () => import("./IsoShaderBackgroundClient"),
  { ssr: false }
);
const PyramidShaderBackgroundClient = dynamic(
  () => import("./PyramidShaderBackgroundClient"),
  { ssr: false }
);
const VoronoiShaderBackgroundClient = dynamic(
  () => import("./VoronoiShaderBackgroundClient"),
  { ssr: false }
);
const VoxelShaderBackgroundClient = dynamic(
  () => import("./VoxelShaderBackgroundClient"),
  { ssr: false }
);

// ===== NAMED CONSTANTS =====

const DEFAULT_BACKGROUND_VARIANT = "pyramid" as const;
const BACKGROUND_LAYER_CLASS = "pointer-events-none fixed inset-0 z-0 overflow-hidden";
const SHADER_LAYER_CLASS = "z-0";

// ===== TYPES =====

export type PageBackgroundVariant =
  | "pyramid"
  | "voronoi"
  | "voxel"
  | "account"
  | "entrance"
  | "faqs"
  | "hexblocks"
  | "discovery"
  | "iso"
  | "settings";

type BackgroundPictureProps = {
  // Which shader paints behind the page.
  variant?: PageBackgroundVariant;
};

// ===== MAIN COMPONENT =====

/**
 * Fixed decorative shader behind an inner page. Clicks pass through to the page.
 * @param props.variant - Which WebGL background to render behind the page
 * @returns A full-viewport layer with the chosen shader
 */
export default function BackgroundPicture({
  variant = DEFAULT_BACKGROUND_VARIANT,
}: BackgroundPictureProps) {
  const renderShader = () => {
    switch (variant) {
      case "voxel":
      case "account":
        return <VoxelShaderBackgroundClient fixed className={SHADER_LAYER_CLASS} />;
      case "entrance":
      case "faqs":
        return <EntranceShaderBackgroundClient fixed className={SHADER_LAYER_CLASS} />;
      case "hexblocks":
      case "discovery":
        return <HexblocksShaderBackgroundClient fixed className={SHADER_LAYER_CLASS} />;
      case "iso":
      case "settings":
        return <IsoShaderBackgroundClient fixed className={SHADER_LAYER_CLASS} />;
      case "voronoi":
        return <VoronoiShaderBackgroundClient fixed className={SHADER_LAYER_CLASS} />;
      case "pyramid":
      default:
        return <PyramidShaderBackgroundClient fixed className={SHADER_LAYER_CLASS} />;
    }
  };

  return (
    <div className={BACKGROUND_LAYER_CLASS} aria-hidden="true">
      {renderShader()}
    </div>
  );
}

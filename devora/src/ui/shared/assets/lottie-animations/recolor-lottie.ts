// Lottie brand palettes and a deep-clone recolor helper for homepage animations.
// Flow: WhyMatchupLottie calls recolorLottie → clone the JSON → walk the tree → rewrite fills.
// After Effects exports keep their original colors; this remaps them to Devora.
// Used by WhyMatchupLottie. Manipulate the palettes below to rebrand the matchup cards.

// ===== NAMED CONSTANTS =====

// vocab: Lottie = After Effects JSON animation. Colors are red, green, blue, alpha as 0..1, not 0–255 CSS.
const LUMA_RED_WEIGHT = 0.299;
const LUMA_GREEN_WEIGHT = 0.587;
const LUMA_BLUE_WEIGHT = 0.114;
const TONE_FULL_BRIGHTNESS = 0.9;
// Manipulate here: raise to recolor more near-whites; lower to preserve more whites
const NEAR_WHITE_LUMINANCE = 0.92;
const UNIT_INTERVAL_MAX = 1;
const OPAQUE_ALPHA = 1;
const RED_CHANNEL_INDEX = 0;
const GREEN_CHANNEL_INDEX = 1;
const BLUE_CHANNEL_INDEX = 2;
const ALPHA_CHANNEL_INDEX = 3;
const LOTTIE_RGBA_LENGTH = 4;
const STATIC_LOTTIE_VALUE_FLAG = 0;
const GRADIENT_HEADER_SLOT_COUNT = 1;
const GRADIENT_STOP_CHANNEL_STRIDE = 4;
const CYCLE_RECOLOR_MODE = "cycle" as const;
const TONE_RECOLOR_MODE = "tone" as const;
const PALETTE_CURSOR_START = 0;
const INDEX_STEP = 1;

// Core brand colors as 0–1 RGBA.
// Manipulate here: tweak a channel (0..1) to shift a brand stop used by every palette below.
export const DEVORA_LOTTIE_COLORS = {
  orange: [1, 0.604, 0.18, 1] as LottieRGBA,
  pink: [1, 0.361, 0.659, 1] as LottieRGBA,
  magenta: [1, 0, 0.431, 1] as LottieRGBA,
  purple: [0.659, 0.333, 0.969, 1] as LottieRGBA,
  deepPurple: [0.42, 0.129, 0.659, 1] as LottieRGBA,
  white: [1, 1, 1, 1] as LottieRGBA,
} as const;

// Ordered palettes per Why Devora card. Cycle mode walks this list for each solid color it finds.
// Manipulate here: reorder or swap colors to change how each animation looks.
export const DEVORA_LOTTIE_PALETTES: Record<DevoraLottiePreset, LottieRGBA[]> = {
  github: [
    DEVORA_LOTTIE_COLORS.orange,
    DEVORA_LOTTIE_COLORS.pink,
    DEVORA_LOTTIE_COLORS.magenta,
    DEVORA_LOTTIE_COLORS.purple,
    DEVORA_LOTTIE_COLORS.deepPurple,
  ],
  linkedin: [
    DEVORA_LOTTIE_COLORS.orange,
    DEVORA_LOTTIE_COLORS.pink,
    DEVORA_LOTTIE_COLORS.magenta,
    DEVORA_LOTTIE_COLORS.purple,
  ],
  discord: [
    DEVORA_LOTTIE_COLORS.purple,
    DEVORA_LOTTIE_COLORS.magenta,
    DEVORA_LOTTIE_COLORS.pink,
    DEVORA_LOTTIE_COLORS.deepPurple,
  ],
};

// Manipulate here: set a preset to "tone" for brightness-based mapping instead of encounter order
const PRESET_RECOLOR_MODE: Record<DevoraLottiePreset, RecolorMode> = {
  github: CYCLE_RECOLOR_MODE,
  linkedin: CYCLE_RECOLOR_MODE,
  discord: CYCLE_RECOLOR_MODE,
};

// ===== TYPES =====

export type LottieRGBA = [number, number, number, number];

export type DevoraLottiePreset = "github" | "linkedin" | "discord";

type RecolorMode = typeof CYCLE_RECOLOR_MODE | typeof TONE_RECOLOR_MODE;

type PaletteCursor = {
  nextColorIndex: number;
};

// ===== HELPER FUNCTIONS =====

function measurePerceivedBrightness([red, green, blue]: LottieRGBA): number {
  // Green counts most because human eyes are most sensitive to it.
  return LUMA_RED_WEIGHT * red + LUMA_GREEN_WEIGHT * green + LUMA_BLUE_WEIGHT * blue;
}

function copyRgbWithOriginalAlpha(
  replacement: readonly [number, number, number, number],
  original: LottieRGBA,
): LottieRGBA {
  return [
    replacement[RED_CHANNEL_INDEX],
    replacement[GREEN_CHANNEL_INDEX],
    replacement[BLUE_CHANNEL_INDEX],
    original[ALPHA_CHANNEL_INDEX],
  ];
}

function pickCycleReplacement(color: LottieRGBA, palette: LottieRGBA[], colorIndex: number): LottieRGBA {
  // vocab/symbol: % = wrap the index around the palette length
  const replacement = palette[colorIndex % palette.length];
  return copyRgbWithOriginalAlpha(replacement, color);
}

function pickToneReplacement(color: LottieRGBA, palette: LottieRGBA[]): LottieRGBA {
  const perceivedBrightness = measurePerceivedBrightness(color);
  const normalizedBrightness = Math.min(UNIT_INTERVAL_MAX, perceivedBrightness / TONE_FULL_BRIGHTNESS);
  // Invert so bright colors pick earlier palette slots and dark colors pick later ones.
  const paletteIndex = Math.min(
    palette.length - INDEX_STEP,
    Math.round((UNIT_INTERVAL_MAX - normalizedBrightness) * (palette.length - INDEX_STEP)),
  );
  const replacement = palette[paletteIndex];
  return copyRgbWithOriginalAlpha(replacement, color);
}

function pickReplacement(
  color: LottieRGBA,
  palette: LottieRGBA[],
  colorIndex: number,
  mode: RecolorMode,
): LottieRGBA {
  const perceivedBrightness = measurePerceivedBrightness(color);
  const isNearWhite = perceivedBrightness > NEAR_WHITE_LUMINANCE;
  if (isNearWhite) {
    return copyRgbWithOriginalAlpha(DEVORA_LOTTIE_COLORS.white, color);
  }

  const isToneMode = mode === TONE_RECOLOR_MODE;
  if (isToneMode) return pickToneReplacement(color, palette);
  return pickCycleReplacement(color, palette, colorIndex);
}

function writeGradientStopRgb(stops: number[], channelIndex: number, color: LottieRGBA): void {
  stops[channelIndex] = color[RED_CHANNEL_INDEX];
  stops[channelIndex + GREEN_CHANNEL_INDEX] = color[GREEN_CHANNEL_INDEX];
  stops[channelIndex + BLUE_CHANNEL_INDEX] = color[BLUE_CHANNEL_INDEX];
}

function pickSpreadToneGradientColor(
  palette: LottieRGBA[],
  stopIndex: number,
  stopCount: number,
): LottieRGBA {
  const lastPaletteIndex = palette.length - INDEX_STEP;
  const gradientIndex = Math.min(
    lastPaletteIndex,
    Math.round((stopIndex / stopCount) * lastPaletteIndex),
  );
  // Reverse so the first stop gets the darkest palette color.
  return palette[lastPaletteIndex - gradientIndex];
}

function recolorOneGradientStop(
  stops: number[],
  palette: LottieRGBA[],
  mode: RecolorMode,
  stopCount: number,
  channelIndex: number,
): void {
  const originalColor: LottieRGBA = [
    stops[channelIndex],
    stops[channelIndex + GREEN_CHANNEL_INDEX],
    stops[channelIndex + BLUE_CHANNEL_INDEX],
    OPAQUE_ALPHA,
  ];
  const stopIndex = (channelIndex - GRADIENT_HEADER_SLOT_COUNT) / GRADIENT_STOP_CHANNEL_STRIDE;
  const isToneMode = mode === TONE_RECOLOR_MODE;
  const replacement = isToneMode
    ? pickToneReplacement(originalColor, palette)
    : pickReplacement(originalColor, palette, stopIndex, CYCLE_RECOLOR_MODE);

  const shouldSpreadToneGradient = isToneMode && stopCount > 0;
  if (shouldSpreadToneGradient) {
    const gradientColor = pickSpreadToneGradientColor(palette, stopIndex, stopCount);
    writeGradientStopRgb(stops, channelIndex, gradientColor);
    return;
  }

  writeGradientStopRgb(stops, channelIndex, replacement);
}

function recolorGradientStops(stops: number[], palette: LottieRGBA[], mode: RecolorMode): void {
  const stopCount = Math.floor((stops.length - GRADIENT_HEADER_SLOT_COUNT) / GRADIENT_STOP_CHANNEL_STRIDE);

  for (
    let channelIndex = GRADIENT_HEADER_SLOT_COUNT;
    channelIndex < stops.length;
    channelIndex += GRADIENT_STOP_CHANNEL_STRIDE
  ) {
    recolorOneGradientStop(stops, palette, mode, stopCount, channelIndex);
  }
}

function recolorStaticSolidFill(
  lottieNode: Record<string, unknown>,
  palette: LottieRGBA[],
  paletteCursor: PaletteCursor,
  mode: RecolorMode,
): void {
  if (!lottieNode.c || typeof lottieNode.c !== "object") return;

  const colorProp = lottieNode.c as { a?: number; k?: LottieRGBA };
  const isStaticColor = colorProp.a === STATIC_LOTTIE_VALUE_FLAG;
  const hasRgbaList = Array.isArray(colorProp.k) && colorProp.k.length === LOTTIE_RGBA_LENGTH;
  if (!isStaticColor || !hasRgbaList) return;

  const originalColor = colorProp.k as LottieRGBA;
  colorProp.k = pickReplacement(originalColor, palette, paletteCursor.nextColorIndex, mode);
  paletteCursor.nextColorIndex += INDEX_STEP;
}

function recolorStaticGradient(lottieNode: Record<string, unknown>, palette: LottieRGBA[], mode: RecolorMode): void {
  if (!lottieNode.g || typeof lottieNode.g !== "object") return;

  const gradient = lottieNode.g as { k?: { a?: number; k?: number[] } };
  const isStaticGradient = gradient.k?.a === STATIC_LOTTIE_VALUE_FLAG;
  const hasStopList = Array.isArray(gradient.k?.k);
  if (!isStaticGradient || !hasStopList || !gradient.k?.k) return;

  recolorGradientStops(gradient.k.k, palette, mode);
}

function walkLottieTreeAndRecolor(
  node: unknown,
  palette: LottieRGBA[],
  paletteCursor: PaletteCursor,
  mode: RecolorMode,
): void {
  // vocab: unknown = the JSON shape is not known yet — narrow it before reading fields
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    node.forEach((child) => walkLottieTreeAndRecolor(child, palette, paletteCursor, mode));
    return;
  }

  const lottieNode = node as Record<string, unknown>;
  recolorStaticSolidFill(lottieNode, palette, paletteCursor, mode);
  recolorStaticGradient(lottieNode, palette, mode);

  // Keep walking every nested value, including children we already recolored.
  // Those children are numbers or already-handled objects, so a second visit does not tint them again.
  Object.values(lottieNode).forEach((child) => {
    walkLottieTreeAndRecolor(child, palette, paletteCursor, mode);
  });
}

// ===== MAIN FUNCTION =====

/**
 * Deep-clone a Lottie JSON and remap static fills and gradients to a Devora palette.
 * The imported JSON is never mutated, because other callers share that module.
 * @param data - Original Lottie JSON object
 * @param preset - Which Why Devora card palette to apply ("github", "linkedin", or "discord")
 * @returns A new Lottie object with brand colors
 */
export function recolorLottie(data: object, preset: DevoraLottiePreset): object {
  // vocab: structuredClone = deep copy so the imported animation file stays untouched
  const clonedAnimation = structuredClone(data);
  const recolorMode = PRESET_RECOLOR_MODE[preset];
  const paletteCursor: PaletteCursor = { nextColorIndex: PALETTE_CURSOR_START };
  walkLottieTreeAndRecolor(clonedAnimation, DEVORA_LOTTIE_PALETTES[preset], paletteCursor, recolorMode);
  return clonedAnimation;
}

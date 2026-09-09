// Lottie brand color palettes and deep-clone recolor helper for homepage animations.
// Flow: WhyMatchupLottie calls recolorLottie(json, preset) → structuredClone → walk the tree →
// rewrite solid fills ({ c: { a:0, k:[r,g,b,a] } }) and gradient stops → return branded JSON.
// Why: After Effects Lottie exports keep original brand colors; we remap them to Devora’s palette
// without editing the huge JSON files by hand.
// Manipulate here: change DEVORA_LOTTIE_COLORS / DEVORA_LOTTIE_PALETTES to rebrand the matchup cards.

// vocab: LottieRGBA = red, green, blue, alpha each as 0..1 (Lottie, not 0–255 CSS)
// Example: CSS #ff9a2e ≈ [1, 0.604, 0.18, 1] here
export type LottieRGBA = [number, number, number, number];

// Core brand colors as 0–1 RGBA (Lottie format, not 0–255).
// Manipulate here: tweak a channel (0..1) to shift a brand stop used by every palette below.
export const DEVORA_LOTTIE_COLORS = {
  orange: [1, 0.604, 0.18, 1] as LottieRGBA,
  pink: [1, 0.361, 0.659, 1] as LottieRGBA,
  magenta: [1, 0, 0.431, 1] as LottieRGBA,
  purple: [0.659, 0.333, 0.969, 1] as LottieRGBA,
  deepPurple: [0.42, 0.129, 0.659, 1] as LottieRGBA,
  white: [1, 1, 1, 1] as LottieRGBA,
} as const;

// Which Why Devora card animation we’re recoloring
export type DevoraLottiePreset = "github" | "linkedin" | "discord";

// Ordered palettes per Why Devora card animation.
// Cycle mode walks this list in order for each solid color it finds.
// Manipulate here: reorder or swap colors to change how each rival’s Lottie looks.
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

// "cycle" = next palette color by encounter order
// "tone"  = map bright→dark source colors onto light→dark palette slots
type RecolorMode = "cycle" | "tone";

// Which remapping strategy each preset uses (all cycle for now).
// Manipulate here: set a preset to "tone" if you want brightness-based mapping instead
const PRESET_RECOLOR_MODE: Record<DevoraLottiePreset, RecolorMode> = {
  github: "cycle",
  linkedin: "cycle",
  discord: "cycle",
};

// Perceived brightness of a color (0 = black, 1 = white).
// Classic luma weights — green counts most because human eyes are most sensitive to it.
function luminance([r, g, b]: LottieRGBA): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Cycle mode — next palette color by index; keep original alpha (transparency).
// vocab/symbol: % = wrap index around the palette length (5th color with 4-length palette → index 1)
function pickCycleReplacement(color: LottieRGBA, palette: LottieRGBA[], index: number): LottieRGBA {
  const replacement = palette[index % palette.length];
  // Keep original alpha so semi-transparent fills stay semi-transparent
  return [replacement[0], replacement[1], replacement[2], color[3]];
}

// Tone mode — map bright→dark source colors onto light→dark palette slots.
// Brighter originals pick earlier (lighter) palette entries; darker originals pick later ones.
function pickToneReplacement(color: LottieRGBA, palette: LottieRGBA[]): LottieRGBA {
  const lum = luminance(color);
  // Normalize luma into 0..1 using 0.9 as “full bright” ceiling
  const t = Math.min(1, lum / 0.9);
  // Invert so bright → low index, dark → high index
  const idx = Math.min(palette.length - 1, Math.round((1 - t) * (palette.length - 1)));
  const replacement = palette[idx];
  return [replacement[0], replacement[1], replacement[2], color[3]];
}

// Choose white for near-white, else tone or cycle based on mode.
function pickReplacement(
  color: LottieRGBA,
  palette: LottieRGBA[],
  index: number,
  mode: RecolorMode,
): LottieRGBA {
  const lum = luminance(color);

  // Near-white highlights stay white so highlights don't tint muddy.
  // Manipulate here: raise 0.92 to recolor more near-whites; lower to preserve more whites
  if (lum > 0.92) {
    return [DEVORA_LOTTIE_COLORS.white[0], DEVORA_LOTTIE_COLORS.white[1], DEVORA_LOTTIE_COLORS.white[2], color[3]];
  }

  if (mode === "tone") {
    return pickToneReplacement(color, palette);
  }

  return pickCycleReplacement(color, palette, index);
}

// Rewrite gradient stop RGB triples in place (Lottie packs them as flat number arrays).
// Lottie gradient `k` shape (simplified): [countOrHeader, offset, r, g, b, offset, r, g, b, …]
// We step by 4 starting at index 1, rewriting only r/g/b and leaving offsets alone.
function recolorGradientStops(stops: number[], palette: LottieRGBA[], mode: RecolorMode): void {
  // How many color stops are packed after the header entry
  const stopCount = Math.floor((stops.length - 1) / 4);

  // Each stop: offset + r + g + b (step by 4 starting after the first entry)
  for (let i = 1; i < stops.length; i += 4) {
    // Temporary RGBA (alpha forced to 1 for luminance / palette picks — we don't write alpha back)
    const old: LottieRGBA = [stops[i], stops[i + 1], stops[i + 2], 1];
    const stopIndex = (i - 1) / 4;
    const replacement =
      mode === "tone"
        ? pickToneReplacement(old, palette)
        : pickReplacement(old, palette, stopIndex, "cycle");

    // Tone mode with multiple stops — spread palette across the gradient from light→dark.
    // We reverse the index so the first stop gets the darkest palette color (looks richer).
    if (mode === "tone" && stopCount > 0) {
      const gradientIdx = Math.min(
        palette.length - 1,
        Math.round((stopIndex / stopCount) * (palette.length - 1)),
      );
      const gradientColor = palette[palette.length - 1 - gradientIdx];
      stops[i] = gradientColor[0];
      stops[i + 1] = gradientColor[1];
      stops[i + 2] = gradientColor[2];
      // vocab: continue = skip the default write below and go to the next loop iteration
      continue;
    }

    // Default (cycle, or tone with a single stop): write the picked replacement RGB
    stops[i] = replacement[0];
    stops[i + 1] = replacement[1];
    stops[i + 2] = replacement[2];
  }
}

// Recursively walk the Lottie JSON and recolor solid fills + gradients.
// colorIndex is an object ({ value }) so nested calls share one mutable counter for cycle mode.
// vocab: unknown = “we don’t know the shape yet” — we narrow it with typeof / Array.isArray checks
function walk(node: unknown, palette: LottieRGBA[], colorIndex: { value: number }, mode: RecolorMode): void {
  // Skip nulls / primitives (numbers, strings, booleans) — only objects/arrays can hold colors.
  // vocab/symbol: !node || ... = bail if missing OR not an object
  if (!node || typeof node !== "object") return;

  // Arrays — visit every child (layers, shapes, keyframe lists, …)
  if (Array.isArray(node)) {
    // vocab: .forEach = call walk once per child
    node.forEach((child) => walk(child, palette, colorIndex, mode));
    return;
  }

  // Treat as a plain object with string keys
  const obj = node as Record<string, unknown>;

  // Solid color prop: { c: { a: 0, k: [r,g,b,a] } }
  // vocab: a: 0 = “not animated” (static keyframe). Animated colors (a:1) are left alone —
  //   their `k` shape is a keyframe array, not a single RGBA, so we skip them safely.
  if (obj.c && typeof obj.c === "object" && obj.c !== null) {
    const colorProp = obj.c as { a?: number; k?: LottieRGBA };
    if (colorProp.a === 0 && Array.isArray(colorProp.k) && colorProp.k.length === 4) {
      const old = colorProp.k as LottieRGBA;
      colorProp.k = pickReplacement(old, palette, colorIndex.value, mode);
      // Advance the cycle counter so the next solid fill gets the next palette color
      colorIndex.value += 1;
    }
  }

  // Gradient prop: { g: { k: { a: 0, k: number[] } } }
  // Same a:0 rule — only static gradients get rewritten.
  if (obj.g && typeof obj.g === "object" && obj.g !== null) {
    const gradient = obj.g as { k?: { a?: number; k?: number[] } };
    // vocab/symbol: ?. = optional chain — skip if k is missing
    if (gradient.k?.a === 0 && Array.isArray(gradient.k.k)) {
      recolorGradientStops(gradient.k.k, palette, mode);
    }
  }

  // Keep walking every nested value (layers → shapes → fills → …).
  // This also re-visits `c` / `g` children, which is fine — primitives/already-handled shapes no-op.
  Object.values(obj).forEach((child) => walk(child, palette, colorIndex, mode));
}

// Deep-clone a Lottie JSON and remap fills/strokes to Devora brand colors.
// Always clone first — never mutate the imported JSON module (other callers share it).
export function recolorLottie(data: object, preset: DevoraLottiePreset): object {
  // vocab: structuredClone = deep copy so we never mutate the imported JSON
  const clone = structuredClone(data);
  const mode = PRESET_RECOLOR_MODE[preset];
  // colorIndex is an object so nested walk() calls can increment the same counter
  walk(clone, DEVORA_LOTTIE_PALETTES[preset], { value: 0 }, mode);
  return clone;
}

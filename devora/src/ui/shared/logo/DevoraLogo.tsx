// Devora logo image with preset sizes for the navbar, cards, and hero.
// Flow: pick a size preset → next/image draws the PNG at that pixel size.
// Larger presets skip Next's optimizer so the logo stays crisp.
// Used by the navbar, sign-in cards, and the homepage hero.

// ===== IMPORTS =====

// vocab: next/image = optimized <img> with sizing, lazy-load, and optional CDN resize
import Image from "next/image";

// ===== NAMED CONSTANTS =====

const LOGO_IMAGE_PATH = "/logo/devora-logo.png";
const LOGO_ALT_TEXT = "Devora";
const DEFAULT_LOGO_CLASS_NAME = "";
const DEFAULT_LOGO_SIZE = "nav" as const;

const LOGO_FRAME_CLASS = "relative inline-flex";
const LOGO_IMAGE_BASE_CLASS = "object-contain transition-transform duration-300";
const NAV_LOGO_HOVER_CLASS = "group-hover:scale-105";

// Tailwind size classes per preset. These set the CSS box.
// Manipulate here: change a preset if the logo should render larger or smaller.
const LOGO_SIZE_CLASSES = {
  nav: "h-11 w-11 md:h-14 md:w-14",
  card: "h-36 w-36 sm:h-40 sm:w-40 md:h-44 md:w-44",
  hero: "h-44 w-44 sm:h-52 sm:w-52 md:h-64 md:w-64 lg:h-72 lg:w-72",
} as const;

// Pixel width and height passed to next/image. Roughly the largest CSS size of that preset.
const LOGO_SIZE_PIXELS = {
  nav: 56,
  card: 176,
  hero: 288,
} as const;

const NAV_LOGO_SIZE = "nav";
const CARD_LOGO_SIZE = "card";
const HERO_LOGO_SIZE = "hero";

// ===== TYPES =====

type DevoraLogoSize = keyof typeof LOGO_SIZE_PIXELS;

type DevoraLogoProps = {
  className?: string;
  // Which size preset to use — defaults to "nav"
  // Manipulate here: pass size="hero" / "card" / "nav" from the call site
  size?: DevoraLogoSize;
};

// ===== HELPER FUNCTIONS =====

function shouldLoadLogoImmediately(size: DevoraLogoSize): boolean {
  // Above-the-fold logos should not wait for lazy-load.
  return size === NAV_LOGO_SIZE || size === CARD_LOGO_SIZE;
}

function shouldSkipImageOptimizer(size: DevoraLogoSize): boolean {
  // Card and hero are large. Next's resize pass softens the PNG.
  return size === CARD_LOGO_SIZE || size === HERO_LOGO_SIZE;
}

function buildLogoImageClass(size: DevoraLogoSize): string {
  const hoverClass = size === NAV_LOGO_SIZE ? NAV_LOGO_HOVER_CLASS : "";
  return `${LOGO_IMAGE_BASE_CLASS} ${hoverClass} ${LOGO_SIZE_CLASSES[size]}`;
}

// ===== MAIN COMPONENT =====

/**
 * Brand logo image at a named size preset.
 * @param props.className - Extra classes on the wrapper (glow, spacing). Defaults to empty.
 * @param props.size - "nav", "card", or "hero". Defaults to "nav".
 * @returns The logo image in a sizing wrapper
 */
export default function DevoraLogo({
  className = DEFAULT_LOGO_CLASS_NAME,
  size = DEFAULT_LOGO_SIZE,
}: DevoraLogoProps) {
  const logoPixelSize = LOGO_SIZE_PIXELS[size];

  return (
    <div className={`${LOGO_FRAME_CLASS} ${className}`}>
      <Image
        src={LOGO_IMAGE_PATH}
        alt={LOGO_ALT_TEXT}
        width={logoPixelSize}
        height={logoPixelSize}
        // vocab: priority = load ASAP (above-the-fold logos) — skips lazy-loading
        priority={shouldLoadLogoImmediately(size)}
        // vocab: unoptimized = serve the original PNG bytes (no resize/compress pass)
        unoptimized={shouldSkipImageOptimizer(size)}
        // vocab: group-hover = only scales when an ancestor with class "group" is hovered
        className={buildLogoImageClass(size)}
      />
    </div>
  );
}

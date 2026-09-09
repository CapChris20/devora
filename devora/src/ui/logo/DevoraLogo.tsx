// Devora logo image with preset sizes for navbar, cards, and hero.
// Uses next/image; larger sizes skip optimization so the PNG stays crisp.
// Manipulate here: edit sizeClasses / sizePixels to change how big each preset renders.

// vocab: next/image = optimized <img> with sizing, lazy-load, and optional CDN resize
import Image from "next/image";

type DevoraLogoProps = {
  className?: string;
  // Which size preset to use — defaults to "nav"
  // Manipulate here: pass size="hero" / "card" / "nav" from the call site
  size?: "nav" | "card" | "hero";
};

// Tailwind size classes per preset (responsive at sm/md/lg breakpoints).
// These control the CSS box; sizePixels below tell next/image the intrinsic px size.
const sizeClasses = {
  nav: "h-11 w-11 md:h-14 md:w-14",
  card: "h-36 w-36 sm:h-40 sm:w-40 md:h-44 md:w-44",
  hero: "h-44 w-44 sm:h-52 sm:w-52 md:h-64 md:w-64 lg:h-72 lg:w-72",
} as const;

// Pixel width/height passed to next/image (should roughly match the largest CSS size).
const sizePixels = {
  nav: 56,
  card: 176,
  hero: 288,
} as const;

export default function DevoraLogo({ className = "", size = "nav" }: DevoraLogoProps) {
  const px = sizePixels[size];

  return (
    // relative inline-flex = size to the image; className lets callers add glow/spacing
    <div className={`relative inline-flex ${className}`}>
      <Image
        // File lives in public/logo/ — leading slash = from the site root
        src="/logo/devora-logo.png"
        alt="Devora"
        width={px}
        height={px}
        // Nav + card load eagerly (above the fold on many pages); hero can wait a tick.
        // vocab: priority = load ASAP (above-the-fold logos) — skips lazy-loading
        priority={size === "nav" || size === "card"}
        // Card/hero: skip Next optimizer so the PNG isn't soft-scaled.
        // vocab: unoptimized = serve the original PNG bytes (no resize/compress pass)
        unoptimized={size === "card" || size === "hero"}
        // object-contain = keep aspect ratio inside the box; nav gets a tiny hover scale
        // vocab: group-hover = only scales when an ancestor with class "group" is hovered
        className={`object-contain transition-transform duration-300 ${
          size === "nav" ? "group-hover:scale-105" : ""
        } ${sizeClasses[size]}`}
      />
    </div>
  );
}

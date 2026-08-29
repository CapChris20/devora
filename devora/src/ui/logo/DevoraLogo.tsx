import Image from "next/image";

type DevoraLogoProps = {
  className?: string;
  size?: "nav" | "card" | "hero";
};

const sizeClasses = {
  nav: "h-11 w-11 md:h-14 md:w-14",
  card: "h-36 w-36 sm:h-40 sm:w-40 md:h-44 md:w-44",
  hero: "h-44 w-44 sm:h-52 sm:w-52 md:h-64 md:w-64 lg:h-72 lg:w-72",
} as const;

const sizePixels = {
  nav: 56,
  card: 176,
  hero: 288,
} as const;

export default function DevoraLogo({ className = "", size = "nav" }: DevoraLogoProps) {
  const px = sizePixels[size];

  return (
    <div className={`relative inline-flex ${className}`}>
      <Image
        src="/logo/devora-logo.png"
        alt="Devora"
        width={px}
        height={px}
        priority={size === "nav" || size === "card"}
        unoptimized={size === "card" || size === "hero"}
        className={`object-contain transition-transform duration-300 ${
          size === "nav" ? "group-hover:scale-105" : ""
        } ${sizeClasses[size]}`}
      />
    </div>
  );
}

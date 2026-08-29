import Image from "next/image";

export default function HeroEmblemAnchor() {
  return (
    <div
      className="pointer-events-none absolute bottom-8 left-6 z-10 opacity-35 md:bottom-12 md:left-12 lg:bottom-16 lg:left-16"
      aria-hidden="true"
    >
      <Image
        src="/logo/devora-logo.png"
        alt=""
        width={120}
        height={120}
        className="h-16 w-16 object-contain md:h-24 md:w-24 lg:h-28 lg:w-28"
      />
    </div>
  );
}

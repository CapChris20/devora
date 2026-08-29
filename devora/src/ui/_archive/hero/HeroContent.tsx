import HeroHeadline from "./HeroHeadline";
import HeroSubheading from "./HeroSubheading";

export default function HeroContent() {
  return (
    <div className="flex flex-col items-center text-center gap-2 sm:gap-3 w-full max-w-2xl px-2">
      <HeroHeadline />
      <HeroSubheading />
    </div>
  );
}

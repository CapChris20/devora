// Big pixel-style "DEVORA" wordmark for alternate hero layouts.
// Thin wrapper — picks pixel variant + large responsive type sizes.
// Manipulate here: tweak the text-* classes to change how huge the wordmark gets.

import DevoraTitleStack from "./DevoraTitleStack";

export default function HeroDevoraTitle() {
  return (
    // Pixel wordmark with responsive type sizes (sm/md/lg Tailwind breakpoints).
    // vocab: text-[10rem] = arbitrary Tailwind size = 10× root font size
    // variant="pixel" turns on float animation + pixel fill (see DevoraTitleStack)
    <DevoraTitleStack
      variant="pixel"
      className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem]"
    />
  );
}

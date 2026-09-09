// Centers the large DEVORA pixel title — thin wrapper around HeroDevoraTitle.
// Only job: horizontal centering via Flexbox.

import HeroDevoraTitle from "./HeroDevoraTitle";

export default function HeroDevoraTitleWrap() {
  return (
    // Center the pixel title horizontally in its parent
    // vocab: flex justify-center = horizontal centering with Flexbox
    <div className="flex justify-center">
      <HeroDevoraTitle />
    </div>
  );
}

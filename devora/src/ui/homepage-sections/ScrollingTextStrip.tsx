// Infinite horizontal marquee between the hero and section 01.
// Duplicate MarqueeRow twice so CSS can scroll seamlessly; id="more" anchors the hero hint.
// Manipulate here: edit ITEMS to change the scrolling keywords; marquee-track animation is in CSS.

import MouseGridBackground from "./MouseGridBackground";

// Keywords that scroll across the strip.
// Manipulate here: add/remove/reorder strings — MarqueeRow maps them automatically
const ITEMS = ["CONNECT", "BE MORE CONFIDENT","COLLABORATE", "CREATE", "MEET NEW PEERS" , "DEVELOPER FURTHER BONDS", "SPONSERED BY CECS · UM-DEARBORN", "BUILD THE NETWORK"];

// One full pass of keywords + star separators (rendered twice in the track for a seamless loop).
function MarqueeRow() {
  return (
    <div className="flex shrink-0 items-center">
      {/* vocab: .map = one keyword + star per ITEMS entry */}
      {ITEMS.map((item, i) => (
        <span key={item} className="flex items-center">
          {/* Even indexes solid; odd indexes outlined — alternating look.
              vocab/symbol: % 2 === 0 means “even index” (0, 2, 4…)
              Manipulate here: theme-heading / text-outline styles live in globals.css */}
          <span
            className={`font-display whitespace-nowrap px-10 text-2xl font-bold uppercase tracking-wider sm:text-3xl ${
              i % 2 === 0 ? "theme-heading" : "text-outline"
            }`}
          >
            {item}
          </span>
          {/* Decorative star between words — pink with a soft glow via text-shadow */}
          <span className="text-xl text-[#ff5ca8] [text-shadow:0_0_14px_rgba(255,92,168,0.9)]">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

export default function ScrollingTextStrip() {
  return (
    // as="div" so this isn’t another landmark section; id="more" for scroll-to from HeroScrollHint.
    // vocab: scroll-mt-* = scroll-margin so the sticky navbar doesn't cover the strip on jump
    <MouseGridBackground
      as="div"
      id="more"
      className="landing-marquee scroll-mt-28 overflow-hidden border-y border-[#ff5ca8]/25 py-5 sm:scroll-mt-32 sm:py-6"
    >
      {/* Top and bottom glow lines framing the strip */}
      <div className="glow-line absolute inset-x-0 top-0 h-px" />
      <div className="glow-line absolute inset-x-0 bottom-0 h-px" />
      {/* Two identical rows — CSS animation translates them as one continuous loop.
          Why twice? When row A scrolls off, row B is already filling the gap (seamless).
          Manipulate here: .marquee-track keyframes / duration in globals.css control speed */}
      <div className="marquee-track">
        <MarqueeRow />
        <MarqueeRow />
      </div>
    </MouseGridBackground>
  );
}

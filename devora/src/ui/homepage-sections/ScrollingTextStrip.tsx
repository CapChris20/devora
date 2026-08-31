import MouseGridBackground from "./MouseGridBackground";

const ITEMS = ["CONNECT", "BE MORE CONFIDENT","COLLABORATE", "CREATE", "MEET NEW PEERS" , "DEVELOPER FURTHER BONDS", "SPONSERED BY CECS · UM-DEARBORN", "BUILD THE NETWORK"];

function MarqueeRow() {
  return (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item, i) => (
        <span key={item} className="flex items-center">
          <span
            className={`font-display whitespace-nowrap px-10 text-2xl font-bold uppercase tracking-wider sm:text-3xl ${
              i % 2 === 0 ? "theme-heading" : "text-outline"
            }`}
          >
            {item}
          </span>
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
    <MouseGridBackground
      as="div"
      id="more"
      className="landing-marquee scroll-mt-28 overflow-hidden border-y border-[#ff5ca8]/25 py-5 sm:scroll-mt-32 sm:py-6"
    >
      <div className="glow-line absolute inset-x-0 top-0 h-px" />
      <div className="glow-line absolute inset-x-0 bottom-0 h-px" />
      <div className="marquee-track">
        <MarqueeRow />
        <MarqueeRow />
      </div>
    </MouseGridBackground>
  );
}

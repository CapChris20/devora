const ITEMS = ["CONNECT", "COLLABORATE", "CREATE", "CECS · UM-DEARBORN", "BUILD THE NETWORK"];

function MarqueeRow() {
  return (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item, i) => (
        <span key={item} className="flex items-center">
          <span
            className={`font-display whitespace-nowrap px-10 text-2xl font-bold uppercase tracking-wider sm:text-3xl ${
              i % 2 === 0 ? "text-white" : "text-outline"
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

export default function LandingMarquee() {
  return (
    <div id="more" className="relative scroll-mt-24 overflow-hidden border-y border-[#ff5ca8]/25 bg-[#0a0512] py-6">
      <div className="glow-line absolute inset-x-0 top-0 h-px" />
      <div className="glow-line absolute inset-x-0 bottom-0 h-px" />
      <div className="marquee-track">
        <MarqueeRow />
        <MarqueeRow />
      </div>
    </div>
  );
}

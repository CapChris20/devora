// Sponsor and creator credits under the DEVORA title.
// CECS sponsorship line, then Chris + Dr. Maxim on the meta row.
// Styles: hero-credits-* in globals.css.

export default function HeroCredits() {
  return (
    // Block under the glass DEVORA wordmark
    <div className="hero-credits-block">
      <p className="hero-credits-label">Sponsored by</p>
      {/* Sponsor name — “CECS Department” uses soft brand fill (not loud headline-grad).
          Manipulate here: swap soft-pink ↔ soft-violet if you want a cooler accent */}
      {/* vocab: font-display = the display typeface from globals.css (not the pixel font) */}
      <p className="hero-credits-sponsor font-display">
        <span className="hero-credits-body">University of Michigan-Dearborn </span>
        {/* vocab: soft-pink = calm brand gradient that already has light/dark theme variants */}
        <span className="soft-pink font-bold">CECS Department</span>
      </p>
      {/* Creator + proctor on one line, separated by a middle dot.
          Manipulate here: edit the names/labels if credits change */}
      <p className="hero-credits-meta font-display">
        Created by <span className="hero-credits-name">Chris Shina</span>
        <span className="hero-credits-sep"> · </span>
        Proctored by <span className="hero-credits-name">Dr. Bruce Maxim</span>
      </p>
    </div>
  );
}

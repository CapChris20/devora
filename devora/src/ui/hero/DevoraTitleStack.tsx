// Two-layer DEVORA wordmark — back layer is 3D depth only; front keeps your gradient.
// variant "logo" = soft gradient fill (hero glass); "pixel" = pixel font + float animation.
// CSS in globals.css positions .devora-title-depth behind .devora-title-fill.

type DevoraTitleStackProps = {
  // Manipulate here: "logo" for the soft brand fill; "pixel" for the floating pixel look
  variant: "logo" | "pixel";
  className?: string;
};

// CSS class for the colored front layer, keyed by variant.
// Manipulate here: point a variant at a different gradient class to recolor the wordmark.
const FILL_CLASS = {
  logo: "logo-gradient",
  pixel: "devora-pixel-title",
} as const;
// vocab: as const = lock the object to exact string literals (TypeScript tip)

export default function DevoraTitleStack({ variant, className = "" }: DevoraTitleStackProps) {
  return (
    // Pixel font stack; extra classes only when using the floating pixel variant.
    // vocab: .trim() = strip leftover spaces when the pixel classes are empty
    // Manipulate here: float / pixel modifiers are toggled by the ternary below — styles in CSS
    <h1
      className={`devora-title-stack font-pixel ${variant === "pixel" ? "devora-title-stack--pixel devora-title-stack--float" : ""} ${className}`.trim()}
    >
      {/* Back layer — same letters, offset for depth; hidden from screen readers.
          Without aria-hidden, assistive tech would read “DEVORA” twice. */}
      {/* vocab: aria-hidden = decorative only — screen readers skip the depth copy */}
      <span className="devora-title-depth" aria-hidden="true">
        DEVORA
      </span>
      {/* Front layer — the gradient / pixel colored text you actually read.
          FILL_CLASS[variant] picks logo-gradient vs devora-pixel-title. */}
      <span className={`devora-title-fill ${FILL_CLASS[variant]}`}>DEVORA</span>
    </h1>
  );
}

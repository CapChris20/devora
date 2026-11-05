// Styled on/off switch per DESIGN.md.
// Active state uses the signature gradient (--grad: orange to pink to magenta).
// Accessible with role="switch" and aria-checked.

"use client";

type GradientToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
};

export default function GradientToggle({
  checked,
  onChange,
  disabled = false,
  label,
}: GradientToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 56,
        height: 32,
        borderRadius: 9999,
        background: checked
          ? "linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%)"
          : "#261d2b",
        border: checked ? "2px solid #ff5ca8" : "2px solid #4a3b54",
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "2px 4px",
        boxShadow: checked
          ? "0 0 16px rgba(255, 92, 168, 0.45)"
          : "inset 0 2px 4px rgba(0, 0, 0, 0.4)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        outline: "none",
        transition: "all 0.24s cubic-bezier(0.23, 1, 0.32, 1)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: checked ? "#0d0b0e" : "#ffffff",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.5)",
          transform: checked ? "translateX(24px)" : "translateX(0px)",
          transition: "transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease",
          display: "block",
        }}
      />
    </button>
  );
}

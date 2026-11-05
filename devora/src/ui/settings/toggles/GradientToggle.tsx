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
      className={`toggle-track ${checked ? "is-checked" : ""}`}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span className="toggle-thumb" />

      <style jsx>{`
        .toggle-track {
          width: 54px;
          height: 32px;
          border-radius: 9999px;
          background: var(--surface-2, #29232a);
          border: 2px solid var(--edge, #3d3439);
          position: relative;
          display: flex;
          align-items: center;
          padding: 3px;
          transition: background 0.24s cubic-bezier(0.23, 1, 0.32, 1),
                      border-color 0.24s ease,
                      box-shadow 0.24s ease,
                      transform 0.16s var(--spring);
          outline: none;
        }

        .toggle-track:hover:not(:disabled) {
          border-color: rgb(255 92 168 / 0.5);
          transform: scale(1.03);
        }

        .toggle-track:active:not(:disabled) {
          transform: scale(0.97);
        }

        .toggle-track:focus-visible {
          outline: 3px solid #ff5ca8;
          outline-offset: 3px;
        }

        .toggle-track.is-checked {
          background: var(--grad, linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%));
          border-color: transparent;
          box-shadow: 0 0 16px rgb(255 92 168 / 0.38);
        }

        .toggle-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fbf6f8;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
          transition: transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.2s ease,
                      width 0.16s ease;
          transform: translateX(0);
        }

        .toggle-track:active:not(:disabled) .toggle-thumb {
          width: 25px;
        }

        .toggle-track.is-checked .toggle-thumb {
          transform: translateX(22px);
          background: #0d0b0e;
        }
      `}</style>
    </button>
  );
}

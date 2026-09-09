// Styled on/off switch used in Settings — flips value and calls parent onChange.
// Parent owns the real saved state; this only renders the thumb UI.
// SettingsRow wraps this with a label + description.

"use client";

type GradientToggleProps = {
  // Whether the switch looks "on" right now
  checked: boolean;
  // Parent callback — receives the flipped boolean after a click
  // SettingsPageContent usually passes updatePreference(...) or updatePublic(...)
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  // vocab: label = accessible name for screen readers (aria-label)
  label: string;
};

// Accessible switch button — click flips checked and notifies the parent.
export default function GradientToggle({
  checked,
  onChange,
  disabled = false,
  label,
}: GradientToggleProps) {
  return (
    <button
      type="button"
      // vocab: role="switch" = tells assistive tech this is an on/off control
      role="switch"
      // vocab: aria-checked = current on/off state for screen readers
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      // Manipulate here: toggle look lives in globals.css (.devora-toggle / --on)
      className={`devora-toggle ${checked ? "devora-toggle--on" : ""}`}
      // vocab/symbol: !checked — flip true↔false when clicked
      onClick={() => onChange(!checked)}
    >
      {/* Sliding thumb; CSS moves it based on .devora-toggle--on */}
      <span className="devora-toggle-thumb" />
    </button>
  );
}

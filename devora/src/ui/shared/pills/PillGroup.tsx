// Pill-shaped button group for onboarding and account edit — single or multi-select.
// Parent owns selected state; this only toggles and reports the new value via onChange.
// Used by OnboardingForm + AccountProfileEditor with the same option lists.

"use client";

type PillGroupProps = {
  label: string;
  // vocab: readonly string[] = list of option labels that this component won't mutate
  options: readonly string[];
  // Single-select passes one string; multi-select passes a string[]
  selected: string | string[];
  // vocab: multiple? = optional prop; when true, clicking toggles pills on/off
  // Omit (or false) = picking a pill replaces the previous single choice
  multiple?: boolean;
  // Parent callback — receives the next selected value after a click
  // Manipulate here: parent stores this in useState and often casts: value as string / string[]
  onChange: (value: string | string[]) => void;
};

// Renders a labeled row of clickable pills.
export default function PillGroup({
  label,
  options,
  selected,
  multiple,
  onChange,
}: PillGroupProps) {
  // Normalize selected into an array so includes() works for both modes.
  // vocab/symbol: Array.isArray = true when selected is already a list
  // vocab/symbol: selected ? [selected] : [] = wrap a single string, or empty if blank
  const selectedList = Array.isArray(selected) ? selected : selected ? [selected] : [];

  // This function is the heartbeat of the pill row.
  // Single-select picks one pill; multi-select toggles pills on and off.
  function toggle(option: string) {
    if (multiple) {
      // Already selected → remove it; otherwise add it.
      // vocab/symbol: includes = true if this option is already in the list
      // vocab/symbol: filter = keep every item except the one being removed
      // vocab/symbol: [...selectedList, option] = copy the list and append the new pick
      const next = selectedList.includes(option)
        ? selectedList.filter((item) => item !== option)
        : [...selectedList, option];
      onChange(next);
      return;
    }
    // Single-select — replace whatever was selected with this option.
    // Clicking the same pill again still calls onChange(option) (stays selected).
    onChange(option);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="onboarding-field-label">{label}</p>
      <div className="flex flex-wrap gap-2">
        {/* One button per option; active class when it's in selectedList */}
        {/* Manipulate here: change options upstream (onboarding-options.ts), not hardcode here */}
        {options.map((option) => {
          const active = selectedList.includes(option);
          return (
            <button
              key={option}
              type="button"
              // onboarding-pill-active = filled/selected look (CSS in globals.css)
              className={`onboarding-pill ${active ? "onboarding-pill-active" : ""}`}
              onClick={() => toggle(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

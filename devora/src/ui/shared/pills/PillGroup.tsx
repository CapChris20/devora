// Pill-shaped button group for onboarding and account edit — single or multi-select.
// Flow: parent owns the selection → a click toggles or replaces it → onChange reports the next value.
// Used by OnboardingForm and AccountProfileEditor with the same option lists.

"use client";

// ===== NAMED CONSTANTS =====

const PILL_GROUP_CLASS = "flex flex-col gap-3";
const PILL_ROW_CLASS = "flex flex-wrap gap-2";
const PILL_LABEL_CLASS = "onboarding-field-label";
const PILL_CLASS = "onboarding-pill";
const PILL_ACTIVE_CLASS = "onboarding-pill-active";

// ===== TYPES =====

type PillGroupProps = {
  label: string;
  // vocab: readonly string[] = list of option labels this component will not mutate
  options: readonly string[];
  // Single-select passes one string; multi-select passes a string[]
  selected: string | string[];
  // When true, clicking toggles pills on and off. Omit it to replace the one selected pill.
  multiple?: boolean;
  // Parent callback — receives the next selected value after a click
  // Manipulate here: parent stores this in useState
  onChange: (value: string | string[]) => void;
};

// ===== HELPER FUNCTIONS =====

function readSelectedList(selected: string | string[]): string[] {
  // vocab/symbol: Array.isArray = true when selected is already a list
  if (Array.isArray(selected)) return [...selected];
  if (selected) return [selected];
  return [];
}

function toggleMultiSelect(selectedList: string[], option: string): string[] {
  const isAlreadySelected = selectedList.includes(option);
  if (isAlreadySelected) {
    return selectedList.filter((item) => item !== option);
  }
  // vocab/symbol: ...spread = copy the list and append the new pick
  return [...selectedList, option];
}

function buildPillClass(isOptionSelected: boolean): string {
  if (!isOptionSelected) return PILL_CLASS;
  return `${PILL_CLASS} ${PILL_ACTIVE_CLASS}`;
}

// ===== MAIN COMPONENT =====

/**
 * Labeled row of pills. The parent owns what is selected.
 * @param props.label - Field label above the pills
 * @param props.options - Pill labels to show
 * @param props.selected - One string, or a list when multiple is set
 * @param props.multiple - Toggle mode when true. Replace mode when omitted.
 * @param props.onChange - Called with the next string or string list
 * @returns The pill row
 */
export default function PillGroup({
  label,
  options,
  selected,
  multiple,
  onChange,
}: PillGroupProps) {
  const selectedList = readSelectedList(selected);
  const isMultiSelect = Boolean(multiple);

  const selectPillOption = (option: string) => {
    if (isMultiSelect) {
      onChange(toggleMultiSelect(selectedList, option));
      return;
    }
    // Clicking the current pill again still reports that same option.
    onChange(option);
  };

  return (
    <div className={PILL_GROUP_CLASS}>
      <p className={PILL_LABEL_CLASS}>{label}</p>
      <div className={PILL_ROW_CLASS}>
        {/* Manipulate here: change options upstream (onboarding-options.ts), not in this file */}
        {options.map((option) => {
          const isOptionSelected = selectedList.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={buildPillClass(isOptionSelected)}
              onClick={() => selectPillOption(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

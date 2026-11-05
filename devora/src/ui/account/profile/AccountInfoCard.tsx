// Labeled mini-card (e.g. Major / Class rank) in the account sidebar grid.
// Label on top, value underneath — no click behavior.
// Parent passes "—" when a profile field is empty.
// Typography lives in globals.css (.account-section-eyebrow / .account-info-value).

// ===== TYPES =====

type AccountInfoCardProps = {
  label: string;
  // Display value for one profile field (use "—" when empty upstream)
  value: string;
};

// ===== MAIN COMPONENT =====

/**
 * One glass mini-card for a single profile field on the account sidebar.
 * @param props - The label and the value to show
 * @param props.label - Eyebrow text, such as Major or Class rank
 * @param props.value - The field text. Parents pass an em dash when the field is empty
 * @returns A glass card with the label above the value
 */
export default function AccountInfoCard({ label, value }: AccountInfoCardProps) {
  return (
    <div className="glass-card account-info-card">
      {/* Eyebrow size/contrast come from .account-section-eyebrow in globals.css */}
      <p className="account-section-eyebrow">{label}</p>
      {/* Manipulate here: change account-info-value in globals.css to recolor/resize values */}
      <p className="account-info-value">{value}</p>
    </div>
  );
}

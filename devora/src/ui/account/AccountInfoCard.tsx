// Labeled mini-card (e.g. Major / Class rank) in the account sidebar grid.
// Label on top, value underneath — no click behavior.
// Parent passes "—" when a profile field is empty.
// Typography lives in globals.css (.account-section-eyebrow / .account-info-value).

type AccountInfoCardProps = {
  label: string;
  // Display value for one profile field (use "—" when empty upstream)
  value: string;
};

// One glass mini-card for a single profile field.
export default function AccountInfoCard({ label, value }: AccountInfoCardProps) {
  return (
    <div className="glass-card account-info-card rounded-xl p-4">
      {/* Eyebrow size/contrast come from .account-section-eyebrow in globals.css */}
      <p className="account-section-eyebrow">{label}</p>
      {/* Manipulate here: change account-info-value in globals.css to recolor/resize values */}
      <p className="account-info-value mt-1.5">{value}</p>
    </div>
  );
}

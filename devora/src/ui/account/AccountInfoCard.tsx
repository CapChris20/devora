// Tiny labeled card (e.g. "Major: CIS") used in the account sidebar grid.
// Label on top, value underneath — no click behavior.
// Parent passes "—" when a profile field is empty.

type AccountInfoCardProps = {
  label: string;
  // Display value for one profile field (use "—" when empty upstream)
  value: string;
};

// One glass mini-card for a single profile field.
export default function AccountInfoCard({ label, value }: AccountInfoCardProps) {
  return (
    <div className="glass-card rounded-xl p-3">
      <p className="account-section-eyebrow text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
        {label}
      </p>
      <p className="theme-heading mt-1 text-sm font-medium leading-snug">{value}</p>
    </div>
  );
}

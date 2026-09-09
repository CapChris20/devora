// Left-column sidebar with avatar, quick stats, and sign-out button.
// Used when the account page wants a compact left rail (edit opens from here).
// Note: AccountProfileView currently inlines a similar left column; this stays for reuse.

"use client";

import type { UserProfile } from "@/backend/firebase";
import { signOutUser } from "@/backend/firebase";
import { useRouter } from "next/navigation";

import AccountInfoCard from "./AccountInfoCard";
import { formatJoinedDate, getInitials } from "./account-helpers";

type AccountProfileSidebarProps = {
  // vocab: UserProfile = full Firestore users/{uid} document shape
  profile: UserProfile;
  // Parent flips into edit mode when this runs
  onEdit: () => void;
};

// Avatar card + info grid + sign-out for the account left column.
export default function AccountProfileSidebar({
  profile,
  onEdit,
}: AccountProfileSidebarProps) {
  // vocab: useRouter = Next.js helper that lets us navigate after sign-out
  const router = useRouter();
  const initials = getInitials(profile);

  // Sign out of Firebase Auth and return to the login page.
  // vocab: signOutUser = clear the Firebase session on this device
  async function handleSignOut() {
    await signOutUser();
    // vocab: router.replace = navigate without adding a history entry
    // Manipulate here: change "/auth/login" if sign-out should land elsewhere
    router.replace("/auth/login");
  }

  return (
    <aside className="flex min-w-0 flex-col gap-5">
      {/* Avatar, name, school, Edit button */}
      <div className="glass-card flex flex-col items-center gap-4 rounded-2xl p-6 text-center">
        <div className="account-avatar-ring">
          {/* Photo if they uploaded one; otherwise initials */}
          {/* vocab / profile field: photoURL = Firebase Storage download link (or empty) */}
          {profile.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoURL}
              alt=""
            />
          ) : (
            <span className="account-avatar-initials">{initials}</span>
          )}
        </div>
        <div>
          <h2 className="page-card-name headline-grad text-xl font-bold">
            {profile.displayName}
          </h2>
          <p className="theme-muted mt-1 text-sm">{profile.school}</p>
        </div>
        <button
          type="button"
          className="page-btn-outline page-btn-grad-devora w-full"
          onClick={onEdit}
        >
          <span className="page-btn-text-grad">Edit profile</span>
        </button>
      </div>

      {/* Quick facts in a 2×2 grid — vocab: major / classRank / age from onboarding */}
      <div className="grid grid-cols-2 gap-3">
        <AccountInfoCard label="Joined" value={formatJoinedDate(profile.createdAt)} />
        <AccountInfoCard label="Major" value={profile.major || "—"} />
        <AccountInfoCard label="Class rank" value={profile.classRank || "—"} />
        <AccountInfoCard label="Age" value={profile.age || "—"} />
      </div>

      <button type="button" className="page-btn-danger w-full" onClick={handleSignOut}>
        Sign out
      </button>
    </aside>
  );
}

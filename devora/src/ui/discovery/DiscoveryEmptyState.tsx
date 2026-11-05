// Discovery Grid empty state — renders 3 to 4 preview cards directly using
// the standard DiscoveryProfileCard (pcard) and grid layout (dgrid).
// Removes the "Awaiting Enrollment" header banner card entirely per user request.

"use client";

import { useState } from "react";
import type { UserProfile } from "@/backend/firebase";
import DiscoveryProfileCard from "./cards/DiscoveryProfileCard";
import DiscoveryProfilePeek from "./cards/DiscoveryProfilePeek";
import { MOCK_PROFILES, type DiscoveryProfile } from "./mock-profiles";

type DiscoveryEmptyStateProps = {
  hasPublicStudents: boolean;
  onClearFilters: () => void;
  viewerProfile?: UserProfile | null;
  onToast?: (message: string) => void;
  onViewProfile?: (profile: DiscoveryProfile) => void;
  requestedProfileIds?: string[];
};

// Top 4 preview profiles with the signature pcard styling
const PREVIEW_PROFILES: DiscoveryProfile[] = MOCK_PROFILES.slice(0, 4);

export default function DiscoveryEmptyState({
  hasPublicStudents,
  onClearFilters,
  onToast,
  onViewProfile,
  requestedProfileIds = [],
}: DiscoveryEmptyStateProps) {
  const [localSelectedProfile, setLocalSelectedProfile] = useState<DiscoveryProfile | null>(null);
  const [localRequestedIds, setLocalRequestedIds] = useState<string[]>([]);

  // If search/filter miss, show simple reset box
  if (hasPublicStudents) {
    return (
      <div className="no-match">
        <h3 className="t-card text-[var(--text)]">
          No students match these filters
        </h3>
        <p className="text-[var(--text-body)]">
          Try resetting your filters or clearing keywords to see all classmates on the grid.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="btn btn-primary"
        >
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  const allRequestedIds = [...requestedProfileIds, ...localRequestedIds];

  const handleView = (profile: DiscoveryProfile) => {
    if (onViewProfile) {
      onViewProfile(profile);
    } else {
      setLocalSelectedProfile(profile);
    }
  };

  const handleLocalConnect = (profile: DiscoveryProfile) => {
    if (!allRequestedIds.includes(profile.id)) {
      setLocalRequestedIds((prev) => [...prev, profile.id]);
    }
    if (onToast) {
      onToast(`Connect request sent to ${profile.displayName}.`);
    }
  };

  return (
    <>
      {/* Discovery grid with signature pcard styles, hard offset shadows, and interactive cards */}
      <div className="dgrid" style={{ width: "100%" }}>
        {PREVIEW_PROFILES.map((profile, index) => (
          <DiscoveryProfileCard
            key={profile.id}
            profile={profile}
            index={index}
            isRequested={allRequestedIds.includes(profile.id)}
            onView={handleView}
          />
        ))}
      </div>

      {/* Fallback local profile peek if parent didn't provide onViewProfile */}
      {localSelectedProfile && !onViewProfile && (
        <DiscoveryProfilePeek
          profile={localSelectedProfile}
          requested={allRequestedIds.includes(localSelectedProfile.id)}
          onClose={() => setLocalSelectedProfile(null)}
          onConnect={() => handleLocalConnect(localSelectedProfile)}
        />
      )}
    </>
  );
}

// Settings page content — toggles Discovery visibility, notification prefs, theme.
// Each toggle saves immediately to Firestore via updateUserSettings() (no separate Save button).
// Danger zone handles deactivate / reactivate / permanent delete.
// Theme (dark/light) is device-local via useTheme — it is NOT stored in Firestore.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
// vocab: onAuthStateChanged = Firebase listener; fires when user signs in or out
import { onAuthStateChanged } from "firebase/auth";

import {
  auth,
  deactivateAccount,
  deleteOwnAccount,
  getAuthErrorMessage,
  getUserProfile,
  reactivateAccount,
  resolveUserPreferences,
  signOutUser,
  updateUserSettings,
  type MessagePolicy,
  type UserPreferences,
  type UserProfile,
} from "@/backend/firebase";
import { useTheme } from "@/ui/theme/DarkLightMode";

import GradientToggle from "./GradientToggle";

type SettingsCardProps = {
  title: string;
  titleClassName?: string;
  // vocab: ReactNode = anything React can render (JSX, text, null, …)
  children: ReactNode;
};

// Glass card wrapper for a settings section (title + body rows).
function SettingsCard({
  title,
  titleClassName = "devora-gradient-text",
  children,
}: SettingsCardProps) {
  return (
    <section className="settings-card glass-card">
      <h2 className={`settings-card-title ${titleClassName}`}>{title}</h2>
      <div className="settings-card-body">{children}</div>
    </section>
  );
}

type SettingsRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

// One label + description + GradientToggle row inside a SettingsCard.
function SettingsRow({ label, description, checked, onChange, disabled }: SettingsRowProps) {
  return (
    <div className="settings-row">
      <div className="settings-row-copy">
        <p className="settings-row-label">{label}</p>
        {description ? <p className="settings-row-desc">{description}</p> : null}
      </div>
      <GradientToggle
        label={label}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

// Owns settings state: load profile → toggle prefs → deactivate / delete account.
// Preference keys live on profile.preferences; isPublic / isDeactivated are top-level profile fields.
export default function SettingsPageContent() {
  // vocab: useRouter = Next.js helper that lets us navigate after sign-out / delete
  const router = useRouter();
  // vocab: useTheme = app dark/light mode context (local to this device, not Firestore)
  const { theme, setTheme } = useTheme();
  // vocab: useState = React hook that stores a value and re-renders when you call the setter
  // vocab: UserProfile | null = loaded Firestore profile, or null until/if it arrives
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // vocab: UserPreferences = notification + privacy toggles nested on the profile
  // vocab: resolveUserPreferences = fill defaults when Firestore prefs are missing
  const [preferences, setPreferences] = useState<UserPreferences>(
    resolveUserPreferences()
  );
  // vocab / profile field: isPublic = show on Discovery Grid when true
  const [isPublic, setIsPublic] = useState(true);
  // vocab / profile field: isDeactivated = hidden from Discovery until they reactivate
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // which danger confirm panel is open (null = neither)
  const [dangerConfirm, setDangerConfirm] = useState<"deactivate" | "delete" | null>(
    null
  );
  // Must type DELETE exactly before permanent delete is allowed
  const [deletePhrase, setDeletePhrase] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auth gate + hydrate toggles from Firestore — same pattern as Account page.
  // vocab: useEffect = run side effects after render (here: subscribe to Firebase auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Not signed in — settings are private; bounce to login.
      if (!user) {
        // vocab: router.replace = navigate without adding a history entry
        // Manipulate here: change "/auth/login" if the login route moves
        router.replace("/auth/login");
        return;
      }

      try {
        // vocab: getUserProfile = load users/{uid} from Firestore
        const nextProfile = await getUserProfile(user.uid);
        // Profile missing or unfinished — finish onboarding before settings.
        // vocab/symbol: ?. = optional chaining — if nextProfile is null, skip the field
        if (!nextProfile?.onboardingComplete) {
          // Manipulate here: change "/onboarding" if that route renames
          router.replace("/onboarding");
          return;
        }
        setProfile(nextProfile);
        // vocab / profile field: isPublic = show on Discovery Grid when true
        // vocab/symbol: ?? true = if isPublic is missing, default to visible
        setIsPublic(nextProfile.isPublic ?? true);
        // vocab: Boolean(x) = true for truthy values (handles undefined → false)
        setIsDeactivated(Boolean(nextProfile.isDeactivated));
        // Fill missing pref keys with defaults so toggles never see undefined
        setPreferences(resolveUserPreferences(nextProfile.preferences));
      } catch {
        setError("Could not load your settings. Refresh and try again.");
      } finally {
        // Always hide the spinner once the auth check finishes.
        setIsLoading(false);
      }
    });

    // vocab: return unsubscribe — React runs this cleanup when the component unmounts
    return unsubscribe;
  }, [router]);

  // This function is the heartbeat of every non-danger toggle on the page.
  // Write isPublic + preferences to Firestore whenever the user flips something.
  // vocab: useCallback = keep the same function identity unless isDeactivated changes
  // (so child rows don't see a brand-new save function every render)
  const saveSettingsToFirestore = useCallback(
    async (nextPublic: boolean, nextPreferences: UserPreferences) => {
      // vocab: auth.currentUser = whoever Firebase says is logged in right now
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      setIsSaving(true);
      setError("");
      setSuccess("");

      try {
        // Deactivated accounts stay hidden on Discovery even if they flip the public toggle.
        // Force isPublic false while deactivated so Discovery rules stay consistent.
        // vocab: updateUserSettings = merge isPublic + preferences into users/{uid}
        await updateUserSettings(user.uid, {
          isPublic: isDeactivated ? false : nextPublic,
          preferences: nextPreferences,
        });
        setSuccess("Settings saved.");
        // Clear the success banner after a couple seconds.
        // vocab: setTimeout = run this callback later (2200 ms ≈ 2.2 seconds)
        // Manipulate here: raise 2200 if the banner disappears too fast
        window.setTimeout(() => setSuccess(""), 2200);
      } catch (err) {
        setError(getAuthErrorMessage(err));
      } finally {
        setIsSaving(false);
      }
    },
    [isDeactivated]
  );

  // Update one preference key and save immediately (no separate Save button).
  // vocab/symbol: <K extends keyof UserPreferences> = TypeScript — key must be a real pref name
  // Manipulate here: add a new SettingsRow by calling updatePreference("yourNewKey", value)
  // (and add that key to UserPreferences + resolveUserPreferences in the backend)
  function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) {
    // Optimistic UI: update local state first, then persist.
    // vocab/symbol: ...preferences = copy all current prefs, then override [key]
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    // vocab: void = fire-and-forget the promise (don't await in the click handler)
    void saveSettingsToFirestore(isPublic, next);
  }

  // Toggle Discovery Grid visibility and save.
  // Separate from updatePreference because isPublic is a top-level profile field, not under preferences.
  function updatePublic(nextPublic: boolean) {
    // Deactivated accounts can't appear on Discovery until they reactivate.
    if (isDeactivated) {
      return;
    }
    setIsPublic(nextPublic);
    void saveSettingsToFirestore(nextPublic, preferences);
  }

  // Sign out of Firebase Auth and return to the login page.
  // vocab: signOutUser = clear the Firebase session on this device
  async function handleSignOut() {
    await signOutUser();
    // Manipulate here: change "/auth/login" if sign-out should land elsewhere
    router.replace("/auth/login");
  }

  // Hide profile from Discovery. Account data stays until they reactivate or delete.
  // Does NOT wipe Auth — they can still sign in and land on /auth/deactivated.
  // vocab: deactivateAccount = set isDeactivated + hide from Discovery in Firestore
  async function handleDeactivate() {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await deactivateAccount(user.uid);
      // Keep local UI in sync with what Firestore now says
      setIsDeactivated(true);
      setIsPublic(false);
      setDangerConfirm(null);
      setSuccess("Account deactivated. You're hidden from Discovery.");
      window.setTimeout(() => setSuccess(""), 2800);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  // Undo deactivate and show the profile on Discovery again.
  // vocab: reactivateAccount = clear isDeactivated and restore Discovery visibility
  async function handleReactivate() {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await reactivateAccount(user.uid);
      setIsDeactivated(false);
      setIsPublic(true);
      setSuccess("Account reactivated. You can appear on Discovery again.");
      window.setTimeout(() => setSuccess(""), 2800);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  // Confirm phrase → wipe Storage, Firestore, and Auth, then leave the app.
  // vocab: deleteOwnAccount = permanent delete (photo + profile + Google login on Devora)
  // May re-prompt Google to confirm identity before Firebase will delete the Auth user.
  async function handleDelete() {
    // Must type DELETE exactly before we call the destructive API.
    // Manipulate here: change the phrase in BOTH this check and the button's disabled=...
    if (deletePhrase.trim() !== "DELETE") {
      setError('Type DELETE in all caps to confirm.');
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await deleteOwnAccount();
      // Account is gone — send them to the public homepage (not login).
      // Manipulate here: change "/home" if post-delete landing should differ
      router.replace("/home");
    } catch (err) {
      setError(getAuthErrorMessage(err));
      // Only re-enable UI on failure — success already navigated away
      setIsSaving(false);
    }
  }

  // Spinner while settings load.
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="sign-in-spinner" />
        <p className="theme-muted text-sm">Loading settings…</p>
      </div>
    );
  }

  // Auth succeeded but Firestore profile never arrived.
  if (!profile) {
    return <div className="sign-in-error">Could not load your settings.</div>;
  }

  return (
    <div className="settings-page-content">
      {/* Status banners from save / load / danger actions */}
      {error ? <div className="sign-in-error">{error}</div> : null}
      {success ? <div className="account-success-banner">{success}</div> : null}
      {isSaving ? <p className="settings-saving-hint">Saving…</p> : null}

      <div className="settings-grid">
        {/* Discovery visibility + what fields show on the public profile */}
        {/* Manipulate here: wire new privacy toggles via updatePreference("showX", value) */}
        <SettingsCard title="Profile & Discovery" titleClassName="logo-gradient">
          <SettingsRow
            label="Show profile on Discovery Grid"
            description={
              isDeactivated
                ? "Reactivate your account below to appear on Discovery again."
                : "When off, classmates won't see you while browsing."
            }
            // Force off visually when deactivated even if local isPublic is stale
            checked={isPublic && !isDeactivated}
            onChange={updatePublic}
            disabled={isSaving || isDeactivated}
          />
          <SettingsRow
            label="Show interests on profile"
            checked={preferences.showInterests}
            onChange={(value) => updatePreference("showInterests", value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Show career focus / skills"
            checked={preferences.showSkills}
            onChange={(value) => updatePreference("showSkills", value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Show class year"
            checked={preferences.showClassYear}
            onChange={(value) => updatePreference("showClassYear", value)}
            disabled={isSaving}
          />
        </SettingsCard>

        {/* Notification toggles + who may message you */}
        <SettingsCard title="Notifications" titleClassName="headline-grad">
          <SettingsRow
            label="New messages"
            checked={preferences.notifyMessages}
            onChange={(value) => updatePreference("notifyMessages", value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Connection requests"
            checked={preferences.notifyConnectionRequests}
            onChange={(value) => updatePreference("notifyConnectionRequests", value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Profile views"
            checked={preferences.notifyProfileViews}
            onChange={(value) => updatePreference("notifyProfileViews", value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Event invites"
            checked={preferences.notifyEventInvites}
            onChange={(value) => updatePreference("notifyEventInvites", value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Weekly digest email"
            checked={preferences.notifyWeeklyDigest}
            onChange={(value) => updatePreference("notifyWeeklyDigest", value)}
            disabled={isSaving}
          />

          <div className="settings-row settings-row--select">
            <div className="settings-row-copy">
              <p className="settings-row-label">Allow messages from</p>
              <p className="settings-row-desc">Who can start a conversation with you.</p>
            </div>
            {/* vocab: MessagePolicy = "everyone" | "connections" | "none" */}
            <select
              className="settings-select"
              value={preferences.allowMessagesFrom}
              onChange={(event) =>
                updatePreference("allowMessagesFrom", event.target.value as MessagePolicy)
              }
              disabled={isSaving}
            >
              <option value="everyone">Everyone on Devora</option>
              <option value="connections">Connections only</option>
              <option value="none">No one</option>
            </select>
          </div>
        </SettingsCard>

        {/* Dark / light theme for this device */}
        <SettingsCard title="Appearance" titleClassName="devora-gradient-text">
          <p className="settings-row-desc mb-4">Pick how Devora looks on this device.</p>
          <div className="settings-mode-row">
            {(["dark", "light"] as const).map((mode) => {
              const active = theme === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  className={`devora-mode-btn ${active ? "devora-mode-btn--active" : ""}`}
                  onClick={() => setTheme(mode)}
                >
                  <span className={active ? "devora-gradient-text" : "theme-muted"}>
                    {mode === "dark" ? "Dark mode" : "Light mode"}
                  </span>
                </button>
              );
            })}
          </div>
        </SettingsCard>

        {/* Online status + read receipts */}
        <SettingsCard title="Privacy & Safety" titleClassName="pink-grad">
          <SettingsRow
            label="Show online status"
            checked={preferences.showOnlineStatus}
            onChange={(value) => updatePreference("showOnlineStatus", value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Read receipts"
            checked={preferences.showReadReceipts}
            onChange={(value) => updatePreference("showReadReceipts", value)}
            disabled={isSaving}
          />
          <p className="settings-row-desc mt-2">
            Blocked users and data export are coming in a future update.
          </p>
        </SettingsCard>

        {/* Quick links to profile edit and sign out */}
        <SettingsCard title="Account" titleClassName="headline-grad">
          <p className="settings-row-desc">{profile.email}</p>
          <div className="settings-action-row">
            <Link href="/account-page" className="devora-btn-outline">
              Edit profile
            </Link>
            <button
              type="button"
              className="devora-btn-outline"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </SettingsCard>

        {/* Deactivate (hide) or permanently delete the account — confirm panels below */}
        <SettingsCard title="Danger zone" titleClassName="theme-heading">
          {isDeactivated ? (
            <p className="settings-row-desc">
              Your account is deactivated. Classmates can&apos;t find you on
              Discovery. Reactivate anytime, or delete everything permanently.
            </p>
          ) : (
            <p className="settings-row-desc">
              Deactivate hides you from Discovery but keeps your data. Delete
              removes your profile, photo, and login — that can&apos;t be undone.
            </p>
          )}

          <div className="settings-action-row">
            {/* Reactivate vs start deactivate confirm */}
            {isDeactivated ? (
              <button
                type="button"
                className="devora-btn-outline"
                onClick={handleReactivate}
                disabled={isSaving}
              >
                Reactivate account
              </button>
            ) : (
              <button
                type="button"
                className="page-btn-danger"
                onClick={() => {
                  setDangerConfirm("deactivate");
                  setError("");
                }}
                disabled={isSaving}
              >
                Deactivate account
              </button>
            )}
            <button
              type="button"
              className="page-btn-danger"
              onClick={() => {
                setDangerConfirm("delete");
                setDeletePhrase("");
                setError("");
              }}
              disabled={isSaving}
            >
              Delete account
            </button>
          </div>

          {/* Inline confirm for deactivate */}
          {dangerConfirm === "deactivate" ? (
            <div className="settings-danger-confirm">
              <p className="settings-row-desc">
                Hide your profile from Discovery? You can sign back in later and
                reactivate.
              </p>
              <div className="settings-action-row">
                <button
                  type="button"
                  className="devora-btn-outline"
                  onClick={() => setDangerConfirm(null)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="page-btn-danger"
                  onClick={handleDeactivate}
                  disabled={isSaving}
                >
                  {isSaving ? "Deactivating…" : "Yes, deactivate"}
                </button>
              </div>
            </div>
          ) : null}

          {/* Inline confirm for delete — must type DELETE */}
          {dangerConfirm === "delete" ? (
            <div className="settings-danger-confirm">
              <p className="settings-row-desc">
                This permanently deletes your profile, photo, and Google login
                on Devora. Type DELETE, then confirm with Google.
              </p>
              <input
                className="sign-in-input"
                value={deletePhrase}
                onChange={(event) => setDeletePhrase(event.target.value)}
                placeholder="Type DELETE"
                autoComplete="off"
                disabled={isSaving}
              />
              <div className="settings-action-row">
                <button
                  type="button"
                  className="devora-btn-outline"
                  onClick={() => {
                    setDangerConfirm(null);
                    setDeletePhrase("");
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="page-btn-danger"
                  onClick={handleDelete}
                  disabled={isSaving || deletePhrase.trim() !== "DELETE"}
                >
                  {isSaving ? "Deleting…" : "Yes, delete forever"}
                </button>
              </div>
            </div>
          ) : null}
        </SettingsCard>
      </div>
    </div>
  );
}

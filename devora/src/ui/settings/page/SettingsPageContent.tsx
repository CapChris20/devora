// Settings page content per DESIGN.md.
// Night ground panels with 2px --edge border, Unbounded 700 card titles,
// signature gradient toggle switches, and clean danger actions.

"use client";

// ===== IMPORTS =====

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { LogOut, PenLine, AlertTriangle, Check } from "lucide-react";
import { motion } from "framer-motion";

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
import { useTheme } from "@/ui/shared/theme/DarkLightMode";

import GradientToggle from "../toggles/GradientToggle";

// ===== NAMED CONSTANTS =====

const LOGIN_PATH = "/auth/login";
const ONBOARDING_PATH = "/onboarding";
const HOME_PATH = "/home";
const ACCOUNT_PAGE_PATH = "/account-page";
const SETTINGS_SAVED_BANNER_MS = 2200;
const EMPTY_STATUS_MESSAGE = "";
const DEACTIVATE_CONFIRM_MODE = "deactivate" as const;
const DELETE_CONFIRM_MODE = "delete" as const;
const PUBLIC_PROFILE_DEFAULT = true;
const SETTINGS_SAVED_MESSAGE = "Settings saved.";
const PROFILE_LOAD_ERROR_MESSAGE = "Could not load your settings. Refresh and try again.";
const PROFILE_MISSING_MESSAGE = "Could not load your settings.";
const LOADING_SETTINGS_MESSAGE = "Loading settings…";
const SAVING_HINT = "Saving…";
const DELETE_PHRASE_ERROR_MESSAGE = "Type DELETE in all caps to confirm.";
const DEACTIVATED_SUCCESS_MESSAGE = "Account deactivated. You're hidden from Discovery.";
const REACTIVATED_SUCCESS_MESSAGE = "Account reactivated. You can appear on Discovery again.";
const DEACTIVATING_LABEL = "Deactivating…";
const DEACTIVATE_CONFIRM_LABEL = "Yes, deactivate";
const DELETING_LABEL = "Deleting…";
const DELETE_CONFIRM_LABEL = "Yes, delete forever";
const DARK_THEME_MODE = "dark" as const;
const LIGHT_THEME_MODE = "light" as const;
const THEME_MODES = [DARK_THEME_MODE, LIGHT_THEME_MODE] as const;
const DARK_MODE_LABEL = "Dark mode";
const LIGHT_MODE_LABEL = "Light mode";
const MESSAGE_POLICY_EVERYONE = "everyone";
const MESSAGE_POLICY_CONNECTIONS = "connections";
const MESSAGE_POLICY_NONE = "none";
const SHOW_INTERESTS_KEY = "showInterests" as const;
const SHOW_SKILLS_KEY = "showSkills" as const;
const SHOW_CLASS_YEAR_KEY = "showClassYear" as const;
const NOTIFY_MESSAGES_KEY = "notifyMessages" as const;
const NOTIFY_CONNECTION_REQUESTS_KEY = "notifyConnectionRequests" as const;
const NOTIFY_PROFILE_VIEWS_KEY = "notifyProfileViews" as const;
const NOTIFY_EVENT_INVITES_KEY = "notifyEventInvites" as const;
const NOTIFY_WEEKLY_DIGEST_KEY = "notifyWeeklyDigest" as const;
const ALLOW_MESSAGES_FROM_KEY = "allowMessagesFrom" as const;
const SHOW_ONLINE_STATUS_KEY = "showOnlineStatus" as const;
const SHOW_READ_RECEIPTS_KEY = "showReadReceipts" as const;
const HIDDEN_WHILE_DEACTIVATED_DESCRIPTION =
  "Reactivate your account below to appear for other students again.";
const PUBLIC_PROFILE_DESCRIPTION = "When off, classmates won't see you while browsing.";

// ===== TYPES =====

type SettingsCardProps = {
  title: string;
  children: ReactNode;
};

type SettingsRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

type DangerConfirmMode = typeof DEACTIVATE_CONFIRM_MODE | typeof DELETE_CONFIRM_MODE;

type SettingsStatusControls = {
  router: ReturnType<typeof useRouter>;
  setIsSaving: (isSaving: boolean) => void;
  setErrorMessage: (message: string) => void;
  setSuccessMessage: (message: string) => void;
};

type SettingsWriteInput = SettingsStatusControls & {
  userId: string;
  isDeactivated: boolean;
  nextIsPublic: boolean;
  nextPreferences: UserPreferences;
};

// ===== HELPER COMPONENTS =====

function SettingsCard({ title, children }: SettingsCardProps) {
  return (
    <motion.section
      className="settings-panel"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="settings-panel-head">
        <h2 className="settings-panel-title">{title}</h2>
        <span className="settings-panel-line" aria-hidden="true" />
      </div>
      <div className="settings-panel-body">{children}</div>
    </motion.section>
  );
}

function SettingsRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingsRowProps) {
  return (
    <div className="settings-row-item">
      <div className="settings-row-text">
        <span className="settings-row-label">{label}</span>
        {description && (
          <p className="settings-row-desc">{description}</p>
        )}
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

function hideSuccessBannerLater(setSuccessMessage: (message: string) => void) {
  const timeoutId = setTimeout(() => {
    setSuccessMessage(EMPTY_STATUS_MESSAGE);
  }, SETTINGS_SAVED_BANNER_MS);
  return () => clearTimeout(timeoutId);
}

function resolvePublicFlagForSave(isDeactivated: boolean, nextIsPublic: boolean): boolean {
  if (isDeactivated) {
    return false;
  }
  return nextIsPublic;
}

function isDeletePhraseConfirmed(phrase: string): boolean {
  return phrase.trim() === "DELETE";
}

async function redirectIfSettingsAreUnavailable(
  user: User | null,
  router: ReturnType<typeof useRouter>,
  setProfile: (profile: UserProfile | null) => void,
  setIsPublic: (isPublic: boolean) => void,
  setIsDeactivated: (isDeactivated: boolean) => void,
  setPreferences: (preferences: UserPreferences) => void,
  setErrorMessage: (message: string) => void,
  setIsLoading: (isLoading: boolean) => void
) {
  if (!user) {
    router.replace(LOGIN_PATH);
    return;
  }

  try {
    const loadedProfile = await getUserProfile(user.uid);
    if (!loadedProfile) {
      setErrorMessage(PROFILE_MISSING_MESSAGE);
      setProfile(null);
      return;
    }

    if (!loadedProfile.onboardingComplete) {
      router.replace(ONBOARDING_PATH);
      return;
    }

    setProfile(loadedProfile);
    setIsPublic(loadedProfile.isPublic ?? PUBLIC_PROFILE_DEFAULT);
    setIsDeactivated(Boolean(loadedProfile.isDeactivated));
    setPreferences(resolveUserPreferences(loadedProfile.preferences));
    setErrorMessage(EMPTY_STATUS_MESSAGE);
  } catch {
    setErrorMessage(PROFILE_LOAD_ERROR_MESSAGE);
    setProfile(null);
  } finally {
    setIsLoading(false);
  }
}

async function writeSettingsToFirestore(input: SettingsWriteInput) {
  input.setIsSaving(true);
  input.setErrorMessage(EMPTY_STATUS_MESSAGE);

  try {
    const isPublicForSave = resolvePublicFlagForSave(input.isDeactivated, input.nextIsPublic);
    await updateUserSettings(input.userId, {
      isPublic: isPublicForSave,
      preferences: input.nextPreferences,
    });
    input.setSuccessMessage(SETTINGS_SAVED_MESSAGE);
  } catch (thrownError) {
    input.setErrorMessage(getAuthErrorMessage(thrownError));
  } finally {
    input.setIsSaving(false);
  }
}

function requireSignedInUser(): User {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("You must be signed in to change settings.");
  }
  return currentUser;
}

async function signOutAndReturnToLogin(router: ReturnType<typeof useRouter>) {
  await signOutUser();
  router.replace(LOGIN_PATH);
}

async function deactivateAccountFromSettings(
  controls: SettingsStatusControls,
  setIsDeactivated: (value: boolean) => void,
  setIsPublic: (value: boolean) => void,
  setDangerConfirm: (mode: DangerConfirmMode | null) => void
) {
  controls.setIsSaving(true);
  controls.setErrorMessage(EMPTY_STATUS_MESSAGE);

  try {
    const currentUser = requireSignedInUser();
    await deactivateAccount(currentUser.uid);
    setIsDeactivated(true);
    setIsPublic(false);
    setDangerConfirm(null);
    controls.setSuccessMessage(DEACTIVATED_SUCCESS_MESSAGE);
  } catch (thrownError) {
    controls.setErrorMessage(getAuthErrorMessage(thrownError));
  } finally {
    controls.setIsSaving(false);
  }
}

async function reactivateAccountFromSettings(
  controls: SettingsStatusControls,
  setIsDeactivated: (value: boolean) => void,
  setIsPublic: (value: boolean) => void
) {
  controls.setIsSaving(true);
  controls.setErrorMessage(EMPTY_STATUS_MESSAGE);

  try {
    const currentUser = requireSignedInUser();
    await reactivateAccount(currentUser.uid);
    setIsDeactivated(false);
    setIsPublic(true);
    controls.setSuccessMessage(REACTIVATED_SUCCESS_MESSAGE);
  } catch (thrownError) {
    controls.setErrorMessage(getAuthErrorMessage(thrownError));
  } finally {
    controls.setIsSaving(false);
  }
}

async function deleteAccountAfterPhraseCheck(
  phrase: string,
  controls: SettingsStatusControls
) {
  if (!isDeletePhraseConfirmed(phrase)) {
    controls.setErrorMessage(DELETE_PHRASE_ERROR_MESSAGE);
    return;
  }

  controls.setIsSaving(true);
  controls.setErrorMessage(EMPTY_STATUS_MESSAGE);

  try {
    await deleteOwnAccount();
    controls.router.replace(HOME_PATH);
  } catch (thrownError) {
    controls.setErrorMessage(getAuthErrorMessage(thrownError));
    controls.setIsSaving(false);
  }
}

function SettingsAppearanceCard() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsCard title="Appearance">
      <p className="settings-desc-note">
        Pick how Devora looks on this device.
      </p>

      <div className="settings-theme-group">
        {THEME_MODES.map((mode) => {
          const isModeActive = theme === mode;
          const modeLabel = mode === DARK_THEME_MODE ? DARK_MODE_LABEL : LIGHT_MODE_LABEL;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              aria-pressed={isModeActive}
              className={`settings-theme-btn ${isModeActive ? "is-active" : ""}`}
            >
              <span>{modeLabel}</span>
            </button>
          );
        })}
      </div>
    </SettingsCard>
  );
}

function SettingsDangerZone({
  isDeactivated,
  isSaving,
  dangerConfirm,
  deletePhrase,
  setDangerConfirm,
  setDeletePhrase,
  setErrorMessage,
  onReactivate,
  onDeactivate,
  onDelete,
}: {
  isDeactivated: boolean;
  isSaving: boolean;
  dangerConfirm: DangerConfirmMode | null;
  deletePhrase: string;
  setDangerConfirm: (mode: DangerConfirmMode | null) => void;
  setDeletePhrase: (deletePhrase: string) => void;
  setErrorMessage: (message: string) => void;
  onReactivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  const isDeactivateConfirmOpen = dangerConfirm === DEACTIVATE_CONFIRM_MODE;
  const isDeleteConfirmOpen = dangerConfirm === DELETE_CONFIRM_MODE;

  return (
    <motion.div
      className="settings-danger-panel"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="settings-danger-head">
        <AlertTriangle size={22} className="danger-head-icon" />
        <h2 className="settings-danger-title">Danger zone</h2>
      </div>

      <p className="settings-danger-desc">
        {isDeactivated
          ? "Your account is deactivated. Classmates can't find you on Discovery. Reactivate anytime, or delete everything permanently."
          : "Deactivate hides you from Discovery but keeps your data. Delete removes your profile, photo, and login — that can't be undone."}
      </p>

      <div className="settings-danger-actions">
        {isDeactivated ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onReactivate}
            disabled={isSaving}
          >
            <span>Reactivate account</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-danger-outline"
            onClick={() => {
              setDangerConfirm(DEACTIVATE_CONFIRM_MODE);
              setErrorMessage(EMPTY_STATUS_MESSAGE);
            }}
            disabled={isSaving}
          >
            <span>Deactivate account</span>
          </button>
        )}

        <button
          type="button"
          className="btn-danger-outline"
          onClick={() => {
            setDangerConfirm(DELETE_CONFIRM_MODE);
            setDeletePhrase(EMPTY_STATUS_MESSAGE);
            setErrorMessage(EMPTY_STATUS_MESSAGE);
          }}
          disabled={isSaving}
        >
          <span>Delete account</span>
        </button>
      </div>

      {isDeactivateConfirmOpen && (
        <div className="danger-confirm-box">
          <p className="danger-confirm-title">
            Hide your profile from Discovery? You can sign back in later and reactivate.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              className="danger-cancel-btn"
              onClick={() => setDangerConfirm(null)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="danger-action-btn"
              onClick={onDeactivate}
              disabled={isSaving}
            >
              {isSaving ? DEACTIVATING_LABEL : DEACTIVATE_CONFIRM_LABEL}
            </button>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="danger-confirm-box">
          <p className="danger-confirm-title">
            This permanently deletes your profile, photo, and Google login on Devora. Type DELETE to confirm.
          </p>
          <input
            className="danger-confirm-input"
            value={deletePhrase}
            onChange={(event) => setDeletePhrase(event.target.value)}
            placeholder="Type DELETE"
            autoComplete="off"
            disabled={isSaving}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              className="danger-cancel-btn"
              onClick={() => {
                setDangerConfirm(null);
                setDeletePhrase(EMPTY_STATUS_MESSAGE);
              }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="danger-delete-btn"
              onClick={onDelete}
              disabled={isSaving}
            >
              {isSaving ? DELETING_LABEL : DELETE_CONFIRM_LABEL}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ===== MAIN COMPONENT =====

export default function SettingsPageContent() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPublic, setIsPublic] = useState(PUBLIC_PROFILE_DEFAULT);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(resolveUserPreferences(null));
  const [errorMessage, setErrorMessage] = useState(EMPTY_STATUS_MESSAGE);
  const [successMessage, setSuccessMessage] = useState(EMPTY_STATUS_MESSAGE);
  const [dangerConfirm, setDangerConfirm] = useState<DangerConfirmMode | null>(null);
  const [deletePhrase, setDeletePhrase] = useState(EMPTY_STATUS_MESSAGE);

  const statusControls: SettingsStatusControls = useMemo(
    () => ({
      router,
      setIsSaving,
      setErrorMessage,
      setSuccessMessage,
    }),
    [router]
  );

  useEffect(() => {
    if (!successMessage) return;
    return hideSuccessBannerLater(setSuccessMessage);
  }, [successMessage]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void redirectIfSettingsAreUnavailable(
        user,
        router,
        setProfile,
        setIsPublic,
        setIsDeactivated,
        setPreferences,
        setErrorMessage,
        setIsLoading
      );
    });

    return () => unsubscribe();
  }, [router]);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      const currentUid = auth.currentUser?.uid;
      if (!profile || !currentUid) return;
      const nextPreferences = { ...preferences, [key]: value };
      setPreferences(nextPreferences);
      void writeSettingsToFirestore({
        ...statusControls,
        userId: currentUid,
        isDeactivated,
        nextIsPublic: isPublic,
        nextPreferences,
      });
    },
    [profile, preferences, isDeactivated, isPublic, statusControls]
  );

  const updateDiscoveryVisibility = useCallback(
    (nextIsPublic: boolean) => {
      const currentUid = auth.currentUser?.uid;
      if (!profile || !currentUid) return;
      setIsPublic(nextIsPublic);
      void writeSettingsToFirestore({
        ...statusControls,
        userId: currentUid,
        isDeactivated,
        nextIsPublic,
        nextPreferences: preferences,
      });
    },
    [profile, preferences, isDeactivated, statusControls]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="mono text-[var(--text-muted)]">{LOADING_SETTINGS_MESSAGE}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--surface)] border-2 border-[var(--danger-edge)] text-[var(--danger)] text-center">
        {errorMessage || PROFILE_MISSING_MESSAGE}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      {/* Status banner */}
      {successMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            borderRadius: 14,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 14,
            fontWeight: 700,
            background: "linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%)",
            color: "#0d0b0e",
            boxShadow: "0 8px 24px -4px rgba(0,0,0,0.5)",
          }}
        >
          <Check size={18} color="#0d0b0e" strokeWidth={3} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            borderRadius: 14,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 14,
            fontWeight: 700,
            background: "#241018",
            border: "2px solid #852230",
            color: "#ff8fa0",
            boxShadow: "0 8px 24px -4px rgba(0,0,0,0.5)",
          }}
        >
          <AlertTriangle size={18} color="#ff8fa0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSaving && (
        <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 13, color: "#d8cdd5", textAlign: "right" }}>
          <span>{SAVING_HINT}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Discovery Visibility */}
        <SettingsCard title="Discovery Grid">
          <SettingsRow
            label="Public profile"
            description={
              isDeactivated ? HIDDEN_WHILE_DEACTIVATED_DESCRIPTION : PUBLIC_PROFILE_DESCRIPTION
            }
            checked={isPublic}
            onChange={updateDiscoveryVisibility}
            disabled={isSaving || isDeactivated}
          />
          <SettingsRow
            label="Show interests"
            checked={preferences.showInterests}
            onChange={(value) => updatePreference(SHOW_INTERESTS_KEY, value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Show career focus &amp; skills"
            checked={preferences.showSkills}
            onChange={(value) => updatePreference(SHOW_SKILLS_KEY, value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Show class year"
            checked={preferences.showClassYear}
            onChange={(value) => updatePreference(SHOW_CLASS_YEAR_KEY, value)}
            disabled={isSaving}
          />
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard title="Notifications">
          <SettingsRow
            label="New messages"
            checked={preferences.notifyMessages}
            onChange={(value) => updatePreference(NOTIFY_MESSAGES_KEY, value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Connection requests"
            checked={preferences.notifyConnectionRequests}
            onChange={(value) => updatePreference(NOTIFY_CONNECTION_REQUESTS_KEY, value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Profile views"
            checked={preferences.notifyProfileViews}
            onChange={(value) => updatePreference(NOTIFY_PROFILE_VIEWS_KEY, value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Event invites"
            checked={preferences.notifyEventInvites}
            onChange={(value) => updatePreference(NOTIFY_EVENT_INVITES_KEY, value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Weekly digest email"
            checked={preferences.notifyWeeklyDigest}
            onChange={(value) => updatePreference(NOTIFY_WEEKLY_DIGEST_KEY, value)}
            disabled={isSaving}
          />

          <div className="settings-select-card">
            <div>
              <span className="settings-select-title">
                Allow messages from
              </span>
              <p className="settings-select-desc">
                Who can start a conversation with you.
              </p>
            </div>

            <select
              className="settings-select-dropdown"
              value={preferences.allowMessagesFrom}
              onChange={(event) =>
                updatePreference(ALLOW_MESSAGES_FROM_KEY, event.target.value as MessagePolicy)
              }
              disabled={isSaving}
            >
              <option value={MESSAGE_POLICY_EVERYONE}>Everyone on Devora</option>
              <option value={MESSAGE_POLICY_CONNECTIONS}>Connections only</option>
              <option value={MESSAGE_POLICY_NONE}>No one</option>
            </select>
          </div>
        </SettingsCard>

        {/* Appearance */}
        <SettingsAppearanceCard />

        {/* Privacy & Safety */}
        <SettingsCard title="Privacy & Safety">
          <SettingsRow
            label="Show online status"
            checked={preferences.showOnlineStatus}
            onChange={(value) => updatePreference(SHOW_ONLINE_STATUS_KEY, value)}
            disabled={isSaving}
          />
          <SettingsRow
            label="Read receipts"
            checked={preferences.showReadReceipts}
            onChange={(value) => updatePreference(SHOW_READ_RECEIPTS_KEY, value)}
            disabled={isSaving}
          />
        </SettingsCard>

        {/* Account Info & Actions */}
        <SettingsCard title="Account">
          <div className="settings-account-box">
            <span className="settings-account-label">Signed in as</span>
            <span className="settings-account-email">{profile.email}</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingTop: 4 }}>
            <Link href={ACCOUNT_PAGE_PATH} className="btn-primary">
              <PenLine size={16} />
              <span>Edit profile</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                void signOutAndReturnToLogin(router);
              }}
              className="settings-signout-btn"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </SettingsCard>

        {/* Danger zone */}
        <SettingsDangerZone
          isDeactivated={isDeactivated}
          isSaving={isSaving}
          dangerConfirm={dangerConfirm}
          deletePhrase={deletePhrase}
          setDangerConfirm={setDangerConfirm}
          setDeletePhrase={setDeletePhrase}
          setErrorMessage={setErrorMessage}
          onReactivate={() => {
            void reactivateAccountFromSettings(statusControls, setIsDeactivated, setIsPublic);
          }}
          onDeactivate={() => {
            void deactivateAccountFromSettings(
              statusControls,
              setIsDeactivated,
              setIsPublic,
              setDangerConfirm
            );
          }}
          onDelete={() => {
            void deleteAccountAfterPhraseCheck(deletePhrase, statusControls);
          }}
        />
      </div>

      <style jsx>{`
        .settings-panel {
          background: #0e0918;
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-radius: 6px;
          padding: clamp(24px, 3.5vw, 32px);
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 6px 6px 0px 0px #000000;
        }

        :global(html[data-theme="light"]) .settings-panel {
          background: #ffffff;
          border: 2.5px solid #0a0a0a;
          box-shadow: 6px 6px 0px 0px #0a0a0a;
          color: #0a0a0a;
        }

        .settings-panel-head {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        :global(html[data-theme="light"]) .settings-panel-head {
          border-bottom: 2px solid #0a0a0a;
        }

        .settings-panel-title {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 700;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: #ffffff;
          margin: 0;
          white-space: nowrap;
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
        }

        :global(html[data-theme="light"]) .settings-panel-title {
          color: #0a0a0a;
          text-shadow: none;
        }

        .settings-panel-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(255, 92, 168, 0.4), transparent 75%);
        }

        :global(html[data-theme="light"]) .settings-panel-line {
          background: linear-gradient(90deg, #0a0a0a, transparent 75%);
        }

        .settings-panel-body {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .settings-row-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 18px;
          border-radius: 14px;
          background: #15101a;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          transition: background 0.18s ease, border-color 0.18s ease;
        }

        :global(html[data-theme="light"]) .settings-row-item {
          background: #fafaf9;
          border: 2px solid #0a0a0a;
          box-shadow: 2px 2px 0px #0a0a0a;
        }

        .settings-row-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-row-label {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        :global(html[data-theme="light"]) .settings-row-label {
          color: #0a0a0a;
        }

        .settings-row-desc {
          font-size: 14px;
          color: #d8cdd5;
          margin: 0;
          line-height: 1.45;
        }

        :global(html[data-theme="light"]) .settings-row-desc {
          color: #4b5563;
        }

        .settings-desc-note {
          font-size: 14px;
          color: #d8cdd5;
          margin: -4px 0 0;
        }

        :global(html[data-theme="light"]) .settings-desc-note {
          color: #4b5563;
        }

        .settings-theme-group {
          display: flex;
          gap: 12px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .settings-theme-btn {
          height: 44px;
          padding-inline: 22px;
          border-radius: 9999px;
          border: 2px solid #382d40;
          background: #15101a;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          font-family: var(--font-mono), monospace;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        :global(html[data-theme="light"]) .settings-theme-btn {
          background: #ffffff;
          border: 2px solid #0a0a0a;
          color: #0a0a0a;
          box-shadow: 3px 3px 0 0 #0a0a0a;
        }

        .settings-theme-btn.is-active {
          border: 2px solid #000000;
          background: linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%);
          color: #0d0b0e;
          box-shadow: 3px 3px 0 0 #0d0b0e;
        }

        .settings-select-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 14px;
          background: #15101a;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
        }

        :global(html[data-theme="light"]) .settings-select-card {
          background: #fafaf9;
          border: 2px solid #0a0a0a;
          box-shadow: 2px 2px 0px #0a0a0a;
        }

        .settings-select-title {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }

        :global(html[data-theme="light"]) .settings-select-title {
          color: #0a0a0a;
        }

        .settings-select-desc {
          font-size: 14px;
          color: #d8cdd5;
          margin: 4px 0 0;
        }

        :global(html[data-theme="light"]) .settings-select-desc {
          color: #4b5563;
        }

        .settings-select-dropdown {
          height: 44px;
          padding: 0 16px;
          border-radius: 12px;
          background: #0e0b12;
          border: 2px solid #2f2536;
          color: #ffffff;
          font-family: var(--font-mono), monospace;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          max-width: 320px;
        }

        :global(html[data-theme="light"]) .settings-select-dropdown {
          background: #ffffff;
          border: 2px solid #0a0a0a;
          color: #0a0a0a;
          box-shadow: 2px 2px 0px #0a0a0a;
        }

        .settings-account-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 14px 18px;
          border-radius: 14px;
          background: #15101a;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
        }

        :global(html[data-theme="light"]) .settings-account-box {
          background: #fafaf9;
          border: 2px solid #0a0a0a;
          box-shadow: 2px 2px 0px #0a0a0a;
        }

        .settings-account-label {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          color: #d8cdd5;
          text-transform: uppercase;
          font-weight: 700;
        }

        :global(html[data-theme="light"]) .settings-account-label {
          color: #575757;
        }

        .settings-account-email {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }

        :global(html[data-theme="light"]) .settings-account-email {
          color: #0a0a0a;
        }

        .settings-signout-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 44px;
          padding-inline: 22px;
          border-radius: 9999px;
          background: #15101a;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          font-family: var(--font-mono), monospace;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        :global(html[data-theme="light"]) .settings-signout-btn {
          background: #ffffff;
          border: 2px solid #0a0a0a;
          color: #0a0a0a;
          box-shadow: 3px 3px 0 0 #0a0a0a;
        }

        .settings-danger-panel {
          background: #160a10;
          border: 2.5px solid #ef4444;
          border-radius: 6px;
          padding: clamp(24px, 3.5vw, 32px);
          display: flex;
          flex-direction: column;
          gap: 18px;
          box-shadow: 6px 6px 0px 0px #000000, 7px 7px 0px 0px #ef4444;
        }

        :global(html[data-theme="light"]) .settings-danger-panel {
          background: #fef2f2;
          border: 2.5px solid #dc2626;
          box-shadow: 6px 6px 0px 0px #0a0a0a;
        }

        .settings-danger-head {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 1px solid #4a151d;
        }

        :global(html[data-theme="light"]) .settings-danger-head {
          border-bottom: 2px solid #dc2626;
        }

        :global(.danger-head-icon) {
          color: #ff8fa0;
        }

        :global(html[data-theme="light"]) :global(.danger-head-icon) {
          color: #dc2626;
        }

        .settings-danger-title {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 700;
          font-size: 18px;
          text-transform: uppercase;
          color: #ff8fa0;
          margin: 0;
        }

        :global(html[data-theme="light"]) .settings-danger-title {
          color: #dc2626;
        }

        .settings-danger-desc {
          font-size: 14.5px;
          color: #e2d5dc;
          line-height: 1.5;
          margin: 0;
        }

        :global(html[data-theme="light"]) .settings-danger-desc {
          color: #7f1d1d;
        }

        .settings-danger-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .btn-danger-outline {
          height: 44px;
          padding-inline: 22px;
          border-radius: 9999px;
          background: #2a1016;
          border: 2px solid #852230;
          color: #ff8fa0;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        :global(html[data-theme="light"]) .btn-danger-outline {
          background: #fee2e2;
          border: 2px solid #dc2626;
          color: #991b1b;
          box-shadow: 3px 3px 0 0 #dc2626;
        }

        .danger-confirm-box {
          background: #241018;
          border: 1.5px solid #852230;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 6px;
        }

        :global(html[data-theme="light"]) .danger-confirm-box {
          background: #ffffff;
          border: 2px solid #dc2626;
          box-shadow: 4px 4px 0 0 #dc2626;
        }

        .danger-confirm-title {
          font-size: 14px;
          color: #ffffff;
          margin: 0;
          font-weight: 600;
        }

        :global(html[data-theme="light"]) .danger-confirm-title {
          color: #991b1b;
        }

        .danger-cancel-btn {
          height: 40px;
          padding-inline: 18px;
          border-radius: 999px;
          background: #160a0f;
          border: 1.5px solid #4a151d;
          color: #e2d5dc;
          cursor: pointer;
        }

        :global(html[data-theme="light"]) .danger-cancel-btn {
          background: #ffffff;
          border: 2px solid #0a0a0a;
          color: #0a0a0a;
          font-weight: 600;
        }

        .danger-action-btn {
          height: 40px;
          padding-inline: 18px;
          border-radius: 999px;
          background: #ef4444;
          border: 2px solid #0a0a0a;
          color: #ffffff;
          font-weight: 700;
          cursor: pointer;
        }

        .danger-delete-btn {
          height: 40px;
          padding-inline: 18px;
          border-radius: 999px;
          background: #ef4444;
          border: 2px solid #0a0a0a;
          color: #ffffff;
          font-weight: 700;
          cursor: pointer;
        }

        .danger-confirm-input {
          height: 48px;
          padding: 0 16px;
          border-radius: 10px;
          background: #160a0f;
          border: 2px solid #ff8fa0;
          color: #ffffff;
          font-size: 15px;
          outline: none;
        }

        :global(html[data-theme="light"]) .danger-confirm-input {
          background: #ffffff;
          border: 2px solid #dc2626;
          color: #0a0a0a;
          box-shadow: 2px 2px 0 0 #dc2626;
        }
      `}</style>
    </div>
  );
}

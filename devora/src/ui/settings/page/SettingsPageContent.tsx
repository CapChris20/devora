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
      style={{
        background: "#0e0b12",
        border: "2px solid #2f2536",
        borderRadius: 20,
        padding: "clamp(20px, 3vw, 28px)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        boxShadow: "0 14px 36px -10px rgba(0, 0, 0, 0.8), 0 0 20px -8px rgba(255, 92, 168, 0.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingBottom: 12,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display), 'Arial Black', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
            color: "#ffffff",
            margin: 0,
            whiteSpace: "nowrap",
            textShadow: "0 1px 6px rgba(0,0,0,0.6)",
          }}
        >
          {title}
        </h2>
        <span
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(90deg, rgba(255, 92, 168, 0.4), transparent 75%)",
          }}
          aria-hidden="true"
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 16px",
        borderRadius: 14,
        background: "#15101a",
        border: "1.5px solid rgba(255, 255, 255, 0.08)",
        transition: "background 0.18s ease, border-color 0.18s ease",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </span>
        {description && (
          <p
            style={{
              fontSize: 14,
              color: "#d8cdd5",
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            {description}
          </p>
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
      <p style={{ fontSize: 14, color: "#d8cdd5", margin: "-4px 0 0" }}>
        Pick how Devora looks on this device.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
        {THEME_MODES.map((mode) => {
          const isModeActive = theme === mode;
          const modeLabel = mode === DARK_THEME_MODE ? DARK_MODE_LABEL : LIGHT_MODE_LABEL;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              aria-pressed={isModeActive}
              style={{
                height: 44,
                paddingInline: 22,
                borderRadius: 9999,
                border: isModeActive ? "2px solid #000000" : "2px solid #382d40",
                background: isModeActive
                  ? "linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%)"
                  : "#15101a",
                color: isModeActive ? "#0d0b0e" : "#ffffff",
                boxShadow: isModeActive ? "3px 3px 0 0 #0d0b0e" : "0 4px 12px rgba(0,0,0,0.5)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
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
      className="danger-panel"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="danger-header">
        <AlertTriangle size={20} color="var(--danger, #ff8fa0)" />
        <h2 className="danger-title">Danger zone</h2>
      </div>

      <p className="danger-desc">
        {isDeactivated
          ? "Your account is deactivated. Classmates can't find you on Discovery. Reactivate anytime, or delete everything permanently."
          : "Deactivate hides you from Discovery but keeps your data. Delete removes your profile, photo, and login — that can't be undone."}
      </p>

      <div className="danger-actions-row">
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
            className="btn-danger"
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
          className="btn-danger"
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
          <p className="text-[14px] text-[var(--text-body)] m-0">
            Hide your profile from Discovery? You can sign back in later and reactivate.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setDangerConfirm(null)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
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
          <p className="text-[14px] text-[var(--danger)] m-0">
            This permanently deletes your profile, photo, and Google login on Devora. Type DELETE to confirm.
          </p>
          <input
            className="danger-input"
            value={deletePhrase}
            onChange={(event) => setDeletePhrase(event.target.value)}
            placeholder="Type DELETE"
            autoComplete="off"
            disabled={isSaving}
          />
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-ghost"
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
              className="btn-danger"
              onClick={onDelete}
              disabled={isSaving}
            >
              {isSaving ? DELETING_LABEL : DELETE_CONFIRM_LABEL}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .danger-panel {
          background: var(--surface, #1c181c);
          border: 2px solid var(--danger-edge, #7a2a3a);
          border-radius: 20px;
          padding: clamp(20px, 3vw, 28px);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .danger-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--danger-edge, #7a2a3a);
        }

        .danger-title {
          font-family: var(--font-display), "Arial Black", sans-serif;
          font-weight: 700;
          font-size: 17px;
          text-transform: uppercase;
          color: var(--danger, #ff8fa0);
          margin: 0;
        }

        .danger-desc {
          font-size: 14.5px;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0;
        }

        .danger-actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .danger-confirm-box {
          background: var(--surface-2, #29232a);
          border: 1px solid var(--danger-edge, #7a2a3a);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 6px;
        }

        .danger-input {
          height: 48px;
          padding: 0 16px;
          border-radius: 10px;
          background: var(--surface, #1c181c);
          border: 2px solid var(--edge, #3d3439);
          color: white;
          font-family: var(--f-mono);
          font-size: 15px;
          outline: none;
        }

        .danger-input:focus {
          border-color: var(--danger);
        }

        .btn-danger {
          height: 44px;
          padding-inline: 22px;
          border-radius: 9999px;
          background: transparent;
          border: 2px solid var(--danger-edge, #7a2a3a);
          color: var(--danger, #ff8fa0);
          font-family: var(--f-mono);
          font-size: 13.5px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .btn-danger:hover {
          background: rgb(255 143 160 / 0.1);
          border-color: var(--danger);
        }

        .btn-ghost {
          height: 44px;
          padding-inline: 22px;
          border-radius: 9999px;
          background: transparent;
          border: 2px solid rgb(255 255 255 / 0.4);
          color: white;
          font-family: var(--f-mono);
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-ghost:hover {
          border-color: white;
        }
      `}</style>
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
    <div className="settings-page-content-wrapper">
      {/* Status banner */}
      {successMessage && (
        <div className="settings-alert-banner success-banner">
          <Check size={18} color="#0d0b0e" strokeWidth={3} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="settings-alert-banner error-banner">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSaving && (
        <div className="saving-indicator">
          <span>{SAVING_HINT}</span>
        </div>
      )}

      <div className="settings-grid-stack">
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

          <div className="policy-select-row">
            <div>
              <span className="text-[15.5px] font-semibold text-white">
                Allow messages from
              </span>
              <p className="text-[14px] text-[var(--text-muted)] m-0 mt-0.5">
                Who can start a conversation with you.
              </p>
            </div>

            <select
              className="policy-select"
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
          <div className="flex flex-col gap-1">
            <span className="mono text-[12px] text-[var(--text-muted)]">Signed in as</span>
            <span className="text-[16px] font-bold text-white">{profile.email}</span>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href={ACCOUNT_PAGE_PATH} className="btn-primary">
              <PenLine size={16} />
              <span>Edit profile</span>
            </Link>

            <button
              type="button"
              className="account-signout-btn"
              onClick={() => {
                void signOutAndReturnToLogin(router);
              }}
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
        .settings-page-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-alert-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 14px;
          font-family: var(--f-mono);
          font-size: 14px;
          font-weight: 700;
        }

        .success-banner {
          background: var(--grad, linear-gradient(120deg, #ff9a3d 0%, #ff5ca8 52%, #ff2bd6 100%));
          color: #0d0b0e;
        }

        .error-banner {
          background: rgb(255 143 160 / 0.15);
          border: 2px solid var(--danger-edge, #7a2a3a);
          color: var(--danger, #ff8fa0);
        }

        .saving-indicator {
          font-family: var(--f-mono);
          font-size: 13px;
          color: var(--text-muted);
          text-align: right;
        }

        .settings-grid-stack {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .policy-select-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 8px;
          border-top: 1px solid rgb(255 255 255 / 0.08);
        }

        @media (min-width: 640px) {
          .policy-select-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .policy-select {
          height: 44px;
          padding: 0 16px;
          border-radius: 12px;
          background: var(--surface-2, #29232a);
          border: 2px solid var(--edge, #3d3439);
          color: white;
          font-family: var(--f-mono);
          font-size: 13.5px;
          outline: none;
          cursor: pointer;
        }

        .policy-select:focus {
          border-color: #ff5ca8;
          box-shadow: 0 0 0 3px rgb(255 92 168 / 0.2);
        }

        .account-signout-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 52px;
          padding-inline: 26px;
          border-radius: 9999px;
          background: transparent;
          border: 2px solid rgb(255 255 255 / 0.4);
          color: white;
          font-family: var(--f-body);
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: border-color 0.2s ease, translate 0.2s var(--spring);
        }

        .account-signout-btn:hover {
          border-color: white;
          translate: 0 -2px;
        }
      `}</style>
    </div>
  );
}

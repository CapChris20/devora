// Edit profile form — change bio, major, interests, then save via parent onSave().
// Collapsible sections keep one area open at a time so the form stays readable.
// Parent (AccountPageContent) owns Firebase writes; this component only drafts local state + validates.
// Pill lists are shared with onboarding (onboarding-options.ts) so edit + signup stay in sync.

"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

import type { AccountProfileUpdate, UserProfile } from "@/backend/firebase";
import {
  ABOUT_YOU,
  AGES,
  CLASS_RANKS,
  GENDERS,
  getCareerNichesForMajor,
  MAJORS,
  mergeCasualInterests,
  PERSONAL_INTEREST_GROUPS,
} from "@/ui/auth/onboarding-options";
import PillGroup from "@/ui/shared/PillGroup";

import { splitCasualInterests } from "./account-helpers";

type AccountProfileEditorProps = {
  // vocab: UserProfile = full Firestore users/{uid} document shape (seed for the draft)
  profile: UserProfile;
  // saving = true while parent is uploading / writing (disables inputs + buttons)
  saving: boolean;
  onCancel: () => void;
  // vocab: AccountProfileUpdate = partial profile fields the parent will merge into Firestore
  // photoFile is separate so the parent can upload to Storage first, then include photoURL
  onSave: (update: AccountProfileUpdate, photoFile: File | null) => Promise<void>;
};

type EditorSectionProps = {
  title: string;
  // One-line preview shown in the header when the section is collapsed
  summary: string;
  defaultOpen?: boolean;
  // vocab: ReactNode = anything React can render (JSX, text, null, …)
  children: ReactNode;
};

// One collapsible block (Basics, Bio, Career, etc.) inside the editor.
// Each section manages its own open/closed state — they don't force siblings closed.
function EditorSection({ title, summary, defaultOpen = false, children }: EditorSectionProps) {
  // vocab: useState = React hook that stores a value and re-renders when you call the setter
  // open = whether this accordion section's body is visible
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="account-editor-section">
      {/* Click header to expand or collapse this section */}
      <button
        type="button"
        className="account-editor-section-toggle"
        // vocab/symbol: !current = flip true↔false
        onClick={() => setOpen((current) => !current)}
        // vocab: aria-expanded = accessibility hint for screen readers (section open or closed)
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <p className="account-section-eyebrow">{title}</p>
          {/* Summary line only shows when the section is closed */}
          {!open ? <p className="account-editor-section-summary">{summary}</p> : null}
        </div>
        <span className="account-chevron" data-open={open}>
          ▾
        </span>
      </button>
      {open ? <div className="account-editor-section-body">{children}</div> : null}
    </section>
  );
}

// Full edit form — local state starts from the saved profile, then onSave sends changes up.
export default function AccountProfileEditor({
  profile,
  saving,
  onCancel,
  onSave,
}: AccountProfileEditorProps) {
  // Split saved interests into known pills vs custom typed ones (for the text field).
  // vocab: useMemo = only re-run when profile.casualInterests changes (avoids re-splitting every render)
  // vocab: splitCasualInterests = known pills → known[]; anything else → customText
  // Why split? Editor shows known items as active pills; custom ones go in the free-text box.
  const initialSplit = useMemo(
    // vocab/symbol: ?? [] = if casualInterests is missing, use an empty list
    () => splitCasualInterests(profile.casualInterests ?? []),
    [profile.casualInterests]
  );

  // --- Local draft of every editable field (copied from profile on first render) ---
  // Changing these does NOT touch Firestore until Save → parent handleSave.
  // vocab / profile field: bio = short Discovery intro (must stay 20–150 chars to save)
  // Manipulate here: keep canSave limits in sync with onboarding bio rules
  const [bio, setBio] = useState(profile.bio ?? "");
  // vocab / profile field: major = CECS major string
  const [major, setMajor] = useState(profile.major ?? "");
  // vocab / profile field: classRank = Freshman–Graduate
  const [classRank, setClassRank] = useState(profile.classRank ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [age, setAge] = useState(profile.age ?? "");
  // vocab / profile field: careerNiche = multi-select career tags for the major
  // vocab/symbol: string[] = list of strings
  const [careerNiche, setCareerNiche] = useState<string[]>(profile.careerNiche ?? []);
  const [careerNicheOther, setCareerNicheOther] = useState(profile.careerNicheOther ?? "");
  // vocab / profile field: hasExperience = whether they list projects / internships
  const [hasExperience, setHasExperience] = useState(profile.hasExperience ?? false);
  const [experienceDetails, setExperienceDetails] = useState(profile.experienceDetails ?? "");
  // Known interest pills vs free-typed custom interests (merged on save)
  const [casualInterests, setCasualInterests] = useState<string[]>(initialSplit.known);
  const [casualInterestsOther, setCasualInterestsOther] = useState(initialSplit.customText);
  // vocab / profile field: aboutYou = "looking for" tags
  const [aboutYou, setAboutYou] = useState<string[]>(profile.aboutYou ?? []);
  // Optional social URLs stored under profile.links
  // vocab/symbol: ?. = optional chaining — if links is missing, fall back to ""
  const [github, setGithub] = useState(profile.links?.github ?? "");
  const [linkedin, setLinkedin] = useState(profile.links?.linkedin ?? "");
  const [instagram, setInstagram] = useState(profile.links?.instagram ?? "");
  // vocab: File | null = new photo from the file picker, or null to keep the old one
  // Parent uploads only if this is non-null on Save
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  // Derived counts used in section summary lines.
  const careerNicheOptions = getCareerNichesForMajor(major);
  // Count pill picks + comma-separated custom interests for the Interests summary.
  const interestCount =
    casualInterests.length +
    (casualInterestsOther.trim() ? casualInterestsOther.split(",").filter(Boolean).length : 0);
  // How many social URL fields are non-empty.
  const linkCount = [github, linkedin, instagram].filter((link) => link.trim()).length;

  // When major changes, drop career niches that don't belong to the new major.
  // Same rule as OnboardingForm — keeps draft niches honest after a major switch.
  function handleMajorChange(nextMajor: string) {
    setMajor(nextMajor);

    // Cleared major — clear niches too.
    if (!nextMajor) {
      setCareerNiche([]);
      return;
    }

    // Keep only niches that are valid for the newly chosen major.
    // vocab/symbol: filter = keep items where the callback returns true
    const allowed = getCareerNichesForMajor(nextMajor);
    setCareerNiche((current) => current.filter((niche) => allowed.includes(niche)));
  }

  // Bio length is the only hard gate on the Save button's disabled state.
  // Experience details are checked inside handleSubmit (shows an error instead of silently disabling).
  // Manipulate here: change 20/150 to match onboarding canContinue case 5
  function canSave(): boolean {
    const bioLength = bio.trim().length;
    return bioLength >= 20 && bioLength <= 150;
  }

  // Validate draft fields, then hand the update + optional photo to the parent.
  // Parent (AccountPageContent.handleSave) does Storage upload + Firestore merge.
  // vocab: FormEvent = browser form submit event (Enter key or Save button)
  async function handleSubmit(event: FormEvent) {
    // vocab/symbol: preventDefault — stop the browser from doing a full page reload
    event.preventDefault();
    setError("");

    // Bio too short or too long — block save with a banner.
    if (!canSave()) {
      setError("Bio must be between 20 and 150 characters.");
      return;
    }

    // They said Yes to experience but left the details box empty.
    if (hasExperience && !experienceDetails.trim()) {
      setError("Add experience details or switch experience to No.");
      return;
    }

    // Build the field bag the parent will merge into users/{uid}.
    // vocab: mergeCasualInterests = combine pill picks + comma-typed customs, deduped
    await onSave(
      {
        bio: bio.trim(),
        major,
        classRank,
        gender,
        age,
        careerNiche,
        careerNicheOther: careerNicheOther.trim(),
        hasExperience,
        // Clear details if they said No — don't save leftover text from a flipped Yes→No
        experienceDetails: hasExperience ? experienceDetails.trim() : "",
        casualInterests: mergeCasualInterests(casualInterests, casualInterestsOther),
        aboutYou,
        links: {
          github: github.trim(),
          linkedin: linkedin.trim(),
          instagram: instagram.trim(),
        },
      },
      photoFile
    );
  }

  return (
    <form className="glass-card account-profile-editor" onSubmit={handleSubmit}>
      {/* Editor header + validation error */}
      <div className="account-editor-header">
        <h2 className="account-hero-name text-xl">Edit profile</h2>
        <p className="theme-muted mt-1 text-sm">Open a section to change it — only one area at a time keeps this readable.</p>
        {error ? <div className="sign-in-error mt-4">{error}</div> : null}
      </div>

      <div className="account-editor-sections">
        {/* Basics — photo, class rank, gender, age, major */}
        {/* Manipulate here: CLASS_RANKS / GENDERS / AGES / MAJORS live in onboarding-options.ts */}
        <EditorSection
          title="Basics"
          // vocab/symbol: filter(Boolean) = drop empty strings before joining with " · "
          summary={[classRank, major].filter(Boolean).join(" · ") || "Photo, class rank, major"}
          defaultOpen
        >
          <div className="flex flex-col gap-3">
            <label className="account-editor-label" htmlFor="account-photo">
              Profile photo
            </label>
            <label className="sign-in-file-picker" htmlFor="account-photo">
              <input
                id="account-photo"
                type="file"
                accept="image/*"
                className="sign-in-file-input"
                onChange={(event) =>
                  // vocab/symbol: files?.[0] ?? null = first chosen file, or null if none
                  setPhotoFile(event.target.files?.[0] ?? null)
                }
                disabled={saving}
              />
              <span className="sign-in-file-btn">Choose photo</span>
              <span className="sign-in-file-name">
                {photoFile?.name ?? "JPG, PNG, or WebP"}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PillGroup
              label="Class rank"
              options={CLASS_RANKS}
              selected={classRank}
              // vocab/symbol: as string = single-select mode returns one string (not string[])
              onChange={(value) => setClassRank(value as string)}
            />
            <PillGroup
              label="Gender"
              options={GENDERS}
              selected={gender}
              onChange={(value) => setGender(value as string)}
            />
          </div>

          <PillGroup label="Age" options={AGES} selected={age} onChange={(value) => setAge(value as string)} />

          <div className="flex flex-col gap-3">
            <label className="account-editor-label" htmlFor="account-major">
              Major
            </label>
            {/* vocab: <select> = native dropdown; changing major filters career niches */}
            <select
              id="account-major"
              className="sign-in-input"
              value={major}
              onChange={(event) => handleMajorChange(event.target.value)}
              disabled={saving}
            >
              <option value="">Select a CECS major</option>
              {MAJORS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </EditorSection>

        {/* Bio & looking-for tags — bio length gates Save; ABOUT_YOU pills are optional */}
        <EditorSection
          title="Bio & discovery"
          summary={`${bio.trim().length}/150 chars · ${aboutYou.length} looking-for tags`}
        >
          <div className="flex flex-col gap-3">
            <label className="account-editor-label" htmlFor="account-bio">
              Bio (20–150 characters)
            </label>
            <textarea
              id="account-bio"
              className="sign-in-input min-h-[120px] resize-y"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={150}
              disabled={saving}
            />
            {/* Green count style once they hit the 20-char minimum */}
            <p
              className={`onboarding-char-count ${
                bio.trim().length >= 20 ? "onboarding-char-count--valid" : ""
              }`}
            >
              {bio.trim().length}/150
            </p>
          </div>

          <PillGroup
            label="Looking for (optional)"
            options={ABOUT_YOU}
            selected={aboutYou}
            multiple
            onChange={(value) => setAboutYou(value as string[])}
          />
        </EditorSection>

        {/* Career niches + experience Yes/No */}
        <EditorSection
          title="Career & projects"
          summary={
            careerNiche.length > 0
              ? `${careerNiche.length} focus tags · ${hasExperience ? "Has experience" : "No experience listed"}`
              : "Career focus and project history"
          }
        >
          {/* Career niches only appear after a major is chosen */}
          {major ? (
            <PillGroup
              label="Career focus"
              options={careerNicheOptions}
              selected={careerNiche}
              multiple
              onChange={(value) => setCareerNiche(value as string[])}
            />
          ) : (
            <p className="account-empty-hint">Pick a major in Basics to unlock career focus tags.</p>
          )}

          <input
            type="text"
            className="sign-in-input"
            placeholder="More about your career focus (optional)"
            value={careerNicheOther}
            onChange={(event) => setCareerNicheOther(event.target.value)}
            disabled={saving}
          />

          <div className="flex flex-col gap-3">
            <p className="account-editor-label">Experience or projects?</p>
            <div className="flex gap-3">
              {/* Yes / No buttons that set hasExperience */}
              {["Yes", "No"].map((option) => {
                const active =
                  (option === "Yes" && hasExperience) || (option === "No" && !hasExperience);
                return (
                  <button
                    key={option}
                    type="button"
                    className={`onboarding-pill flex-1 ${active ? "onboarding-pill-active" : ""}`}
                    onClick={() => setHasExperience(option === "Yes")}
                    disabled={saving}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details box only when they said Yes to experience */}
          {hasExperience ? (
            <textarea
              className="sign-in-input min-h-[120px] resize-y"
              placeholder="Tell us about your experience or projects…"
              value={experienceDetails}
              onChange={(event) => setExperienceDetails(event.target.value)}
              disabled={saving}
            />
          ) : null}
        </EditorSection>

        {/* Personal interest pills + custom typed interests */}
        {/* Manipulate here: PERSONAL_INTEREST_GROUPS in onboarding-options.ts */}
        <EditorSection
          title="Interests"
          summary={interestCount > 0 ? `${interestCount} interests selected` : "Personal interests (optional)"}
        >
          <div className="account-editor-interests-scroll">
            {PERSONAL_INTEREST_GROUPS.map((group) => (
              <PillGroup
                key={group.label}
                label={group.label}
                options={group.options}
                selected={casualInterests}
                multiple
                onChange={(value) => setCasualInterests(value as string[])}
              />
            ))}
            <input
              type="text"
              className="sign-in-input"
              placeholder="Add your own interests — separate with commas"
              value={casualInterestsOther}
              onChange={(event) => setCasualInterestsOther(event.target.value)}
              disabled={saving}
            />
          </div>
        </EditorSection>

        {/* Optional GitHub / LinkedIn / Instagram URLs */}
        <EditorSection
          title="Social links"
          summary={linkCount > 0 ? `${linkCount} link${linkCount === 1 ? "" : "s"} added` : "GitHub, LinkedIn, Instagram"}
        >
          <div className="onboarding-link-group">
            <div className="onboarding-link-field">
              <span className="onboarding-link-tag">GH</span>
              <input
                type="url"
                className="sign-in-input"
                placeholder="github.com/username"
                value={github}
                onChange={(event) => setGithub(event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="onboarding-link-field">
              <span className="onboarding-link-tag">IN</span>
              <input
                type="url"
                className="sign-in-input"
                placeholder="linkedin.com/in/username"
                value={linkedin}
                onChange={(event) => setLinkedin(event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="onboarding-link-field">
              <span className="onboarding-link-tag">IG</span>
              <input
                type="url"
                className="sign-in-input"
                placeholder="instagram.com/username"
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </EditorSection>
      </div>

      {/* Cancel leaves edit mode without writing; Save runs handleSubmit → parent onSave */}
      <div className="account-editor-actions">
        <button
          type="button"
          className="sign-in-google-btn flex-1"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-neon font-display flex-1 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em]"
          disabled={saving || !canSave()}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

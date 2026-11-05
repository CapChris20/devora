// Edit profile popup — medium glass panel over the account page (not a full-page swap).
// Collapsible sections keep the form readable. Each section remembers its own open state.
// AccountPageContent owns the Firebase write. This file only drafts local state and validates.
// Pill lists are shared with onboarding so edit and signup stay in sync.

"use client";

// ===== IMPORTS =====

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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
} from "@/ui/account/onboarding/onboarding-options";
import PillGroup from "@/ui/shared/pills/PillGroup";

import { splitCasualInterests } from "../profile/account-helpers";

// ===== NAMED CONSTANTS =====

const MINIMUM_BIO_CHARACTER_COUNT = 20;
const MAXIMUM_BIO_CHARACTER_COUNT = 150;
const SINGULAR_LINK_COUNT = 1;
const ESCAPE_KEY = "Escape";
const HIDDEN_PAGE_OVERFLOW = "hidden";
const EXPERIENCE_YES_LABEL = "Yes";
const EXPERIENCE_NO_LABEL = "No";
const EXPERIENCE_CHOICES = [EXPERIENCE_YES_LABEL, EXPERIENCE_NO_LABEL] as const;
const EMPTY_EXPERIENCE_DETAILS = "";
const CUSTOM_INTEREST_SEPARATOR = ",";
const SUMMARY_SEPARATOR = " · ";
const PHOTO_FILE_FALLBACK_LABEL = "JPG, PNG, or WebP";
const MAJOR_PLACEHOLDER_OPTION = "Select a CECS major";
const ACTIVE_PILL_CLASS_NAME = "onboarding-pill-active";
const DETAILS_TEXTAREA_CLASS_NAME = "sign-in-input min-h-[120px] resize-y";
const VALID_BIO_COUNT_CLASS_NAME = "onboarding-char-count--valid";
const BIO_COUNT_CLASS_NAME = "onboarding-char-count";
const BASICS_SUMMARY_FALLBACK = "Photo, class rank, major";
const CAREER_SUMMARY_FALLBACK = "Career focus and project history";
const HAS_EXPERIENCE_LABEL = "Has experience";
const NO_EXPERIENCE_LABEL = "No experience listed";
const INTERESTS_SUMMARY_FALLBACK = "Personal interests (optional)";
const SOCIAL_SUMMARY_FALLBACK = "GitHub, LinkedIn, Instagram";
const BIO_LENGTH_ERROR_MESSAGE = `Bio must be between ${MINIMUM_BIO_CHARACTER_COUNT} and ${MAXIMUM_BIO_CHARACTER_COUNT} characters.`;
const MISSING_EXPERIENCE_ERROR_MESSAGE = "Add experience details or switch experience to No.";
const EDITOR_TITLE = "Edit profile";
const EDITOR_INTRO = "Open a section to change it — only one area at a time keeps this readable.";
const SAVING_BUTTON_LABEL = "Saving…";
const SAVE_BUTTON_LABEL = "Save changes";
const CANCEL_BUTTON_LABEL = "Cancel";
const BIO_PLACEHOLDER = "A short intro — who you are, what you’re into, who you’d like to meet…";
const EXPERIENCE_PLACEHOLDER = "Tell us about your experience or projects…";

// ===== TYPES =====

type AccountProfileEditorProps = {
  // vocab: UserProfile = full Firestore users/{uid} document shape (seed for the draft)
  profile: UserProfile;
  // saving = true while the parent is uploading or writing
  saving: boolean;
  onCancel: () => void;
  // vocab: AccountProfileUpdate = partial profile fields the parent merges into Firestore
  // photoFile is separate so the parent can upload to Storage first
  onSave: (update: AccountProfileUpdate, photoFile: File | null) => Promise<void>;
};

type EditorSectionProps = {
  title: string;
  summary: string;
  isOpenByDefault?: boolean;
  // vocab: ReactNode = anything React can render
  children: ReactNode;
};

type EditorDraft = {
  bio: string;
  major: string;
  classRank: string;
  gender: string;
  age: string;
  careerNiche: string[];
  careerNicheOther: string;
  hasExperience: boolean;
  experienceDetails: string;
  casualInterests: string[];
  casualInterestsOther: string;
  aboutYou: string[];
  github: string;
  linkedin: string;
  instagram: string;
};

// ===== HELPER FUNCTIONS =====

function EditorPortal({ children }: { children: ReactNode }) {
  // vocab: useState = store a value and re-render when the setter is called
  const [isPortalMounted, setIsPortalMounted] = useState(false);

  // Paint on document.body so the popup is not trapped inside the page column.
  // vocab: useEffect = run after paint. vocab: createPortal = React owns the tree, the DOM node moves
  useEffect(() => {
    setIsPortalMounted(true);
  }, []);

  if (!isPortalMounted) {
    return null;
  }

  return createPortal(children, document.body);
}

function EditorSection({
  title,
  summary,
  isOpenByDefault = false,
  children,
}: EditorSectionProps) {
  const [isSectionOpen, setIsSectionOpen] = useState(isOpenByDefault);

  return (
    <section className="account-editor-section">
      <button
        type="button"
        className="account-editor-section-toggle"
        onClick={() => setIsSectionOpen((isOpen) => !isOpen)}
        // vocab: aria-expanded = tells screen readers whether this section is open
        aria-expanded={isSectionOpen}
      >
        <div className="min-w-0 flex-1">
          <p className="account-section-eyebrow">{title}</p>
          {isSectionOpen ? null : <p className="account-editor-section-summary">{summary}</p>}
        </div>
        <span className="account-chevron" data-open={isSectionOpen}>
          ▾
        </span>
      </button>
      {isSectionOpen ? <div className="account-editor-section-body">{children}</div> : null}
    </section>
  );
}

function useCloseEditorOnEscape(onCancel: () => void, isSaving: boolean): void {
  // vocab: useEffect = lock scroll while open, and undo it when the editor unmounts
  useEffect(() => {
    const closeEditorOnEscape = (event: KeyboardEvent) => {
      const isEscapeKey = event.key === ESCAPE_KEY;
      if (isEscapeKey && !isSaving) {
        onCancel();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = HIDDEN_PAGE_OVERFLOW;
    window.addEventListener("keydown", closeEditorOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeEditorOnEscape);
    };
  }, [onCancel, isSaving]);
}

function keepCareerNichesForMajor(nextMajor: string, currentNiches: string[]): string[] {
  if (!nextMajor) {
    return [];
  }
  const allowedNiches = getCareerNichesForMajor(nextMajor);
  return currentNiches.filter((niche) => allowedNiches.includes(niche));
}

function isBioLengthValid(bio: string): boolean {
  const bioLength = bio.trim().length;
  // Manipulate here: keep 20 and 150 aligned with onboarding Finish
  return bioLength >= MINIMUM_BIO_CHARACTER_COUNT && bioLength <= MAXIMUM_BIO_CHARACTER_COUNT;
}

function isEditorExperienceChoiceSelected(optionLabel: string, hasExperience: boolean): boolean {
  const isYesSelected = optionLabel === EXPERIENCE_YES_LABEL && hasExperience;
  const isNoSelected = optionLabel === EXPERIENCE_NO_LABEL && !hasExperience;
  return isYesSelected || isNoSelected;
}

function countCommaSeparatedInterests(customInterestsText: string): number {
  // Split the raw text. Trimming first would change the count for space-only pieces.
  if (!customInterestsText.trim()) {
    return 0;
  }
  return customInterestsText.split(CUSTOM_INTEREST_SEPARATOR).filter(Boolean).length;
}

function countFilledSocialLinks(socialLinks: string[]): number {
  return socialLinks.filter((link) => link.trim()).length;
}

function formatBasicsSummary(classRank: string, major: string): string {
  const joinedSummary = [classRank, major].filter(Boolean).join(SUMMARY_SEPARATOR);
  if (!joinedSummary) {
    return BASICS_SUMMARY_FALLBACK;
  }
  return joinedSummary;
}

function formatBioSectionSummary(bio: string, aboutYouCount: number): string {
  return `${bio.trim().length}/${MAXIMUM_BIO_CHARACTER_COUNT} chars${SUMMARY_SEPARATOR}${aboutYouCount} looking-for tags`;
}

function formatCareerSectionSummary(careerNicheCount: number, hasExperience: boolean): string {
  if (careerNicheCount === 0) {
    return CAREER_SUMMARY_FALLBACK;
  }
  const experienceLabel = hasExperience ? HAS_EXPERIENCE_LABEL : NO_EXPERIENCE_LABEL;
  return `${careerNicheCount} focus tags${SUMMARY_SEPARATOR}${experienceLabel}`;
}

function formatInterestSectionSummary(interestCount: number): string {
  if (interestCount > 0) {
    return `${interestCount} interests selected`;
  }
  return INTERESTS_SUMMARY_FALLBACK;
}

function formatSocialLinkSummary(linkCount: number): string {
  if (linkCount === 0) {
    return SOCIAL_SUMMARY_FALLBACK;
  }
  const pluralSuffix = linkCount === SINGULAR_LINK_COUNT ? "" : "s";
  return `${linkCount} link${pluralSuffix} added`;
}

function buildBioCountClassName(bio: string): string {
  const isBioLongEnough = bio.trim().length >= MINIMUM_BIO_CHARACTER_COUNT;
  const validClassName = isBioLongEnough ? VALID_BIO_COUNT_CLASS_NAME : "";
  return `${BIO_COUNT_CLASS_NAME} ${validClassName}`;
}

function buildAccountProfileUpdate(draft: EditorDraft): AccountProfileUpdate {
  return {
    bio: draft.bio.trim(),
    major: draft.major,
    classRank: draft.classRank,
    gender: draft.gender,
    age: draft.age,
    careerNiche: draft.careerNiche,
    careerNicheOther: draft.careerNicheOther.trim(),
    hasExperience: draft.hasExperience,
    // A No answer must not keep leftover text from a flipped Yes.
    experienceDetails: draft.hasExperience
      ? draft.experienceDetails.trim()
      : EMPTY_EXPERIENCE_DETAILS,
    casualInterests: mergeCasualInterests(draft.casualInterests, draft.casualInterestsOther),
    aboutYou: draft.aboutYou,
    links: {
      github: draft.github.trim(),
      linkedin: draft.linkedin.trim(),
      instagram: draft.instagram.trim(),
    },
  };
}

function readFirstSelectedFile(fileList: FileList | null): File | null {
  // vocab: ?. = no crash if the picker was cleared. ?? = null when nothing was chosen
  return fileList?.[0] ?? null;
}

function closeEditorUnlessSaving(isSaving: boolean, onCancel: () => void): void {
  if (!isSaving) {
    onCancel();
  }
}

// ===== MAIN COMPONENT =====

/**
 * Full edit form. Local state starts from the saved profile, then onSave sends the draft up.
 * @param props - The saved profile, the saving flag, and cancel/save callbacks
 * @param props.profile - Firestore profile used to seed the draft
 * @param props.saving - True while the parent upload or write is in flight
 * @param props.onCancel - Closes the popup without writing
 * @param props.onSave - Receives the field bag and an optional new photo file
 * @returns The editor dialog
 */
export default function AccountProfileEditor({
  profile,
  saving,
  onCancel,
  onSave,
}: AccountProfileEditorProps) {
  const isSaving = saving;

  // vocab: useMemo = only re-split when casualInterests changes
  // vocab: splitCasualInterests = known pills in known[], everything else in customText
  // vocab: ?? = if casualInterests is missing, start from an empty list
  const initialSplit = useMemo(
    () => splitCasualInterests(profile.casualInterests ?? []),
    [profile.casualInterests]
  );

  // Changing these does not touch Firestore until Save.
  // vocab / profile field: bio = short Discovery intro
  const [bio, setBio] = useState(profile.bio ?? "");
  const [major, setMajor] = useState(profile.major ?? "");
  const [classRank, setClassRank] = useState(profile.classRank ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [age, setAge] = useState(profile.age ?? "");
  const [careerNiche, setCareerNiche] = useState<string[]>(profile.careerNiche ?? []);
  const [careerNicheOther, setCareerNicheOther] = useState(profile.careerNicheOther ?? "");
  // vocab / profile field: hasExperience = whether they list projects or internships
  const [hasExperience, setHasExperience] = useState(profile.hasExperience ?? false);
  const [experienceDetails, setExperienceDetails] = useState(profile.experienceDetails ?? "");
  const [casualInterests, setCasualInterests] = useState<string[]>(initialSplit.known);
  const [casualInterestsOther, setCasualInterestsOther] = useState(initialSplit.customText);
  // vocab / profile field: aboutYou = "looking for" tags
  const [aboutYou, setAboutYou] = useState<string[]>(profile.aboutYou ?? []);
  // vocab: ?. = if links is missing, fall back to an empty string
  const [github, setGithub] = useState(profile.links?.github ?? "");
  const [linkedin, setLinkedin] = useState(profile.links?.linkedin ?? "");
  const [instagram, setInstagram] = useState(profile.links?.instagram ?? "");
  // vocab: File | null = a new photo, or null to keep the current one
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useCloseEditorOnEscape(onCancel, isSaving);

  const careerNicheOptions = getCareerNichesForMajor(major);
  const interestCount =
    casualInterests.length + countCommaSeparatedInterests(casualInterestsOther);
  const linkCount = countFilledSocialLinks([github, linkedin, instagram]);
  const canSave = isBioLengthValid(bio);
  const photoName = photoFile?.name ?? PHOTO_FILE_FALLBACK_LABEL;

  const draft: EditorDraft = {
    bio,
    major,
    classRank,
    gender,
    age,
    careerNiche,
    careerNicheOther,
    hasExperience,
    experienceDetails,
    casualInterests,
    casualInterestsOther,
    aboutYou,
    github,
    linkedin,
    instagram,
  };

  const applyMajorChange = (nextMajor: string) => {
    setMajor(nextMajor);
    setCareerNiche((currentNiches) => keepCareerNichesForMajor(nextMajor, currentNiches));
  };

  const submitProfileEdits = async (event: FormEvent) => {
    // vocab: preventDefault = stop the browser from reloading the page
    // vocab: async = wait for the parent save before this submit handler finishes
    event.preventDefault();
    setErrorMessage("");

    if (!isBioLengthValid(bio)) {
      setErrorMessage(BIO_LENGTH_ERROR_MESSAGE);
      return;
    }

    if (hasExperience && !experienceDetails.trim()) {
      setErrorMessage(MISSING_EXPERIENCE_ERROR_MESSAGE);
      return;
    }

    // vocab: await = the parent uploads the photo, then merges Firestore
    await onSave(buildAccountProfileUpdate(draft), photoFile);
  };

  return (
    <EditorPortal>
      <div
        className="account-editor-backdrop"
        onClick={() => closeEditorUnlessSaving(isSaving, onCancel)}
      >
        <form
          className="glass-card account-profile-editor"
          onSubmit={submitProfileEdits}
          // vocab: stopPropagation = a click on the form must not count as a backdrop click
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-editor-title"
        >
          <div className="account-editor-header">
            <h2 id="account-editor-title" className="account-hero-name text-xl">
              {EDITOR_TITLE}
            </h2>
            <p className="theme-muted mt-1 text-sm">{EDITOR_INTRO}</p>
            {errorMessage ? <div className="sign-in-error mt-4">{errorMessage}</div> : null}
          </div>

          <div className="account-editor-sections">
            {/* Manipulate here: CLASS_RANKS / GENDERS / AGES / MAJORS live in onboarding-options.ts */}
            <EditorSection
              title="Basics"
              summary={formatBasicsSummary(classRank, major)}
              isOpenByDefault
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
                    onChange={(event) => setPhotoFile(readFirstSelectedFile(event.target.files))}
                    disabled={isSaving}
                  />
                  <span className="sign-in-file-btn">Choose photo</span>
                  <span className="sign-in-file-name">{photoName}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PillGroup
                  label="Class rank"
                  options={CLASS_RANKS}
                  selected={classRank}
                  onChange={(value) => setClassRank(value as string)}
                />
                <PillGroup
                  label="Gender"
                  options={GENDERS}
                  selected={gender}
                  onChange={(value) => setGender(value as string)}
                />
              </div>

              <PillGroup
                label="Age"
                options={AGES}
                selected={age}
                onChange={(value) => setAge(value as string)}
              />

              <div className="flex flex-col gap-3">
                <label className="account-editor-label" htmlFor="account-major">
                  Major
                </label>
                <select
                  id="account-major"
                  className="sign-in-input"
                  value={major}
                  onChange={(event) => applyMajorChange(event.target.value)}
                  disabled={isSaving}
                >
                  <option value="">{MAJOR_PLACEHOLDER_OPTION}</option>
                  {MAJORS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </EditorSection>

            <EditorSection
              title="Bio & discovery"
              summary={formatBioSectionSummary(bio, aboutYou.length)}
            >
              <div className="flex flex-col gap-3">
                <label className="account-editor-label" htmlFor="account-bio">
                  Bio ({MINIMUM_BIO_CHARACTER_COUNT}–{MAXIMUM_BIO_CHARACTER_COUNT} characters)
                </label>
                <textarea
                  id="account-bio"
                  className={DETAILS_TEXTAREA_CLASS_NAME}
                  placeholder={BIO_PLACEHOLDER}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={MAXIMUM_BIO_CHARACTER_COUNT}
                  disabled={isSaving}
                />
                <p className={buildBioCountClassName(bio)}>
                  {bio.trim().length}/{MAXIMUM_BIO_CHARACTER_COUNT}
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

            <EditorSection
              title="Career & projects"
              summary={formatCareerSectionSummary(careerNiche.length, hasExperience)}
            >
              {major ? (
                <PillGroup
                  label="Career focus"
                  options={careerNicheOptions}
                  selected={careerNiche}
                  multiple
                  onChange={(value) => setCareerNiche(value as string[])}
                />
              ) : (
                <p className="account-empty-hint">
                  Pick a major in Basics to unlock career focus tags.
                </p>
              )}
              <input
                type="text"
                className="sign-in-input"
                placeholder="More about your career focus (optional)"
                value={careerNicheOther}
                onChange={(event) => setCareerNicheOther(event.target.value)}
                disabled={isSaving}
              />
              <div className="flex flex-col gap-3">
                <p className="account-editor-label">Experience or projects?</p>
                <div className="flex gap-3">
                  {EXPERIENCE_CHOICES.map((optionLabel) => {
                    const isOptionSelected = isEditorExperienceChoiceSelected(
                      optionLabel,
                      hasExperience
                    );
                    const pillClassName = `onboarding-pill flex-1 ${
                      isOptionSelected ? ACTIVE_PILL_CLASS_NAME : ""
                    }`;
                    return (
                      <button
                        key={optionLabel}
                        type="button"
                        className={pillClassName}
                        onClick={() => setHasExperience(optionLabel === EXPERIENCE_YES_LABEL)}
                        disabled={isSaving}
                      >
                        {optionLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
              {hasExperience ? (
                <textarea
                  className={DETAILS_TEXTAREA_CLASS_NAME}
                  placeholder={EXPERIENCE_PLACEHOLDER}
                  value={experienceDetails}
                  onChange={(event) => setExperienceDetails(event.target.value)}
                  disabled={isSaving}
                />
              ) : null}
            </EditorSection>

            {/* Manipulate here: PERSONAL_INTEREST_GROUPS in onboarding-options.ts */}
            <EditorSection title="Interests" summary={formatInterestSectionSummary(interestCount)}>
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
                  disabled={isSaving}
                />
              </div>
            </EditorSection>

            <EditorSection title="Social links" summary={formatSocialLinkSummary(linkCount)}>
              <div className="onboarding-link-group">
                <div className="onboarding-link-field">
                  <span className="onboarding-link-tag">GH</span>
                  <input
                    type="url"
                    className="sign-in-input"
                    placeholder="github.com/username"
                    value={github}
                    onChange={(event) => setGithub(event.target.value)}
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
                  />
                </div>
              </div>
            </EditorSection>
          </div>

          <div className="account-editor-actions">
            <button
              type="button"
              className="sign-in-google-btn flex-1"
              onClick={onCancel}
              disabled={isSaving}
            >
              {CANCEL_BUTTON_LABEL}
            </button>
            <button
              type="submit"
              className="btn-neon font-display flex-1 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em]"
              disabled={isSaving || !canSave}
            >
              {isSaving ? SAVING_BUTTON_LABEL : SAVE_BUTTON_LABEL}
            </button>
          </div>
        </form>
      </div>
    </EditorPortal>
  );
}

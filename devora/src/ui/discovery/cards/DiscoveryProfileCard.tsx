// One Discovery Grid profile card — portrait snapshot for a 4-up desktop grid.
// Hierarchy: PFP → name → major + class rank → socials → career path + interests → View profile.
// “View profile” opens a peek modal — there is no other-user profile route yet.

"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { DiscoveryProfile } from "../mock-profiles";
import DiscoveryAvatar from "./DiscoveryAvatar";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./DiscoverySocialIcons";

type DiscoveryProfileCardProps = {
  profile: DiscoveryProfile;
  onView: (profile: DiscoveryProfile) => void;
  // Grid index — used to stagger the entrance so cards don’t all pop at once
  index?: number;
};

// How many career / interest chips show on the card face (peek shows the rest).
// Manipulate here: raise to show more pills before they overflow the 4-up grid
const CARD_CHIP_LIMIT = 3;

type SocialKey = "github" | "linkedin" | "instagram";

const SOCIAL_META: Array<{
  key: SocialKey;
  label: string;
  Icon: typeof GithubIcon;
}> = [
  { key: "github", label: "GitHub", Icon: GithubIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
];

// Icon row for github / linkedin / instagram. Missing URLs are skipped (not a “Not added” row).
export function DiscoverySocialLinks({
  links,
}: {
  links: DiscoveryProfile["links"];
}) {
  const present = SOCIAL_META.filter((item) => links[item.key]?.trim());

  if (present.length === 0) {
    return null;
  }

  return (
    <div className="discovery-social-row">
      {present.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noopener noreferrer"
          className="discovery-social-link"
          aria-label={label}
          // vocab: stopPropagation = don’t let this click also fire the card’s View profile
          onClick={(event) => event.stopPropagation()}
        >
          <Icon size={16} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

function ChipGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  const visible = items.slice(0, CARD_CHIP_LIMIT);

  return (
    <div className="discovery-chip-group">
      <p className="discovery-chip-label">{title}</p>
      <div className="discovery-tag-row">
        {visible.map((item) => (
          <span key={item} className="discovery-tag">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DiscoveryProfileCard({
  profile,
  onView,
  index = 0,
}: DiscoveryProfileCardProps) {
  // vocab: useReducedMotion = Framer hook — true when OS “Reduce motion” is on
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className="discovery-card"
      data-accent={profile.accent}
      // vocab: initial / animate = start pose → end pose; delay staggers each card in the row
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      // Manipulate here: raise delay step (0.05) for a slower cascade across the grid
      transition={{ duration: 0.45, delay: Math.min(index, 11) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Light sweep on hover — CSS moves this from left → right */}
      <span className="discovery-sheen" aria-hidden="true" />

      <div className="discovery-card-identity">
        <DiscoveryAvatar
          id={profile.id}
          displayName={profile.displayName}
          accent={profile.accent}
        />
        <div className="discovery-card-copy">
          <h2 className="discovery-card-name page-card-name">{profile.displayName}</h2>
          <p className="discovery-card-major">{profile.major}</p>
          <p className="discovery-card-rank">{profile.classRank}</p>
        </div>
      </div>

      <DiscoverySocialLinks links={profile.links} />

      <div className="discovery-chip-stack">
        <ChipGroup title="Career path" items={profile.careerNiche} />
        <ChipGroup title="Interests" items={profile.casualInterests} />
      </div>

      <button
        type="button"
        className="page-btn-outline page-btn-grad-logo discovery-view-btn"
        onClick={() => onView(profile)}
      >
        View profile
      </button>
    </motion.article>
  );
}

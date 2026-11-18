// Server component wrapper for club detail route with static export params.
import { REAL_SEEDED_CLUBS } from "@/ui/activity-center/clubs/seeded-clubs";
import ClubDetailClient from "./ClubDetailClient";

export function generateStaticParams() {
  return REAL_SEEDED_CLUBS.map((club) => ({
    clubId: club.id,
  }));
}

export default function ClubDetailPage() {
  return <ClubDetailClient />;
}

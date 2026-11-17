// /activity/clubs redirects to /activity-center/clubs.

import { redirect } from "next/navigation";

export default function ClubsPage() {
  redirect("/activity-center/clubs");
}

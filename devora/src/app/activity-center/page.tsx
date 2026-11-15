// Route redirect from /activity-center to the Activity Center (/activity)

import { redirect } from "next/navigation";

export default function ActivityCenterRedirectPage() {
  redirect("/activity");
}

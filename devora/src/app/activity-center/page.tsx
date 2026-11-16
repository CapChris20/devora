// Route redirect from /activity-center to /activity-center/events.
// Automatically sends students to the initial tab of the Activity Center.

import { redirect } from "next/navigation";

export default function ActivityCenterRootPage() {
  redirect("/activity-center/events");
}

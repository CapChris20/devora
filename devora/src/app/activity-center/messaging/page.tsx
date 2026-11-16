// Redirect from /activity-center/messaging to top-level /messages.
// Messages has its own dedicated navigation link in the top bar.

import { redirect } from "next/navigation";

export default function ActivityCenterMessagingPage() {
  redirect("/messages");
}

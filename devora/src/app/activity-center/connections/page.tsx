// Redirect from /activity-center/connections to top-level /connections.
// Connections has its own dedicated navigation link in the top bar.

import { redirect } from "next/navigation";

export default function ActivityCenterConnectionsPage() {
  redirect("/connections");
}

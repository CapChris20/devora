// Route redirect from /activity-center to /messages-page

import { redirect } from "next/navigation";

export default function ActivityCenterRedirectPage() {
  redirect("/messages-page");
}


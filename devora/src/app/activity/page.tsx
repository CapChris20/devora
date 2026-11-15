// /activity has no content of its own — send visitors to the first tab.

import { redirect } from "next/navigation";

// Manipulate here: change the default tab
export default function ActivityPage() {
  redirect("/activity/study-groups");
}

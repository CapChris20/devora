// Redirect /campus-hub to /activity-center/events
import { redirect } from "next/navigation";

export default function CampusHubRedirectPage() {
  redirect("/activity-center/events");
}


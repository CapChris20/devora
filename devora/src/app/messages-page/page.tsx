// Old Activity Center URL. The Activity Center is now the tabbed Design Law page at /activity
// (Study Groups + Clubs). Messages and Connections have their own NavBar links.

import { redirect } from "next/navigation";

export default function MessagesPage() {
  redirect("/activity");
}

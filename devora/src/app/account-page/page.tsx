// Profile page shell — account editing UI over the shared Voronoi background.
// Flow: route mounts → PageLayout chrome → AccountPageContent handles view/edit.

"use client";

import PageLayout from "@/ui/backgrounds/PageLayout";
import AccountPageContent from "@/ui/account/AccountPageContent";

// Thin route: shared layout + AccountPageContent (editor / view lives there).
// vocab: "use client" = browser component (needed for interactive account UI below)
// vocab: PageLayout = shared app chrome (nav + Voronoi background + title)
export default function AccountPage() {
  return (
    <PageLayout
      // vocab: wide = give the content more horizontal room than default pages
      // Manipulate here: drop `wide` for a narrower profile column
      wide
      // vocab: activeItem = which NavBar link looks selected
      activeItem="Account"
      title="My Profile"
      // Manipulate here: titleClassName = gradient style class from globals.css
      titleClassName="headline-grad"
    >
      {/* Real logic (load profile, edit, save) lives in AccountPageContent */}
      <AccountPageContent />
    </PageLayout>
  );
}

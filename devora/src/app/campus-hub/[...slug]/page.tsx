// Redirect /campus-hub/* to /activity-center/*
import { redirect } from "next/navigation";

export default function CampusHubSlugRedirectPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const subpath = params.slug?.join("/") || "events";
  redirect(`/activity-center/${subpath}`);
}


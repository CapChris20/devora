"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FaqsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/faqs-page");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center font-mono text-sm">
      <p>Redirecting to FAQs...</p>
    </div>
  );
}


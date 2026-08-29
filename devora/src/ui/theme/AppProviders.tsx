"use client";

import { ThemeProvider } from "@/ui/theme/ThemeProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

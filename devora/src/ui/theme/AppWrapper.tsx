"use client";

import { ThemeProvider } from "@/ui/theme/DarkLightMode";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

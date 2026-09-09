// Wraps the whole app with theme provider.
// layout.tsx nests page content inside this so dark/light mode is available everywhere.
// Thin pass-through — real logic lives in DarkLightMode.tsx (ThemeProvider / useTheme).

"use client";

import { ThemeProvider } from "@/ui/theme/DarkLightMode";

// vocab: children = whatever layout.tsx nests inside this wrapper (the whole page tree)
export default function AppWrapper({ children }: { children: React.ReactNode }) {
  // Every useTheme() call under here shares one theme state + localStorage persistence
  return <ThemeProvider>{children}</ThemeProvider>;
}

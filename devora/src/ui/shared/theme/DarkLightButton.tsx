// Sun/moon navbar button that toggles dark vs light mode.
// Shows a sun when dark (click for light), moon when light (click for dark).
// Reads/writes theme through useTheme() from DarkLightMode (ThemeProvider must wrap the app).

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./DarkLightMode";

export default function DarkLightButton() {
  // vocab/symbol: { theme, toggleTheme } = destructure the values from the theme hook
  // theme = "dark" | "light"; toggleTheme flips and persists via ThemeProvider
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      // Accessible name describes the *destination* mode, matching the icon
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      // theme-toggle styles (size, hover) live in globals.css
      className="theme-toggle"
    >
      {/* Icon = what you'll switch TO (sun means “go light”, moon means “go dark”).
          vocab/symbol: ? : = show Sun when dark (click→light), Moon when light (click→dark) */}
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

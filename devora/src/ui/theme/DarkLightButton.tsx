"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./DarkLightMode";

export default function DarkLightButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,92,168,0.45)] bg-[rgba(10,4,20,0.85)] text-[#ffd76f] transition-colors hover:border-[rgba(255,92,168,0.65)] hover:bg-[rgba(18,6,31,0.95)]"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "./ThemeProvider";

const OPTIONS: { value: Theme; label: string; description: string; icon: typeof Sun }[] = [
  {
    value: "dark",
    label: "Night",
    description: "Synthwave skies, stars, and neon grid.",
    icon: Moon,
  },
  {
    value: "light",
    label: "Day",
    description: "Bright daylight skies and warm sun.",
    icon: Sun,
  },
];

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="neon-card mt-10 max-w-lg rounded-2xl p-6">
      <h2 className="theme-heading font-display text-lg font-semibold">Appearance</h2>
      <p className="theme-muted mt-2 text-sm">Choose between night and day backgrounds across the app.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-[#ff5ca8] bg-[#ff5ca8]/10 shadow-[0_0_24px_rgba(255,92,168,0.15)]"
                  : "border-[#ff5ca8]/20 bg-transparent hover:border-[#ff5ca8]/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#ff5ca8]" />
                <span className="theme-heading font-display text-sm font-semibold">{option.label}</span>
              </div>
              <p className="theme-muted mt-2 text-xs leading-relaxed">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

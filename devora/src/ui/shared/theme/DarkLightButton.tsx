// Sun/moon navbar button that toggles dark vs light mode.
// Flow: read theme → show the icon for the mode a click will switch to → toggleTheme().
// Reads and writes theme through useTheme() from DarkLightMode. ThemeProvider must wrap the app.

"use client";

// ===== IMPORTS =====

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./DarkLightMode";

// ===== NAMED CONSTANTS =====

const DARK_THEME_NAME = "dark";
const LIGHT_MODE_BUTTON_LABEL = "Switch to light mode";
const DARK_MODE_BUTTON_LABEL = "Switch to dark mode";
const THEME_TOGGLE_CLASS = "theme-toggle";
const THEME_ICON_CLASS = "h-4 w-4";

// ===== MAIN COMPONENT =====

/**
 * Navbar control that flips the app between dark and light.
 * The icon is the destination: sun means "go light", moon means "go dark".
 * @returns The theme toggle button
 */
export default function DarkLightButton() {
  // vocab/symbol: { theme, toggleTheme } = the current "dark" | "light" value and the flip function
  const { theme, toggleTheme } = useTheme();
  const isDarkTheme = theme === DARK_THEME_NAME;
  const buttonLabel = isDarkTheme ? LIGHT_MODE_BUTTON_LABEL : DARK_MODE_BUTTON_LABEL;

  return (
    <button type="button" onClick={toggleTheme} aria-label={buttonLabel} className={THEME_TOGGLE_CLASS}>
      {isDarkTheme ? <Sun className={THEME_ICON_CLASS} /> : <Moon className={THEME_ICON_CLASS} />}
    </button>
  );
}

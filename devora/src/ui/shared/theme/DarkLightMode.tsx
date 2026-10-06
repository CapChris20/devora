// Dark/light mode for the whole app — saves choice in localStorage.
// Flow: ThemeProvider mounts → restore saved theme → write data-theme on <html> →
// any child calls useTheme() / toggleTheme() → CSS in globals.css reacts to [data-theme].
// AppWrapper wraps the tree with ThemeProvider so every page shares one theme state.

"use client";

// vocab: createContext / useContext = share theme state with any child without prop drilling
// (prop drilling = passing theme through every parent just so a deep button can read it)
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Only two legal values — TypeScript will yell if you typo "Dark"
export type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

// null until a ThemeProvider mounts — useTheme() checks for that and throws a clear error
const ThemeContext = createContext<ThemeContextValue | null>(null);

// localStorage key — change this if you ever need to invalidate everyone’s saved choice
// Manipulate here: rename the key to force every user back to the default once
const STORAGE_KEY = "devora-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default "dark" before localStorage is read (avoids a flash of the wrong theme on SSR/hydration).
  // First client paint may briefly be dark even if the user saved light — then effect #1 corrects it.
  const [theme, setThemeState] = useState<Theme>("dark");

  // On first load, restore saved theme from localStorage if present.
  // Must run in useEffect (not during render) because localStorage is a browser-only API.
  // vocab: localStorage = browser key/value memory that survives refreshes and tab closes
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    // Guard against garbage values someone typed in DevTools
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    }
  }, []);
  // vocab/symbol: [] = run once after mount

  // When theme changes, update data-theme on <html> and persist to localStorage.
  // CSS hooks: [data-theme="dark"] / [data-theme="light"] rules in globals.css.
  // vocab: document.documentElement = the <html> element
  // vocab: data-theme attribute = custom HTML attribute CSS can select on
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);
  // vocab/symbol: [theme] = re-run whenever theme flips

  // Set an exact theme (used by settings or future UI that picks dark/light directly)
  const setTheme = (next: Theme) => setThemeState(next);

  // Flip dark ↔ light from the current value (safe if two clicks race).
  // vocab/symbol: prev => ... = functional update — flip based on the latest React state, not a stale closure
  // Manipulate here: this is what DarkLightButton calls on click
  const toggleTheme = () =>
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  // Provider value is the public API every consumer reads via useTheme()
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for any client component that needs the current theme.
// vocab: custom hook = function starting with use… that other components call for shared state
export function useTheme() {
  const ctx = useContext(ThemeContext);
  // Must be inside ThemeProvider — otherwise theme state doesn't exist yet
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

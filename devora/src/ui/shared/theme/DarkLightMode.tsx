// Dark/light mode for the whole app — saves the choice in localStorage.
// Flow: ThemeProvider mounts → restore the saved theme → write data-theme on <html> →
// any child calls useTheme() → CSS in globals.css reacts to [data-theme].
// AppWrapper wraps the tree with ThemeProvider so every page shares one theme state.

"use client";

// ===== IMPORTS =====

// vocab: createContext / useContext = share theme state without passing it through every parent
// vocab: useEffect = run browser-only work after paint (localStorage is not available during render)
// vocab: useState = remember the theme and re-render when it changes
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// ===== NAMED CONSTANTS =====

const DARK_THEME = "dark" as const;
const LIGHT_THEME = "light" as const;
const DEFAULT_THEME = DARK_THEME;
const DOCUMENT_THEME_ATTRIBUTE = "data-theme";

// Manipulate here: rename the key to force every browser back to the default once
const THEME_STORAGE_KEY = "devora-theme";
const MISSING_PROVIDER_ERROR = "useTheme must be used within ThemeProvider";

// ===== TYPES =====

export type Theme = typeof DARK_THEME | typeof LIGHT_THEME;

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

// ===== HELPER FUNCTIONS =====

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isSavedTheme(storedTheme: string | null): storedTheme is Theme {
  return storedTheme === LIGHT_THEME || storedTheme === DARK_THEME;
}

function readSavedTheme(): Theme | null {
  // vocab: localStorage = browser key/value memory that survives refreshes and tab closes
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (!isSavedTheme(storedTheme)) return null;
  return storedTheme;
}

function applyThemeToDocument(theme: Theme): void {
  // vocab: document.documentElement = the <html> element
  // vocab: data-theme = custom attribute CSS selects with [data-theme="dark"]
  document.documentElement.setAttribute(DOCUMENT_THEME_ATTRIBUTE, theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function flipTheme(previousTheme: Theme): Theme {
  if (previousTheme === DARK_THEME) return LIGHT_THEME;
  return DARK_THEME;
}

// ===== MAIN COMPONENT =====

/**
 * Holds the app theme, restores it from localStorage, and writes it onto <html>.
 * @param props.children - The page tree that may call useTheme()
 * @returns The context provider around those children
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Default dark before localStorage is read so server HTML and the first paint match.
  // A saved light theme is applied in the effect below, after the browser is available.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const savedTheme = readSavedTheme();
    if (!savedTheme) return;
    setThemeState(savedTheme);
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
  };

  // Functional update so two fast clicks flip from the latest theme, not a stale one.
  // Manipulate here: this is what DarkLightButton calls on click
  const toggleTheme = () => {
    setThemeState((previousTheme) => flipTheme(previousTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Read and change the current theme from any client component under ThemeProvider.
 * @returns theme ("dark" or "light"), setTheme, and toggleTheme
 */
export function useTheme(): ThemeContextValue {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) throw new Error(MISSING_PROVIDER_ERROR);
  return themeContext;
}

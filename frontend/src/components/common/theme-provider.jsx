/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "theme";
const THEMES = ["light", "dark", "system"];
const DARK_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = createContext(undefined);

const readStoredTheme = () => {
      try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            return THEMES.includes(stored) ? stored : "system";
      } catch {
            return "system";
      }
};

const getSystemTheme = () => (window.matchMedia(DARK_QUERY).matches ? "dark" : "light");

const applyTheme = (resolved) => {
      const root = document.documentElement;
      root.classList.toggle("dark", resolved === "dark");
      root.style.colorScheme = resolved;
};

export const ThemeProvider = ({ children }) => {
      const [theme, setThemeState] = useState(readStoredTheme);
      const [systemTheme, setSystemTheme] = useState(getSystemTheme);

      const resolvedTheme = theme === "system" ? systemTheme : theme;

      useEffect(() => {
            applyTheme(resolvedTheme);
      }, [resolvedTheme]);

      useEffect(() => {
            const media = window.matchMedia(DARK_QUERY);
            const onChange = (event) => setSystemTheme(event.matches ? "dark" : "light");
            media.addEventListener("change", onChange);
            return () => media.removeEventListener("change", onChange);
      }, []);

      // Keep tabs in sync, matching next-themes' storage-event behaviour.
      useEffect(() => {
            const onStorage = (event) => {
                  if (event.key !== STORAGE_KEY || !THEMES.includes(event.newValue)) return;
                  setThemeState(event.newValue);
            };
            window.addEventListener("storage", onStorage);
            return () => window.removeEventListener("storage", onStorage);
      }, []);

      const setTheme = useCallback((value) => {
            if (!THEMES.includes(value)) return;
            try {
                  window.localStorage.setItem(STORAGE_KEY, value);
            } catch {
                  /* Ignore private-mode write failures; state still updates. */
            }
            setThemeState(value);
      }, []);

      const value = useMemo(
            () => ({ theme, setTheme, resolvedTheme, systemTheme, themes: THEMES }),
            [theme, setTheme, resolvedTheme, systemTheme]
      );

      return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
      const context = useContext(ThemeContext);
      if (!context) {
            throw new Error("useTheme must be used within a ThemeProvider");
      }
      return context;
};

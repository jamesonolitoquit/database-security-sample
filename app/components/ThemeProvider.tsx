"use client";
import { createContext, useContext, useEffect, useState, useMemo } from "react";

function getAutoTheme(): "light" | "dark" {
  const hour = new Date().getHours();
  // Light: 6am-18pm, Dark: 18pm-6am
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

const ThemeContext = createContext({
  theme: "light",
  setTheme: (theme: "light" | "dark" | null) => {},
});

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // null = auto, "light"/"dark" = user override
  // Read initial theme from localStorage synchronously to avoid flash
  const getInitialTheme = () => {
    if (typeof globalThis.window !== "undefined") {
      const stored = globalThis.window.localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") {
        return stored;
      }
    }
    return null;
  };
  const [userTheme, setUserTheme] = useState<"light"|"dark"|null>(getInitialTheme);
  const [theme, setThemeState] = useState<"light"|"dark">(userTheme || getAutoTheme());

  // On mount, apply theme immediately
  useEffect(() => {
    if (userTheme) {
      setThemeState(userTheme);
    }
  }, [userTheme]);

  // Auto-update theme based on time if no user override
  useEffect(() => {
    if (userTheme === null) {
      const update = () => setThemeState(getAutoTheme());
      update();
      const interval = setInterval(update, 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [userTheme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    if (userTheme) {
      localStorage.setItem("theme", userTheme);
    } else {
      localStorage.removeItem("theme");
    }
  }, [theme, userTheme]);

  // setTheme: user override, or null to reset to auto
  const setTheme = (t: "light"|"dark"|null) => {
    setUserTheme(t);
    if (t) setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={useMemo(() => ({ theme, setTheme }), [theme, setTheme])}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

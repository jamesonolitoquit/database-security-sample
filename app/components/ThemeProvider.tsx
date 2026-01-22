"use client";
import { createContext, useContext, useEffect, useState } from "react";

function getAutoTheme(): "light" | "dark" {
  const hour = new Date().getHours();
  // Light: 6am-18pm, Dark: 18pm-6am
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

const ThemeContext = createContext({
  theme: "light",
  setTheme: (theme: "light" | "dark") => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // null = auto, "light"/"dark" = user override
  const [userTheme, setUserTheme] = useState<"light"|"dark"|null>(null);
  const [theme, setThemeState] = useState<"light"|"dark">(getAutoTheme());

  // On mount, check for user preference
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setUserTheme(stored);
      setThemeState(stored);
    }
  }, []);

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
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

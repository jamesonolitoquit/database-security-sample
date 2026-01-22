"use client";
import { useTheme } from "./ThemeProvider";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      aria-label="Toggle theme"
      className="fixed top-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-white/20 dark:bg-portal-dark/30 border border-portal/40 dark:border-magic/40 shadow-lg hover:bg-portal/30 dark:hover:bg-magic/30 transition-all duration-300"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "dark" ? (
        <SunIcon className="w-7 h-7 text-yellow-300" />
      ) : (
        <MoonIcon className="w-7 h-7 text-blue-500" />
      )}
    </button>
  );
}

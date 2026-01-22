"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useTheme } from "./ThemeProvider";
import {
  Home,
  LayoutGrid,
  Users,
  ScrollText,
  Swords,
  FlaskConical,
  Backpack,
  ShoppingBag,
  Trophy,
  UserCircle,
  Menu,
  X,
  LogIn,
  UserPlus,
  Sun,
  Moon
} from "lucide-react";

export function FloatingGameMenu() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const themeIcon = theme === "dark" ? Sun : Moon;
  const themeLabel = theme === "dark" ? "Light Mode" : "Dark Mode";

  const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/feed", label: "Feed", icon: LayoutGrid },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/quests", label: "Quests", icon: ScrollText },
  { href: "/party", label: "Party", icon: Swords },
  { href: "/battle", label: "Battle", icon: Swords },
  { href: "/crafting", label: "Crafting", icon: FlaskConical },
  { href: "/inventory", label: "Inventory", icon: Backpack },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/auth", label: "Login", icon: LogIn },
  { href: "/auth/register", label: "Register", icon: UserPlus },
  { href: "#theme-toggle", label: themeLabel, icon: themeIcon, onClick: () => setTheme(theme === "light" ? "dark" : "light") },
  ];

  // Persist autoClose and open state in localStorage
  // Always render closed on server, then update on client after mount
  const [autoClose, setAutoClose] = useState(true);
  const [open, setOpen] = useState(false);
  // Avoid setState on first render to prevent cascading renders
  const didInit = useRef(false);
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      const storedAutoClose = localStorage.getItem("menuAutoClose");
      const storedOpen = localStorage.getItem("menuOpen");
      setTimeout(() => {
        if (storedAutoClose === null) {
          setAutoClose(true);
        } else {
          setAutoClose(storedAutoClose === "true");
        }
        setOpen(storedOpen === "true");
      }, 0);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("menuAutoClose", autoClose.toString());
  }, [autoClose]);
  useEffect(() => {
    localStorage.setItem("menuOpen", open.toString());
  }, [open]);
  // If autoClose is off, keep menu open after mount
  useEffect(() => {
    if (!autoClose) {
      setTimeout(() => setOpen(true), 0);
    }
  }, [autoClose]);

  const handleMenuClick = () => setOpen((o) => !o);
  type MenuItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
  };
  const handleItemClick = (item?: MenuItem) => {
    item?.onClick?.();
    if (autoClose && !item?.onClick) setOpen(false);
  };

  return (
    <>
      {/* Floating Main Menu Button */}
      <button
        aria-label="Open main menu"
        className="fixed top-6 left-6 z-50 group flex flex-col items-center justify-center w-14 h-14 rounded-full bg-white/20 dark:bg-portal-dark/30 border border-portal/40 dark:border-magic/40 shadow-lg hover:bg-portal/30 dark:hover:bg-magic/30 transition-all duration-300 menu-pulse group-hover:menu-glow"
        onClick={handleMenuClick}
      >
        {open
          ? <X className="w-7 h-7 text-white group-hover:text-magic transition-all duration-200" />
          : <Menu className="w-7 h-7 text-white group-hover:text-magic transition-all duration-200" />}
        <span className="absolute left-16 top-1/2 -translate-y-1/2 w-32 h-14 flex items-center justify-center text-lg font-fantasy opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-10 whitespace-nowrap border shadow-xl
          rounded-full bg-portal/30 backdrop-blur-md text-portal-dark border-portal/60 ring-0 ring-offset-0
          dark:bg-magic/30 dark:backdrop-blur-md dark:text-magic dark:border-magic/60">
          Menu
        </span>
      </button>
      {/* Animated Menu Items */}
      <div
        className={`fixed top-6 left-6 z-40 pointer-events-none`}
        style={{ width: 0, height: 0 }}
      >
        <div className="relative">
          {menuItems.map((item, i) => {
            const { href, label, icon: Icon } = item;
            const isThemeToggle = href === "#theme-toggle";
            const isActive = !isThemeToggle && href !== undefined && pathname && pathname.split("?")[0] === href;
            const baseClass = `absolute pointer-events-auto group flex flex-col items-center justify-center w-14 h-14 rounded-full border border-portal/40 dark:border-magic/40 shadow-lg hover:bg-portal/30 dark:hover:bg-magic/30 transition-all duration-300 menu-animate scale-90 group-hover:menu-glow ${isActive ? 'bg-sky-100 dark:bg-sky-900' : 'bg-white/20 dark:bg-portal-dark/30'}`;
            const positionClass = open ? `translate-x-[${70 * (i + 1)}px] opacity-100` : 'translate-x-0 opacity-0';
            const style = {
              top: `${60 + i * 60}px`,
              left: open ? `${70}px` : `0px`,
              transitionDelay: open ? `${i * 40}ms` : `${(menuItems.length - i) * 20}ms`,
            };
            const iconClass = `w-7 h-7 transition-all duration-200 ${isActive ? 'text-sky-400 dark:text-sky-300' : 'text-white group-hover:text-magic group-hover:drop-shadow-[0_0_16px_rgba(80,200,255,0.95)]'}`;
            const tooltipClass = `absolute left-16 top-1/2 -translate-y-1/2 w-32 h-14 flex items-center justify-center text-lg font-fantasy opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-10 whitespace-nowrap shadow-xl rounded-full backdrop-blur-md border-2
              ${isActive ? 'bg-sky-100/90 text-sky-700 dark:bg-sky-900/90 dark:text-sky-200 border-sky-200 dark:border-sky-700' : 'bg-portal/30 text-portal-dark border-portal/60 dark:bg-magic/30 dark:text-magic dark:border-magic/60'} group-hover:menu-glow`;
            if (isThemeToggle) {
              return (
                <button
                  key={label}
                  aria-label={label}
                  className={`${baseClass} ${positionClass}`}
                  style={style}
                  onClick={() => handleItemClick(item)}
                  type="button"
                >
                  <Icon className={iconClass} />
                  <span className={tooltipClass}>
                    {label}
                  </span>
                </button>
              );
            }
            return (
              <a
                key={href}
                href={href}
                className={`${baseClass} ${positionClass}`}
                style={style}
                onClick={autoClose ? () => handleItemClick(item) : undefined}
                tabIndex={0}
              >
                <Icon className={iconClass} />
                <span className={tooltipClass}>
                  {label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
      {/* Auto-close toggle */}
      {open && (
        <div className="fixed top-6 left-32 z-50 flex items-center gap-3 bg-black/70 text-white px-4 py-2 rounded shadow-lg">
          <span className="text-xs select-none">Auto-close menu</span>
          <button
            aria-label="Toggle auto-close menu"
            onClick={() => setAutoClose((v) => !v)}
            className={`w-10 h-6 flex items-center rounded-full transition-colors duration-200 focus:outline-none ${autoClose ? 'bg-portal' : 'bg-gray-400'}`}
          >
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${autoClose ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </button>
        </div>
      )}
    </>
  );
}

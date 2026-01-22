import React from "react";

export interface HUDPanelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Floating HUD panel with glassmorphism and subtle SAO-inspired glow.
 */
export function HUDPanel({ children, className = "" }: HUDPanelProps) {
  return (
    <div
      className={`backdrop-blur-md bg-white/20 dark:bg-portal-dark/30 border border-portal/40 dark:border-magic/40 shadow-lg rounded-2xl p-4 md:p-6 transition-all duration-300 hover:shadow-portal/60 dark:hover:shadow-magic/60 ${className}`}
      style={{
        boxShadow: "0 4px 32px 0 rgba(60, 60, 255, 0.15)",
        borderRadius: "1.5rem",
      }}
    >
      {children}
    </div>
  );
}

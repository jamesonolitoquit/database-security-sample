"use client";
import { useEffect, useState } from "react";

function getDayPhase(date: Date, lat?: number, lng?: number): "morning" | "noon" | "dawn" | "night" {
  // 5-8: morning, 8-17: noon, 17-19: dawn, 19-5: night
  const hour = date.getHours();
  if (hour >= 5 && hour < 8) return "morning";
  if (hour >= 8 && hour < 17) return "noon";
  if (hour >= 17 && hour < 19) return "dawn";
  return "night";
}

export function DayNightOverlay() {
  const [phase, setPhase] = useState<"morning"|"noon"|"dawn"|"night">("noon");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = now.getHours();
      let newPhase: "morning" | "noon" | "dawn" | "night";

      if (hour >= 5 && hour < 8) {
        newPhase = "morning";
      } else if (hour >= 8 && hour < 17) {
        newPhase = "noon";
      } else if (hour >= 17 && hour < 19) {
        newPhase = "dawn";
      } else {
        newPhase = "night";
      }

      setPhase(newPhase);

      const bg = document.getElementById("fantasy-bg-root");
      if (bg) {
        bg.classList.remove("morning", "noon", "dawn", "night");
        bg.classList.add(newPhase);
      }
    };

    update();
    const interval = setInterval(update, 5 * 60 * 1000); // update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Overlay visuals
  // Overlay visuals for each phase
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {phase === "morning" && (
        <div className="absolute top-10 right-10 flex items-center gap-2 opacity-80 fantasy-float">
          <span className="text-4xl">🌅</span>
          <span className="text-2xl fantasy-float">Morning Mist</span>
        </div>
      )}
      {phase === "noon" && (
        <div className="absolute top-10 right-10 flex items-center gap-2 opacity-80 fantasy-float">
          <span className="text-4xl">☀️</span>
          <span className="text-2xl fantasy-float">Bright Skies</span>
        </div>
      )}
      {phase === "dawn" && (
        <div className="absolute top-10 right-10 flex items-center gap-2 opacity-80 fantasy-float">
          <span className="text-4xl">🌇</span>
          <span className="text-2xl fantasy-float">Dawn Glow</span>
        </div>
      )}
      {phase === "night" && (
        <div className="absolute top-10 right-10 flex items-center gap-2 opacity-80 fantasy-float">
          <span className="text-4xl fantasy-twinkle">🌙</span>
          <span className="text-2xl fantasy-twinkle">Stars ✨</span>
        </div>
      )}
    </div>
  );
}

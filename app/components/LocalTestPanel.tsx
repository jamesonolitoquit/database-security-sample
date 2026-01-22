"use client";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

export function LocalTestPanel() {
  const { theme, setTheme } = useTheme();
  const [login, setLogin] = useState<null | "admin" | "user">(null);

  return (
    <div className="fixed top-4 right-4 z-[100] bg-black/80 text-white p-4 rounded-lg shadow-2xl flex flex-col gap-2 border-2 border-yellow-400 opacity-95">
      <div className="font-bold text-lg mb-2">Local Test Panel</div>
      <div className="flex gap-2 mb-2">
        <button className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-700" onClick={() => setTheme("light")}>Light</button>
        <button className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-900" onClick={() => setTheme("dark")}>Dark</button>
        <button className="px-3 py-1 rounded bg-green-600 hover:bg-green-800" onClick={() => setTheme(null)}>Auto</button>
      </div>
      <div className="flex gap-2 mb-2">
        <button className={`px-3 py-1 rounded ${login==="admin"?"bg-yellow-500":"bg-gray-600"}`} onClick={() => setLogin("admin")}>Login as Admin</button>
        <button className={`px-3 py-1 rounded ${login==="user"?"bg-yellow-500":"bg-gray-600"}`} onClick={() => setLogin("user")}>Login as User</button>
        <button className="px-3 py-1 rounded bg-red-700 hover:bg-red-900" onClick={() => setLogin(null)}>Logout</button>
      </div>
      <div className="text-xs opacity-80">Theme: <b>{theme}</b> | Login: <b>{login||"none"}</b></div>
      <div className="text-xs mt-2 text-yellow-200">If you don't see this panel, make sure you are running on localhost or 127.0.0.1</div>
    </div>
  );
}

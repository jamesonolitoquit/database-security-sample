"use client";
import { useEffect, useState } from "react";

export default function CharacterCreation({ onComplete }: { onComplete?: () => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data.classes || []));
  }, []);

  const handleSelect = async () => {
    if (!selected) return setError("Please select a class.");
    setLoading(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/user/select-class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selected }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Failed to select class.");
    setSuccess(true);
    if (onComplete) onComplete();
  };

  return (
    <div className="p-4 bg-gray-900 rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Choose Your Character Class</h2>
      <ul className="mb-4">
        {classes.map((c) => (
          <li key={c.id} className="mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="class"
                value={c.id}
                checked={selected === c.id}
                onChange={() => setSelected(c.id)}
                disabled={loading}
              />
              <span className="font-semibold">{c.name}</span>
              <span className="text-xs text-gray-400">{c.description}</span>
            </label>
          </li>
        ))}
      </ul>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">Class selected successfully!</div>}
      <button
        className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded shadow w-full"
        onClick={handleSelect}
        disabled={loading}
      >
        {loading ? "Selecting..." : "Select Class"}
      </button>
    </div>
  );
}

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed");
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white/80 rounded shadow">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">Create Your Account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required className="p-2 rounded border" />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="p-2 rounded border" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="p-2 rounded border" />
        <button type="submit" disabled={loading} className="bg-purple-700 text-white font-bold py-2 px-4 rounded">
          {loading ? "Registering..." : "Register"}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Registration successful! You can now log in.</div>}
      </form>
    </div>
  );
}

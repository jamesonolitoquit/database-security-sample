"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("credentials");
    setError("");

    try {
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });

      // If redirect is true, this code won't execute
      // The user will be redirected automatically
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An error occurred during sign in");
      setLoading(null);
    }
  };

  const handleProviderSignIn = async (provider: string) => {
    setLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 rounded-lg p-8 shadow-md border border-purple-300 mt-12">
      <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Sign In to Isekai Gate</h2>

      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading === "credentials"}
          className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-purple-500 text-white font-bold py-2 px-6 rounded shadow transition-colors"
        >
          {loading === "credentials" ? "Signing in..." : "Sign in with Email"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => handleProviderSignIn("google")}
            disabled={loading === "google"}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white font-bold py-2 px-6 rounded shadow transition-colors"
          >
            {loading === "google" ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-300 mt-6 text-center">
        Don't have an account?{" "}
        <Link href="/auth/register" className="text-purple-600 hover:text-purple-800 underline">
          Register here
        </Link>
      </p>

      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 text-center">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

export function DemoLoginButton() {
  const [login, setLogin] = useState<null | "admin" | "user">(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname.match(/^(localhost|127\.|192\.168\.|10\.)/);
      setShow(!!isLocal);
      // Restore from localStorage
      const stored = localStorage.getItem("localTestLogin");
      if (stored === "admin" || stored === "user") {
        setLogin(stored);
      }
    }
  }, []);

  const toggleLogin = () => {
    const next = login === "admin" ? "user" : login === "user" ? null : "admin";
    setLogin(next);
    if (typeof window !== "undefined") {
      if (next === null) {
        localStorage.removeItem("localTestLogin");
        (window as any).__LOCAL_LOGIN__ = null;
      } else {
        localStorage.setItem("localTestLogin", next);
        (window as any).__LOCAL_LOGIN__ = next;
      }
      window.dispatchEvent(new CustomEvent("localTestLoginChange"));
    }
  };

  const handleDemoLogin = async () => {
    if (typeof window !== "undefined" && window.location.hostname.match(/^(localhost|127\.|192\.168\.|10\.)/)) {
      // Instead of toggling local session, sign in as demo account
      await signIn("credentials", {
        email: "test@test.com",
        password: "testpassword",
        callbackUrl: "/",
        redirect: true,
      });
    } else {
      alert("Demo login is only available on local development.");
    }
  };

  if (!show) return null;

  const getLabel = () => {
    if (login === "admin") return "Logged in as Admin";
    if (login === "user") return "Logged in as User";
    return "Logged out";
  };

  return (
    <>
      <button
        onClick={handleDemoLogin}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
        title="Demo login toggle for local testing"
      >
        Demo Login
      </button>
    </>
  );
}
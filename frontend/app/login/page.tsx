"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { isAuthenticated } from "@/lib/auth";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // AUTO REDIRECT IF LOGGED IN
  // ---------------------------
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  // ---------------------------
  // LOGIN HANDLER
  // ---------------------------
  const login = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!password) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        toast.error("Invalid credentials");
        return;
      }

      localStorage.setItem("token", data.token);

      toast.success("Login successful");

      router.push("/dashboard");
    } catch (err) {
      toast.error("Unable to reach server");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-cyan-100 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-xl p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            Welcome Back
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign in to Todo SaaS</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your tasks and stay productive.</p>
        </div>

        <form onSubmit={login} className="flex flex-col gap-3">
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-600">No account yet?</p>
          <Link
            href="/signup"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-sky-300 bg-sky-50 px-4 py-2.5 font-medium text-sky-700 transition hover:bg-sky-100"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
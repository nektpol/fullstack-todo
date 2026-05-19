"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { isAuthenticated } from "@/lib/auth";

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

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={login}
        className="bg-white p-6 rounded-xl shadow-md w-80 flex flex-col gap-3"
      >
        <h1 className="text-xl font-bold">Login</h1>

        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-2 rounded hover:opacity-80 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
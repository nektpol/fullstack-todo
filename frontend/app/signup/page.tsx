"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { isAuthenticated } from "@/lib/auth";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const PASSWORD_RULES: Array<{
  key: string;
  label: string;
  test: (value: string) => boolean;
}> = [
  {
    key: "length",
    label: "At least 12 characters",
    test: (value) => value.length >= 12,
  },
  {
    key: "uppercase",
    label: "At least one uppercase letter",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: "lowercase",
    label: "At least one lowercase letter",
    test: (value) => /[a-z]/.test(value),
  },
  {
    key: "number",
    label: "At least one number",
    test: (value) => /[0-9]/.test(value),
  },
  {
    key: "special",
    label: "At least one special character",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
  {
    key: "spaces",
    label: "No spaces",
    test: (value) => !/\s/.test(value),
  },
];

function getPasswordPolicyErrors(password: string): string[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => {
    if (rule.key === "length") return "Password must be at least 12 characters long";
    if (rule.key === "uppercase") return "Password must include at least one uppercase letter";
    if (rule.key === "lowercase") return "Password must include at least one lowercase letter";
    if (rule.key === "number") return "Password must include at least one number";
    if (rule.key === "special") return "Password must include at least one special character";
    return "Password cannot contain spaces";
  });
}

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRuleResults = PASSWORD_RULES.map((rule) => ({
    ...rule,
    valid: rule.test(password),
  }));
  const passedRulesCount = password.length === 0
    ? 0
    : passwordRuleResults.filter((rule) => rule.valid).length;
  const strengthPercent = Math.round((passedRulesCount / PASSWORD_RULES.length) * 100);
  const strengthLabel =
    passedRulesCount <= 2
      ? "Weak"
      : passedRulesCount <= 4
        ? "Medium"
        : passedRulesCount === 5
          ? "Strong"
          : "Very strong";
  const strengthColorClass =
    passedRulesCount <= 2
      ? "bg-rose-500"
      : passedRulesCount <= 4
        ? "bg-amber-500"
        : "bg-emerald-500";

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const signup = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!username.trim() || !normalizedEmail || !password) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const passwordErrors = getPasswordPolicyErrors(password);
    if (passwordErrors.length > 0) {
      for (const error of passwordErrors) {
        toast.error(error);
      }
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: normalizedEmail,
          password,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        toast.error(errorText || "Unable to create account");
        return;
      }

      toast.success("Account created. Please log in.");
      router.push("/login");
    } catch {
      toast.error("Unable to reach server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-sky-50 to-slate-100 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-xl p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            Create Account
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign up for Todo SaaS</h1>
          <p className="mt-1 text-sm text-slate-600">Start organizing your tasks in minutes.</p>
        </div>

        <form onSubmit={signup} className="flex flex-col gap-3">
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

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
            autoComplete="new-password"
            required
          />

          <p className="text-xs text-slate-500">
            Use 12+ chars with uppercase, lowercase, number, and special symbol.
          </p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Password strength</span>
              <span className="font-semibold text-slate-800">{password.length === 0 ? "Enter password" : strengthLabel}</span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-200">
              <div
                className={`h-2 rounded-full transition-all ${strengthColorClass}`}
                style={{ width: `${strengthPercent}%` }}
              />
            </div>

            <ul className="mt-3 space-y-1 text-xs">
              {passwordRuleResults.map((rule) => (
                <li key={rule.key} className="flex items-center justify-between">
                  <span className={rule.valid ? "text-emerald-700" : "text-slate-600"}>{rule.label}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 font-semibold ${
                      rule.valid ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {rule.valid ? "OK" : "--"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
          <span>Already have an account? </span>
          <Link href="/login" className="font-medium text-sky-700 hover:text-sky-800">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { logout } from "@/lib/auth";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <h1 className="font-bold text-lg">Todo SaaS</h1>

        <button
          onClick={logout}
          className="px-3 py-1 bg-black text-white rounded"
        >
          Logout
        </button>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto p-6">{children}</div>
    </div>
  );
}

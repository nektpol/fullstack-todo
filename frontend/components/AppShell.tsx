"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { logout } from "@/lib/auth";

export default function AppShell({
  children,
  onCreateTodo,
}: {
  children: React.ReactNode;
  onCreateTodo?: () => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sidebarButtonBase =
    "flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition";

  const renderLabel = (label: string) =>
    isSidebarOpen ? <span className="ml-3">{label}</span> : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside
          className={`border-r border-slate-200 bg-white/95 backdrop-blur transition-all duration-300 ${
            isSidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="flex h-full flex-col p-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="min-w-0 overflow-hidden">
                <p
                  className={`text-sm font-bold text-slate-800 transition-all duration-300 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Todo SaaS
                </p>
              </div>

              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                  {isSidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                  )}
                </svg>
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <button
                onClick={() => onCreateTodo?.()}
                className={`${sidebarButtonBase} bg-sky-50 text-sky-700 hover:bg-sky-100`}
                title="Create new todo"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                {renderLabel("Create Todo")}
              </button>

              <button
                onClick={() => toast("Account settings coming soon")}
                className={`${sidebarButtonBase} text-slate-700 hover:bg-slate-100`}
                title="Account"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 20a8 8 0 0116 0" />
                </svg>
                {renderLabel("Account")}
              </button>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3">
              <button
                onClick={logout}
                className={`${sidebarButtonBase} text-rose-700 hover:bg-rose-50`}
                title="Logout"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12H9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5V4a2 2 0 00-2-2H5a2 2 0 00-2 2v16a2 2 0 002 2h6a2 2 0 002-2v-1" />
                </svg>
                {renderLabel("Logout")}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

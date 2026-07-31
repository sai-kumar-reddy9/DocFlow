"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const SearchIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/dashboard": return "User Dashboard";
      case "/documents": return "My Documents";
      case "/upload": return "Upload Document";
      case "/admin": return "Admin Overview & Analytics";
      case "/admin/users": return "User Management Console";
      case "/admin/health": return "System Health & Audit Logs";
      default: return "Dashboard";
    }
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Title & Path */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          {getPageTitle(pathname)}
        </h1>
        <p className="text-xs text-slate-400">
          DocFlow Platform &bull; {pathname}
        </p>
      </div>

      {/* Right controls: Search, Role badge, Notifications */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Role Badge Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
          <span className={`w-2 h-2 rounded-full ${isAdmin ? "bg-purple-400 animate-pulse" : "bg-emerald-400"}`} />
          <span className="text-xs font-semibold text-slate-300">
            {isAdmin ? "Admin Access" : "Standard User"}
          </span>
        </div>

        {/* Notifications Button */}
        <button
          type="button"
          className="relative p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
          title="Notifications"
        >
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
        </button>
      </div>
    </header>
  );
}

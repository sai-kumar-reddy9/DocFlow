"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Global role state toggle for Phase 1 prototyping
  const [currentRole, setCurrentRole] = useState<"ADMIN" | "USER">("ADMIN");

  const handleRoleToggle = () => {
    setCurrentRole((prev) => (prev === "ADMIN" ? "USER" : "ADMIN"));
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Persistent Sidebar Navigation */}
      <Sidebar currentRole={currentRole} onRoleToggle={handleRoleToggle} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header currentRole={currentRole} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

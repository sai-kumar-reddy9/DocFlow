"use client";

import React from "react";
import Link from "next/link";
import UploadTrendLineChart from "@/components/dashboard/UploadTrendLineChart";
import UserRolesPieChart from "@/components/dashboard/UserRolesPieChart";
import FileTypeBarChart from "@/components/dashboard/FileTypeBarChart";
import { useAdminAnalytics } from "@/hooks/use-dashboard";

export default function AdminDashboardPage() {
  const { data: analyticsData, isLoading } = useAdminAnalytics();

  // Extract live metrics from backend response
  const overview = analyticsData?.overview;
  const uploadTrendData = analyticsData?.upload_trend || [];
  const userRolesData = analyticsData?.user_role_distribution || [];
  const fileTypesData = analyticsData?.file_type_distribution || [];

  const adminStats = [
    {
      label: "Total Platform Users",
      value: overview ? overview.total_users.toLocaleString() : "0",
      sub: overview ? `${overview.active_users} active users` : "Active platform users",
      color: "from-purple-500 to-indigo-500",
    },
    {
      label: "Total Uploaded Files",
      value: overview ? overview.total_documents.toLocaleString() : "0",
      sub: overview ? `${overview.total_storage_mb} MB disk space` : "Total stored files",
      color: "from-indigo-500 to-blue-500",
    },
    {
      label: "System Health",
      value: "99.9%",
      sub: "Redis Cache + Async API",
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Total Storage Used",
      value: overview ? `${overview.total_storage_mb} MB` : "0 MB",
      sub: "Organisational disk usage",
      color: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 relative overflow-hidden shadow-xl">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            ADMINISTRATOR PRIVILEGES ACTIVE • Live FastAPI Integration
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            System Analytics Console
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Real-time platform metrics, daily upload velocity, user role distributions, and global file format statistics.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/admin/users"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              User Management Console &rarr;
            </Link>
            <Link
              href="/admin/health"
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              System Health & Audit Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {adminStats.map((stat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${stat.color}`} />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {isLoading ? "..." : stat.value}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Recharts Analytics Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Upload & Processing Trend (14 Days) */}
        <div className="lg:col-span-2">
          <UploadTrendLineChart data={uploadTrendData} />
        </div>

        {/* User Roles Distribution (Pie Chart) */}
        <div>
          <UserRolesPieChart data={userRolesData} />
        </div>
      </div>

      {/* Recharts Format Breakdown (Bar Chart) */}
      <div>
        <FileTypeBarChart data={fileTypesData} />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import UploadTrendLineChart from "@/components/dashboard/UploadTrendLineChart";
import UserRolesPieChart from "@/components/dashboard/UserRolesPieChart";
import FileTypeBarChart from "@/components/dashboard/FileTypeBarChart";
import {
  MOCK_DAILY_UPLOAD_TREND,
  MOCK_USER_ROLES_DISTRIBUTION,
  MOCK_DOCUMENTS_BY_FILE_TYPE,
  MOCK_ADMIN_SYSTEM_METRICS,
} from "@/lib/mock-data";

export default function AdminDashboardPage() {
  /**
   * Future Integration with FastAPI & TanStack Query:
   * 
   * const { data: uploadTrend = MOCK_DAILY_UPLOAD_TREND } = useQuery({
   *   queryKey: ['admin', 'analytics', 'upload-trend'],
   *   queryFn: () => api.get('/api/v1/admin/analytics/upload-trend').then(res => res.data),
   * });
   * 
   * const { data: userRoles = MOCK_USER_ROLES_DISTRIBUTION } = useQuery({
   *   queryKey: ['admin', 'analytics', 'user-roles'],
   *   queryFn: () => api.get('/api/v1/admin/analytics/user-roles').then(res => res.data),
   * });
   * 
   * const { data: fileTypes = MOCK_DOCUMENTS_BY_FILE_TYPE } = useQuery({
   *   queryKey: ['admin', 'analytics', 'file-types'],
   *   queryFn: () => api.get('/api/v1/admin/analytics/file-types').then(res => res.data),
   * });
   * 
   * const { data: metrics = MOCK_ADMIN_SYSTEM_METRICS } = useQuery({
   *   queryKey: ['admin', 'analytics', 'system-metrics'],
   *   queryFn: () => api.get('/api/v1/admin/analytics/metrics').then(res => res.data),
   * });
   */

  const metrics = MOCK_ADMIN_SYSTEM_METRICS;

  const adminStats = [
    { label: "Total Platform Users", value: metrics.totalUsers.toLocaleString(), sub: `${metrics.activeUsersToday} active today`, color: "from-purple-500 to-indigo-500" },
    { label: "Total Uploaded Files", value: metrics.totalDocuments.toLocaleString(), sub: `${metrics.storageUsedGb} GB disk space`, color: "from-indigo-500 to-blue-500" },
    { label: "Uploads Today", value: metrics.uploadsToday.toString(), sub: "Peak intake rate", color: "from-emerald-500 to-teal-500" },
    { label: "Storage Limit", value: `${metrics.storageLimitGb} GB`, sub: `${((metrics.storageUsedGb / metrics.storageLimitGb) * 100).toFixed(1)}% utilized`, color: "from-cyan-500 to-blue-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 relative overflow-hidden shadow-xl">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            ADMINISTRATOR PRIVILEGES ACTIVE
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
              {stat.value}
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
          <UploadTrendLineChart data={MOCK_DAILY_UPLOAD_TREND} />
        </div>

        {/* User Roles Distribution (Pie Chart) */}
        <div>
          <UserRolesPieChart data={MOCK_USER_ROLES_DISTRIBUTION} />
        </div>
      </div>

      {/* Recharts Format Breakdown (Bar Chart) */}
      <div>
        <FileTypeBarChart data={MOCK_DOCUMENTS_BY_FILE_TYPE} />
      </div>
    </div>
  );
}

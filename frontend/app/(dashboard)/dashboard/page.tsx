"use client";

import React from "react";
import Link from "next/link";
import UploadsBarChart from "@/components/dashboard/UploadsBarChart";
import FileTypePieChart from "@/components/dashboard/FileTypePieChart";
import StorageProgressCard from "@/components/dashboard/StorageProgressCard";
import { useUserDashboardStats, useUserDocuments } from "@/hooks/use-dashboard";

export default function UserDashboardPage() {
  // Live API integration via TanStack Query
  const { data: statsData, isLoading: isStatsLoading } = useUserDashboardStats();
  const { data: docsData, isLoading: isDocsLoading } = useUserDocuments();

  // Extract live metrics
  const uploadsData = statsData?.uploads_7_days || [];
  const fileTypesData = statsData?.file_type_distribution || [];
  const storageData = {
    usedMb: statsData?.storage_used_mb ?? 0,
    totalMb: 5120, // 5.0 GB storage limit
    documentCount: statsData?.total_files ?? 0,
  };

  const totalFilesCount = statsData?.total_files ?? 0;
  const storageMbStr = statsData ? `${statsData.storage_used_mb} MB` : "0 MB";

  const stats = [
    { label: "Total Documents", value: totalFilesCount.toString(), change: "Live workspace files", color: "from-indigo-500 to-blue-500" },
    { label: "Processing Queue", value: "0", change: "All systems clear", color: "from-purple-500 to-indigo-500" },
    { label: "Storage Used", value: storageMbStr, change: "of 5.0 GB limit", color: "from-blue-500 to-cyan-500" },
    { label: "System Health", value: "99.9%", change: "Redis + Async API active", color: "from-emerald-500 to-teal-500" },
  ];

  const recentDocs = docsData?.items?.slice(0, 5).map((doc: any) => ({
    id: doc.id,
    name: doc.original_filename,
    type: doc.file_extension.replace(".", "").toUpperCase(),
    size: `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB`,
    status: doc.upload_status,
    date: new Date(doc.created_at).toISOString().split("T")[0],
  })) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            DocFlow Platform v1.0 • Live FastAPI Integration
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            User Workspace Dashboard
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Real-time analytics for your stored files, weekly velocity trends, format distribution, and storage quota.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/upload"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload New Document
            </Link>
            <Link
              href="/documents"
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              View All Documents
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${stat.color}`} />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {isStatsLoading ? "..." : stat.value}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Recharts Analytics Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Uploads in Last 7 Days (Bar Chart) */}
        <div className="lg:col-span-2">
          <UploadsBarChart data={uploadsData} />
        </div>

        {/* Documents by File Type (Pie Chart) */}
        <div>
          <FileTypePieChart data={fileTypesData} />
        </div>
      </div>

      {/* Main Bottom Grid: Recent Documents + Storage Usage Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Documents Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Recent Documents
            </h3>
            <Link href="/documents" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              View All &rarr;
            </Link>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Document Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {isDocsLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      Loading user documents...
                    </td>
                  </tr>
                ) : recentDocs.length > 0 ? (
                  recentDocs.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold text-white flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono text-[10px]">
                          {doc.type}
                        </span>
                        <span className="truncate max-w-xs">{doc.name}</span>
                      </td>
                      <td className="p-4 text-slate-400">{doc.type}</td>
                      <td className="p-4 text-slate-400">{doc.size}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-400">{doc.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No documents uploaded yet. Click "Upload New Document" above to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Storage Quota Progress Card */}
        <div>
          <StorageProgressCard stats={storageData} />
        </div>
      </div>
    </div>
  );
}

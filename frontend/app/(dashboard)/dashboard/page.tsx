"use client";

import React from "react";
import Link from "next/link";
import UploadsBarChart from "@/components/dashboard/UploadsBarChart";
import FileTypePieChart from "@/components/dashboard/FileTypePieChart";
import StorageProgressCard from "@/components/dashboard/StorageProgressCard";
import {
  MOCK_UPLOADS_LAST_7_DAYS,
  MOCK_DOCUMENTS_BY_FILE_TYPE,
  MOCK_STORAGE_STATS,
} from "@/lib/mock-data";

export default function UserDashboardPage() {
  /**
   * Future Integration with FastAPI & TanStack Query:
   * 
   * const { data: weeklyUploads = MOCK_UPLOADS_LAST_7_DAYS } = useQuery({
   *   queryKey: ['analytics', 'user', 'uploads-7d'],
   *   queryFn: () => api.get('/api/v1/analytics/uploads-7d').then(res => res.data),
   * });
   * 
   * const { data: fileTypes = MOCK_DOCUMENTS_BY_FILE_TYPE } = useQuery({
   *   queryKey: ['analytics', 'user', 'file-types'],
   *   queryFn: () => api.get('/api/v1/analytics/file-types').then(res => res.data),
   * });
   * 
   * const { data: storageStats = MOCK_STORAGE_STATS } = useQuery({
   *   queryKey: ['analytics', 'user', 'storage'],
   *   queryFn: () => api.get('/api/v1/analytics/storage').then(res => res.data),
   * });
   */

  const stats = [
    { label: "Total Documents", value: "48", change: "+12% this month", color: "from-indigo-500 to-blue-500" },
    { label: "Processing Queue", value: "3", change: "2 pending validation", color: "from-purple-500 to-indigo-500" },
    { label: "Storage Used", value: "142 MB", change: "of 5.0 GB limit", color: "from-blue-500 to-cyan-500" },
    { label: "System Health", value: "99.9%", change: "All services operational", color: "from-emerald-500 to-teal-500" },
  ];

  const recentDocs = [
    { id: "1", name: "Q3_Financial_Audit_Report.pdf", type: "PDF", size: "4.2 MB", status: "PROCESSED", date: "2026-07-28" },
    { id: "2", name: "Vendor_Contract_Agreement_2026.docx", type: "DOCX", size: "1.8 MB", status: "PROCESSED", date: "2026-07-27" },
    { id: "3", name: "Employee_Payroll_Summary_July.xlsx", type: "XLSX", size: "3.1 MB", status: "PENDING", date: "2026-07-28" },
    { id: "4", name: "Product_Roadmap_Q4_v2.pdf", type: "PDF", size: "8.6 MB", status: "PROCESSED", date: "2026-07-25" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            DocFlow Platform v1.0
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, John!
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your document workspace is active. Monitor weekly file velocity, view storage distribution, and track metadata processing.
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
              {stat.value}
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
          <UploadsBarChart data={MOCK_UPLOADS_LAST_7_DAYS} />
        </div>

        {/* Documents by File Type (Pie Chart) */}
        <div>
          <FileTypePieChart data={MOCK_DOCUMENTS_BY_FILE_TYPE} />
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
                {recentDocs.map((doc) => (
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
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        doc.status === "PROCESSED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-400">{doc.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Storage Quota Progress Card */}
        <div>
          <StorageProgressCard stats={MOCK_STORAGE_STATS} />
        </div>
      </div>
    </div>
  );
}

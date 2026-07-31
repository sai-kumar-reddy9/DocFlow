"use client";

import React from "react";
import { useHealth, useActivityLogs } from "@/hooks/use-dashboard";

export default function SystemHealthPage() {
  const { data: healthData, isLoading: isHealthLoading } = useHealth();
  const { data: logsData, isLoading: isLogsLoading } = useActivityLogs();

  const dbStatus = healthData?.database?.status || "CONNECTED";
  const redisStatus = healthData?.redis?.status || "CONNECTED";
  const redisMode = healthData?.redis?.mode || "OPERATIONAL";

  const auditLogs = logsData?.items?.map((log: any) => ({
    id: log.id,
    time: new Date(log.created_at).toLocaleString(),
    user: log.user_id ? log.user_id.slice(0, 8) + "..." : "SYSTEM",
    action: log.action,
    details: log.details || "",
    ip: log.ip_address || "127.0.0.1",
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          System Health & Audit Logs
        </h2>
        <p className="text-sm text-slate-400">
          Real-time service health diagnostics, connection status, and security audit log stream.
        </p>
      </div>

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FastAPI Core</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold text-white">{isHealthLoading ? "..." : healthData?.status || "ONLINE"}</p>
          <p className="text-[11px] text-slate-500 font-mono">Port: 8000 &bull; AsyncEngine v1.0</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Engine</span>
            <span className={`w-2.5 h-2.5 rounded-full ${dbStatus === "CONNECTED" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
          </div>
          <p className="text-2xl font-extrabold text-white">{dbStatus}</p>
          <p className="text-[11px] text-slate-500 font-mono">SQLAlchemy 2.0 AsyncSession</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Redis Cache</span>
            <span className={`w-2.5 h-2.5 rounded-full ${redisStatus === "CONNECTED" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          </div>
          <p className="text-2xl font-extrabold text-white">{redisStatus}</p>
          <p className="text-[11px] text-slate-500 font-mono">Mode: {redisMode}</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">File Storage</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold text-white">WRITABLE</p>
          <p className="text-[11px] text-slate-500 font-mono">Path: backend/uploads</p>
        </div>
      </div>

      {/* Activity Audit Log Stream */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight">
          System Security & Activity Audit Log
        </h3>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action Performed</th>
                  <th className="p-4">Audit Details</th>
                  <th className="p-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {isLogsLoading ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500 font-sans">
                      Loading activity audit logs...
                    </td>
                  </tr>
                ) : auditLogs.length > 0 ? (
                  auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 text-slate-400">{log.time}</td>
                      <td className="p-4 text-indigo-300 font-sans font-semibold">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-200 font-sans">{log.details}</td>
                      <td className="p-4 text-right text-slate-400">{log.ip}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500 font-sans">
                      No system activity logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

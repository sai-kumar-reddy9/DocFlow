"use client";

import React from "react";

export default function SystemHealthPage() {
  const auditLogs = [
    { id: "log-1", time: "2026-07-28 23:15:02", user: "john@docflow.io", action: "LOGIN_SUCCESS", ip: "192.168.1.45" },
    { id: "log-2", time: "2026-07-28 22:40:19", user: "alex@docflow.io", action: "DOCUMENT_UPLOAD (Q3_Audit.pdf)", ip: "10.0.0.12" },
    { id: "log-3", time: "2026-07-28 21:10:55", user: "sarah@company.com", action: "ROLE_CHANGE (USER -> ADMIN)", ip: "172.16.0.8" },
    { id: "log-4", time: "2026-07-28 19:04:11", user: "john@docflow.io", action: "DOCUMENT_DELETE (draft_memo.docx)", ip: "192.168.1.45" },
  ];

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
          <p className="text-2xl font-extrabold text-white">HEALTHY</p>
          <p className="text-[11px] text-slate-500 font-mono">Port: 8000 &bull; Uptime: 99.98%</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">PostgreSQL DB</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold text-white">CONNECTED</p>
          <p className="text-[11px] text-slate-500 font-mono">Port: 5432 &bull; Pool: 5/20 active</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Redis Cache</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold text-white">OPERATIONAL</p>
          <p className="text-[11px] text-slate-500 font-mono">Port: 6379 &bull; Keys: 1,420</p>
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
                  <th className="p-4">User Email</th>
                  <th className="p-4">Action Performed</th>
                  <th className="p-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400">{log.time}</td>
                    <td className="p-4 text-indigo-300 font-sans font-semibold">{log.user}</td>
                    <td className="p-4 text-slate-200">{log.action}</td>
                    <td className="p-4 text-right text-slate-400">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
